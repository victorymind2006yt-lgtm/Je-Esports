"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, Coins, Filter, Search, Users } from "lucide-react";

import { getTournaments } from "../lib/firebase";
import type { Tournament, TournamentMode } from "../lib/types";

const filters = [
  { label: "All Tournaments", value: "all" },
  { label: "Solo Per Kill", value: "solo" },
  { label: "Survival", value: "duo" },
  { label: "Clash Squad", value: "squad" },
];

export default function TournamentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeFilter, setActiveFilter] = useState(() => {
    const mode = searchParams.get("mode");
    if (!mode) return "all";
    const value = mode.toLowerCase();
    return filters.some((filter) => filter.value === value) ? value : "all";
  });
  const [query, setQuery] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTournaments();
        setTournaments(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleFilterClick = (value: string) => {
    setActiveFilter(value);
    if (value === "all") {
      router.push("/tournaments");
    } else {
      router.push(`/tournaments?mode=${value}`);
    }
  };

  const filteredEvents = useMemo(() => {
    const lowered = query.toLowerCase();
    return tournaments.filter((tournament) => {
      const matchesMode =
        activeFilter === "all" || tournament.mode === (activeFilter as TournamentMode);
      const matchesQuery = tournament.name.toLowerCase().includes(lowered);
      return matchesMode && matchesQuery;
    });
  }, [tournaments, activeFilter, query]);

  const formatDateTime = (date: Date) => {
    try {
      return new Date(date).toLocaleString("en-PK", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="global-bg min-h-screen px-0 text-white">
      <section className="w-full bg-[#080808] px-4 py-12 sm:px-10 lg:px-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              Active <span className="text-[#14cc6f]">Tournaments</span>
            </h1>
            <p className="mt-2 text-base text-[#f4c544]">
              Choose from various Free Fire game modes and compete for amazing prizes
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterClick(filter.value)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-semibold transition ${
                    activeFilter === filter.value
                      ? "bg-[#14cc6f] text-black"
                      : "bg-[#111111] text-white/70"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  {filter.label}
                  <span className="text-xs">0</span>
                </button>
              ))}
            </div>
            <label className="flex w-full max-w-sm items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-base text-muted">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tournaments..."
                className="flex-1 bg-transparent text-white outline-none"
              />
            </label>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-12 lg:px-10">

        <section className="grid gap-8 md:grid-cols-2">
          {error ? (
            <div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-10 text-center text-sm text-muted">
              Loading tournaments...
            </div>
          ) : null}

          {!loading &&
            filteredEvents.map((tournament) => {
            const statusLabel =
              tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1);
            const isCompleted = tournament.status === "completed";
            const isOngoing = tournament.status === "ongoing";
            const isUpcoming = tournament.status === "upcoming";
            const isCancelled = tournament.status === "cancelled";
            const isJoinable = (isUpcoming || isOngoing) && !isCancelled;
            const isFull = tournament.registeredSlots >= tournament.maxSlots;
            const fillPercent = Math.min(
              100,
              Math.round(
                (tournament.registeredSlots / Math.max(1, tournament.maxSlots)) * 100,
              ),
            );

            const modeLabel = tournament.mode
              .replace("-", " ")
              .replace(/^(.)/, (c) => c.toUpperCase());
            const categoryLabel = tournament.type
              .replace("-", " ")
              .replace(/^(.)/, (c) => c.toUpperCase());

            const statusClasses = isCancelled
              ? "bg-red-500/15 text-red-300"
              : isCompleted
              ? "bg-gray-500/15 text-gray-200"
              : isOngoing
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-blue-500/15 text-blue-300";

            return (
              <article
                key={tournament.id}
                className="flex w-full max-w-sm flex-col justify-between rounded-md border border-emerald-500/20 bg-gradient-to-b from-[#071829] via-[#050b10] to-[#020509] px-6 py-6 text-sm shadow-[0_30px_90px_rgba(0,0,0,0.85)] transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-[0_40px_120px_rgba(0,0,0,0.95)] md:mx-auto"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {tournament.name}
                      </h2>
                      <p className="mt-1 line-clamp-1 text-xs text-muted">
                        {tournament.description || "Je Esports Private Limited..."}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-xs text-muted">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-emerald-300" />
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                          Entry Fee
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-300">
                        {tournament.entryFee} diamonds
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-4 rounded-full bg-white/40" />
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                          Mode
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {modeLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-4 rounded-full bg-purple-400" />
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                          Category
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-emerald-300">
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-300" />
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                          Participants
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {tournament.registeredSlots}/
                        <span className="opacity-70">{tournament.maxSlots}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-emerald-300" />
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                          Date &amp; Time
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-white text-right">
                        {formatDateTime(tournament.startTime)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted">{fillPercent}% full</p>
                  </div>
                </div>

                <Link
                  href={`/tournaments/${tournament.id}`}
                  className={`mt-4 inline-flex items-center justify-center rounded-full px-6 py-2 text-center text-sm font-semibold transition ${
                    isCancelled
                      ? "cursor-not-allowed bg-[#111111] text-white/40"
                      : isJoinable && !isFull
                      ? "bg-[#14cc6f] text-black hover:bg-[#0fa75b]"
                      : "bg-[#111111] text-white/80"
                  }`}
                >
                  {isCancelled
                    ? "Cancelled"
                    : isCompleted
                    ? "View Results"
                    : isFull
                    ? "Full"
                    : "Join Now"}
                </Link>
              </article>
            );
          })}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-muted">
              <Filter className="mx-auto h-10 w-10" />
              <p className="mt-4 text-lg font-semibold text-white">
                No tournaments match this filter.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
