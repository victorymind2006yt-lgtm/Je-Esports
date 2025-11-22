"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User as UserIcon } from "lucide-react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";

import { auth } from "../firebase";

type ProfileFormState = {
  displayName: string;
  avatarUrl: string;
};

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    displayName: "",
    avatarUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);

      if (!user) {
        router.push("/login");
        return;
      }

      setForm({
        displayName:
          user.displayName || user.email?.split("@")[0] || "",
        avatarUrl: user.photoURL || "",
      });
    });

    return () => unsubscribe();
  }, [router]);

  const username = currentUser?.email ? currentUser.email.split("@")[0] : "";
  const email = currentUser?.email ?? "";
  const creationDate = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
    : "—";

  const handleInputChange = (
    field: keyof ProfileFormState,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updateProfile(currentUser, {
        displayName:
          form.displayName.trim() ||
          currentUser.displayName ||
          username,
        photoURL: form.avatarUrl.trim() || null,
      } as any);

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return;

    setSendingReset(true);
    setMessage(null);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error(err);
      setError("Could not send reset email. Please try again.");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="global-bg min-h-screen px-4 pb-24 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-16">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-muted">
            Manage your account settings and preferences.
          </p>
        </header>

        {message ? (
          <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {/* Profile Information */}
        <section className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-6">
          <div className="flex items-center gap-2 pb-4">
            <UserIcon className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-base font-semibold text-white">
                Profile Information
              </p>
              <p className="text-xs text-muted">
                Update your profile details
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1 text-sm">
              <label className="font-medium text-white">Username</label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full rounded-lg bg-[#111318] px-3 py-2 text-sm text-muted outline-none ring-0 ring-emerald-500/0 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-muted">
                Username cannot be changed.
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium text-white">Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                placeholder="Enter your display name"
                className="w-full rounded-lg bg-[#111318] px-3 py-2 text-sm text-white outline-none ring-1 ring-transparent transition focus:ring-emerald-500/70"
              />
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium text-white">Avatar URL</label>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-lg bg-[#111318] px-3 py-2 text-sm text-white outline-none ring-1 ring-transparent transition focus:ring-emerald-500/70"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !currentUser}
              className="mt-2 inline-flex items-center rounded-full bg-[#14cc6f] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#0fa75b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Account Information */}
        <section className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-6">
          <div className="flex items-center gap-2 pb-4">
            <Mail className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-base font-semibold text-white">
                Account Information
              </p>
              <p className="text-xs text-muted">Your account details</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-white">Email</p>
              <p className="text-muted">{email || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Account Created</p>
              <p className="text-muted">{creationDate}</p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-3xl border border-white/10 bg-[#080f0c] px-6 py-6">
          <div className="flex items-center gap-2 pb-4">
            <Lock className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-base font-semibold text-white">Security</p>
              <p className="text-xs text-muted">
                Manage your account security
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={sendingReset || !email}
            className="inline-flex items-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendingReset ? "Sending..." : "Change Password"}
          </button>
          <p className="mt-1 text-[11px] text-muted">
            We will email you a secure link to reset your password.
          </p>
        </section>

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
