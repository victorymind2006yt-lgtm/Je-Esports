"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Coins, Filter, Search, Users } from "lucide-react";

const filters = [
  { label: "All Tournaments", value: "all" },
  { label: "Solo", value: "solo" },
  { label: "Duo", value: "duo" },
  { label: "Squad", value: "squad" },
  { label: "Clash Squad", value: "clash" },
];

const tournaments = [
  {
    id: "1",
    name: "Midnight Rush #120",
    mode: "Squad",
    type: "Per Kill",
    entryFee: 50,
    prizePool: 500,
    slots: "32/64",
    status: "Upcoming",
    startTime: "Today 10:30 PM",
  },
  {
    id: "2",
    name: "Elite Duo Arena",
    mode: "Duo",
    type: "Survival",
    entryFee: 40,
    prizePool: 400,
    slots: "16/32",
    status: "Upcoming",
    startTime: "Tomorrow 8:00 PM",
  },
];

export default function TournamentsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filteredEvents = useMemo(() => {
    return tournaments.filter((event) => {
      const matchesMode =
        activeFilter === "all" ||
        event.mode.toLowerCase() === activeFilter.toLowerCase();
      const matchesQuery = event.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesMode && matchesQuery;
    });
  }, [activeFilter, query]);

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
                  onClick={() => setActiveFilter(filter.value)}
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

        <section className="grid gap-6">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">
                  {event.status}
                </p>
                <h2 className="text-2xl font-semibold text-white">{event.name}</h2>
                <p className="text-sm text-muted">
                  {event.mode} • {event.type} • {event.startTime}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" /> Slots: {event.slots}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Coins className="h-4 w-4" /> Entry: PKR {event.entryFee}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-4 w-4" /> Prize: PKR {event.prizePool}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-[#14cc6f] px-6 py-2 text-sm font-semibold text-black transition hover:bg-[#0fa75b] text-center"
                >
                  Join Now
                </Link>
                <Link
                  href="/rules"
                  className="rounded-full border border-white/15 px-6 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50 text-center"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
          {filteredEvents.length === 0 && (
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
