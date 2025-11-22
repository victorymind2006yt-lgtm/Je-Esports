"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Gem,
  History,
} from "lucide-react";

import { auth, db } from "../firebase";

type WalletStats = {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnings: number;
};

type WalletTransaction = {
  id: string;
  type: "deposit" | "withdraw";
  amount: number;
  createdAt: Date | null;
};

export default function WalletPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const fetchWallet = async (walletUser: User) => {
    setLoading(true);
    setError(null);

    try {
      const walletRef = doc(db, "wallets", walletUser.uid);
      const snap = await getDoc(walletRef);

      const profile = {
        email: walletUser.email ?? "",
        displayName:
          walletUser.displayName ||
          walletUser.email?.split("@")[0] ||
          "Player",
      };

      let data: WalletStats;
      if (!snap.exists()) {
        data = {
          balance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          totalEarnings: 0,
        };
        await setDoc(walletRef, { ...data, ...profile }, { merge: true });
      } else {
        const raw = snap.data() as any;
        data = {
          balance: raw.balance ?? 0,
          totalDeposited: raw.totalDeposited ?? 0,
          totalWithdrawn: raw.totalWithdrawn ?? 0,
          totalEarnings: raw.totalEarnings ?? 0,
        };
        await setDoc(walletRef, profile, { merge: true });
      }
      setStats(data);

      const txRef = collection(db, "wallets", walletUser.uid, "transactions");
      const q = query(txRef, orderBy("createdAt", "desc"), limit(10));
      const qSnap = await getDocs(q);
      const list: WalletTransaction[] = qSnap.docs.map((docSnap) => {
        const txData = docSnap.data() as any;
        return {
          id: docSnap.id,
          type: txData.type,
          amount: txData.amount ?? 0,
          createdAt: txData.createdAt?.toDate() ?? null,
        };
      });
      setTransactions(list);
    } catch (err) {
      console.error(err);
      setError("Failed to load wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (current) => {
      if (!current) {
        router.push("/login");
        return;
      }
      setUser(current);
      fetchWallet(current);
    });

    return () => unsubscribe();
  }, [router]);

  const handleTransaction = async (type: "deposit" | "withdraw") => {
    if (!user || !stats) return;

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid diamond amount.");
      return;
    }

    if (type === "withdraw" && value > stats.balance) {
      setError("Not enough diamonds to withdraw that amount.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const walletRef = doc(db, "wallets", user.uid);

      const updated: WalletStats = { ...stats };
      if (type === "deposit") {
        updated.balance += value;
        updated.totalDeposited += value;
      } else {
        updated.balance -= value;
        updated.totalWithdrawn += value;
      }

      await updateDoc(walletRef, {
        balance: updated.balance,
        totalDeposited: updated.totalDeposited,
        totalWithdrawn: updated.totalWithdrawn,
        totalEarnings: updated.totalEarnings,
      });

      const txRef = collection(db, "wallets", user.uid, "transactions");
      await addDoc(txRef, {
        type,
        amount: value,
        createdAt: serverTimestamp(),
      });

      setStats(updated);
      setAmount("");
      setMessage(
        type === "deposit"
          ? `Deposited ${value} diamonds into your wallet.`
          : `Withdrew ${value} diamonds from your wallet.`,
      );

      // Refresh latest transactions
      fetchWallet(user);
    } catch (err) {
      console.error(err);
      setError("Failed to process transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const safeStats: WalletStats = stats ?? {
    balance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalEarnings: 0,
  };

  return (
    <div className="global-bg min-h-screen px-4 pb-24 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-16">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Wallet</h1>
          <p className="text-sm text-muted">
            Manage your funds and transactions. Currency: diamonds.
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

        <section className="grid gap-4 md:grid-cols-[2fr_1.2fr]">
          <div className="rounded-3xl bg-[#080f0c] px-6 py-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <CreditCard className="h-4 w-4 text-emerald-300" />
              Balance
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <Gem className="h-6 w-6 text-emerald-400" />
              <p className="text-3xl font-semibold text-emerald-400">
                {safeStats.balance}
              </p>
              <span className="text-sm text-muted">diamonds</span>
            </div>

            <div className="mt-5 space-y-3">
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in diamonds"
                className="w-full rounded-lg bg-[#111318] px-3 py-2 text-sm text-white outline-none ring-1 ring-transparent transition focus:ring-emerald-500/70"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting || loading}
                  onClick={() => handleTransaction("deposit")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#14cc6f] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#0fa75b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  Deposit
                </button>
                <button
                  type="button"
                  disabled={submitting || loading}
                  onClick={() => handleTransaction("withdraw")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#111318] px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowUpFromLine className="h-4 w-4" />
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#080f0c] px-6 py-5">
            <p className="text-sm font-semibold text-white">Quick Stats</p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted">Total Deposited</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-white">
                  <Gem className="h-4 w-4 text-emerald-300" />
                  <span>{safeStats.totalDeposited}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Withdrawn</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-white">
                  <Gem className="h-4 w-4 text-emerald-300" />
                  <span>{safeStats.totalWithdrawn}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Earnings</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-300">
                  <Gem className="h-4 w-4 text-emerald-300" />
                  <span>{safeStats.totalEarnings}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-300" />
            <div>
              <p className="text-sm font-semibold text-white">
                Transaction History
              </p>
              <p className="text-xs text-muted">
                Your recent deposits and withdrawals
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-muted">Loading wallet...</p>
          ) : transactions.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No transactions yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/5 text-sm">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    {tx.type === "deposit" ? (
                      <ArrowDownToLine className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <ArrowUpFromLine className="h-4 w-4 text-red-300" />
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        {tx.type === "deposit" ? "Deposit" : "Withdraw"}
                      </p>
                      <p className="text-[11px] text-muted">
                        {tx.createdAt
                          ? tx.createdAt.toLocaleString()
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      tx.type === "deposit"
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {tx.type === "withdraw" ? "-" : "+"}
                    {tx.amount}{" "}
                    <span className="text-xs text-muted">diamonds</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
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
