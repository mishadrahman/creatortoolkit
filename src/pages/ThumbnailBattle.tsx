import React, { useState } from "react";
import { Copy, Check, Upload, BarChart, ArrowRight } from "lucide-react";
import { Button, Input, Card, CardContent } from "../components/ui";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function ThumbnailBattle() {
  const [thumbA, setThumbA] = useState<string | null>(null);
  const [thumbB, setThumbB] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [battleId, setBattleId] = useState<string | null>(null);

  const resizeAndConvertIfFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          // target size
          const MAX_WIDTH = 640;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // compress
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "A" | "B") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await resizeAndConvertIfFile(file);
      if (side === "A") setThumbA(base64);
      else setThumbB(base64);
    }
  };

  const createBattle = async () => {
    if (!thumbA || !thumbB) return;
    setCreating(true);
    try {
      const docRef = await addDoc(collection(db, "battles"), {
        title: title || "Which thumbnail is better?",
        thumbA,
        thumbB,
        votesA: 0,
        votesB: 0,
        createdAt: new Date().toISOString(),
      });
      setBattleId(docRef.id);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, "battles");
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
               {!thumbA ? (
                  <div className="aspect-video bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center relative hover:bg-gray-100 cursor-pointer transition-colors">
                     <Upload className="h-8 w-8 text-gray-400 mb-2" />
                     <span className="text-sm text-gray-500 text-center px-4">Upload Thumbnail</span>
                     <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, "A")} />
                  </div>
               ) : (
                  <div className="aspect-video rounded-xl relative group overflow-hidden">
                     <img src={thumbA} alt="A" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="destructive" size="sm" onClick={() => setThumbA(null)}>Remove</Button>
                     </div>
                  </div>
               )}
            </div>

            {/* Thumb B */}
            <div className="space-y-4">
               <h3 className="font-semibold text-center">Option B</h3>
               {!thumbB ? (
                  <div className="aspect-video bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center relative hover:bg-gray-100 cursor-pointer transition-colors">
                     <Upload className="h-8 w-8 text-gray-400 mb-2" />
                     <span className="text-sm text-gray-500 text-center px-4">Upload Thumbnail</span>
                     <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, "B")} />
                  </div>
               ) : (
                  <div className="aspect-video rounded-xl relative group overflow-hidden">
                     <img src={thumbB} alt="B" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="destructive" size="sm" onClick={() => setThumbB(null)}>Remove</Button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         <div className="flex justify-center pt-8">
            <Button size="lg" className="w-full md:w-auto px-12" disabled={!thumbA || !thumbB || creating} onClick={createBattle}>
               {creating ? "Creating Battle..." : "Create Battle Link"}
            </Button>
         </div>
      </div>
    </div>
  );
}
