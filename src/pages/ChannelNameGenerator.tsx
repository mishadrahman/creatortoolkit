import React, { useState } from "react";
import { Sparkles, Copy, RefreshCw, Check, Star } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";
import SEO from "../components/SEO";

export default function ChannelNameGenerator() {
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateNames = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 10 catchy, unique, and memorable YouTube channel names for the niche: "${niche}". Do not use the word "Channel". Provide only the names in a bulleted list.`,
          systemInstruction: "You are an expert branding consultant.",
        }),
      });
      const data = await res.json();
      if (data.text) {
        const parsed = data.text
          .split("\n")
          .map((line: string) => line.replace(/^-\s*/, "").replace(/^\d+\.\s*/, "").trim())
          .filter(Boolean);
        setNames(parsed);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <SEO 
        title="AI YouTube Channel Name Generator | Brand Ideas Brainstormer"
        description="Generate highly-memorizable, unique, and catchiest brand name suggestions and handles for your YouTube launch. Custom-matched to target your niche, audience, and Search Engine metrics."
        keywords="youtube channel name generator, brand ideas brainstorming, find channel handles, channel name ideas, creative creator nicknames, content username finder"
      />
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          Channel Name Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Brainstorm the perfect memorable name for your YouTube brand.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Your niche or topic (e.g. Minimalist Tech Reviews)"
              className="flex-1 text-base h-12"
              onKeyDown={(e) => e.key === "Enter" && generateNames()}
            />
            <Button onClick={generateNames} disabled={loading || !niche} className="h-12 px-6 gap-2 shrink-0">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Names
            </Button>
          </div>
        </CardContent>
      </Card>

      {names.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {names.map((name, index) => (
            <Card key={index} className="overflow-hidden transition-colors hover:border-gray-300 dark:hover:border-gray-700">
              <CardContent className="p-0 flex items-center justify-between">
                <p className="p-5 flex-1 font-semibold text-lg text-gray-900 dark:text-gray-100">{name}</p>
                <div className="p-3 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(name, index)}>
                    {copiedIndex === index ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-yellow-500">
                     <Star className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
