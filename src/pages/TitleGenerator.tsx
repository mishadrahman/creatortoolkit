import React, { useState } from "react";
import { Sparkles, Copy, RefreshCw, Check } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";
import SEO from "../components/SEO";
import FAQSection from "../components/FAQSection";

const TITLE_FAQS = [
  {
    question: "What makes a YouTube video title click-worthy (High CTR)?",
    answer: "A high-CTR title balances emotional triggers (curiosity, fear-of-missing-out, sudden discovery) with clear value propositions. It avoids direct clickbait (which can decrease your watch-time retention) and instead frames the video as the clear solution to a specific topic or mystery."
  },
  {
    question: "How long should my YouTube titles be?",
    answer: "The ideal length is between 50 to 60 characters. YouTube allows up to 100 characters, but anything longer than 60 characters gets truncated (cut off) with '...' in mobile feed lists, hiding your critical call-to-action or punchy keywords."
  },
  {
    question: "Should I place my main search keywords at the beginning or end of my title?",
    answer: "Always prioritize placing your core search phrase near the beginning of your title. This ensures that users scrolling quickly on mobile devices instantly recognize the topic, and it signals high contextual relevance to Google and YouTube crawlers."
  },
  {
    question: "How do capital letters and numbers affect title rankings?",
    answer: "Using numbers (e.g., '5 Secret Steps', '2026 Guide') and selective, single-word capitalization (e.g., 'EASY', 'NEVER') breaks layout monotony and increases raw CTR on busy feeds. Avoid over-capitalizing entire titles, as it reduces readability and looks like spam."
  }
];

export default function TitleGenerator() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateTitles = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 5 highly clickable, emotionally engaging YouTube video titles about: "${topic}". Return only a bulleted list of the 5 titles. Do not include any introduction or explanation. Do not use asterisks.`,
          systemInstruction: "You are an elite global YouTube strategist specializing in high CTR titles. All produced titles MUST be strictly in English only. Do NOT use or generate any other language such as Bengali, under any circumstances.",
        }),
      });
      const data = await res.json();
      if (data.text) {
        const parsed = data.text
          .split("\n")
          .map((line: string) => line.replace(/^-\s*/, "").replace(/^\d+\.\s*/, "").trim())
          .filter(Boolean);
        setTitles(parsed);
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
        title="AI YouTube Title Generator | High CTR Headlines"
        description="Write highly-engaging, viral, and click-boosting video titles. Powered by advanced AI to find popular niches, structures, and keywords that increase viewer clicks and search rank."
        keywords="youtube title generator, high ctr titles, viral title generation, video seo headline optimizer, copy clickbait hook titles, youtube headline generator, search friendly video titles"
      />
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          YouTube Title Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Generate highly clickable, SEO-friendly video titles using AI.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How to start a successful podcast in 2024"
              className="flex-1 text-base h-12"
              onKeyDown={(e) => e.key === "Enter" && generateTitles()}
            />
            <Button onClick={generateTitles} disabled={loading || !topic} className="h-12 px-6 gap-2 shrink-0">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Titles
            </Button>
          </div>
        </CardContent>
      </Card>

      {titles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-medium px-2 text-sm text-gray-500">
            <span>Generated Titles</span>
            <span>{titles.length} ideas</span>
          </div>
          {titles.map((title, index) => (
            <Card key={index} className="overflow-hidden transition-colors hover:border-gray-300 dark:hover:border-gray-700">
              <CardContent className="p-0 flex items-center justify-between">
                <p className="p-4 flex-1 text-gray-900 dark:text-gray-100 font-medium">{title}</p>
                <div className="p-2">
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(title, index)}>
                    {copiedIndex === index ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* FAQ Section */}
      <FAQSection faqs={TITLE_FAQS} />
    </div>
  );
}
