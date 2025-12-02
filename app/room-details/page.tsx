"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft, Lock, Copy, Check, AlertCircle, Trophy } from "lucide-react";
import Link from "next/link";

import { auth, db } from "../firebase";
import { getTournamentById } from "../lib/firebase";
import type { PlayerRegistration, Tournament } from "../lib/types";

type TournamentWithRoom = Tournament & {
    registrationId: string;
    slotNumber?: number;
};

export default function RoomDetailsPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tournaments, setTournaments] = useState<TournamentWithRoom[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setAuthReady(true);

            if (!user) {
                router.push("/login?redirect=/room-details");
            }
        });

        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const loadUserTournaments = async () => {
            if (!authReady || !currentUser) return;

            try {
                setLoading(true);

                // Get all registrations for this user
                const registrationsQuery = query(
                    collection(db, "registrations"),
                    where("userId", "==", currentUser.uid)
                );

                const registrationsSnapshot = await getDocs(registrationsQuery);
                const registrations: PlayerRegistration[] = registrationsSnapshot.docs.map(
                    (doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            userId: data.userId,
                            userName: data.userName,
                            userEmail: data.userEmail,
                            tournamentId: data.tournamentId,
                            slotNumber: data.slotNumber,
                            registrationTime: data.registrationTime?.toDate() || new Date(),
                        } as PlayerRegistration;
                    }
                );

                // Get tournament details for each registration
                const tournamentsWithRooms: TournamentWithRoom[] = [];

                for (const registration of registrations) {
                    const tournament = await getTournamentById(registration.tournamentId);

                    if (tournament && (tournament.roomId || tournament.roomPassword)) {
                        // Only include tournaments that have room details
                        tournamentsWithRooms.push({
                            ...tournament,
                            registrationId: registration.id,
                            slotNumber: registration.slotNumber,
                        });
                    }
                }

                // Sort by start time (most recent first)
                tournamentsWithRooms.sort((a, b) =>
                    b.startTime.getTime() - a.startTime.getTime()
                );

                setTournaments(tournamentsWithRooms);
            } catch (error) {
                console.error("Error loading tournaments:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUserTournaments();
    }, [authReady, currentUser]);

    const copyToClipboard = async (text: string, type: "id" | "password", tournamentId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === "id") {
                setCopiedId(tournamentId);
                setTimeout(() => setCopiedId(null), 2000);
            } else {
                setCopiedPassword(tournamentId);
                setTimeout(() => setCopiedPassword(null), 2000);
            }
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    };

    if (!authReady || !currentUser) {
        return (
            <div className="global-bg min-h-screen flex items-center justify-center px-4 text-white">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                    <p className="mt-4 text-muted">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="global-bg min-h-screen px-4 pb-20 text-white lg:px-10">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-10">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <header className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
                        Your Tournaments
                    </p>
                    <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                        Room ID & Password
                    </h1>
                    <p className="mt-2 text-sm text-muted">
                        Access room details for tournaments you've joined
                    </p>
                </header>

                {loading ? (
                    <div className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-10 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                        <p className="mt-4 text-sm text-muted">Loading your tournaments...</p>
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-10 text-center">
                        <Lock className="mx-auto h-12 w-12 text-muted" />
                        <h2 className="mt-4 text-lg font-semibold text-white">
                            No Room Details Available
                        </h2>
                        <p className="mt-2 text-sm text-muted">
                            You haven't joined any tournaments yet, or room details haven't been shared by the admin.
                        </p>
                        <Link
                            href="/tournaments"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                        >
                            <Trophy className="h-4 w-4" />
                            Browse Tournaments
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tournaments.map((tournament) => {
                            const hasRoomDetails = tournament.roomId || tournament.roomPassword;
                            const statusLabel = tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1);

                            const statusClasses =
                                tournament.status === "cancelled" ? "bg-red-500/15 text-red-300" :
                                    tournament.status === "completed" ? "bg-gray-500/15 text-gray-200" :
                                        tournament.status === "ongoing" ? "bg-emerald-500/15 text-emerald-300" :
                                            "bg-blue-500/15 text-blue-300";

                            return (
                                <div
                                    key={tournament.id}
                                    className="rounded-3xl border border-white/10 bg-[#080f0c] p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">
                                                {tournament.name}
                                            </h2>
                                            <p className="mt-1 text-xs text-muted">
                                                {formatDate(tournament.startTime)}
                                                {tournament.slotNumber && ` • Slot #${tournament.slotNumber}`}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses}`}>
                                            {statusLabel}
                                        </span>
                                    </div>

                                    {hasRoomDetails ? (
                                        <div className="mt-6 space-y-3">
                                            {tournament.roomId && (
                                                <div className="rounded-2xl border border-white/10 bg-[#050a0f] p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1">
                                                            <p className="text-xs font-medium text-muted">Room ID</p>
                                                            <p className="mt-1 text-lg font-semibold text-white">
                                                                {tournament.roomId}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(tournament.roomId!, "id", tournament.id)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/20"
                                                            aria-label="Copy Room ID"
                                                        >
                                                            {copiedId === tournament.id ? (
                                                                <Check className="h-4 w-4" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {tournament.roomPassword && (
                                                <div className="rounded-2xl border border-white/10 bg-[#050a0f] p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1">
                                                            <p className="text-xs font-medium text-muted">Room Password</p>
                                                            <p className="mt-1 text-lg font-semibold text-white">
                                                                {tournament.roomPassword}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(tournament.roomPassword!, "password", tournament.id)}
                                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/20"
                                                            aria-label="Copy Room Password"
                                                        >
                                                            {copiedPassword === tournament.id ? (
                                                                <Check className="h-4 w-4" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                <p>
                                                    Use these details to join the tournament room in Free Fire. Make sure to join before the tournament starts!
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-6 rounded-2xl border border-white/10 bg-[#050a0f] px-4 py-6 text-center">
                                            <Lock className="mx-auto h-8 w-8 text-muted" />
                                            <p className="mt-3 text-sm font-semibold text-white">
                                                Room Details Not Available
                                            </p>
                                            <p className="mt-1 text-xs text-muted">
                                                The admin hasn't shared the room details yet. Check back closer to the tournament start time.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
