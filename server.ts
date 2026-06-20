import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const distExists = fs.existsSync(path.join(process.cwd(), "dist", "index.html"));
const isProd = process.env.NODE_ENV === "production" || distExists;

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

// Resilient helper to call Gemini API with model fallback and exponential backoff retry on transient errors
async function callGeminiWithFallbackAndRetry(apiKey: string, prompt: string, systemInstruction?: string): Promise<string> {
  // Try newer high-capacity models first, falling back to other compatible models if busy
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro"];
  const maxRetries = 2; // up to 3 attempts total per model
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Calling Gemini API (model: ${model}, attempt: ${attempt + 1}/${maxRetries + 1})...`);
        const ai = new GoogleGenAI({ 
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
          },
        });

        if (response && response.text) {
          console.log(`Successfully generated text with model ${model} on attempt ${attempt + 1}.`);
          return response.text;
        }
        throw new Error(`Empty response returned from model ${model}`);
      } catch (err: any) {
        lastError = err;
        const errMsg = err.message || JSON.stringify(err);
        const statusCode = err.status || (errMsg.includes("503") ? 503 : errMsg.includes("429") ? 429 : null);
        
        // Treat 503 (UNAVAILABLE), 429 (RESOURCE_EXHAUSTED), connection errors, or high-demand alerts as transient
        const isTransient = !statusCode || 
                            statusCode === 503 || 
                            statusCode === 429 || 
                            errMsg.includes("RESOURCE_EXHAUSTED") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("high demand") ||
                            errMsg.includes("busy");

        console.warn(`Attempt ${attempt + 1} with model ${model} failed: ${errMsg}`);

        if (isTransient && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Transient error encountered. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Break the retry loop to immediately try the next fallback model in the list
          break;
        }
      }
    }
  }
  throw lastError || new Error("Failed to generate content with all available models and retries.");
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
          
          generatedText = await callGeminiWithFallbackAndRetry(sanitizedKey, prompt, systemInstruction);
          success = true;
          console.log(`Successful generation using Gemini API key index ${i}!`);
          break; // Exit loop on success
        } catch (err: any) {
          console.error(`Error with Gemini key index ${i} after all fallbacks and retries:`, err.message || err);
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
        return res.status(400).json({ ok: false, error: "Missing image data" });
      }

      // Extract base64 details
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Retrieve bot token and chat ID, fallback to developer values if not customized
      const botToken = (process.env.TELEGRAM_BOT_TOKEN || "1988624744:AAFUFeLE6soEn1B_jwQM1TaynP_fDmaNSz0").replace(/['"]/g, "").trim();
      const chatId = (process.env.TELEGRAM_CHAT_ID || "-1004308800425").replace(/['"]/g, "").trim();

      // In Node.js environment, using the global File class ensures correct multi-part content-type serialization
      const fileName = name || "photo.jpg";
      const file = new File([buffer], fileName, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("photo", file);
      formData.append("chat_id", chatId);

      console.log(`Sending image upload request to Telegram API (Chat: ${chatId})...`);
      
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: formData,
      });

      const data = await telegramRes.json();
      if (data.ok) {
        const photos = data.result.photo;
        const fileId = photos[photos.length - 1].file_id;
        console.log("Telegram upload success. File ID:", fileId);
        return res.json({ ok: true, fileId });
      } else {
        console.error("Telegram API response error:", data);
        return res.status(500).json({ ok: false, error: data.description || "Telegram upload failed" });
      }
    } catch (error: any) {
      console.error("Telegram proxy upload error:", error);
      return res.status(500).json({ ok: false, error: error.message || "Proxy upload failed" });
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
        return res.status(500).json({ ok: false, error: errorData.description || "Failed to get file data from Telegram" });
      }

      const data = await telegramRes.json();
      if (!data.ok) {
        return res.status(500).json({ ok: false, error: data.description || "Failed to get file path" });
      }

      const fileUrl = `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
      return res.json({ ok: true, url: fileUrl });
    } catch (error: any) {
      console.error("Telegram file URL proxy error:", error);
      return res.status(500).json({ ok: false, error: error.message || "Proxy retrieval failed" });
    }
  });

  // Serves pre-rendered static HTML files with clean URLs (omitting .html extension)
  app.get("/privacy-policy", (req, res) => {
    const file = isProd
      ? path.join(process.cwd(), "dist", "privacy-policy.html")
      : path.join(process.cwd(), "public", "privacy-policy.html");
    res.sendFile(file);
  });

  app.get("/terms-of-service", (req, res) => {
    const file = isProd
      ? path.join(process.cwd(), "dist", "terms-of-service.html")
      : path.join(process.cwd(), "public", "terms-of-service.html");
    res.sendFile(file);
  });

  app.get("/contact-support", (req, res) => {
    const file = isProd
      ? path.join(process.cwd(), "dist", "contact-support.html")
      : path.join(process.cwd(), "public", "contact-support.html");
    res.sendFile(file);
  });

  // Dynamic Sitemap.xml endpoint for SEO and Google Search Console submissions
  app.get("/sitemap.xml", (req, res) => {
    res.header("Content-Type", "application/xml; charset=utf-8");
    
    // Always use the primary user custom domain for production SEO and proper GSC indexing
    const host = "https://toolzet.xyz";
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
    <loc>${host}${url === "" ? "/" : url}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === "" ? "1.0" : "0.8"}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.send(xml);
  });

  // Vite middleware for development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files with production optimized Cache-Control headers
    // Highly hashed assets inside dist/assets are cached immutably to raise PageSpeed performance score
    app.use(express.static(path.join(process.cwd(), "dist"), {
      maxAge: "1d",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.includes("/assets/") || filePath.includes("\\assets\\")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      }
    }));
    app.get("*", (req, res) => { // Using '*' for express 4 is fine
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
