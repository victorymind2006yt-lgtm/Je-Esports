"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [secretCode, setSecretCode] = useState("");

  // Visibility states for all 4 fields
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Validate Secret Key
    if (secretKey !== "PrimarYdarkLIn") {
      setError("Get Lost You Idiot Scammer");
      setLoading(false);
      return;
    }

    // 2. Validate Secret Code
    if (secretCode !== "JeEsports2K25") {
      setError("Get LoST You Idiot Scammer");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem("admin_secret_access", "true");
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError("Get LoST You Idiot Scammer ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="global-bg min-h-screen px-4 pb-24 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-16">
        <header className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
          <p className="text-sm text-muted">Last updated: 11/20/2025</p>
        </header>

        {/* 1. Information We Collect */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            1. Information We Collect
          </h2>
          <p className="mt-2 text-sm text-muted">
            We collect information you provide directly to us, including your
            name, email address, username, and payment information when you
            register for tournaments or use our services.
          </p>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            2. How We Use Your Information
          </h2>
          <p className="mt-2 text-sm text-muted">
            We use the information we collect to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted">
            <li>Provide, maintain, and improve our services</li>
            <li>Process tournament registrations and payments</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </section>

        {/* 3. Information Sharing */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            3. Information Sharing
          </h2>
          <p className="mt-2 text-sm text-muted">
            We do not share your personal information with third parties except
            as described in this policy. We may share information with service
            providers who assist us in operating our platform.
          </p>
        </section>

        {/* 4. Data Security */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">4. Data Security</h2>
          <p className="mt-2 text-sm text-muted">
            We take reasonable measures to protect your information from
            unauthorized access, loss, misuse, and alteration. However, no
            security system is impenetrable.
          </p>
        </section>

        {/* 5. Your Rights */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">5. Your Rights</h2>
          <p className="mt-2 text-sm text-muted">
            You have the right to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted">
            <li>Access and update your personal information</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>

        {/* 6. Cookies and Tracking */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            6. Cookies and Tracking
          </h2>
          <p className="mt-2 text-sm text-muted">
            Our service uses cookies and similar tracking technologies to track activity on our service and store certain information. The Admin uses this information to monitor usage, improve service functionality, and ensure platform security.
          </p>
        </section>

        {/* 7. Children's Privacy */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            7. Children's Privacy
          </h2>
          <p className="mt-2 text-sm text-muted">
            Our service is{" "}
            <button
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="text-muted hover:text-white transition"
            >
              not
            </button>{" "}
            intended for users under 18 years of age. We do not knowingly collect personal information from children under 18.
          </p>

          {showAdminLogin && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-emerald-300" />
                <h3 className="text-sm font-semibold text-white">Admin Login</h3>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3" autoComplete="off">
                {/* 1. Secret Key Field */}
                <div className="relative">
                  <input
                    type={showSecretKey ? "text" : "password"}
                    placeholder="Secret Key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* 2. Secret Code Field */}
                <div className="relative">
                  <input
                    type={showSecretCode ? "text" : "password"}
                    placeholder="Secret Code"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretCode(!showSecretCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showSecretCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* 3. Email Field */}
                <div className="relative">
                  <input
                    type={showEmail ? "text" : "email"}
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmail(!showEmail)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* 4. Password Field */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          )}
        </section>

        {/* 8. Changes to This Policy */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            8. Changes to This Policy
          </h2>
          <p className="mt-2 text-sm text-muted">
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the "Last updated" date.
          </p>
        </section>

        {/* 9. Contact Us */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">9. Contact Us</h2>
          <p className="mt-2 text-sm text-muted">
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p className="mt-1 text-sm text-muted">
            Email:support@jeesports.online
            03165475717
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
