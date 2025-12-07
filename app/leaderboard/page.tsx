"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Crown, Trophy, Gem, ArrowLeft, Medal } from "lucide-react";

interface LeaderboardEntry {
    userId: string;
    displayName: string;
    userPhotoURL?: string;
    wins: number;
    diamondsWon: number;
}

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
                const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
                const weekId = `${now.getFullYear()}_${weekNum}`;

                const q = query(
                    collection(db, "weeklyLeaderboard"),
                    where("weekId", "==", weekId),
                    orderBy("wins", "desc"),
                    orderBy("diamondsWon", "desc"),
                    limit(50)
                );

                const querySnapshot = await getDocs(q);
                const data: LeaderboardEntry[] = querySnapshot.docs.map((doc) => ({
                    ...(doc.data() as LeaderboardEntry),
                }));

                setLeaders(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white px-4 py-8 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Global Leaderboard</h1>
                    <p className="text-gray-400 text-lg">
                        See who is dominating the competition across all tournaments this week.
                    </p>
                </div>

                {/* Leaderboard Card */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                    {/* Card Header */}
                    <div className="p-6 border-b border-white/5 bg-[#161616]">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-xl font-bold">Top Players (Weekly)</h2>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0a0a0a] text-xs uppercase tracking-wider text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4 w-20 text-center">Rank</th>
                                    <th className="px-6 py-4">Player</th>
                                    <th className="px-6 py-4 text-center">Wins</th>
                                    <th className="px-6 py-4 text-right">Diamonds Won</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    // Loading Skeleton
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4 text-center">
                                                <div className="h-4 w-4 bg-white/10 rounded mx-auto"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-white/10"></div>
                                                    <div className="h-4 w-24 bg-white/10 rounded"></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="h-4 w-8 bg-white/10 rounded mx-auto"></div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="h-4 w-12 bg-white/10 rounded ml-auto"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : leaders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No leaderboard data available for this week yet.
                                        </td>
                                    </tr>
                                ) : (
                                    leaders.map((player, index) => {
                                        const rank = index + 1;
                                        let rankDisplay;

                                        if (rank === 1) {
                                            rankDisplay = <Crown className="w-6 h-6 text-yellow-400 mx-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" fill="currentColor" />;
                                        } else if (rank === 2) {
                                            rankDisplay = <Medal className="w-6 h-6 text-gray-300 mx-auto" fill="currentColor" />;
                                        } else if (rank === 3) {
                                            rankDisplay = <Medal className="w-6 h-6 text-amber-600 mx-auto" fill="currentColor" />;
                                        } else {
                                            rankDisplay = <span className="text-gray-400 font-mono">#{rank}</span>;
                                        }

                                        return (
                                            <tr key={player.userId} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 text-center font-bold text-lg">
                                                    {rankDisplay}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {player.userPhotoURL ? (
                                                            <div className="h-9 w-9 rounded-full overflow-hidden border border-white/10 shadow-lg">
                                                                <img src={player.userPhotoURL} alt={player.displayName} className="h-full w-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg">
                                                                {player.displayName ? player.displayName.charAt(0).toUpperCase() : "?"}
                                                            </div>
                                                        )}
                                                        <span className="font-semibold group-hover:text-white text-gray-200 transition-colors">
                                                            {player.displayName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-gray-300">
                                                    {player.wins}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                                                        {player.diamondsWon}
                                                        <Gem className="w-4 h-4" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
