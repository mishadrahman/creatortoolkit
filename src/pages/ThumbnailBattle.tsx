import React, { useState } from "react";
import { Copy, Check, Upload, ArrowRight, LogIn } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { uploadToTelegram } from "../lib/telegram";
import { useAuth } from "../lib/AuthContext";
import CropModal from "../components/CropModal";
import SEO from "../components/SEO";
import FAQSection from "../components/FAQSection";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookMessengerShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  FacebookMessengerIcon,
} from "react-share";

const BATTLE_FAQS = [
  {
    question: "What is a Thumbnail Battle inside Toolzet?",
    answer:
      "A Thumbnail Battle is an interactive visual A/B testing simulator. You can upload two different thumbnail designs (Option A and Option B), generate a shareable voting link, and share it with your audience, friends, or community to gather real human votes on which design grabs more attention.",
  },
  {
    question: "Why should I A/B test my YouTube thumbnails?",
    answer:
      "Your thumbnail is the single most important factor determining your CTR (Click-Through Rate). Even a 2% improvement in CTR can multiply your video impressions into thousands of extra views and boost recommendations on mobile feeds.",
  },
  {
    question: "How long should I run a Thumbnail Battle voting campaign?",
    answer:
      "We recommend running a Battle until you gather at least 25 to 50 votes. This gives you a statistically significant indicator of which graphic performs better under neutral scrolling conditions, helping you pick the winner with confidence.",
  },
  {
    question: "Does changing my thumbnail on an active video help ranking?",
    answer:
      "Absolutely! If a newly published video has a low click-through-rate, swapping the thumbnail for a higher-contrast, tested layout can immediately revive the video, causing YouTube's recommendation algorithm to push it to a broader audience.",
  },
];

export default function ThumbnailBattle() {
  const { user, signIn } = useAuth();
  const [thumbAPreview, setThumbAPreview] = useState<string | null>(null);
  const [thumbBPreview, setThumbBPreview] = useState<string | null>(null);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [battleId, setBattleId] = useState<string | null>(null);

  const [cropTarget, setCropTarget] = useState<{
    side: "A" | "B";
    url: string;
  } | null>(null);

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "A" | "B",
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        // If image is portrait (like 9:16), ask to crop
        if (img.height > img.width) {
          setCropTarget({ side, url: previewUrl });
        } else {
          setPreviewAndFile(side, previewUrl, file);
        }
      };
      img.src = previewUrl;
    }
    // reset input
    e.target.value = "";
  };

  const setPreviewAndFile = (side: "A" | "B", url: string, file: File) => {
    if (side === "A") {
      setThumbAPreview(url);
      setFileA(file);
    } else {
      setThumbBPreview(url);
      setFileB(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    if (cropTarget) {
      const url = URL.createObjectURL(croppedFile);
      setPreviewAndFile(cropTarget.side, url, croppedFile);
      setCropTarget(null);
    }
  };

  const createBattle = async () => {
    if (!fileA || !fileB) return;
    if (!user) {
      alert("Please login first to create a battle.");
      return;
    }

    setCreating(true);
    setUploadProgress(0);
    try {
      // Helper to compress image to webp if > 1MB, or just resize if too large
      const processImage = (file: File): Promise<Blob | File> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const MAX_DIMENSION = 2560;
              const isOversizedFile = file.size > 1 * 1024 * 1024; // 1MB limit for compression trigger
              const isOversizedDimensions =
                img.width > MAX_DIMENSION || img.height > MAX_DIMENSION;

              // If it's under 1MB AND dimensions are safe for Telegram, return original
              if (
                !isOversizedFile &&
                !isOversizedDimensions &&
                file.type !== "image/webp"
              ) {
                return resolve(file);
              }

              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              let width = img.width;
              let height = img.height;

              if (isOversizedDimensions) {
                if (width > height) {
                  height = Math.round((height * MAX_DIMENSION) / width);
                  width = MAX_DIMENSION;
                } else {
                  width = Math.round((width * MAX_DIMENSION) / height);
                  height = MAX_DIMENSION;
                }
              }

              // Set canvas dimensions
              canvas.width = width;
              canvas.height = height;

              // Draw image
              ctx?.drawImage(img, 0, 0, width, height);

              // Extract and compress as WebP
              canvas.toBlob(
                (blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error("Blob conversion failed"));
                },
                "image/webp",
                0.85,
              ); // Compress quality
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const compressedA = await processImage(fileA);
      const compressedB = await processImage(fileB);

      // 1. Upload images to Telegram and get File IDs with progress
      // We will split 100% progress between the two files
      const fileIdA = await uploadToTelegram(compressedA, (p) =>
        setUploadProgress(p * 0.5),
      );
      const fileIdB = await uploadToTelegram(compressedB, (p) =>
        setUploadProgress(50 + p * 0.5),
      );

      // 2. Save File IDs to Firestore
      const docRef = await addDoc(collection(db, "battles"), {
        userId: user.uid,
        title: title || "Which thumbnail is better?",
        thumbA: fileIdA,
        thumbB: fileIdB,
        votesA: 0,
        votesB: 0,
        createdAt: new Date().toISOString(),
      });
      setBattleId(docRef.id);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("chat not found")) {
        alert(
          "Telegram error: Chat not found. Make sure the Chat ID is correct (e.g. -100xxxxx) and your bot is an admin in the channel.",
        );
      } else {
        alert(`Error creating battle: ${err.message || "Unknown error"}`);
      }
    } finally {
      setCreating(false);
      setUploadProgress(0);
    }
  };

  if (battleId) {
    const rawBase = (import.meta as any).env?.BASE_URL || "/";
    const base = rawBase.endsWith("/") ? rawBase : rawBase + "/";
    const battleUrl = `/battle/${battleId}`;
    const shareUrl = window.location.origin + base + `battle/${battleId}`;
    const shareTitle = title || "Which thumbnail is better? Vote now!";

    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          Battle Created!
        </h1>
        <p className="text-slate-500 mb-8">
          Share this link with your audience to get their votes.
        </p>

        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg items-center gap-2 mb-8">
          <div className="px-4 text-slate-500 truncate flex-1 text-left select-all">
            {shareUrl}
          </div>
          <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>
            <Copy className="h-4 w-4 mr-2" /> Copy Link
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 py-4 mb-8">
          <FacebookShareButton url={shareUrl} title={shareTitle}>
            <FacebookIcon size={48} round />
          </FacebookShareButton>
          <FacebookMessengerShareButton url={shareUrl} appId="">
            <FacebookMessengerIcon size={48} round />
          </FacebookMessengerShareButton>
          <WhatsappShareButton
            url={shareUrl}
            title={shareTitle}
            separator=":: "
          >
            <WhatsappIcon size={48} round />
          </WhatsappShareButton>
          <TwitterShareButton url={shareUrl} title={shareTitle}>
            <TwitterIcon size={48} round />
          </TwitterShareButton>
          <TelegramShareButton url={shareUrl} title={shareTitle}>
            <TelegramIcon size={48} round />
          </TelegramShareButton>
        </div>

        <a href={battleUrl}>
          <Button
            variant="outline"
            className="gap-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Go to Voting Page <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <SEO
        title="YouTube Thumbnail Battle | Creative A/B Tester"
        description="Run real comparison match voting tests with alternative video covers. Collect authentic CTR insights, votes, and user feedback from real communities to elevate dynamic performance."
        keywords="youtube thumbnail ab test, compare video overlays, thumbnail vote poll, click-through rate booster, community preference battle, test video cover, ctr ab tool, thumbnail optimizer polls"
      />
      {cropTarget && (
        <CropModal
          imageSrc={cropTarget.url}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropTarget(null)}
        />
      )}

      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          Thumbnail Battle
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          A/B test your thumbnails with your audience and get real voting stats
          before you publish to maximize your click-through-rates.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {!user && (
          <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
            <CardContent className="pt-6 flex flex-col items-center">
              <h3 className="font-semibold text-lg mb-2">Login Required</h3>
              <p className="text-gray-500 mb-4 px-4 text-center">
                To track your battles and votes later, you must log in to create
                a thumbnail battle.
              </p>
              <Button
                onClick={signIn}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" /> Login with Google
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Battle Title (Optional)
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Which thumbnail makes you want to click?"
            className="h-12 text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Thumb A */}
          <div className="space-y-4">
            <h3 className="font-semibold text-center text-gray-900 dark:text-white">
              Option A
            </h3>
            {!thumbAPreview ? (
              <div className="aspect-video bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center relative hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 text-center px-4">
                  Upload Thumbnail
                </span>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, "A")}
                  disabled={!user}
                />
              </div>
            ) : (
              <div className="aspect-video rounded-xl relative group overflow-hidden bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                <img
                  src={thumbAPreview}
                  alt="A"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setThumbAPreview(null);
                      setFileA(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Thumb B */}
          <div className="space-y-4">
            <h3 className="font-semibold text-center text-gray-900 dark:text-white">
              Option B
            </h3>
            {!thumbBPreview ? (
              <div className="aspect-video bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center relative hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 text-center px-4">
                  Upload Thumbnail
                </span>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, "B")}
                  disabled={!user}
                />
              </div>
            ) : (
              <div className="aspect-video rounded-xl relative group overflow-hidden bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                <img
                  src={thumbBPreview}
                  alt="B"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setThumbBPreview(null);
                      setFileB(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 pt-8">
          <Button
            size="lg"
            className="w-full md:w-auto px-12 relative overflow-hidden"
            disabled={!fileA || !fileB || creating || !user}
            onClick={createBattle}
          >
            {creating && (
              <div
                className="absolute inset-0 bg-red-800 pointer-events-none"
                style={{
                  width: `${uploadProgress}%`,
                  transition: "width 0.3s ease",
                }}
              />
            )}
            <span className="relative z-10">
              {creating
                ? `Uploading... ${Math.round(uploadProgress)}%`
                : "Create Battle Link"}
            </span>
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection faqs={BATTLE_FAQS} />
    </div>
  );
}
