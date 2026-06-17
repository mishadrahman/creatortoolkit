import React, { useState } from "react";
import { Copy, Check, Upload, BarChart, ArrowRight, LogIn } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { uploadToTelegram } from "../lib/telegram";
import { useAuth } from "../lib/AuthContext";

export default function ThumbnailBattle() {
  const { user, signIn } = useAuth();
  const [thumbAPreview, setThumbAPreview] = useState<string | null>(null);
  const [thumbBPreview, setThumbBPreview] = useState<string | null>(null);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [battleId, setBattleId] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "A" | "B") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      if (side === "A") {
        setThumbAPreview(previewUrl);
        setFileA(file);
      } else {
        setThumbBPreview(previewUrl);
        setFileB(file);
      }
    }
  };

  const createBattle = async () => {
    if (!fileA || !fileB) return;
    if (!user) {
      alert("Please login first to create a battle.");
      return;
    }

    setCreating(true);
    try {
      // Helper to resize image so Telegram accepts it, only if > 5MB
      const resizeImage = (file: File): Promise<Blob | File> => {
        return new Promise((resolve, reject) => {
          // Check file size (5MB = 5 * 1024 * 1024)
          // Also try to keep as original as possible to avoid losing quality
          if (file.size <= 5 * 1024 * 1024) {
            return resolve(file);
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              
              // Only slightly reduce dimensions to maintain quality
              const MAX_DIMENSION = 2048;
              let width = img.width;
              let height = img.height;
              
              if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                 if (width > height) {
                    height = (height * MAX_DIMENSION) / width;
                    width = MAX_DIMENSION;
                 } else {
                    width = (width * MAX_DIMENSION) / height;
                    height = MAX_DIMENSION;
                 }
              }
              
              canvas.width = width;
              canvas.height = height;
              ctx?.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob((blob) => {
                 if (blob) resolve(blob);
                 else reject(new Error("Blob conversion failed"));
              }, "image/jpeg", 0.95); // High quality
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const compressedA = await resizeImage(fileA);
      const compressedB = await resizeImage(fileB);

      // 1. Upload images to Telegram and get File IDs
      const fileIdA = await uploadToTelegram(compressedA);
      const fileIdB = await uploadToTelegram(compressedB);

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
         alert("Telegram error: Chat not found. Make sure the Chat ID is correct (e.g. -100xxxxx) and your bot is an admin in the channel.");
      } else {
         alert(`Error creating battle: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setCreating(false);
    }
  };

  if (battleId) {
    const battleUrl = `/battle/${battleId}`;
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
         <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8" />
         </div>
         <h1 className="text-3xl font-bold mb-4">Battle Created!</h1>
         <p className="text-gray-500 mb-8">Share this link with your audience to get their votes.</p>
         
         <div className="flex bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded-lg items-center gap-2 mb-8">
            <div className="px-4 text-gray-500 truncate flex-1 text-left select-all">
               {window.location.origin}{battleUrl}
            </div>
            <Button onClick={() => navigator.clipboard.writeText(window.location.origin + battleUrl)}>
               <Copy className="h-4 w-4 mr-2" /> Copy Link
            </Button>
         </div>

         <Link to={battleUrl}>
            <Button variant="outline" className="gap-2">
               Go to Voting Page <ArrowRight className="h-4 w-4" />
            </Button>
         </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          Thumbnail Battle
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          A/B test your thumbnails with your audience before you publish.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
         {!user && (
           <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
             <CardContent className="pt-6 flex flex-col items-center">
               <h3 className="font-semibold text-lg mb-2">Login Required</h3>
               <p className="text-gray-500 mb-4 px-4 text-center">To track your battles and votes later, you must log in to create a thumbnail battle.</p>
               <Button onClick={signIn} className="bg-red-600 hover:bg-red-700 text-white">
                 <LogIn className="h-4 w-4 mr-2" /> Login with Google
               </Button>
             </CardContent>
           </Card>
         )}

         <div className="space-y-4">
            <label className="block text-sm font-medium">Battle Title (Optional)</label>
            <Input 
               value={title} 
               onChange={e => setTitle(e.target.value)} 
               placeholder="e.g. Which thumbnail makes you want to click?"
               className="h-12 text-base"
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thumb A */}
            <div className="space-y-4">
               <h3 className="font-semibold text-center">Option A</h3>
               {!thumbAPreview ? (
                  <div className="aspect-video bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center relative hover:bg-gray-100 cursor-pointer transition-colors">
                     <Upload className="h-8 w-8 text-gray-400 mb-2" />
                     <span className="text-sm text-gray-500 text-center px-4">Upload Thumbnail</span>
                     <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, "A")} disabled={!user} />
                  </div>
               ) : (
                  <div className="aspect-video rounded-xl relative group overflow-hidden bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                     <img src={thumbAPreview} alt="A" className="w-full h-full object-contain" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="destructive" size="sm" onClick={() => { setThumbAPreview(null); setFileA(null); }}>Remove</Button>
                     </div>
                  </div>
               )}
            </div>

            {/* Thumb B */}
            <div className="space-y-4">
               <h3 className="font-semibold text-center">Option B</h3>
               {!thumbBPreview ? (
                  <div className="aspect-video bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center relative hover:bg-gray-100 cursor-pointer transition-colors">
                     <Upload className="h-8 w-8 text-gray-400 mb-2" />
                     <span className="text-sm text-gray-500 text-center px-4">Upload Thumbnail</span>
                     <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, "B")} disabled={!user} />
                  </div>
               ) : (
                  <div className="aspect-video rounded-xl relative group overflow-hidden bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                     <img src={thumbBPreview} alt="B" className="w-full h-full object-contain" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="destructive" size="sm" onClick={() => { setThumbBPreview(null); setFileB(null); }}>Remove</Button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         <div className="flex justify-center pt-8">
            <Button size="lg" className="w-full md:w-auto px-12" disabled={!fileA || !fileB || creating || !user} onClick={createBattle}>
               {creating ? "Creating Battle..." : "Create Battle Link"}
            </Button>
         </div>
      </div>
    </div>
  );
}
