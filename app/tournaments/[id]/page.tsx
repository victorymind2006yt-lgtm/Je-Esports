"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { 
  Calendar, 
  Coins, 
  Users, 
  Clock, 
  Trophy, 
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

import { auth } from "../../firebase";
import { 
  getTournamentById, 
  getTournamentRegistrations, 
  registerPlayer, 
  unregisterPlayer 
} from "../../lib/firebase";
import { Tournament, PlayerRegistration } from "../../lib/types";

export default function TournamentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<PlayerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState<PlayerRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      
      if (!user) {
        router.push(`/login?redirect=/tournaments/${tournamentId}`);
      }
    });

    return () => unsubscribe();
  }, [router, tournamentId]);

  useEffect(() => {
    const fetchTournamentData = async () => {
      if (!authReady || !tournamentId) return;
      
      try {
        setLoading(true);
        const [tournamentData, registrationData] = await Promise.all([
          getTournamentById(tournamentId),
          getTournamentRegistrations(tournamentId)
        ]);
        
        if (!tournamentData) {
          setError("Tournament not found");
          return;
        }
        
        setTournament(tournamentData);
        setRegistrations(registrationData);
        
        // Check if current user is registered
        if (currentUser) {
          const userReg = registrationData.find(reg => reg.userId === currentUser.uid);
          setUserRegistration(userReg || null);
        }
      } catch (err) {
        console.error("Error fetching tournament data:", err);
        setError("Failed to load tournament data");
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [authReady, currentUser, tournamentId]);

  const handleRegister = async () => {
    if (!currentUser || !tournament) return;
    
    setRegistering(true);
    setError(null);
    
    try {
      // Check if user already has a wallet and sufficient balance
      // In a real app, you would check the user's wallet balance here
      
      const registration = await registerPlayer({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split("@")[0] || "Player",
        userEmail: currentUser.email || "",
        tournamentId: tournament.id,
        registrationTime: new Date()
      });
      
      // Update local state
      const newRegistration = {
        ...registration,
        id: registration.id,
        registrationTime: new Date()
      };
      
      setUserRegistration(newRegistration);
      setRegistrations(prev => [...prev, newRegistration]);
      
      // Update tournament slots
      if (tournament) {
        setTournament({
          ...tournament,
          registeredSlots: tournament.registeredSlots + 1
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to register for tournament. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!userRegistration || !tournament) return;
    
    setRegistering(true);
    setError(null);
    
    try {
      await unregisterPlayer(userRegistration.id, tournament.id);
      
      // Update local state
      setUserRegistration(null);
      setRegistrations(prev => prev.filter(reg => reg.id !== userRegistration.id));
      
      // Update tournament slots
      if (tournament) {
        setTournament({
          ...tournament,
          registeredSlots: Math.max(0, tournament.registeredSlots - 1)
        });
      }
    } catch (err) {
      console.error("Unregistration error:", err);
      setError("Failed to unregister from tournament. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="global-bg min-h-screen flex items-center justify-center px-4 text-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-muted">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="global-bg min-h-screen flex items-center justify-center px-4 text-white">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-white">Error</h2>
          <p className="mt-2 text-muted">{error}</p>
          <Link 
            href="/tournaments"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="global-bg min-h-screen flex items-center justify-center px-4 text-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-white">Tournament Not Found</h2>
          <p className="mt-2 text-muted">The tournament you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/tournaments"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const isFull = tournament.registeredSlots >= tournament.maxSlots;
  const isUpcoming = tournament.status === 'upcoming';
  const canRegister = currentUser && isUpcoming && !userRegistration && !isFull;
  const canUnregister = currentUser && userRegistration && isUpcoming;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="global-bg min-h-screen px-4 pb-20 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-10">
        <Link 
          href="/tournaments"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tournaments
        </Link>

        <div className="rounded-3xl border border-white/10 bg-[#080f0c] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span className="capitalize">{tournament.mode}</span>
                <span>•</span>
                <span className="capitalize">{tournament.type.replace('-', ' ')}</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white">{tournament.name}</h1>
              <p className="mt-2 text-muted max-w-2xl">
                {tournament.description || "No description provided for this tournament."}
              </p>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-[#050a0f] px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <Trophy className="h-5 w-5" />
                <span className="text-lg font-semibold">PKR {tournament.prizePool}</span>
              </div>
              <p className="text-xs text-muted mt-1">Prize Pool</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#050a0f] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Calendar className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm text-muted">Start Time</p>
                  <p className="font-semibold text-white">{formatDate(tournament.startTime)}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-[#050a0f] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Coins className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm text-muted">Entry Fee</p>
                  <p className="font-semibold text-white">PKR {tournament.entryFee}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-[#050a0f] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm text-muted">Slots</p>
                  <p className="font-semibold text-white">
                    {tournament.registeredSlots} / {tournament.maxSlots}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-[#050a0f] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Clock className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm text-muted">Status</p>
                  <p className="font-semibold text-white capitalize">{tournament.status}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            {canRegister && (
              <button
                onClick={handleRegister}
                disabled={registering || isFull}
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {registering ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Register Now (PKR {tournament.entryFee})
                  </>
                )}
              </button>
            )}
            
            {canUnregister && (
              <button
                onClick={handleUnregister}
                disabled={registering}
                className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-red-400 hover:text-red-400 disabled:opacity-50"
              >
                {registering ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  "Unregister"
                )}
              </button>
            )}
            
            {userRegistration && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-3 text-emerald-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Registered</span>
              </div>
            )}
            
            {isFull && !userRegistration && (
              <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-3 text-amber-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Tournament Full</span>
              </div>
            )}
            
            {!isUpcoming && (
              <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-3 text-blue-300">
                <Clock className="h-5 w-5" />
                <span className="font-semibold capitalize">{tournament.status}</span>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#080f0c] p-6">
          <h2 className="text-xl font-semibold text-white">Registered Players ({registrations.length})</h2>
          
          {registrations.length === 0 ? (
            <div className="mt-6 text-center py-8 text-muted">
              <Users className="h-12 w-12 mx-auto text-white/20" />
              <p className="mt-3">No players have registered for this tournament yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              {registrations.map((registration, index) => (
                <div 
                  key={registration.id} 
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#050a0f] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-300">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{registration.userName}</p>
                      <p className="text-xs text-muted">
                        Registered on {new Date(registration.registrationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {currentUser && registration.userId === currentUser.uid && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}