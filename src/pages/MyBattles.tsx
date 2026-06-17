import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { BarChart, LogIn, ArrowRight, Share2, Check } from "lucide-react";
import { Button, Card, CardContent } from "../components/ui";

export default function MyBattles() {
  const { user, signIn, loading: authLoading } = useAuth();
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBattles = async () => {
      try {
        const q = query(
          collection(db, "battles"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedBattles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Let's sort manually since index on multiple fields might not be ready
        fetchedBattles.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBattles(fetchedBattles);
      } catch (error) {
        console.error("Failed to fetch battles", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
  }, [user]);

  const copyLink = (id: string) => {
    const rawBase = (import.meta as any).env?.BASE_URL || "/";
    const base = rawBase.endsWith('/') ? rawBase : rawBase + '/';
    const url = `${window.location.origin}${base}battle/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-24 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-slate-800 rounded mb-8"></div>
          <div className="space-y-4 w-full max-w-2xl text-left">
            <div className="h-32 bg-slate-800 rounded-lg"></div>
            <div className="h-32 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Login Required</h1>
        <p className="text-gray-400 mb-8">You need to be logged in to view your battle history.</p>
        <Button size="lg" onClick={signIn} className="bg-red-600 hover:bg-red-700 text-white border-0">
          Sign In with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
            My Battles
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View the voting history and results of your thumbnail A/B tests.
          </p>
        </div>
        <Link to="/thumbnail-battle">
          <Button variant="outline" className="hidden sm:flex">
            Create New Battle
          </Button>
        </Link>
      </div>

      {battles.length === 0 ? (
        <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
              <BarChart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Battles Yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              You haven't created any thumbnail battles yet. Start your first A/B test to see how your audience votes.
            </p>
            <Link to="/thumbnail-battle">
              <Button>Create Your First Battle</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {battles.map((battle) => {
            const totalVotes = (battle.votesA || 0) + (battle.votesB || 0);
            const aPercent = totalVotes > 0 ? Math.round(((battle.votesA || 0) / totalVotes) * 100) : 0;
            const bPercent = totalVotes > 0 ? Math.round(((battle.votesB || 0) / totalVotes) * 100) : 0;
            const isAWinner = aPercent > bPercent;
            const isBWinner = bPercent > aPercent;

            return (
              <Card key={battle.id} className="overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="p-0 sm:p-6 sm:flex sm:items-center sm:gap-6">
                  {/* Left Side: Stats Preview */}
                  <div className="flex-1 p-6 sm:p-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg truncate" title={battle.title}>
                        {battle.title || "Untitled Battle"}
                      </h3>
                      <span className="text-xs text-slate-500 hidden sm:block">
                        {new Date(battle.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-500 mb-4">
                      Total Votes: <span className="font-semibold text-slate-900 dark:text-white">{totalVotes}</span>
                    </div>

                    {totalVotes > 0 ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={isAWinner ? "font-semibold text-green-600 dark:text-green-500" : ""}>Option A</span>
                            <span className="font-semibold">{battle.votesA} votes ({aPercent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <div className={`h-2 rounded-full ${isAWinner ? 'bg-green-500' : 'bg-slate-400'}`} style={{ width: `${aPercent}%` }}></div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={isBWinner ? "font-semibold text-green-600 dark:text-green-500" : ""}>Option B</span>
                            <span className="font-semibold">{battle.votesB} votes ({bPercent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <div className={`h-2 rounded-full ${isBWinner ? 'bg-green-500' : 'bg-slate-400'}`} style={{ width: `${bPercent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 italic">Waiting for votes...</div>
                    )}
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex sm:flex-col gap-2 p-6 sm:p-0 bg-slate-50 dark:bg-slate-900/50 sm:bg-transparent border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <Button variant="outline" className="flex-1 sm:flex-none w-full gap-2" onClick={() => copyLink(battle.id)}>
                      {copiedId === battle.id ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                      {copiedId === battle.id ? "Copied" : "Copy Link"}
                    </Button>
                    <Link to={`/battle/${battle.id}`} className="flex-1 sm:flex-none w-full">
                      <Button className="w-full gap-2" variant="default">
                        View Details <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
