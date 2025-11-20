"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Headphones,
  Menu,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  Zap,
  LayoutDashboard,
  LogOut,
  Palette,
  Shield,
  FileText,
  User as UserIcon,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import { auth } from "./firebase";

const stats = [
  { label: "Active Players", value: "5k+" },
  { label: "Total Prizes", value: "50K+" },
  { label: "Tournaments", value: "24/7" },
];

const steps = [
  {
    title: "Create Account",
    body: "Sign up with email and build your gamer profile in seconds.",
  },
  {
    title: "Add Deposit",
    body: "Secure top-ups starting at 50 PKR via wallet deposits.",
  },
  {
    title: "Join Tournament",
    body: "Pick Solo, Duo or Squad rooms and reserve your slot instantly.",
  },
  {
    title: "Win Prizes",
    body: "Climb the leaderboard and cash out winnings within minutes.",
  },
];

const reasons = [
  {
    icon: Trophy,
    title: "Exciting Tournaments",
    description: "Daily rooms, custom prizes and diverse formats.",
  },
  {
    icon: Users,
    title: "Fair Competition",
    description: "Skill-based matchmaking monitored by admins.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    description: "Wallet operations protected by Firebase security rules.",
  },
  {
    icon: Zap,
    title: "Instant Rewards",
    description: "Automated payouts through Cloud Functions.",
  },
];

const tournamentTabs = ["Upcoming", "Ongoing", "Past"] as const;
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Contact", href: "/contact" },
  { label: "Rules", href: "/rules" },
] as const;

type SiteHeaderProps = {
  user: User | null;
  authReady: boolean;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<(typeof tournamentTabs)[number]>(
    "Upcoming",
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen text-white">
      <SiteHeader user={currentUser} authReady={authReady} />
      {authReady && currentUser ? <UserProfileBar user={currentUser} /> : null}
      <Hero />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 pt-10 lg:px-10">
        <HowItWorks />
        <BrowseTournaments activeTab={activeTab} onTabChange={setActiveTab} />
        <WhyChooseUs />
        <Cta />
      </div>
    </div>
  );
}

function SiteHeader({ user, authReady }: SiteHeaderProps) {
  return (
    <header className="header-shell flex w-full items-center justify-between rounded-none px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-[#0d1611]">
          <Image
            src="/je-logo.png"
            alt="JE Esports logo"
            width={48}
            height={48}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
            JE Esports
          </p>
          <p className="text-sm text-muted">Premier Free Fire League</p>
        </div>
      </div>
      <nav className="hidden items-center gap-3 text-sm font-semibold text-muted lg:flex">
        {navLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-full px-3 py-1.5 transition hover:bg-white/5 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="hidden items-center gap-3 lg:flex">
        {!authReady ? (
          <div className="h-9 w-32 rounded-full bg-white/5" />
        ) : user ? null : (
          <>
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/60"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#14cc6f] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#0fa75b]"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
      <button className="lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5 text-muted" />
      </button>
    </header>
  );
}

type UserProfileBarProps = {
  user: User;
};

function UserProfileBar({ user }: UserProfileBarProps) {
  const displayName = user.displayName || user.email?.split("@")[0] || "Player";
  const email = user.email ?? "";
  const roleLabel =
    email === "fflionking12345678@gmail.com" ? "Admin" : "Player";
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative mx-auto flex w-full max-w-6xl justify-end px-4 pt-2 lg:px-10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-300 shadow-md"
        aria-label="Open profile menu"
      >
        {initial}
      </button>

      {open ? (
        <div className="absolute right-4 top-12 w-64 rounded-2xl border border-white/10 bg-[#050a0f] p-4 shadow-xl">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-muted">{roleLabel} · {email}</p>
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted">
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5">
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5">
              <Users className="h-4 w-4" />
              <span>My Tournaments</span>
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5">
              <Shield className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-white/5">
              <span className="inline-flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Theme</span>
              </span>
              <ChevronRight className="h-3 w-3 text-muted" />
            </button>
            <div className="my-1 h-px bg-white/10" />
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5">
              <ShieldCheck className="h-4 w-4" />
              <span>Privacy Policy</span>
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5">
              <FileText className="h-4 w-4" />
              <span>Terms of Service</span>
            </button>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Hero() {
  return (
    <section
      id="hero"
      className="hero-card relative w-full overflow-hidden rounded-none px-4 py-16 text-center sm:px-12 lg:px-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="pill-outline mx-auto">
          <span className="text-xs uppercase tracking-[0.4em] text-emerald-300">
            Pakistan's Premier Free Fire Tournament Platform
          </span>
        </div>
        <div className="mt-10 space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold leading-tight text-white sm:text-5xl"
          >
            Welcome to <span className="text-emerald-300">JE Esports</span>
          </motion.h1>
          <p className="mx-auto max-w-2xl text-base text-muted sm:text-lg">
            Join thousands of players in competitive Free Fire battles. Win prizes,
            climb leaderboards, and become a champion with entry fees starting at
            just 40 PKR.
          </p>
          <Stats />
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/tournaments"
              className="flex items-center gap-2 rounded-full bg-[#14cc6f] px-8 py-4 text-lg font-semibold text-black transition hover:bg-[#0fa75b]"
            >
              Join Tournament Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tournaments"
              className="rounded-full border border-white/15 px-8 py-4 text-lg font-semibold text-white transition hover:border-emerald-400/50 hover:text-emerald-100"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="mt-6 grid gap-2 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="px-4 py-2 text-center"
        >
          <p className="text-3xl font-semibold text-emerald-300">{stat.value}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted">
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="panel-dark grid gap-10 rounded-[28px] px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
            How to Join Tournaments
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Get started in 4 pro-level steps
          </h2>
          <p className="text-muted">
            Sign up, add funds, join your favorite lobby, and claim your rewards
            with instant wallet settlements.
          </p>
        </div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="panel-dark flex items-start gap-4 rounded-2xl px-5 py-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-lg font-semibold text-emerald-300">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <p className="text-base font-semibold text-white">{step.title}</p>
                <p className="text-sm text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-dark flex h-full flex-col justify-between rounded-3xl p-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            Game Tournament
          </p>
          <p className="mt-2 text-sm text-muted">
            Choose your mode, secure your slot, and drop into battle-ready rooms.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded-full border border-white/15 px-4 py-1 text-white">
              Solo Per Kill
            </span>
            <span className="rounded-full border border-white/15 px-4 py-1 text-white">
              Bermuda Survival
            </span>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {[
            { label: "Prizes", icon: Trophy },
            { label: "Players", icon: Users },
            { label: "Compete", icon: Wallet },
          ].map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="panel-dark flex items-center justify-between rounded-2xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </div>
          ))}
        </div>
        <Link
          href="/tournaments"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#14cc6f] px-4 py-3 text-base font-semibold text-black transition hover:bg-[#0fa75b]"
        >
          Join Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

type BrowseTournamentsProps = {
  activeTab: (typeof tournamentTabs)[number];
  onTabChange: (tab: (typeof tournamentTabs)[number]) => void;
};

function BrowseTournaments({ activeTab, onTabChange }: BrowseTournamentsProps) {
  return (
    <section id="tournaments" className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
          Browse Tournaments
        </p>
        <h2 className="text-3xl font-semibold text-white">Pick your lobby</h2>
        <p className="text-muted">
          Upcoming, live and past events managed by Firebase-powered admin panel.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {tournamentTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-emerald-400 text-black"
                : "border border-white/10 text-muted hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="panel-dark rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-muted">
        <Trophy className="mx-auto h-10 w-10 text-white/25" />
        <p className="mt-4 text-lg font-semibold text-white">
          No {activeTab} Tournaments
        </p>
        <p className="text-sm text-muted">
          Check back soon or follow our Discord for instant announcements.
        </p>
      </div>
      <div className="text-center">
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50"
        >
          View All Tournaments
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
          Why Choose Us?
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Built for champions
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reasons.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="panel-dark flex flex-col gap-3 rounded-3xl p-5"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-emerald-300" />
              <p className="text-lg font-semibold text-white">{title}</p>
            </div>
            <p className="text-sm text-muted">{description}</p>
          </div>
        ))}
      </div>
      <div className="panel-dark flex flex-col items-center gap-4 rounded-3xl px-6 py-10 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-xl font-semibold text-white">
            Need admin access?
          </p>
          <p className="text-sm text-muted">
            Dedicated control center with Cloud Functions, audit logs and secure
            wallet controls.
          </p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/50"
        >
          Admin Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section id="cta" className="panel-dark rounded-3xl px-6 py-12 text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
        Ready to Start Winning?
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-white">
        Join daily Free Fire tournaments with instant payouts.
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-muted">
        Secure Firebase Authentication, wallet automation via Cloud Functions and
        responsive dashboards keep you focused on the next drop.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-full bg-[#14cc6f] px-6 py-3 text-base font-semibold text-black transition hover:bg-[#0fa75b]"
        >
          Sign Up Free
        </Link>
        <Link
          href="/contact"
          className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:border-emerald-400/50"
        >
          Contact Support
          <Headphones className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
