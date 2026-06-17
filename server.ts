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

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        }
      });
      const html = await response.text();

      const tagsSet = new Set<string>();

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

      // 3. Try parsing from embed JSON or JSON keywords array in source text
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

      let tags = Array.from(tagsSet).filter(t => t.length > 0);

      // 4. SMART FALLBACK/GENERATOR:
      // If we got 0 tags, fetch the video's title/info and generate high-performance SEO tags via Gemini!
      if (tags.length === 0) {
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
                tags = parsed.map(t => String(t).trim()).filter(Boolean);
              }
            } catch (err) {
              console.error("Gemini fallback parse error:", err);
            }
          }
        }
      }

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
