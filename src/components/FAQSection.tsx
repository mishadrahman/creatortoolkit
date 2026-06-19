import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
}

export default function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
  description = "Have questions about this tool? Find quick answers below to optimize your YouTube content strategy."
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate Google Search structured data (JSON-LD Schema) for rich result snippets
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      }
    }))
  };

  return (
    <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-12 pb-6 w-full animate-fade-in" id="faq-section">
      {/* Schema dynamic injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/30 rounded-full mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            Learn & Excel
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm mt-3 text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="group border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/40 hover:border-red-200 dark:hover:border-red-950/50 transition-all duration-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 md:py-4.5 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/10"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {faq.question}
                  </span>
                  <span className="shrink-0 p-1 rounded-lg bg-slate-50 dark:bg-slate-900 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 transition-colors">
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 group-hover:text-red-500 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-red-500" : ""
                      }`}
                    />
                  </span>
                </button>
                
                {/* Collapsible area */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 text-xs md:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-4 leading-relaxed bg-slate-50/30 dark:bg-slate-950/10">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
