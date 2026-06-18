import React, { useState } from "react";
import { Download, Image as ImageIcon, Copy, Check } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";
import SEO from "../components/SEO";

export default function ThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const extractVideoId = (inputUrl: string) => {
    let id = "";
    try {
      const urlObj = new URL(inputUrl);
      if (urlObj.hostname.includes("youtube.com")) {
        id = urlObj.searchParams.get("v") || "";
      } else if (urlObj.hostname.includes("youtu.be")) {
        id = urlObj.pathname.slice(1);
      }
    } catch (e) {
      // maybe it's just the ID
      if (inputUrl.length === 11) id = inputUrl;
    }
    
    if (id !== videoId) {
       setVideoId(id);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    extractVideoId(e.target.value);
  };

  const resolutions = [
    { name: "Max Resolution (HD)", quality: "maxresdefault", res: "1280x720" },
    { name: "High Quality", quality: "hqdefault", res: "480x360" },
    { name: "Medium Quality", quality: "mqdefault", res: "320x180" },
    { name: "Standard Quality", quality: "sddefault", res: "640x480" },
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadImage = async (imgUrl: string, filename: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(imgUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <SEO 
        title="YT Thumbnail Downloader | Download HD Video Covers"
        description="Instantly extract, view, and save maximum-resolution (1080p, HD, SD) cover art, banners, and preview files from any public YouTube video. Fast, safe, and free thumbnail grabber."
        keywords="download youtube thumbnail, download yt thumbnail, full hd thumbnail downloader, extract cover art, high resolution thumbnail grabber, youtube thumbnail exporter, maxresdefault preview downloader, save youtube video covers"
      />
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          YT Thumbnail Downloader
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Extract and download thumbnails in full HD right from any YouTube video URL.
        </p>
      </div>

      <Card className="mb-12 max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <Input
              value={url}
              onChange={handleUrlChange}
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
              className="text-base h-12"
            />
          </div>
        </CardContent>
      </Card>

      {videoId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resolutions.map((res, idx) => {
            const imgUrl = `https://img.youtube.com/vi/${videoId}/${res.quality}.jpg`;
            return (
              <Card key={res.quality} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative group border-b border-gray-200 dark:border-gray-800">
                  <img 
                    src={imgUrl} 
                    alt={res.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                       // Hide if not available (maxresdefault might not exist)
                       (e.target as HTMLImageElement).style.display = 'none';
                       (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-sm text-gray-500">Thumbnail not available in this resolution</div>';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{res.name}</h3>
                      <p className="text-xs text-gray-500">{res.res}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(imgUrl, idx)} className="flex-1 sm:flex-none">
                        {copiedIndex === idx ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copy Link
                      </Button>
                      <Button size="sm" onClick={() => downloadImage(imgUrl, `thumbnail_${videoId}_${res.quality}.jpg`)} className="flex-1 sm:flex-none">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
