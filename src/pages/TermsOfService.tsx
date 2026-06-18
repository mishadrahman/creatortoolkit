import React from "react";
import { motion } from "motion/react";
import { FileText, Hammer, Ban, Scale, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui";
import SEO from "../components/SEO";

export default function TermsOfService() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="container mx-auto px-4 md:px-8 py-12 max-w-4xl"
    >
      <SEO 
        title="Terms of Service"
        description="Review the acceptable usage policies, guidelines, and terms governing your access to the free tools suite on Toolzet."
        keywords="terms of service, legal guidelines, acceptable use policy, toolzet terms"
      />
      <div className="text-center mb-12">
        <div className="inline-flex p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 mb-4 shadow-sm">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          Terms of Service
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
          Please review the guidelines around accessing and operating the tools provided by Toolzet.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Effective Date: June 17, 2026
        </p>
      </div>

      <div className="space-y-8">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <CardTitle className="text-lg">1. Agreement to Terms</CardTitle>
            </div>
            <CardDescription>Legal framework governing access to our free-to-use toolkit platform.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              By visiting or registering with Toolzet, you signify your full agreement and conformity to these Terms of Service. If you do not accept these terms under any constraints, please terminate your usage of this platform immediately.
            </p>
            <p>
              We reserve the absolute right to revise, update, or alter any portion of these Terms of Service from time to time. Your continued utilization of our resources serves as complete acceptance of any new terms in place.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Hammer className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <CardTitle className="text-lg">2. Acceptable Use Policy</CardTitle>
            </div>
            <CardDescription>Rules and constraints on generating metadata, titles, and thumbnails.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              Toolzet provides free utilities including Title Generator, Hashtag Generator, Description Optimizer, and Thumbnail Downloader. When using these utilities:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>No Automation/Abuse:</strong> You are strictly forbidden from abusing our API routes, employing automated bots, spiders, indexing scraper scripts, or submitting excessive volumes of parallel requests.
              </li>
              <li>
                <strong>Respect YouTube Creators:</strong> When downloading channel assets, respect copyrights. Creators retain ownership of video assets and media thumbnails. Only operate within the bounds of standard fair use.
              </li>
              <li>
                <strong>No Inappropriate Input:</strong> You must not enter harassing, abusive, illegal, or toxic prompts.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <CardTitle className="text-lg">3. Disclaimer of Warranties</CardTitle>
            </div>
            <CardDescription>Limitation of liability and platform uptime warranties.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              Toolzet is provided entirely on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. We do not warranty that our optimization services, dynamic AI generators, or thumbnail processors will be free of interruptions, errors, blockages, or service modifications.
            </p>
            <p>
              Under no scenario shall we be liable for any revenue losses, audience drops, or algorithmic impact of generated metadata on your platforms. Content suggestions are merely ideas and should be reviewed according to your niche standards.
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4">
          For any query concerning these terms, please contact our help agent.
        </div>
      </div>
    </motion.div>
  );
}
