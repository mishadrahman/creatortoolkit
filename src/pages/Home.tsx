import React, { useState } from "react";
import { ArrowRight, Image as ImageIcon, Sparkles, Hash, AlignLeft, Type, Tags, LayoutList, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui";
import SEO from "../components/SEO";

const categories = [
  { id: "all", name: "All Tools" },
  { id: "design", name: "Visuals & Design" },
  { id: "ai", name: "AI Writers" },
  { id: "seo", name: "SEO & Discovery" },
];

const tools = [
  {
    name: "Thumbnail Battle",
    category: "design",
    categoryLabel: "Visuals & CTR Test",
    purpose: "Run A/B match tests with two of your custom thumbnails to see which one gets direct audience votes.",
    icon: ImageIcon,
    href: "/thumbnail-battle",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/20",
    borderColor: "group-hover:border-red-300 dark:group-hover:border-red-800",
    glow: "group-hover:shadow-[0_0_25px_-5px_rgba(239,68,68,0.12)]",
    badgeColor: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    span: "md:col-span-12 lg:col-span-6 lg:row-span-4",
    highlight: true,
  },
  {
    name: "Thumbnail Downloader",
    category: "design",
    categoryLabel: "Asset Grabber",
    purpose: "Instantly extract and download the high-definition cover art from any existing public YouTube video.",
    icon: ImageIcon,
    href: "/thumbnail-downloader",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "group-hover:border-blue-300 dark:group-hover:border-blue-800",
    glow: "group-hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.12)]",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-3",
  },
  {
    name: "Thumbnail Preview",
    category: "design",
    categoryLabel: "Layout Test",
    purpose: "Verify exactly how your thumbnail pops on Desktop feed, Sidebar feeds, and Mobile layouts before uploading.",
    icon: LayoutList,
    href: "/thumbnail-preview",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    borderColor: "group-hover:border-indigo-300 dark:group-hover:border-indigo-800",
    glow: "group-hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.12)]",
    badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-3",
  },
  {
    name: "Title Generator",
    category: "ai",
    categoryLabel: "AI Copywriter",
    purpose: "Generate psychological & high-click YouTube title varieties customized to your target core concepts.",
    icon: Sparkles,
    href: "/title-generator",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "group-hover:border-orange-300 dark:group-hover:border-orange-800",
    glow: "group-hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.12)]",
    badgeColor: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-2",
  },
  {
    name: "Hashtag Generator",
    category: "seo",
    categoryLabel: "Discovery SEO",
    purpose: "Instantly compile a list of related, hyper-targeted hashtags to supplement your YouTube search ranking.",
    icon: Hash,
    href: "/hashtag-generator",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "group-hover:border-emerald-300 dark:group-hover:border-emerald-800",
    glow: "group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.12)]",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-2",
  },
  {
    name: "Channel Name Generator",
    category: "ai",
    categoryLabel: "Branding",
    purpose: "Establish highly custom, clean brand ideas and channel identity names matching your specific niche.",
    icon: Type,
    href: "/channel-name-generator",
    color: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800",
    borderColor: "group-hover:border-slate-400 dark:group-hover:border-slate-700",
    glow: "group-hover:shadow-[0_0_25px_-5px_rgba(100,116,139,0.12)]",
    badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    span: "md:col-span-12 lg:col-span-6 lg:row-span-2",
  },
  {
    name: "Description Generator",
    category: "ai",
    categoryLabel: "SEO Structure",
    purpose: "Instantly draft beautiful descriptions with built-in areas for social handles, timeline chapters, and rules.",
    icon: AlignLeft,
    href: "/description-generator",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "group-hover:border-purple-300 dark:group-hover:border-purple-800",
    glow: "group-hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.12)]",
    badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-1",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTools = tools.filter(
    (tool) => activeCategory === "all" || tool.category === activeCategory
  );

  return (
    <div className="relative min-h-[85vh] overflow-hidden">
      <SEO 
        title="Free AI YouTube Creator Tools & A/B Tester"
        description="Boost your click-through rate (CTR) and views with Toolzet. Compare video cover thumbnails using interactive A/B battles, test mobile feed views, find high-ranking titles, tags, and custom channel brand handles."
        keywords="youtube SEO tools, youtube thumbnail ab test, youtube keyword research tool, thumbnail preview tool, best hashtags for youtube, boost youtube ctr, viral youtube video titles, find channel names, youtube branding suite"
      />
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-400/5 dark:bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-400/5 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-400/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-10 flex flex-col gap-1 items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/5 dark:bg-red-500/10 text-red-500 text-xs font-semibold tracking-wider uppercase mb-3 border border-red-500/10">
            <Sparkles className="w-3.5 h-3.5" /> All-In-One Toolkit
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-3">
            Smart tools for creators, marketers and everyday users.
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl">
            Everything you need to level up your branding, optimize search discovery metrics, preview cover art, and write highly-engaging copy in seconds.
          </p>
        </section>

        {/* Category Switches */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-2xl mx-auto px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

         {/* Grid of Tools */}
        <section className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-5 max-w-6xl mx-auto mb-16 lg:grid-flow-row-dense">
          {filteredTools.map((tool) => (
            <a key={tool.name} href={tool.href} className={`group cursor-pointer ${tool.span}`}>
              <Card className={`h-full transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden group ${tool.borderColor} ${tool.glow}`}>
                {tool.name === "Thumbnail Battle" && (
                  <div className="absolute top-5 right-5 pointer-events-none">
                    <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full uppercase tracking-wider">HOT FEATURE</span>
                  </div>
                )}
                <CardHeader className="p-5 flex flex-col h-full justify-between min-h-[160px]">
                  <div>
                    {/* Badge showing exactly what the option is for */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tool.bg} ${tool.color}`}>
                        <tool.icon className="h-4.5 w-4.5" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${tool.badgeColor}`}>
                        {tool.categoryLabel}
                      </span>
                    </div>

                    <CardTitle className="text-lg text-slate-900 dark:text-white font-extrabold group-hover:text-red-500 transition-colors flex items-center gap-1">
                      {tool.name}
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-500" />
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                      {tool.purpose}
                    </CardDescription>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Ready to Use
                    </span>
                    <span className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-0.5 group-hover:underline">
                      Open Tool <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </a>
          ))}
        </section>
        
        {/* FAQ / Content Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black mb-6 text-center text-slate-900 dark:text-white tracking-tight">Built for Growth</h2>
          <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm px-6 text-center">
            <p>
              Toolzet is designed by creators, for creators. Our tools help you manage the tedious parts 
              of publishing on YouTube so you can focus on making great videos. Whether you need a spark of inspiration 
              for your next video title, or an optimized description for better SEO, we have you covered.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

