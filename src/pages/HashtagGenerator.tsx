import React, { useState } from "react";
import { Sparkles, Copy, RefreshCw, Check } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";
import SEO from "../components/SEO";
import FAQSection from "../components/FAQSection";

const HASHTAG_FAQS = [
  {
    question: "Why are hashtags important for YouTube SEO?",
    answer: "Hashtags make your videos discoverable by categorizing them into broad search collections. They help YouTube's algorithm understand your content cluster, index your videos accurately, and display them under specific hashtag landing pages and user recommendation lists."
  },
  {
    question: "How many hashtags should I include in my YouTube videos?",
    answer: "While YouTube allows up to 60 hashtags per video, Google recommends using between 3 to 15 highly relevant hashtags in your video description. Over-stuffing hashtags is considered spammy and may lead to YouTube ignoring all of them or reducing your search visibility."
  },
  {
    question: "Where do my hashtags display on YouTube?",
    answer: "On mobile and desktop browsers, the first three hashtags of your description will automatically display above your video's title or inside the initial description container. This prime visibility drives direct user clicks on specific keywords."
  },
  {
    question: "Should my hashtags have punctuation or spaces?",
    answer: "No. Commas, periods, or spaces will break a hashtag on social platform algorithms. Our AI generator automatically strip spaces and punctuation, combining multiple-word phrases into clean, easy-to-read hashtags (e.g. #GamingGear)."
  }
];

export default function HashtagGenerator() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateHashtags = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 20 relevant, highly searched YouTube hashtags for a video about: "${topic}". Return only the hashtags separated by spaces,.`,
          systemInstruction: "You are a professional global YouTube SEO expert. All generated hashtags and words MUST be strictly in English only. Do NOT use or generate any other language such as Bengali, under any circumstances.",
        }),
      });
      const data = await res.json();
      if (data.text) {
        const parsed = data.text
          .split(/[\s,]+/)
          .filter((t: string) => t.startsWith("#") || t.trim().length > 0)
          .map((t: string) => (t.startsWith("#") ? t : `#${t}`))
          .filter((t: string) => t !== "#");
        setHashtags(parsed);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(hashtags.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <SEO 
        title="AI YouTube Hashtag Generator | Viral SEO Tags Finder"
        description="Discover trending and contextually-aware searchable tags. Leverage real-time AI to supplement your video's search visibility, optimize crawl classification, and rank higher in search indexes."
        keywords="youtube tag generator, best hashtags for youtube, find youtube video keywords, search tags optimization, video classification tool, seo tag indexer, trending video hash keywords"
      />
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          YouTube Hashtag Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Find the best hashtags to boost your video's search visibility.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. minimalist desk setup"
              className="flex-1 text-base h-12"
              onKeyDown={(e) => e.key === "Enter" && generateHashtags()}
            />
            <Button onClick={generateHashtags} disabled={loading || !topic} className="h-12 px-6 gap-2 shrink-0">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Hashtags
            </Button>
          </div>
        </CardContent>
      </Card>

      {hashtags.length > 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900/50">
          <CardContent className="p-6">
             <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-gray-700 dark:text-gray-300">Generated Hashtags ({hashtags.length})</span>
                <Button variant="outline" size="sm" onClick={copyAll}>
                  {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy All
                </Button>
             </div>
             <div className="flex flex-wrap gap-2 text-lg text-blue-600 dark:text-blue-400 font-medium">
               {hashtags.map((tag, idx) => (
                 <span key={idx} className="cursor-pointer hover:underline" onClick={() => {
                   navigator.clipboard.writeText(tag);
                 }}>{tag}</span>
               ))}
             </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Section */}
      <FAQSection faqs={HASHTAG_FAQS} />
    </div>
  );
}
