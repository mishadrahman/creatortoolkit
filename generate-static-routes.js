import fs from "fs";
import path from "path";

const routes = [
  "thumbnail-downloader",
  "thumbnail-preview",
  "thumbnail-battle",
  "my-battles",
  "title-generator",
  "hashtag-generator",
  "description-generator",
  "channel-name-generator"
];

const distDir = path.join(process.cwd(), "dist");
const indexPath = path.join(distDir, "index.html");

if (fs.existsSync(indexPath)) {
  console.log("Generating static route directories for GitHub Pages compatibility...");
  const indexContent = fs.readFileSync(indexPath, "utf8");

  for (const route of routes) {
    const routeDir = path.join(distDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, "index.html"), indexContent);
    console.log(`[Static Routing] Created physical route: ${route}/index.html`);
  }
  console.log("Successfully generated all static route directories for GitHub Pages!");
} else {
  console.error("Error: dist/index.html not found. Make sure 'npm run build' completes successfully before running this script.");
}
