"use client";

import Link from "next/link";

export default function HistoryPage() {
  return (
    <div className="global-bg min-h-screen px-4 pb-24 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-16">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Match History</h1>
          <p className="text-sm text-muted">
            Your recent tournaments and match results will appear here once the
            history system is connected to Firestore.
          </p>
        </header>

        <div className="rounded-3xl border border-dashed border-white/15 px-6 py-10 text-center text-muted">
          Tournament history is coming soon.
        </div>

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
