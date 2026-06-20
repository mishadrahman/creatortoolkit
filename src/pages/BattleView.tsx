import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Button } from "../components/ui";
import { getTelegramFileUrl } from "../lib/telegram";
import { useAuth } from "../lib/AuthContext";
import FAQSection from "../components/FAQSection";
import SEO from "../components/SEO";
import {
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  FacebookMessengerIcon,
} from "react-share";

const BATTLE_VIEW_FAQS = [
  {
    question: "How do I cast my vote in a Thumbnail Battle?",
    answer: "Simply tap or click directly on either of the two visual choices (Option A or Option B). Once your preference is cast, the screen will instantly update to display the live real-time split-percentage vote counts."
  },
  {
    question: "Are votes in this comparison battle anonymous?",
    answer: "Yes, completely! Every vote cast is anonymous, ensuring that readers can select honestly and without bias, maintaining highly pristine split-test statistics for the creator."
  },
  {
    question: "Can I create my own layout test battle?",
    answer: "Yes! Click 'Create Your Own Battle' on this page, register or login securely with your Google Account, upload two different 16:9 thumbnail designs for your video topic, and grab your free link to share with anyone."
  },
  {
    question: "How does A/B testing benefit my YouTube CTR ranking?",
    answer: "Testing thumbnails gathers actual human validation before you upload. Swapping in a proven, high-voted layout can multiply your average CTR, driving more organic YouTube mobile recommendation traffic."
  }
];

export default function BattleView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votedFor, setVotedFor] = useState<"A" | "B" | null>(null);
  const [urlA, setUrlA] = useState<string | null>(null);
  const [urlB, setUrlB] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  const shareUrl = `${window.location.origin}/battle/${id}`;
  const shareTitle = battle?.title || "Which thumbnail is better? Vote now!";

  const handleFacebookShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(
      fbShareUrl,
      "_blank",
      "width=600,height=500,noopener,noreferrer",
    );
  };

  const handleMessengerShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const isMobile =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      window.location.href = `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;
    } else {
      const app_id = "291494419107518"; // Public App ID fallback for desktop messenger
      const mShareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=${app_id}&redirect_uri=${encodeURIComponent(shareUrl)}`;
      window.open(
        mShareUrl,
        "_blank",
        "width=600,height=500,noopener,noreferrer",
      );
    }
  };

  useEffect(() => {
    // Check local storage for previous vote
    if (id) {
      const storedVotes = JSON.parse(
        localStorage.getItem("thumbnail_battle_votes") || "{}",
      );
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
    const storedVotes = JSON.parse(
      localStorage.getItem("thumbnail_battle_votes") || "{}",
    );
    storedVotes[id] = side;
    localStorage.setItem("thumbnail_battle_votes", JSON.stringify(storedVotes));

    // optimistic update
    setBattle((prev: any) => ({
      ...prev,
      [`votes${side}`]: prev[`votes${side}`] + 1,
    }));

    try {
      const docRef = doc(db, "battles", id);
      await updateDoc(docRef, {
        [`votes${side}`]: increment(1),
      });
    } catch (e) {
      console.error("Failed to vote", e);
      handleFirestoreError(e, OperationType.UPDATE, `battles/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-24">
        {/* Pulsing Header */}
        <div className="mb-12 text-center animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4 md:w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2 md:w-1/3 mx-auto"></div>
        </div>

        {/* Pulsing Option Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Option A Skeleton */}
          <div className="space-y-6 animate-pulse">
            <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-800 w-full relative overflow-hidden flex items-center justify-center border border-slate-300/30">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              <div className="text-slate-400 dark:text-slate-600 font-bold text-lg select-none">
                Option A
              </div>
            </div>
            <div className="h-11 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          </div>

          {/* Option B Skeleton */}
          <div className="space-y-6 animate-pulse">
            <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-800 w-full relative overflow-hidden flex items-center justify-center border border-slate-300/30">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              <div className="text-slate-400 dark:text-slate-600 font-bold text-lg select-none">
                Option B
              </div>
            </div>
            <div className="h-11 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          </div>
        </div>

        {/* Social Share Indicator Skeleton */}
        <div className="mt-16 text-center max-w-xl mx-auto space-y-4 border-t border-slate-100 dark:border-slate-800 pt-8 animate-pulse">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto mb-2"></div>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-500">
        Battle not found.
      </div>
    );
  }

  const totalVotes = battle.votesA + battle.votesB;
  const pctA =
    totalVotes === 0 ? 0 : Math.round((battle.votesA / totalVotes) * 100);
  const pctB =
    totalVotes === 0 ? 0 : Math.round((battle.votesB / totalVotes) * 100);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-24">
      <SEO 
        title={battle.title ? `Vote: ${battle.title}` : "Thumbnail Battle Voting"}
        description={`Cast your vote on the battle: "${battle.title || 'Which thumbnail is better?'}" and help select the highest performing YouTube CTR thumbnail layout.`}
        keywords="youtube CTR test, thumbnail comparison, vote thumbnail, thumbnail battle, Toolzet test"
      />
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
          {battle.title || "Which thumbnail is better?"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {isCreator
            ? "You are the creator of this battle. You cannot vote."
            : "Vote for the thumbnail you would be more likely to click."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Option A */}
        <div className="space-y-6">
          <div
            className={`aspect-video rounded-xl overflow-hidden cursor-pointer bg-black/5 dark:bg-white/5 transition-all border-4 ${votedFor === "A" || (isCreator && battle.votesA >= battle.votesB && battle.votesA > 0) ? "border-green-500 shadow-xl shadow-green-500/20" : "border-transparent hover:scale-[1.02]"}`}
            onClick={() => handleVote("A")}
          >
            {urlA ? (
              <img
                src={urlA}
                alt="Option A"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            )}
          </div>

          {!votedFor && !isCreator ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleVote("A")}
              disabled={!urlA}
            >
              Vote for A
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                <span>Option A</span>
                <span>{pctA}%</span>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-1000"
                  style={{ width: `${pctA}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {battle.votesA} votes
              </p>
            </div>
          )}
        </div>

        {/* Option B */}
        <div className="space-y-6">
          <div
            className={`aspect-video rounded-xl overflow-hidden cursor-pointer bg-black/5 dark:bg-white/5 transition-all border-4 ${votedFor === "B" || (isCreator && battle.votesB >= battle.votesA && battle.votesB > 0) ? "border-green-500 shadow-xl shadow-green-500/20" : "border-transparent hover:scale-[1.02]"}`}
            onClick={() => handleVote("B")}
          >
            {urlB ? (
              <img
                src={urlB}
                alt="Option B"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            )}
          </div>

          {!votedFor && !isCreator ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleVote("B")}
              disabled={!urlB}
            >
              Vote for B
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                <span>Option B</span>
                <span>{pctB}%</span>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-1000"
                  style={{ width: `${pctB}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {battle.votesB} votes
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 text-center max-w-xl mx-auto space-y-6 border-t border-gray-200 dark:border-gray-800 pt-8">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm inline-block">
          Share this Battle
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4 py-4">
          <button
            onClick={handleFacebookShare}
            className="hover:opacity-85 active:scale-95 transition-all focus:outline-none cursor-pointer"
            aria-label="Share on Facebook"
          >
            <FacebookIcon size={48} round />
          </button>
          <button
            onClick={handleMessengerShare}
            className="hover:opacity-85 active:scale-95 transition-all focus:outline-none cursor-pointer"
            aria-label="Share on Messenger"
          >
            <FacebookMessengerIcon size={48} round />
          </button>
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
      </div>

      {!isCreator && votedFor && (
        <div className="mt-12 mb-8 text-center bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 w-full">
          <h3 className="text-xl font-bold mb-2">Thanks for voting!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Want to test your own thumbnails to see which gets more clicks?
          </p>
          <a href="/thumbnail-battle">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              Create Your Own Battle
            </Button>
          </a>
        </div>
      )}

      {/* FAQ Section */}
      <FAQSection faqs={BATTLE_VIEW_FAQS} />
    </div>
  );
}
