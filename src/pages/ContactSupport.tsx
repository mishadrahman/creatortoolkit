import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Textarea, Label } from "../components/ui";
import { useAuth } from "../lib/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import SEO from "../components/SEO";

export default function ContactSupport() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("Please fill out all the fields so we can support you properly.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      try {
        await addDoc(collection(db, "support_tickets"), {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          userId: user?.uid || "guest",
          createdAt: new Date().toISOString(),
          status: "open",
        });

        setSubmitted(true);
        setSubject("");
        setMessage("");
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, "support_tickets");
      }
    } catch (err: any) {
      console.error("Failed to submit support ticket:", err);
      try {
        const parsed = JSON.parse(err.message);
        setErrorMsg(`Failed to submit: ${parsed.error}`);
      } catch {
        setErrorMsg(err.message || "Failed to deliver your ticket. Please verify your connection or try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="container mx-auto px-4 md:px-8 py-12 max-w-4xl"
    >
      <SEO 
        title="Contact Support"
        description="Need assistance or have feedback for our AI YouTube optimizer tools? Send our team a ticket and we will support you."
        keywords="contact support, client help, tool feedback, support ticket, creator assistance"
      />
      <div className="text-center mb-12">
        <div className="inline-flex p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 mb-4 shadow-sm">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          Contact Support
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
          Need assistance or want to request a custom optimizer? Send us a message and our team will support you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Support channels details */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-600 dark:text-red-400" />
              Creator Support channels
            </h2>
            
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Email Inquiry</h3>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">support@creatortoolkit.com</p>
                <p className="text-xs text-slate-400 mt-0.5">Send details directly with file attachments anytime.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Community feedback</h3>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">Join Creator Hub on Discord</p>
                <p className="text-xs text-slate-400 mt-0.5">Discuss strategies and optimization tips live.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Notice for Free Creators</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              To support our creators across the globe, Toolzet runs fully non-profitable. Submitting a ticket automatically secures your position in our priority support queue.
            </p>
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="md:col-span-7">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <CardTitle className="text-base">Open a Support Ticket</CardTitle>
              <CardDescription>Fill out this form and we will log the ticket instantly in our help desk.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                    <div className="w-14 h-14 bg-green-50 dark:bg-green-950/30 text-green-500 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ticket Submitted Successfully!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                      Thank you for contacting us! We have successfully submitted your response to Firestore Support Queue with ticket reference. Our help desks will follow up with you quickly.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" size="sm">
                      Submit Another Ticket &rarr;
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                    {errorMsg && (
                      <div className="flex gap-2 items-start p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="support-name">Your Name</Label>
                        <Input
                          id="support-name"
                          placeholder="Mishad Rahman"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="support-email">Email Address</Label>
                        <Input
                          id="support-email"
                          type="email"
                          placeholder="mishad@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="support-subject">Subject</Label>
                      <Input
                        id="support-subject"
                        placeholder="Feature request or bug issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="support-message">Message Details</Label>
                      <Textarea
                        id="support-message"
                        rows={5}
                        placeholder="Please write down whatever you are experiencing or want us to look at. Mention any specifications or steps..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="resize-none"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold flex items-center justify-center gap-2">
                      {loading ? (
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Ticket
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
