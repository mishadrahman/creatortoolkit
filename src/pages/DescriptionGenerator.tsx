import React, { useState } from "react";
import { Sparkles, Copy, RefreshCw, Check } from "lucide-react";
import { Button, Input, Textarea, Card, CardContent } from "../components/ui";

export default function DescriptionGenerator() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const generateDesc = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a comprehensive, SEO-optimized YouTube video description for a video about: "${topic}". Include an engaging introduction, a section for timestamps (leave the times as 00:00 placeholders), a call to action to subscribe, social media links placeholders, and 5-10 relevant hashtags at the bottom.`,
          systemInstruction: "You are an expert YouTube growth hacker. Write directly without generic AI intros.",
        }),
      });
      const data = await res.json();
      if (data.text) {
        setDescription(data.text);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyDesc = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          YouTube Description Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Craft perfect, SEO-friendly video descriptions in seconds.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is your video about? e.g. Reviewing the M3 MacBook Pro 14-inch"
              className="text-base h-12"
              onKeyDown={(e) => e.key === "Enter" && generateDesc()}
            />
            <Button onClick={generateDesc} disabled={loading || !topic} className="h-12 w-full md:w-auto self-end px-8 gap-2">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Description
            </Button>
          </div>
        </CardContent>
      </Card>

      {description && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
               <span className="font-semibold text-gray-900 dark:text-white">Generated Description</span>
               <Button variant="outline" size="sm" onClick={copyDesc}>
                  {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy to Clipboard
               </Button>
            </div>
            <Textarea 
               value={description}
               readOnly
               className="min-h-[400px] font-mono whitespace-pre-wrap text-sm leading-relaxed"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
