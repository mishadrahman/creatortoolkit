import React from "react";
import { motion } from "motion/react";
import { Shield, Eye, Lock, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui";
import SEO from "../components/SEO";

export default function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="container mx-auto px-4 md:px-8 py-12 max-w-4xl"
    >
      <SEO 
        title="Privacy Policy"
        description="Learn how Toolzet respects, safeguards, and handles your private metadata and account safety features."
        keywords="privacy policy, data safety, creator tools privacy, cookie consent"
      />
      <div className="text-center mb-12">
        <div className="inline-flex p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 mb-4 shadow-sm">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
          Your privacy matters to us. Learn how Toolzet handles, protects, and respects your data.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Last Updated: June 17, 2026
        </p>
      </div>

      <div className="space-y-8">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <CardTitle className="text-lg">1. Information We Collect</CardTitle>
            </div>
            <CardDescription>What data we collect and why we require it to offer our creator tools.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              At Toolzet, we believe in collecting as little personal information as possible. We only collect details necessary to serve you properly:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> If you sign in via Google or other authenticate methods, we collect your displayName, email, and profile image URL to personalize your space and store safe states.
              </li>
              <li>
                <strong>Tool Usage Data:</strong> Input data such as video titles, generated keyword history, or thumbnail URL queries are kept locally or temporarily parsed to generate requested tags of the corresponding tool.
              </li>
              <li>
                <strong>Local Storage:</strong> We use cookies or browser LocalStorage to persistent your preferences such as light or dark themes.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <CardTitle className="text-lg">2. How Your Data Is Secured</CardTitle>
            </div>
            <CardDescription>Security protocols and policies in place to safeguard your credentials.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              We take information safety seriously. Built on top of enterprise-grade cloud providers, your identity data and personal credentials are protected using industry-standard measures:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">End-to-End Encryption</h4>
                  <p className="text-xs text-slate-500 mt-1">All data transmitted between your device and our tool suite is fully encrypted via HTTPS/TLS protocols.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Firebase Secured Storage</h4>
                  <p className="text-xs text-slate-500 mt-1">Authenticated logins and database documents are stored within isolated Cloud DB instances with strict database rules.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <CardTitle className="text-lg">3. Third-Party Integrations & APIs</CardTitle>
            </div>
            <CardDescription>Details about Gemini AI and YouTube third-party services utilized by our engine.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              Toolzet integrates with third-party providers to enhance functionality:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Google Gemini API:</strong> Generates responsive video titles, optimized metadata, and channel suggestions. Your prompt inputs are safely routed to safe cloud modules.
              </li>
              <li>
                <strong>YouTube Public Services:</strong> Our dynamic thumbnail fetcher routes inquiries via standard public oEmbed modules to locate and download top-performance visuals safely.
              </li>
            </ul>
            <p className="pt-2">
              We never sell or distribute your private search queries, identity details, or prompt inputs to third parties for commercial gain.
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4">
          For any questions concerning this Privacy Policy, please contact our helpline via the <span className="text-red-600 dark:text-red-500 font-medium">Contact Support</span> channels.
        </div>
      </div>
    </motion.div>
  );
}
