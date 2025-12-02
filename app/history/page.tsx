"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase";
import { getPlayerRegistrations, getTournamentById } from "../lib/firebase";
import { Calendar, Trophy, Coins, Clock, ArrowRight } from "lucide-react";

type HistoryItem = {
  registrationId: string;
  tournamentId: string;
  tournamentName: string;
  registrationTime: Date;
  status: string;
  entryFee: string;
  prizePool: string;
  startTime?: Date;
};

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const registrations = await getPlayerRegistrations(user.uid);

          const items: HistoryItem[] = [];

          for (const reg of registrations) {
            const tournament = await getTournamentById(reg.tournamentId);
            if (tournament) {
              items.push({
                registrationId: reg.id,
                tournamentId: tournament.id,
                tournamentName: tournament.name,
                registrationTime: reg.registrationTime,
                status: tournament.status,
                entryFee: String(tournament.entryFee),
                prizePool: String(tournament.prizePool),
                startTime: tournament.startTime
              });
            }
          }

          setHistory(items);
        } catch (error) {
          console.error("Failed to fetch history", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  const formatDate = (date?: Date) => {
    if (!date) return "TBD";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "ongoing": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "completed": return "text-gray-400 bg-gray-400/10 border-gray-400/20";
      case "cancelled": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="global-bg min-h-screen px-4 pb-24 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-16">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Match History</h1>
          <p className="text-sm text-muted">
            A record of all the tournaments you have joined.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 px-6 py-10 text-center text-muted">
            <p>You haven't joined any tournaments yet.</p>
            <Link href="/tournaments" className="mt-4 inline-block text-emerald-400 hover:underline">
              Browse Tournaments
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <div
                key={item.registrationId}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#080f0c] p-5 transition hover:border-emerald-500/30 hover:bg-[#0a120e]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white group-hover:text-emerald-300 transition">
                        {item.tournamentName}
                      </h3>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Joined: {formatDate(item.registrationTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Start: {formatDate(item.startTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 border-t border-white/5 pt-4 sm:border-t-0 sm:pt-0">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] text-muted uppercase tracking-wider">Entry</span>
                      <div className="flex items-center gap-1 text-sm font-medium text-white">
                        <Coins className="h-3.5 w-3.5 text-emerald-400" />
                        {item.entryFee === "Free" ? "Free" : `${item.entryFee}`}
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] text-muted uppercase tracking-wider">Prize</span>
                      <div className="flex items-center gap-1 text-sm font-medium text-white">
                        <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                        {item.prizePool}
                      </div>
                    </div>
                    <Link
                      href={`/tournaments/${item.tournamentId}`}
                      className="ml-auto sm:ml-0 rounded-full bg-white/5 p-2 text-muted transition hover:bg-emerald-500 hover:text-black"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/60"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
