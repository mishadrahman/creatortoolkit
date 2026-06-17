import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Button } from "../components/ui";
import { getTelegramFileUrl } from "../lib/telegram";
import { useAuth } from "../lib/AuthContext";
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
  FacebookMessengerIcon
} from "react-share";

export default function BattleView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votedFor, setVotedFor] = useState<"A" | "B" | null>(null);
  const [urlA, setUrlA] = useState<string | null>(null);
  const [urlB, setUrlB] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  const shareUrl = window.location.href;
  const shareTitle = battle?.title || "Which thumbnail is better? Vote now!";

  useEffect(() => {
    // Check local storage for previous vote
    if (id) {
      const storedVotes = JSON.parse(localStorage.getItem('thumbnail_battle_votes') || '{}');
      if (storedVotes[id]) {
        setVotedFor(storedVotes[id]);
      }
    }

    const fetchBattle = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "battles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBattle({ id: docSnap.id, ...data });
          
          if (user && data.userId === user.uid) {
            setIsCreator(true);
          }

          // Resolve Telegram URLs dynamically so they don't expire
          try {
             const resolvedA = await getTelegramFileUrl(data.thumbA);
             setUrlA(resolvedA);
          } catch (e) {
             console.error("Failed resolving A URL", e);
             setUrlA(data.thumbA); // Fallback
          }
          try {
             const resolvedB = await getTelegramFileUrl(data.thumbB);
             setUrlB(resolvedB);
          } catch (e) {
             console.error("Failed resolving B URL", e);
             setUrlB(data.thumbB); // Fallback
          }

        }
      } catch (e) {
        console.error(e);
        handleFirestoreError(e, OperationType.GET, `battles/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBattle();
  }, [id, user]);

  const handleVote = async (side: "A" | "B") => {
    if (votedFor || !id || isCreator) return;
    setVotedFor(side);
    
    // Save to local storage
    const storedVotes = JSON.parse(localStorage.getItem('thumbnail_battle_votes') || '{}');
    storedVotes[id] = side;
    localStorage.setItem('thumbnail_battle_votes', JSON.stringify(storedVotes));

    // optimistic update
    setBattle((prev: any) => ({
       ...prev,
       [`votes${side}`]: prev[`votes${side}`] + 1
    }));

    try {
      const docRef = doc(db, "battles", id);
      await updateDoc(docRef, {
        [`votes${side}`]: increment(1)
      });
    } catch (e) {
      console.error("Failed to vote", e);
      handleFirestoreError(e, OperationType.UPDATE, `battles/${id}`);
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center">Loading battle...</div>;
  }

  if (!battle) {
    return <div className="min-h-[50vh] flex items-center justify-center text-red-500">Battle not found.</div>;
  }

  const totalVotes = battle.votesA + battle.votesB;
  const pctA = totalVotes === 0 ? 0 : Math.round((battle.votesA / totalVotes) * 100);
  const pctB = totalVotes === 0 ? 0 : Math.round((battle.votesB / totalVotes) * 100);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-24">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          {battle.title || "Which thumbnail is better?"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {isCreator ? "You are the creator of this battle. You cannot vote." : "Vote for the thumbnail you would be more likely to click."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Option A */}
        <div className="space-y-6">
           <div 
             className={`aspect-video rounded-xl overflow-hidden cursor-pointer bg-black/5 dark:bg-white/5 transition-all border-4 ${(votedFor === 'A' || (isCreator && battle.votesA >= battle.votesB && battle.votesA > 0)) ? 'border-green-500 shadow-xl shadow-green-500/20' : 'border-transparent hover:scale-[1.02]'}`}
             onClick={() => handleVote('A')}
           >
              {urlA ? <img src={urlA} alt="Option A" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />}
           </div>
           
           {(!votedFor && !isCreator) ? (
              <Button className="w-full" size="lg" onClick={() => handleVote('A')} disabled={!urlA}>Vote for A</Button>
           ) : (
              <div className="space-y-2">
                 <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                    <span>Option A</span>
                    <span>{pctA}%</span>
                 </div>
                 <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${pctA}%` }} />
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{battle.votesA} votes</p>
              </div>
           )}
        </div>

        {/* Option B */}
        <div className="space-y-6">
           <div 
             className={`aspect-video rounded-xl overflow-hidden cursor-pointer bg-black/5 dark:bg-white/5 transition-all border-4 ${(votedFor === 'B' || (isCreator && battle.votesB >= battle.votesA && battle.votesB > 0)) ? 'border-green-500 shadow-xl shadow-green-500/20' : 'border-transparent hover:scale-[1.02]'}`}
             onClick={() => handleVote('B')}
           >
              {urlB ? <img src={urlB} alt="Option B" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />}
           </div>
           
           {(!votedFor && !isCreator) ? (
              <Button className="w-full" size="lg" onClick={() => handleVote('B')} disabled={!urlB}>Vote for B</Button>
           ) : (
              <div className="space-y-2">
                 <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                    <span>Option B</span>
                    <span>{pctB}%</span>
                 </div>
                 <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${pctB}%` }} />
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{battle.votesB} votes</p>
              </div>
           )}
        </div>
      </div>
      
      <div className="mt-16 text-center max-w-xl mx-auto space-y-6 border-t border-gray-200 dark:border-gray-800 pt-8">
         <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm inline-block">Share this Battle</h3>
         <div className="flex flex-wrap items-center justify-center gap-4 py-4">
           <FacebookShareButton url={shareUrl} title={shareTitle}>
             <FacebookIcon size={48} round />
           </FacebookShareButton>
           <FacebookMessengerShareButton url={shareUrl} appId="">
             <FacebookMessengerIcon size={48} round />
           </FacebookMessengerShareButton>
           <WhatsappShareButton url={shareUrl} title={shareTitle} separator=":: ">
             <WhatsappIcon size={48} round />
           </WhatsappShareButton>
           <TwitterShareButton url={shareUrl} title={shareTitle}>
             <TwitterIcon size={48} round />
           </TwitterShareButton>
           <TelegramShareButton url={shareUrl} title={shareTitle}>
             <TelegramIcon size={48} round />
           </TelegramShareButton>
         </div>
      </div>

      {!isCreator && votedFor && (
         <div className="mt-12 mb-8 text-center bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 w-full">
            <h3 className="text-xl font-bold mb-2">Thanks for voting!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Want to test your own thumbnails to see which gets more clicks?</p>
            <Link to="/thumbnail-battle">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0">Create Your Own Battle</Button>
            </Link>
         </div>
      )}
    </div>
  );
}
