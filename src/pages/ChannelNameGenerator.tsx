import React, { useState, useEffect } from "react";
import { Sparkles, Copy, RefreshCw, Check, Star, Trash2, Heart, Type, Smile, FolderOpen, AlertCircle, HelpCircle, X } from "lucide-react";
import { Button, Input, Card, CardContent, Label } from "../components/ui";
import SEO from "../components/SEO";

const CATEGORIES = [
  { id: "tech", label: "Tech & Gadgets", emoji: "💻" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "education", label: "Education & Science", emoji: "📚" },
  { id: "cooking", label: "Cooking & Food", emoji: "🍳" },
  { id: "vlog", label: "Vlog & Lifestyle", emoji: "✈️" },
  { id: "finance", label: "Finance & Investing", emoji: "📈" },
  { id: "entertainment", label: "Comedy & Entertainment", emoji: "🎭" },
  { id: "fitness", label: "Fitness & Health", emoji: "🏋️" },
  { id: "music", label: "Music & Art", emoji: "🎵" },
  { id: "beauty", label: "Fashion & Beauty", emoji: "👗" },
  { id: "other", label: "Other / Custom Niche", emoji: "🌟" },
];

const TONES = [
  { id: "friendly", label: "Friendly & Casual", emoji: "😊" },
  { id: "pro", label: "Pro & Authoritative", emoji: "👔" },
  { id: "funny", label: "Funny & Quirky", emoji: "😜" },
  { id: "minimalist", label: "Minimalist & Elegant", emoji: "🍃" },
  { id: "bold", label: "Energetic & Bold", emoji: "⚡" },
];

const STYLES = [
  { id: "brandable", label: "Brandable / Abstract", desc: "Short, modern, unique", emoji: "💎" },
  { id: "descriptive", label: "Descriptive & Direct", desc: "Clear, niche-focused", emoji: "📍" },
  { id: "personal", label: "Personal / Hybrid", desc: "Using nickname + seed", emoji: "🤝" },
  { id: "action", label: "Kinetic / Action", desc: "Verb prefixes & motion", emoji: "🚀" },
];

export default function ChannelNameGenerator() {
  const [niche, setNiche] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("tech");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [selectedStyle, setSelectedStyle] = useState("brandable");
  const [seedWord, setSeedWord] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedFavIndex, setCopiedFavIndex] = useState<number | null>(null);
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("toolzet_channel_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("toolzet_channel_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const generateNames = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const selectedCategoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label || "Other";
      const selectedToneLabel = TONES.find(t => t.id === selectedTone)?.label || "Friendly & Casual";
      const selectedStyleLabel = STYLES.find(s => s.id === selectedStyle)?.label || "Brandable";

      let promptText = `Generate 12 incredibly catchy, creative, and highly memorable global YouTube channel names.
Niche Keywords / Core Idea: "${niche}"
Channel Category: "${selectedCategoryLabel}"
Vibe / Tone Style: "${selectedToneLabel}"
Naming Style Mode: "${selectedStyleLabel}"
`;

      if (seedWord) {
        promptText += `Incorporate, blend, or gracefully reference this specific seed concept: "${seedWord}"\n`;
      }

      promptText += `
Specific Synthesis & Generation Guideline (Do NOT just prepend or append words):
- Create names containing smart word association, linguistic/syllabic wordplays, portmanteaus, conceptual blending, or unique aesthetic creations.
- NEVER output raw word lists or direct hyphenated concatenations of inputs unless it sounds uniquely modern.
- Keep names relatively short (1 to 2 words, occasionally 3 if incredibly punchy).
- Do NOT include the generic terms "Channel", "Tv", "Youtube", or "Vlog" directly unless they form a highly clever prefix/suffix.
- All names MUST be in English only, designed for a high-value global audience.
- Provide ONLY the plain list of names with a preceding dash (e.g., - SuggestedName). Do not include any numbers, introductory text, explanations, descriptions, or summaries.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: "You are an elite brand naming and brand strategy consultant who specializes in modern, global, highly memorable channel names and viral handle ideas. All suggested names MUST be strictly in English only. Do NOT use or generate any other language such as Bengali under any circumstances.",
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

  const copyToClipboard = (text: string, index: number, isFav = false) => {
    navigator.clipboard.writeText(text);
    if (isFav) {
      setCopiedFavIndex(index);
      setTimeout(() => setCopiedFavIndex(null), 2000);
    } else {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const toggleFavorite = (name: string) => {
    if (favorites.includes(name)) {
      setFavorites(favorites.filter(f => f !== name));
    } else {
      setFavorites([...favorites, name]);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <SEO 
        title="AI YouTube Channel Name Generator | Global Brand Ideas"
        description="Brainstorm perfect, highly memorable YouTube channel names custom-categorized by your topic, mood, naming style preference. Complete with local storage favorites."
        keywords="youtube channel name generator, channel naming options, category based youtube name ideas, brand ideas brainstorming, find channel handles"
      />
      
      {/* Header section with clean brand styling */}
      <div className="mb-10 text-center">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/30 rounded-full">
          AI Brand Brainstormer
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 mb-2 text-slate-900 dark:text-white">
          YouTube Channel Name Generator
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Generate creative, catchy, and globally appealing YouTube channel names custom-categorized for your specific audience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Dynamic Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-6 space-y-6">
              
              {/* Niche Input field */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  1. Channel Niche / Core Keywords
                </Label>
                <Input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. tech gadgets, vegetarian baking, space theories..."
                  className="w-full text-sm h-11"
                  onKeyDown={(e) => e.key === "Enter" && generateNames()}
                />
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Enter 2-3 target keywords representing your video topic.
                </p>
              </div>

              {/* Category selection */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
                  2. Channel Category
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs transition-all ${
                          isSelected 
                            ? "border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold" 
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="text-sm">{cat.emoji}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone/Vibe of Voice Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smile className="h-3.5 w-3.5 text-slate-400" />
                  3. Channel Tone & Vibe
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((toneOpts) => {
                    const isSelected = selectedTone === toneOpts.id;
                    return (
                      <button
                        key={toneOpts.id}
                        type="button"
                        onClick={() => setSelectedTone(toneOpts.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs transition-all ${
                          isSelected 
                            ? "border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold" 
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="text-sm">{toneOpts.emoji}</span>
                        <span className="truncate">{toneOpts.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Naming Styles Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-slate-400" />
                  4. Brand Naming Style
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((styleOpt) => {
                    const isSelected = selectedStyle === styleOpt.id;
                    return (
                      <button
                        key={styleOpt.id}
                        type="button"
                        onClick={() => setSelectedStyle(styleOpt.id)}
                        className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                          isSelected 
                            ? "border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold" 
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs">
                          <span>{styleOpt.emoji}</span>
                          <span className="font-semibold truncate">{styleOpt.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 truncate">{styleOpt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom seed word Optional */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  Include Custom Seed Word? (Optional)
                </Label>
                <Input
                  value={seedWord}
                  onChange={(e) => setSeedWord(e.target.value)}
                  placeholder="e.g. Hub, Quest, Sphere..."
                  className="w-full text-xs h-10"
                />
              </div>

              {/* Trigger Generation Button */}
              <Button 
                onClick={generateNames} 
                disabled={loading || !niche} 
                className="w-full h-12 gap-2 text-sm bg-red-600 hover:bg-red-700 text-white border-0 transition-colors"
                id="generate-button"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating creative handles...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Channel Names
                  </>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Output Suggestions Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Output List Card */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px] flex flex-col justify-between">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Suggested Names (AI Recommendations)
                  </h2>
                </div>
                {names.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">
                    {names.length} Suggestions
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Our AI is crafting high-value creative channel titles...
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                    This takes just a few seconds as we analyze your niche preferences and compile modern ideas.
                  </p>
                </div>
              ) : names.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                  {names.map((name, index) => {
                    const isFavorite = favorites.includes(name);
                    return (
                      <div 
                        key={index} 
                        className="group flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-bold text-sm text-slate-950 dark:text-slate-100 truncate">
                            {name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Suggested Handle Idea
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 p-0.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-red-500"
                            onClick={() => toggleFavorite(name)}
                            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500 animate-pulse" : ""}`} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(name, index, false)}
                            title="Copy to clipboard"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 mb-4 shadow-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Generate Your Next Big Project Name!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                    Type your niche keywords on the left, pick your category, choose a modern naming tone, and click &ldquo;Generate Channel Names&rdquo; to begin.
                  </p>
                  
                  {/* Quick Assist tip bar */}
                  <div className="mt-8 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 max-w-md flex items-start gap-2.5 text-left">
                    <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Creator Tip:</h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                        Choose <strong>&ldquo;Brandable / Abstract&rdquo;</strong> style for modern, premium coined names like &ldquo;Techora&rdquo; or &ldquo;VibeSprout&rdquo; that stand out in global search feeds.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Persistent Favorites/Starred names section */}
          {favorites.length > 0 && (
            <Card className="border border-red-100 dark:border-red-950/50 bg-red-50/10 dark:bg-red-950/5 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between border-b border-red-100 dark:border-red-950/50 pb-3 mb-4">
                  <h3 className="text-sm font-extrabold text-red-600 dark:text-red-400 tracking-wide uppercase flex items-center gap-2">
                    <Star className="h-4 w-4 fill-red-500 text-red-500" />
                    Saved Favorites ({favorites.length})
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFavorites}
                    className="h-8 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50/50 flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear All
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {favorites.map((favName, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {favName}
                      </span>
                      <div className="flex items-center gap-0.5 border-l border-slate-100 dark:border-slate-800 pl-1.5 ml-1">
                        <button 
                          onClick={() => copyToClipboard(favName, index, true)}
                          title="Copy name"
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          {copiedFavIndex === index ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button 
                          onClick={() => toggleFavorite(favName)}
                          title="Unsave name"
                          className="text-slate-300 hover:text-red-500 p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
