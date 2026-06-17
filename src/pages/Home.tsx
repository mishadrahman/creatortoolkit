import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, Sparkles, Hash, AlignLeft, Type, Tags, LayoutList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui";

const tools = [
  {
    name: "Thumbnail Battle",
    description: "A/B test thumbnails with your audience and see what gets clicks.",
    icon: ImageIcon,
    href: "/thumbnail-battle",
    color: "text-red-500",
    bg: "bg-red-500/10",
    span: "md:col-span-12 lg:col-span-6 lg:row-span-4",
  },
  {
    name: "Thumbnail Downloader",
    description: "Extract and download any YouTube thumbnail in high resolution.",
    icon: ImageIcon,
    href: "/thumbnail-downloader",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-3",
  },
  {
    name: "Thumbnail Preview",
    description: "See how your thumbnail looks in the YouTube feed before publishing.",
    icon: LayoutList,
    href: "/thumbnail-preview",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-3",
  },
  {
    name: "Title Generator",
    description: "AI-powered, highly clickable title ideas for your next video.",
    icon: Sparkles,
    href: "/title-generator",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-2",
  },
  {
    name: "Hashtag Generator",
    description: "Generate relevant trending hashtags to boost your reach.",
    icon: Hash,
    href: "/hashtag-generator",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-2",
  },
  {
    name: "Channel Name Generator",
    description: "Brainstorm catchy, unique names for your creator brand.",
    icon: Type,
    href: "/channel-name-generator",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    span: "md:col-span-12 lg:col-span-6 lg:row-span-2",
  },
  {
    name: "Description Generator",
    description: "Write SEO-optimized descriptions with timestamps and CTA.",
    icon: AlignLeft,
    href: "/description-generator",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-1",
  },
  {
    name: "Tag Extractor",
    description: "Extract and copy the hidden meta tags from any video.",
    icon: Tags,
    href: "/tag-extractor",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    span: "md:col-span-6 lg:col-span-3 lg:row-span-1",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-12 flex flex-col gap-1 items-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Free YouTube Creator Tools in One Place
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
          Everything you need to grow your channel, optimized for high performance.
        </p>
      </section>

      {/* Grid of Tools */}
      <section className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-4 max-w-6xl mx-auto mb-16 lg:grid-flow-row-dense">
        {tools.map((tool) => (
          <Link key={tool.name} to={tool.href} className={`group cursor-pointer ${tool.span}`}>
            <Card className="h-full transition-colors hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl relative overflow-hidden group">
              {tool.name === "Thumbnail Battle" && (
                <div className="absolute top-5 right-5 pointer-events-none">
                  <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded">HOT FEATURE</span>
                </div>
              )}
              <CardHeader className="p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${tool.bg} ${tool.color}`}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg text-slate-900 dark:text-white font-bold group-hover:text-red-500 transition-colors">{tool.name}</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
      
      {/* FAQ / Content Section */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white tracking-tight">Built for Growth</h2>
        <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm px-6 text-center">
          <p>
            Creator Toolkit is designed by creators, for creators. Our tools help you manage the tedious parts 
            of publishing on YouTube so you can focus on making great videos. Whether you need a spark of inspiration 
            for your next video title, or an optimized description for better SEO, we have you covered.
          </p>
        </div>
      </section>
    </div>
  );
}
