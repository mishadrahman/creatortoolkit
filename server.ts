import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to get all configured API keys (comma-separated or single)
function getApiKeys(): string[] {
  const keysInput = process.env.GEMINI_API_KEY || "";
  if (!keysInput) {
    return [];
  }
  return keysInput
    .split(",")
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set body size parser limit to 50MB for base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const keys = getApiKeys();
      
      if (keys.length === 0) {
        throw new Error("GEMINI_API_KEY is not defined. Please configure it in your environment settings.");
      }

      let lastError: any = null;
      let generatedText = "";
      let success = false;
      
      // Try each API key in sequence until one succeeds
      for (let i = 0; i < keys.length; i++) {
        const activeKey = keys[i];
        try {
          // Cleanly replace any potential quote marks inside the keys
          const sanitizedKey = activeKey.replace(/['"]/g, "").trim();
          console.log(`Attempting generation with Gemini API key index ${i}/${keys.length}...`);
          
          const ai = new GoogleGenAI({ apiKey: sanitizedKey });
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction,
            },
          });
          
          if (response && response.text) {
            generatedText = response.text;
            success = true;
            console.log(`Successful generation using Gemini API key index ${i}!`);
            break; // Exit loop on success
          }
        } catch (err: any) {
          console.error(`Error with Gemini key index ${i}:`, err.message || err);
          lastError = err;
        }
      }
      
      if (success) {
        res.json({ text: generatedText });
      } else {
        res.status(500).json({ 
          error: "All configured Gemini API keys failed or exceeded rate limits.", 
          details: lastError?.message || lastError 
        });
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // Telegram upload proxy endpoint (hides TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID completely from frontend)
  app.post("/api/telegram/upload", async (req, res) => {
    try {
      const { image, name } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image data" });
      }

      // Extract base64 details
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Retrieve bot token and chat ID, fallback to developer values if not customized
      const botToken = (process.env.TELEGRAM_BOT_TOKEN || "1988624744:AAFUFeLE6soEn1B_jwQM1TaynP_fDmaNSz0").replace(/['"]/g, "").trim();
      const chatId = (process.env.TELEGRAM_CHAT_ID || "-1004308800425").replace(/['"]/g, "").trim();

      const formData = new FormData();
      const blob = new Blob([buffer], { type: "image/jpeg" });
      formData.append("photo", blob, name || "photo.jpg");
      formData.append("chat_id", chatId);

      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: formData,
      });

      const data = await telegramRes.json();
      if (data.ok) {
        const photos = data.result.photo;
        const fileId = photos[photos.length - 1].file_id;
        return res.json({ ok: true, fileId });
      } else {
        console.error("Telegram API response error:", data);
        return res.status(500).json({ error: data.description || "Telegram upload failed" });
      }
    } catch (error: any) {
      console.error("Telegram proxy upload error:", error);
      return res.status(500).json({ error: error.message || "Proxy upload failed" });
    }
  });

  // Telegram file URL retriever proxy endpoint
  app.get("/api/telegram/file-url/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
      const botToken = (process.env.TELEGRAM_BOT_TOKEN || "1988624744:AAFUFeLE6soEn1B_jwQM1TaynP_fDmaNSz0").replace(/['"]/g, "").trim();

      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
      if (!telegramRes.ok) {
        const errorData = await telegramRes.json();
        return res.status(500).json({ error: errorData.description || "Failed to get file data from Telegram" });
      }

      const data = await telegramRes.json();
      if (!data.ok) {
        return res.status(500).json({ error: data.description || "Failed to get file path" });
      }

      const fileUrl = `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
      return res.json({ ok: true, url: fileUrl });
    } catch (error: any) {
      console.error("Telegram file URL proxy error:", error);
      return res.status(500).json({ error: error.message || "Proxy retrieval failed" });
    }
  });

  // Dynamic Sitemap.xml endpoint for SEO and Google Search Console submissions
  app.get("/sitemap.xml", (req, res) => {
    res.header("Content-Type", "application/xml");
    
    // Dynamically check host and fall back to toolzet.xyz in production
    const requestHost = req.get("host") || "";
    const isLocalOrRunApp = requestHost.includes("localhost") || requestHost.includes("run.app") || requestHost.includes("127.0.0.1");
    const host = isLocalOrRunApp ? `${req.protocol}://${requestHost}` : "https://toolzet.xyz";
    const urls = [
      "",
      "/thumbnail-downloader",
      "/thumbnail-preview",
      "/thumbnail-battle",
      "/title-generator",
      "/hashtag-generator",
      "/description-generator",
      "/channel-name-generator",
      "/privacy-policy",
      "/terms-of-service",
      "/contact-support"
    ];

    const todayStr = new Date().toISOString().split("T")[0];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${host}${url}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === "" ? "1.0" : "0.8"}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.send(xml);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist", "client");
    // we need to fix this as our build scripts emit directly to dist, wait, vite outputs to dist by default. Let me check the build script.
    // Actually Vite outputs to dist. I'll use dist.
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => { // Using '*' for express 4 is fine
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
