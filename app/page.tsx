"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Clock3,
} from "lucide-react";
import { motion } from "framer-motion";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import { auth } from "./firebase";

const stats = [
  { label: "Active Players", value: "5k+" },
  { label: "Total Prizes", value: "50K+" },
  { label: "Tournaments Battles", value: "24/7" },
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
  { label: "Contact Us", href: "/contact" },
  { label: "Rules", href: "/rules" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Wallet", href: "/wallet" },
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
      </div>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-muted">
        <p>© 2025 JE Esports. All rights reserved.</p>
        <p className="mt-2">
          <Link
            href="/admin/login"
            className="font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Admin Login
          </Link>
        </p>
      </footer>
    </div>
  );
}

function SiteHeader({ user, authReady }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navLinks.filter((item) => {
    if (item.label === "Dashboard" || item.label === "Wallet") {
      return !!user;
    }
    return true;
  });

  return (
    <>
      <header className="header-shell flex w-full items-center justify-between rounded-none px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-[#0d1611]">
            <Image
              src="https://anyimage.io/storage/uploads/b876d0034821a9b733f61d5e3f56fb64"
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
        </Link>
        <nav className="hidden items-center gap-3 text-sm font-semibold text-muted lg:flex">
          {filteredNav.map((item) => (
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
        <button
          type="button"
          className="lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <Menu className="h-5 w-5 text-muted" />
        </button>
      </header>

      {mobileOpen ? (
        <nav className="lg:hidden border-t border-white/10 bg-[#050a0f] px-6 py-4 text-sm font-semibold text-muted">
          <div className="flex flex-col gap-2">
            {filteredNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {!authReady || user ? null : (
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-white/15 px-3 py-2 text-center text-sm font-semibold text-white transition hover:border-emerald-400/60"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[#14cc6f] px-3 py-2 text-center text-sm font-semibold text-black transition hover:bg-[#0fa75b]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      ) : null}
    </>
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
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="fixed right-4 top-4 z-40 flex flex-col items-end">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-300 shadow-md cursor-pointer"
        aria-label="Open profile menu"
      >
        {initial}
      </button>

      {open ? (
        <div className="mt-3 w-64 rounded-2xl border border-white/10 bg-[#050a0f] p-4 shadow-xl">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              {initial}
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight text-white">{displayName}</p>
              <p className="text-[10px] leading-tight text-muted break-all">{roleLabel} · {email}</p>
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/dashboard");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/wallet");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/tournaments");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
              <Users className="h-4 w-4" />
              <span>My Tournaments</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/settings");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
              <Shield className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/theme");
              }}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
              <span className="inline-flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Theme</span>
              </span>
              <ChevronRight className="h-3 w-3 text-muted" />
            </button>
            <div className="my-1 h-px bg-white/10" />
            <button
              onClick={() => {
                setOpen(false);
                router.push("/privacy");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/terms");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
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
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      const diffMs = nextHour.getTime() - now.getTime();
      const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
      setTimeLeft(diffSeconds);
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

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
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl font-bold leading-tight text-white sm:text-5xl"
          >
            <motion.span
              animate={{
                textShadow: [
                  "0 0 0 rgba(16,185,129,0)",
                  "0 0 18px rgba(16,185,129,0.9)",
                  "0 0 0 rgba(16,185,129,0)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              Welcome to <span className="text-emerald-300">JE Esports</span>
            </motion.span>
          </motion.h1>
          <p className="mx-auto max-w-2xl text-base text-muted sm:text-lg">
            Join thousands in Free Fire battles. Win prizes, climb leaderboards,
            and be a champion with entry fees.
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

          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-xl rounded-3xl border border-emerald-500/40 bg-[#050a0f] px-6 py-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Next Tournament In:
                    </p>
                    <p className="text-xs text-muted">
                      Tournaments start every hour on the hour!
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#14cc6f] px-5 py-3 text-lg font-semibold text-black">
                  <Clock3 className="h-4 w-4" />
                  <span>
                    {minutes}:{seconds}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="mt-6 grid grid-cols-3 gap-2">
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
        <p className="text-base uppercase tracking-[0.35em] text-emerald-300">
          Browse Tournaments
        </p>
        <h2 className="text-3xl font-semibold text-white">Pick your lobby</h2>
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
