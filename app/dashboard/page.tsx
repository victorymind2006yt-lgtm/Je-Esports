"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { getPlayerRegistrations } from "../lib/firebase";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../lib/imageUtils";

import {
  ArrowRight,
  ArrowUpFromLine,
  LayoutDashboard,
  Wallet as WalletIcon,
  Users,
  Shield,
  Palette,
  ShieldCheck,
  FileText,
  ChevronRight,
  LogOut,
  Target,
  TrendingUp,
  Trophy,
  History,
  Menu,
  Camera,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { onAuthStateChanged, signOut, updateProfile, type User } from "firebase/auth";
import { auth } from "../firebase";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Room Details", href: "/room-details" },
  { label: "Contact Us", href: "/contact" },
  { label: "Rules", href: "/rules" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Wallet", href: "/wallet" },
] as const;

type SiteHeaderProps = {
  user: User | null;
  authReady: boolean;
};

type UserProfileBarProps = {
  user: User;
  balance?: number;
};

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [stats, setStats] = useState({
    balance: 0,
    tournamentsPlayed: 0,
    totalWithdrawn: 0,
    totalEarnings: 0,
    photoURL: ""
  });
  const router = useRouter();

  // Cropping State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      const fetchStats = async () => {
        try {
          // Fetch Wallet
          const walletRef = doc(db, "wallets", currentUser.uid);
          const walletSnap = await getDoc(walletRef);
          const walletData = walletSnap.exists() ? walletSnap.data() : null;

          // Fetch Registrations
          const registrations = await getPlayerRegistrations(currentUser.uid);

          setStats({
            balance: walletData?.balance || 0,
            tournamentsPlayed: registrations.length,
            totalWithdrawn: walletData?.totalWithdrawn || 0,
            totalEarnings: walletData?.totalEarnings || 0,
            photoURL: walletData?.photoURL || currentUser.photoURL || ""
          });
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
        }
      };
      fetchStats();
    }
  }, [currentUser]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setShowCropModal(true);
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUploadPhoto = async () => {
    if (!imageSrc || !croppedAreaPixels || !currentUser) return;

    try {
      setUploadingPhoto(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (!croppedImage) {
        throw new Error("Failed to crop image");
      }

      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile_photos/${currentUser.uid}`);
      await uploadBytes(storageRef, croppedImage);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Auth Profile
      await updateProfile(currentUser, { photoURL: downloadURL });

      // Update Firestore
      await setDoc(doc(db, "wallets", currentUser.uid), {
        photoURL: downloadURL
      }, { merge: true });

      // Update local state
      setStats(prev => ({ ...prev, photoURL: downloadURL }));
      setShowCropModal(false);
      setImageSrc(null);

    } catch (e) {
      console.error("Failed to upload photo", e);
      alert(`Failed to upload photo: ${(e as Error).message}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCloseCrop = () => {
    setShowCropModal(false);
    setImageSrc(null);
  };

  const displayName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "Player";
  const handle = currentUser?.email
    ? `@${currentUser.email.split("@")[0]}`
    : "@player";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <SiteHeader user={currentUser} authReady={authReady} />
      {authReady && currentUser ? <UserProfileBar user={currentUser} balance={stats.balance} /> : null}

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-8 lg:px-10">
        <section className="rounded-3xl bg-[#080f0c] px-6 py-6 sm:flex sm:items-center sm:gap-6">
          <div className="relative group">
            <div className={`h-20 w-20 overflow-hidden rounded-full border-2 border-emerald-500/20 bg-[#0d1611] flex items-center justify-center ${!stats.photoURL ? 'text-emerald-300' : ''}`}>
              {stats.photoURL ? (
                <Image
                  src={stats.photoURL}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold">{initial}</span>
              )}
            </div>

            <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </label>

            {uploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-0">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-white">{displayName}</p>
              {stats.photoURL && <ShieldCheck className="h-4 w-4 text-emerald-400" />}
            </div>
            <p className="text-sm text-muted">{handle}</p>
            <p className="mt-2 text-xs text-muted/60">Click photo to update profile picture</p>
          </div>
        </section>

        {/* Crop Modal */}
        {showCropModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#1a1a1a]">
              <div className="relative h-64 w-full bg-black">
                <Cropper
                  image={imageSrc || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={false}
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Zoom</span>
                  <span className="text-xs text-muted">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-2 h-1 w-full appearance-none rounded-full bg-white/20 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                />

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleCloseCrop}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    disabled={uploadingPhoto}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadPhoto}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Wallet Balance",
              value: stats.balance.toString(),
              sublabel: "diamonds",
              icon: WalletIcon,
            },
            {
              label: "Tournaments Played",
              value: stats.tournamentsPlayed.toString(),
              sublabel: "",
              icon: Trophy,
            },
            {
              label: "Total Withdrawn",
              value: stats.totalWithdrawn.toString(),
              sublabel: "diamonds",
              icon: ArrowUpFromLine,
            },
            {
              label: "Total Earnings",
              value: stats.totalEarnings.toString(),
              sublabel: "diamonds",
              icon: TrendingUp,
            },
          ].map(({ label, value, sublabel, icon: Icon }) => (
            <div
              key={label}
              className="rounded-3xl border border-white/10 bg-[#080f0c] px-5 py-4"
            >
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{label}</span>
                <Icon className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-semibold text-white">{value}</p>
                {sublabel ? (
                  <p className="text-xs text-muted">{sublabel}</p>
                ) : null}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-4 space-y-3">
          <p className="text-lg font-semibold text-white">Quick Actions</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/tournaments"
              className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-4 text-left transition hover:border-emerald-400/60"
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-emerald-300" />
                <span className="text-base font-semibold text-white">
                  Join Tournament
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Browse and join upcoming tournaments
              </p>
            </Link>

            <Link
              href="/wallet"
              className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-4 text-left transition hover:border-emerald-400/60"
            >
              <div className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-emerald-300" />
                <span className="text-base font-semibold text-white">
                  Manage Wallet
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Deposit or withdraw funds
              </p>
            </Link>

            <Link
              href="/history"
              className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-4 text-left transition hover:border-emerald-400/60"
            >
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-300" />
                <span className="text-base font-semibold text-white">
                  View History
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Check your tournament history
              </p>
            </Link>
          </div>
        </section>
      </main >
    </div >
  );
}

function SiteHeader({ user, authReady }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navLinks.filter((item) => {
    if (item.label === "Dashboard" || item.label === "Wallet" || item.label === "Room Details") {
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
              src="/logo.jpg"
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
          {filteredNav.map((item) => {
            const isActive = item.href === "/dashboard";
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-full px-3 py-1.5 transition ${isActive
                  ? "bg-[#14cc6f] text-black"
                  : "hover:bg-white/5 hover:text-white"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
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
            {filteredNav.map((item) => {
              const isActive = item.href === "/dashboard";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-full px-3 py-2 transition ${isActive
                    ? "bg-[#14cc6f] text-black"
                    : "hover:bg-white/5 hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
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

function UserProfileBar({ user, balance }: UserProfileBarProps) {
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
        {user.photoURL ? (
          <img src={user.photoURL} alt={displayName} className="h-full w-full rounded-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open ? (
        <div className="mt-3 w-64 rounded-2xl border border-white/10 bg-[#050a0f] p-4 shadow-xl">
          <div className="mb-3 flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt={displayName} className="h-9 w-9 rounded-full object-cover border border-emerald-500/20" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {initial}
              </div>
            )}
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
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <WalletIcon className="h-4 w-4" />
                <span>Wallet</span>
              </div>
              {balance !== undefined && (
                <span className="text-xs font-semibold text-emerald-300">{balance} 💎</span>
              )}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/room-details");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
            >
              <Users className="h-4 w-4" />
              <span>Room ID & Password</span>
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
