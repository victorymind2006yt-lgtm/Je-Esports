"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import {
  LayoutDashboard,
  Trophy,
  CalendarClock,
  Users,
  DollarSign,
  ShieldCheck,
  Database,
  CreditCard,
  Settings,
  ArrowRight,
  LogOut,
  Trash2,
  CheckCircle2,
  XCircle,
  PlayCircle,
  UserCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { auth, db } from "../../firebase";
import { getTournaments, deleteTournament, updateTournament } from "../../lib/firebase";
import type { Tournament, TournamentStatus } from "../../lib/types";

const ADMIN_EMAIL = "fflionking12345678@gmail.com";

type OverviewStats = {
  totalUsers: number;
  totalTournaments: number;
  totalRevenue: number;
  totalMatches: number;
};

type SystemStatus = "online" | "issue";

type WalletUserSummary = {
  id: string;
  displayName: string;
  email: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnings: number;
};

type AdminTransaction = {
  id: string;
  userId: string;
  type: "deposit" | "withdraw";
  amount: number;
  createdAt: Date | null;
};

type AdminTab =
  | "dashboard"
  | "tournaments"
  | "matches"
  | "users"
  | "payments"
  | "admin";

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [dbStatus, setDbStatus] = useState<SystemStatus>("online");
  const [authStatus, setAuthStatus] = useState<SystemStatus>("online");
  const [paymentsStatus] = useState<SystemStatus>("issue");
  const [tournamentsData, setTournamentsData] = useState<Tournament[]>([]);
  const [walletUsers, setWalletUsers] = useState<WalletUserSummary[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [tournamentActionId, setTournamentActionId] = useState<string | null>(
    null,
  );
  const [tournamentFilter, setTournamentFilter] = useState<
    "all" | TournamentStatus
  >("all");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
      setCurrentUser(user);

      if (!user) {
        router.push("/admin/login");
        return;
      }

      if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
      } else {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const loadOverview = async () => {
      if (!isAdmin) return;

      setLoadingOverview(true);
      try {
        const [walletSnap, tournaments] = await Promise.all([
          getDocs(collection(db, "wallets")),
          getTournaments().catch(() => [] as Tournament[]),
        ]);

        const totalUsers = walletSnap.size;
        const totalTournaments = tournaments.length;

        let totalRevenue = 0;
        let totalMatches = 0;

        tournaments.forEach((tournament) => {
          totalMatches += 1;
          const entryFee = (tournament.entryFee ?? 0) as number;
          const registeredSlots = (tournament.registeredSlots ?? 0) as number;
          totalRevenue += entryFee * registeredSlots;
        });

        const walletSummaries: WalletUserSummary[] = walletSnap.docs.map(
          (docSnap) => {
            const data = docSnap.data() as any;
            return {
              id: docSnap.id,
              displayName: data.displayName ?? "Player",
              email: data.email ?? "",
              balance: data.balance ?? 0,
              totalDeposited: data.totalDeposited ?? 0,
              totalWithdrawn: data.totalWithdrawn ?? 0,
              totalEarnings: data.totalEarnings ?? 0,
            };
          },
        );

        const allTransactions: AdminTransaction[] = [];
        for (const docSnap of walletSnap.docs) {
          const txRef = collection(db, "wallets", docSnap.id, "transactions");
          const q = query(txRef, orderBy("createdAt", "desc"), limit(5));
          const qSnap = await getDocs(q);
          qSnap.forEach((txDoc) => {
            const txData = txDoc.data() as any;
            allTransactions.push({
              id: txDoc.id,
              userId: docSnap.id,
              type: txData.type,
              amount: txData.amount ?? 0,
              createdAt: txData.createdAt?.toDate() ?? null,
            });
          });
        }

        allTransactions.sort((a, b) => {
          const aTime = a.createdAt?.getTime() ?? 0;
          const bTime = b.createdAt?.getTime() ?? 0;
          return bTime - aTime;
        });

        setOverview({
          totalUsers,
          totalTournaments,
          totalRevenue,
          totalMatches,
        });
        setTournamentsData(tournaments);
        setWalletUsers(walletSummaries);
        setTransactions(allTransactions);
        setDbStatus("online");
        setAuthStatus("online");
      } catch (error) {
        console.error("Failed to load admin overview", error);
        setOverview(null);
        setDbStatus("issue");
      } finally {
        setLoadingOverview(false);
      }
    };

    loadOverview();
  }, [isAdmin]);

  const displayName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "Admin";
  const email = currentUser?.email ?? "";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  if (!authReady || !currentUser || !isAdmin) {
    return (
      <div className="global-bg flex min-h-screen items-center justify-center px-4 text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldCheck className="h-8 w-8 text-emerald-300" />
          <p className="text-sm text-muted">Checking admin access...</p>
        </div>
      </div>
    );
  }

  const overviewSafe: OverviewStats = overview ?? {
    totalUsers: 0,
    totalTournaments: 0,
    totalRevenue: 0,
    totalMatches: 0,
  };

  const formatDateTime = (date?: Date | null) => {
    if (!date) return "-";
    try {
      return date.toLocaleString("en-PK", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date.toLocaleString();
    }
  };

  const handleTournamentStatusChange = async (
    id: string,
    status: TournamentStatus,
  ) => {
    try {
      setTournamentActionId(id);
      await updateTournament(id, { status });
      setTournamentsData((prev) =>
        prev.map((tournament) =>
          tournament.id === id ? { ...tournament, status } : tournament,
        ),
      );
    } catch (error) {
      console.error("Failed to update tournament status", error);
      alert("Failed to update tournament status. Please try again.");
    } finally {
      setTournamentActionId(null);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tournament? This cannot be undone.",
    );
    if (!confirmDelete) return;

    try {
      setTournamentActionId(id);
      await deleteTournament(id);
      setTournamentsData((prev) =>
        prev.filter((tournament) => tournament.id !== id),
      );
    } catch (error) {
      console.error("Failed to delete tournament", error);
      alert("Failed to delete tournament. Please try again.");
    } finally {
      setTournamentActionId(null);
    }
  };

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "tournaments", label: "Tournaments" },
    { id: "matches", label: "Matches" },
    { id: "users", label: "Users" },
    { id: "payments", label: "Payments" },
    { id: "admin", label: "Admin Mgmt" },
  ];

  const renderTabContent = () => {
    if (activeTab === "dashboard") {
      return (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <AdminStatCard
              label="Total Users"
              description="Players with wallets"
              icon={Users}
              value={loadingOverview ? "-" : overviewSafe.totalUsers.toString()}
            />
            <AdminStatCard
              label="Total Tournaments"
              description="Across all modes"
              icon={Trophy}
              value={
                loadingOverview ? "-" : overviewSafe.totalTournaments.toString()
              }
            />
            <AdminStatCard
              label="Total Revenue"
              description="Entry fees collected"
              icon={DollarSign}
              value={
                loadingOverview
                  ? "-"
                  : `₨${overviewSafe.totalRevenue.toLocaleString("en-PK")}`
              }
            />
            <AdminStatCard
              label="Total Matches"
              description="Tournaments scheduled"
              icon={CalendarClock}
              value={
                loadingOverview ? "-" : overviewSafe.totalMatches.toString()
              }
            />
          </section>

          <section className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-5">
              <p className="text-sm font-semibold text-white">Quick Actions</p>
              <p className="text-xs text-muted">Common administrative tasks</p>
              <div className="mt-4 space-y-3 text-sm">
                <AdminActionRow
                  title="Create New Tournament"
                  description="Set up a new tournament event"
                  href="/tournaments"
                />
                <AdminActionRow
                  title="Schedule Matches"
                  description="Adjust start times and rooms"
                  href="/tournaments"
                />
                <AdminActionRow
                  title="Manage Users"
                  description="Review players from dashboard view"
                  href="/dashboard"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-5">
              <p className="text-sm font-semibold text-white">System Status</p>
              <p className="text-xs text-muted">Platform health and alerts</p>
              <div className="mt-4 space-y-3 text-sm">
                <StatusRow label="Database" status={dbStatus} icon={Database} />
                <StatusRow
                  label="Authentication"
                  status={authStatus}
                  icon={ShieldCheck}
                />
                <StatusRow
                  label="Payment System"
                  status={paymentsStatus}
                  icon={CreditCard}
                />
              </div>
            </div>
          </section>
        </>
      );
    }

    if (activeTab === "tournaments") {
      const filteredTournaments = tournamentsData.filter((tournament) =>
        tournamentFilter === "all"
          ? true
          : tournament.status === tournamentFilter,
      );

      return (
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#070b10] px-6 py-5 text-sm text-muted">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Tournaments</p>
              <p className="text-xs text-muted">
                View, create, update status, or delete tournaments.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Link
                href="/admin/tournaments/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-[11px] font-semibold text-black transition hover:bg-emerald-400"
              >
                <Trophy className="h-3 w-3" />
                <span>Create Tournament</span>
              </Link>
              <div className="inline-flex flex-wrap gap-2 rounded-full bg-black/40 p-1 text-[11px]">
                {["all", "upcoming", "ongoing", "completed", "cancelled"].map(
                  (statusKey) => {
                    const labelMap: Record<string, string> = {
                      all: "All",
                      upcoming: "Upcoming",
                      ongoing: "Ongoing",
                      completed: "Completed",
                      cancelled: "Cancelled",
                    };
                    const isActive = tournamentFilter === statusKey;
                    return (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() =>
                          setTournamentFilter(
                            statusKey === "all"
                              ? "all"
                              : (statusKey as TournamentStatus),
                          )
                        }
                        className={`rounded-full px-3 py-1 font-semibold transition ${
                          isActive
                            ? "bg-emerald-500 text-black"
                            : "text-muted hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {labelMap[statusKey]}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-white/5 border-t border-white/5">
            {filteredTournaments.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">
                No tournaments found for this filter.
              </p>
            ) : (
              filteredTournaments.map((tournament) => {
                const isWorking = tournamentActionId === tournament.id;
                return (
                  <div
                    key={tournament.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">
                          {tournament.name}
                        </p>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                          {tournament.mode}
                        </span>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                          {tournament.type}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                            tournament.status === "upcoming"
                              ? "bg-blue-500/10 text-blue-300"
                              : tournament.status === "ongoing"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : tournament.status === "completed"
                              ? "bg-gray-500/10 text-gray-300"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          {tournament.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">
                        Entry: {tournament.entryFee} diamonds · Prize: 
                        {" "}
                        {tournament.prizePool} diamonds · Slots:
                        {" "}
                        {tournament.registeredSlots}/{tournament.maxSlots}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        Starts: {formatDateTime(tournament.startTime)}
                        {tournament.endTime
                          ? ` · Ends: ${formatDateTime(tournament.endTime)}`
                          : null}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <Link
                        href={`/tournaments/${tournament.id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 font-semibold text-white hover:border-emerald-400/60"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        View
                      </Link>
                      {tournament.status === "upcoming" ? (
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() =>
                            handleTournamentStatusChange(
                              tournament.id,
                              "ongoing",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60"
                        >
                          <PlayCircle className="h-3 w-3" />
                          Start
                        </button>
                      ) : null}
                      {tournament.status === "ongoing" ? (
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() =>
                            handleTournamentStatusChange(
                              tournament.id,
                              "completed",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </button>
                      ) : null}
                      {tournament.status !== "cancelled" ? (
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() =>
                            handleTournamentStatusChange(
                              tournament.id,
                              "cancelled",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                        >
                          <XCircle className="h-3 w-3" />
                          Cancel
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={isWorking}
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 font-semibold text-red-300 hover:bg-red-500/25 disabled:opacity-60"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      );
    }

    if (activeTab === "matches") {
      const upcomingAndOngoing = tournamentsData.filter((tournament) =>
        ["upcoming", "ongoing"].includes(tournament.status),
      );

      return (
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#070b10] px-6 py-5 text-sm text-muted">
          <p className="text-sm font-semibold text-white">Matches</p>
          <p className="text-xs text-muted">
            See upcoming and live matches, with quick access to details.
          </p>

          <div className="mt-4 divide-y divide-white/5 border-t border-white/5">
            {upcomingAndOngoing.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">
                There are no upcoming or live matches right now.
              </p>
            ) : (
              upcomingAndOngoing.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {tournament.name}
                      </p>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                        {tournament.mode}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                          tournament.status === "upcoming"
                            ? "bg-blue-500/10 text-blue-300"
                            : "bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        {tournament.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      Starts: {formatDateTime(tournament.startTime)} ·
                      Registered: {tournament.registeredSlots}/
                      {tournament.maxSlots}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <Link
                      href={`/tournaments/${tournament.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 font-semibold text-white hover:border-emerald-400/60"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      );
    }

    if (activeTab === "users") {
      return (
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#070b10] px-6 py-5 text-sm text-muted">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Users</p>
              <p className="text-xs text-muted">
                Wallet-enabled players with their current balances.
              </p>
            </div>
            <div className="text-[11px] text-muted">
              Total users: <span className="font-semibold">{walletUsers.length}</span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-muted">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em]">
                <tr>
                  <th className="py-2 pr-4 font-semibold text-white">Player</th>
                  <th className="py-2 pr-4 font-semibold text-white">Email</th>
                  <th className="py-2 pr-4 font-semibold text-white">Balance</th>
                  <th className="py-2 pr-4 font-semibold text-white">Deposited</th>
                  <th className="py-2 pr-4 font-semibold text-white">Withdrawn</th>
                  <th className="py-2 pr-4 font-semibold text-white">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {walletUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-xs text-muted"
                    >
                      No wallet users found yet.
                    </td>
                  </tr>
                ) : (
                  walletUsers.map((userSummary) => (
                    <tr key={userSummary.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2 text-xs text-white">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-300">
                            {userSummary.displayName.charAt(0).toUpperCase()}
                          </span>
                          <span>{userSummary.displayName}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-[11px] text-muted">
                        {userSummary.email}
                      </td>
                      <td className="py-2 pr-4 text-xs text-white">
                        {userSummary.balance} 💎
                      </td>
                      <td className="py-2 pr-4 text-xs text-emerald-300">
                        {userSummary.totalDeposited} 💎
                      </td>
                      <td className="py-2 pr-4 text-xs text-red-300">
                        {userSummary.totalWithdrawn} 💎
                      </td>
                      <td className="py-2 pr-4 text-xs text-emerald-200">
                        {userSummary.totalEarnings} 💎
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    if (activeTab === "payments") {
      const totalDeposits = transactions
        .filter((tx) => tx.type === "deposit")
        .reduce((sum, tx) => sum + tx.amount, 0);
      const totalWithdrawals = transactions
        .filter((tx) => tx.type === "withdraw")
        .reduce((sum, tx) => sum + tx.amount, 0);

      return (
        <section className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#070b10] px-6 py-5 text-sm">
              <p className="text-sm font-semibold text-white">Deposits</p>
              <p className="mt-2 flex items-baseline gap-2">
                <ArrowDownRight className="h-4 w-4 text-emerald-300" />
                <span className="text-2xl font-semibold text-emerald-300">
                  {totalDeposits}
                </span>
                <span className="text-xs text-muted">diamonds</span>
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#070b10] px-6 py-5 text-sm">
              <p className="text-sm font-semibold text-white">Withdrawals</p>
              <p className="mt-2 flex items-baseline gap-2">
                <ArrowUpRight className="h-4 w-4 text-red-300" />
                <span className="text-2xl font-semibold text-red-300">
                  {totalWithdrawals}
                </span>
                <span className="text-xs text-muted">diamonds</span>
              </p>
            </div>
          </div>

          <section className="rounded-3xl border border-white/10 bg-[#070b10] px-6 py-5 text-sm text-muted">
            <p className="text-sm font-semibold text-white">Recent Transactions</p>
            <p className="text-xs text-muted">
              Wallet deposits and withdrawals across all players.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-xs text-muted">
                <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em]">
                  <tr>
                    <th className="py-2 pr-4 font-semibold text-white">Type</th>
                    <th className="py-2 pr-4 font-semibold text-white">Player</th>
                    <th className="py-2 pr-4 font-semibold text-white">Amount</th>
                    <th className="py-2 pr-4 font-semibold text-white">When</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-xs text-muted"
                      >
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 40).map((tx) => {
                      const userInfo = walletUsers.find(
                        (userSummary) => userSummary.id === tx.userId,
                      );
                      const isDeposit = tx.type === "deposit";
                      return (
                        <tr key={tx.id} className="border-b border-white/5">
                          <td className="py-2 pr-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                                isDeposit
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-red-500/10 text-red-300"
                              }`}
                            >
                              {isDeposit ? "Deposit" : "Withdraw"}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-xs text-white">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-300">
                                {(userInfo?.displayName || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                              <div>
                                <p>{userInfo?.displayName ?? "Unknown"}</p>
                                <p className="text-[10px] text-muted">
                                  {userInfo?.email ?? ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-xs text-white">
                            {tx.amount} 💎
                          </td>
                          <td className="py-2 pr-4 text-[11px] text-muted">
                            {formatDateTime(tx.createdAt)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      );
    }

    if (activeTab === "admin") {
      return (
        <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-[#070b10] px-6 py-5 text-sm text-muted">
            <p className="text-sm font-semibold text-white">Admin Management</p>
            <p className="text-xs text-muted">
              Manage who has access to the control center.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-black/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-300">
                    A
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Primary Admin
                    </p>
                    <p className="text-[11px] text-muted">{ADMIN_EMAIL}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-muted">
                For security, only this email can access the admin dashboard.
                To add more admins in the future, you can extend this section to
                store and manage a list of allowed emails.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#070b10] px-6 py-5 text-sm text-muted">
            <p className="text-sm font-semibold text-white">Tips</p>
            <ul className="mt-3 space-y-2 text-xs text-muted">
              <li>
                 b7 Keep your admin password and access key safe. Never share them
                in public.
              </li>
              <li>
                 b7 Review tournaments and payments regularly to ensure there are no
                suspicious activities.
              </li>
              <li>
                 b7 Use the logout button when you finish managing the platform,
                especially on shared devices.
              </li>
            </ul>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div className="global-bg min-h-screen px-4 pb-20 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">
            Admin Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-white">Control Center</h1>
          <p className="text-sm text-muted">
            Manage tournaments, users, and monitor platform performance.
          </p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[#080f0c] px-4 py-2 text-xs">
            <div className="flex flex-col">
              <span className="font-semibold text-white">{displayName}</span>
              <span className="text-[11px] text-muted">{email}</span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Super Admin
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              <LogOut className="h-3 w-3" />
              <span>Log out</span>
            </button>
          </div>
        </header>

        <nav className="mt-2 flex flex-wrap gap-2 rounded-full bg-black/40 p-1 text-xs sm:text-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center rounded-full px-3 py-2 font-semibold transition sm:px-4 ${
                  isActive
                    ? "bg-emerald-500 text-black shadow-[0_0_18px_rgba(16,185,129,0.6)]"
                    : "text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {renderTabContent()}

        <div className="mt-6 flex flex-wrap justify-between gap-3 text-xs text-muted">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-semibold text-white hover:border-emerald-400/60"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-semibold text-white hover:border-emerald-400/60"
          >
            View Player Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[11px]">
            <Settings className="h-3 w-3 text-emerald-300" />
            <span>More admin tools coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  description: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function AdminStatCard({ label, description, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#080f0c] px-5 py-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-emerald-300" />
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </div>
  );
}

type ActionRowProps = {
  title: string;
  description: string;
  href: string;
};

function AdminActionRow({ title, description, href }: ActionRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#070b10] px-4 py-3 text-left text-sm transition hover:border-emerald-400/60"
    >
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-emerald-300" />
    </Link>
  );
}

type StatusRowProps = {
  label: string;
  status: SystemStatus;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function StatusRow({ label, status, icon: Icon }: StatusRowProps) {
  const isOnline = status === "online";
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#070b10] px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-emerald-300" />
        <span>{label}</span>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
          isOnline
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-red-500/10 text-red-300"
        }`}
      >
        {isOnline ? "Online" : "Issue"}
      </span>
    </div>
  );
}
