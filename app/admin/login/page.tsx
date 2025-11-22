"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";

import { auth } from "../../firebase";

const ADMIN_EMAIL = "fflionking12345678@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const [checkingUser, setCheckingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCheckingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (field: "email" | "password") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      const credential = await signInWithEmailAndPassword(
        auth,
        formValues.email,
        formValues.password,
      );

      const user = credential.user;
      const isAdminEmail =
        user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (!isAdminEmail) {
        await signOut(auth);
        setError("You are not authorized to access the admin panel.");
        return;
      }

      router.push("/admin/dashboard");
    } catch (firebaseError: unknown) {
      const message =
        firebaseError instanceof Error
          ? firebaseError.message
          : "Failed to sign in as admin.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingUser) {
    return (
      <div className="global-bg flex min-h-screen items-center justify-center px-4 text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldCheck className="h-8 w-8 text-emerald-300" />
          <p className="text-sm text-muted">Checking admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="global-bg min-h-screen px-4 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-16">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Back to Home
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#050b0f] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <span>Admin Access</span>
          </div>
          <p className="text-xs text-muted">
            Please enter your admin credentials to access the control center.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted">Admin Email</label>
              <input
                type="email"
                value={formValues.email}
                onChange={handleChange("email")}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#050b0f] px-3 py-2 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-emerald-400 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formValues.password}
                  onChange={handleChange("password")}
                  placeholder="Enter admin password"
                  className="w-full rounded-xl border border-white/10 bg-[#050b0f] px-3 py-2 pr-10 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-emerald-400 focus:ring-emerald-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-xs text-red-400">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              {isLoading ? "Verifying..." : "Enter Admin Dashboard"}
            </button>

            <p className="mt-3 text-[11px] text-muted">
              This area is restricted. Use your admin email:
              <span className="ml-1 font-semibold text-emerald-300">
                {ADMIN_EMAIL}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
