import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Button } from "../components/ui";

export default function BattleView() {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votedFor, setVotedFor] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    const fetchBattle = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "battles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBattle({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (e) {
        console.error(e);
        handleFirestoreError(e, OperationType.GET, `battles/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBattle();
  }, [id]);

  const handleVote = async (side: "A" | "B") => {
    if (votedFor || !id) return;
    setVotedFor(side);
    
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
          {battle.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Vote for the thumbnail you would be more likely to click.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Option A */}
        <div className="space-y-6">
           <div 
             className={`aspect-video rounded-xl overflow-hidden cursor-pointer transition-all border-4 ${votedFor === 'A' ? 'border-green-500 shadow-xl shadow-green-500/20' : 'border-transparent hover:scale-[1.02]'}`}
             onClick={() => handleVote('A')}
           >
              <img src={battle.thumbA} alt="Option A" className="w-full h-full object-cover" />
           </div>
           
           {!votedFor ? (
              <Button className="w-full" size="lg" onClick={() => handleVote('A')}>Vote for A</Button>
           ) : (
              <div className="space-y-2">
                 <div className="flex justify-between font-semibold">
                    <span>Option A</span>
                    <span>{pctA}%</span>
                 </div>
                 <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${pctA}%` }} />
                 </div>
                 <p className="text-xs text-gray-500 text-right">{battle.votesA} votes</p>
              </div>
           )}
        </div>

        {/* Option B */}
        <div className="space-y-6">
           <div 
             className={`aspect-video rounded-xl overflow-hidden cursor-pointer transition-all border-4 ${votedFor === 'B' ? 'border-green-500 shadow-xl shadow-green-500/20' : 'border-transparent hover:scale-[1.02]'}`}
             onClick={() => handleVote('B')}
           >
              <img src={battle.thumbB} alt="Option B" className="w-full h-full object-cover" />
           </div>
           
           {!votedFor ? (
              <Button className="w-full" size="lg" onClick={() => handleVote('B')}>Vote for B</Button>
           ) : (
              <div className="space-y-2">
                 <div className="flex justify-between font-semibold">
                    <span>Option B</span>
                    <span>{pctB}%</span>
                 </div>
                 <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${pctB}%` }} />
                 </div>
                 <p className="text-xs text-gray-500 text-right">{battle.votesB} votes</p>
              </div>
           )}
        </div>
      </div>
      
      {votedFor && (
         <div className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-2">Thanks for voting!</h3>
            <p className="text-gray-500">Want to test your own thumbnails?</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/thumbnail-battle'}>Create a Battle</Button>
         </div>
      )}
    </div>
  );
}
