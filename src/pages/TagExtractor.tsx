import React, { useState } from "react";
import { Search, Copy, RefreshCw, Check } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";

export default function TagExtractor() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const extractTags = async () => {
    if (!url) return;
    setLoading(true);
    setSearched(true);
    setTags([]);
    try {
      const res = await fetch("/api/extract-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.tags) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(tags.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          YouTube Tag Extractor
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Uncover the hidden tags used by top-ranking videos to optimize your own.
        </p>
      </div>

      <Card className="mb-8 max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube Video URL"
              className="text-base h-12"
              onKeyDown={(e) => e.key === "Enter" && extractTags()}
            />
            <Button onClick={extractTags} disabled={loading || !url} className="h-12 w-full">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Extract Tags
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && !loading && tags.length === 0 && (
         <div className="text-center text-gray-500 py-12">
            No tags found for this video.
         </div>
      )}

      {tags.length > 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900/50">
          <CardContent className="p-6">
             <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-gray-700 dark:text-gray-300">Extracted Tags ({tags.length})</span>
                <Button variant="outline" size="sm" onClick={copyAll}>
                  {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy Comma Separated
                </Button>
             </div>
             <div className="flex flex-wrap gap-2 text-sm text-gray-700 dark:text-gray-300">
               {tags.map((tag, idx) => (
                 <span key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 cursor-copy hover:border-gray-400 transition-colors" onClick={() => {
                   navigator.clipboard.writeText(tag);
                 }}>
                   {tag}
                 </span>
               ))}
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
