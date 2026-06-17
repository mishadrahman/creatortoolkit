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
      const response = await fetch(url);
      const html = await response.text();
      // super naive extraction
      const match = html.match(/<meta name="keywords" content="(.*?)">/);
      if (match && match[1]) {
        res.json({ tags: match[1].split(",").map((t) => t.trim()) });
      } else {
        res.json({ tags: [] });
      }
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
