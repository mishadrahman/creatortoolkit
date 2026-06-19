import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";
import SEO from "../components/SEO";
import FAQSection from "../components/FAQSection";

const PREVIEW_FAQS = [
  {
    question: "What is a YouTube Thumbnail Preview / Simulator tool?",
    answer: "It is an interactive mockup application allowing creators to upload their custom thumbnail designs and preview exactly how they appear alongside real-world video titles on YouTube's interface (including Desktop feed grids, Recommended search sidebars, and Mobile grids) before uploading to YouTube."
  },
  {
    question: "Why should I test my thumbnails on a mobile emulator?",
    answer: "Over 70% of YouTube views originate on mobile devices where screens are very small. A thumbnail that looks extremely clean on a huge desktop monitor might have unreadable text, blurry details, or poor contrast on standard mobile grids, leading to low CTR."
  },
  {
    question: "How do I prevent the video duration timestamp from burying my text?",
    answer: "YouTube overlays a solid dark rectangular timestamp (such as '12:34') on the bottom-right corner of all thumbnails. You should strictly avoid placing critical faces, text, logo stamps, or visual peaks in the bottom-right area of your 16:9 canvas."
  },
  {
    question: "How can I improve thumbnail text readability on small displays?",
    answer: "Use bright, high-contrast, thick sans-serif fonts (like Impact, Bebas Neue, or Montserrat Bold). Limit your text to 3 or 4 action words, use strong drop shadows or custom dark backgrounds, and keep elements well-scaled so they can be read in under 0.5 seconds of scrolling."
  }
];

export default function ThumbnailPreview() {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <SEO 
        title="YouTube Thumbnail Layout Previewer & Fit Tester"
        description="Verify exactly how your thumbnail stands out on the Desktop home feed, Recommended Sidebar list, and Mobile portrait feeds before uploading to YouTube. Preview CTR potential."
        keywords="youtube thumbnail preview, test thumbnail layouts, mobile thumbnail tester, youtube feed mockups, layout simulator for creators, thumbnail visual CTR test, overlay previews"
      />
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          YouTube Thumbnail Preview
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload your thumbnail to see exactly how it will look in the YouTube feed.
        </p>
      </div>

      {!image ? (
        <Card className="max-w-2xl mx-auto border-dashed border-2">
          <CardContent className="pt-6 pb-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Thumbnail</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Drag and drop or click to upload<br />(1280x720 recommended)
            </p>
            <div className="relative">
               <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
               <Button className="pointer-events-none">Select File</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          <div className="flex justify-center mb-8">
             <Button variant="outline" onClick={() => setImage(null)} className="gap-2">
                <X className="h-4 w-4" /> Clear Image
             </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-semibold text-xl border-b border-gray-200 dark:border-gray-800 pb-2">Desktop Feed Preview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="aspect-video rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                      <img src={i === 1 ? image : `https://picsum.photos/seed/${i}/640/360`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">10:24</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                      <div className="space-y-1 w-full">
                        <div className="font-semibold text-sm leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
                          {i === 1 ? "YOUR VIDEO TITLE GOES HERE IN BOLD AND CAPS" : `Random Video Title for testing ${i}`}
                        </div>
                        <div className="text-xs text-gray-500">Channel Name<br/>124K views • 2 days ago</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold text-xl border-b border-gray-200 dark:border-gray-800 pb-2">Sidebar / Mobile Preview</h3>
              <div className="flex flex-col gap-4 max-w-sm">
                 <div className="flex gap-2">
                    <div className="w-40 aspect-video rounded-lg overflow-hidden shrink-0 relative bg-gray-200 dark:bg-gray-800">
                      <img src={image} className="w-full h-full object-cover" alt="Thumb" />
                    </div>
                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                       <span className="font-semibold text-sm leading-tight line-clamp-2 text-gray-900 dark:text-gray-100">YOUR AWESOME VIDEO TITLE THAT GETS CLICKS</span>
                       <span className="text-xs text-gray-500">Channel Name</span>
                       <span className="text-xs text-gray-500">1.2M views • 1 year ago</span>
                    </div>
                 </div>
                 {[2, 3, 4].map(i => (
                    <div key={i} className="flex gap-2">
                      <div className="w-40 aspect-video rounded-lg overflow-hidden shrink-0 relative bg-gray-200 dark:bg-gray-800">
                         <img src={`https://picsum.photos/seed/s${i}/320/180`} className="w-full h-full object-cover" alt="Thumb" />
                      </div>
                      <div className="flex flex-col gap-1 w-full pr-4 overflow-hidden">
                         <span className="font-semibold text-sm leading-tight line-clamp-2 text-gray-900 dark:text-gray-100">Another video on the sidebar right here</span>
                         <span className="text-xs text-gray-500">Other Channel</span>
                         <span className="text-xs text-gray-500">45K views • 2 weeks ago</span>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <FAQSection faqs={PREVIEW_FAQS} />
    </div>
  );
}
