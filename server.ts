import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
        },
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // Extract tags route (server side fetch to avoid CORS)
  app.post("/api/extract-tags", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Normalization: Prepend https:// if not present
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }

      // Extract raw YouTube video ID if possible
      const youtubeVideoIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
      const videoIdMatch = normalizedUrl.match(youtubeVideoIdRegex);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      let targetUrl = normalizedUrl;
      if (videoId) {
        targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }

      const tagsSet = new Set<string>();
      let html = "";
      let fetchSuccess = false;

      try {
        const response = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          }
        });
        if (response.ok) {
          html = await response.text();
          fetchSuccess = true;
        }
      } catch (fetchErr) {
        console.error("Direct fetch failed, falling back...", fetchErr);
      }

      if (fetchSuccess && html) {
        // 1. Try extracting from og:video:tag properties which YouTube emits separately per tag
        const ogTagRegex = /<meta\s+property=["']og:video:tag["']\s+content=["'](.*?)["']/gi;
        let match;
        while ((match = ogTagRegex.exec(html)) !== null) {
          if (match[1]) {
            tagsSet.add(match[1].trim());
          }
        }

        // 2. Try extracting from general keywords metadata
        const keywordsRegex = /<meta\s+name=["']keywords["']\s+content=["'](.*?)["']/i;
        const keywordsMatch = html.match(keywordsRegex);
        if (keywordsMatch && keywordsMatch[1]) {
          keywordsMatch[1].split(",").forEach(t => {
            const trimmed = t.trim();
            if (trimmed) tagsSet.add(trimmed);
          });
        }

        // 3. Try parsing from JSON keywords array in source text
        const jsonKeywordsRegex = /"keywords"\s*:\s*\[(.*?)\]/;
        const jsonMatch = html.match(jsonKeywordsRegex);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsed = JSON.parse(`[${jsonMatch[1]}]`);
            if (Array.isArray(parsed)) {
              parsed.forEach((t: any) => {
                if (typeof t === "string" && t.trim()) {
                  tagsSet.add(t.trim());
                }
              });
            }
          } catch (e) {
            const individualTags = jsonMatch[1].match(/"([^"]+)"/g);
            if (individualTags) {
              individualTags.forEach(t => {
                const cleaned = t.replace(/"/g, "").trim();
                if (cleaned) tagsSet.add(cleaned);
              });
            }
          }
        }

        // 4. Try parsing from modern inner JSON "tags" array which stores actual tags
        const tagsRegex = /"tags"\s*:\s*\[([^\]]+)\]/g;
        let tagsMatch;
        while ((tagsMatch = tagsRegex.exec(html)) !== null) {
          const innerSection = tagsMatch[1];
          const items = innerSection.match(/"([^"]+)"/g);
          if (items) {
            items.forEach(item => {
              const cleaned = item.replace(/"/g, "").trim();
              if (cleaned && cleaned.length > 0 && cleaned.toLowerCase() !== "tags") {
                tagsSet.add(cleaned);
              }
            });
          }
        }
      }

      // 5. OEMBED + GEMINI SMART BACKUP FLOW:
      // If we got 0 tags (due to CAPTCHA blocking, hidden tags, or modern YouTube deprecations), 
      // but we have a valid videoId, fetch the public metadata from oEmbed and use Gemini to generate highly optimized tags!
      if (tagsSet.size === 0 && videoId) {
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
          const oembedResponse = await fetch(oembedUrl);
          if (oembedResponse.ok) {
            const oembedData = await oembedResponse.json();
            if (oembedData && oembedData.title) {
              const title = oembedData.title;
              const author = oembedData.author_name || "";

              const prompt = `You are a professional YouTube SEO keyword specialist. Generate a clean list of the 15-25 most popular, relevant, and high-performance search tags and high-volume keywords for a video with:
Title: "${title}"
Creator/Author: "${author}"

Output must be a valid, raw JSON array of strings. Do not include markdown formatting or backticks.
Example: ["tag 1", "tag 2", "tag 3"]`;

              const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                  responseMimeType: "application/json"
                }
              });

              if (response.text) {
                const parsed = JSON.parse(response.text.trim());
                if (Array.isArray(parsed)) {
                  parsed.forEach(t => {
                    const cleaned = String(t).trim();
                    if (cleaned) tagsSet.add(cleaned);
                  });
                }
              }
            }
          }
        } catch (oembedErr) {
          console.error("Backup oEmbed/Gemini recovery failed:", oembedErr);
        }
      }

      // 6. DEEP HTML-TITLE BACKUP:
      // If still nothing, extract title from HTML and generate via Gemini
      if (tagsSet.size === 0 && html) {
        let title = "";
        const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].replace("- YouTube", "").trim();
        }

        let desc = "";
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) || html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
        if (descMatch && descMatch[1]) {
          desc = descMatch[1].trim();
        }

        if (title && title !== "YouTube") {
          const prompt = `You are a professional YouTube SEO keyword specialist. Extract or generate a clean JSON array of the 15-25 most popular, relevant search tags and high-volume keywords for a video with:
Title: "${title}"
${desc ? `Description: "${desc.substring(0, 400)}"` : ""}

Output must be a valid raw JSON array of strings. Do not include markdown formatting or backticks.
Example: ["tag 1", "tag 2", "tag 3"]`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });

          if (response.text) {
            try {
              const parsed = JSON.parse(response.text.trim());
              if (Array.isArray(parsed)) {
                parsed.forEach(t => {
                  const cleaned = String(t).trim();
                  if (cleaned) tagsSet.add(cleaned);
                });
              }
            } catch (err) {
              console.error("Gemini fallback parse error:", err);
            }
          }
        }
      }

      const tags = Array.from(tagsSet).filter(t => t.length > 0);
      res.json({ tags });
    } catch (error) {
      console.error("Fetch Error:", error);
      res.status(500).json({ error: "Failed to extract tags" });
    }
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
