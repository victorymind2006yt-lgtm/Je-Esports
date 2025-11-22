"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="global-bg min-h-screen px-4 pb-24 text-white lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-16">
        <header className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-semibold text-white">Terms of Service</h1>
          <p className="text-sm text-muted">Last updated: 11/20/2025</p>
        </header>

        {/* 1. Acceptance of Terms */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            1. Acceptance of Terms
          </h2>
          <p className="mt-2 text-sm text-muted">
            By creating an account or participating in any JE Esports
            tournament, you agree to be bound by these Terms of Service and all
            applicable rules published on our platform.
          </p>
        </section>

        {/* 2. Eligibility */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">2. Eligibility</h2>
          <p className="mt-2 text-sm text-muted">
            You must be at least 18 years old, or the age of majority in your
            jurisdiction, to participate in cash or prize tournaments. By using
            JE Esports, you confirm that you meet all legal requirements in your
            region.
          </p>
        </section>

        {/* 3. Accounts and Security */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            3. Accounts and Security
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted">
            <li>You are responsible for maintaining the confidentiality of your account.</li>
            <li>You agree to notify us immediately of any unauthorized use.</li>
            <li>We reserve the right to suspend or terminate accounts that
              violate these Terms or our tournament rules.</li>
          </ul>
        </section>

        {/* 4. Tournaments and Gameplay */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            4. Tournaments and Gameplay
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted">
            <li>All tournaments are subject to the official JE Esports rules
              published on the Rules page.</li>
            <li>Admins may disqualify players for cheating, exploiting bugs, or
              unsportsmanlike behavior.</li>
            <li>Decisions made by JE Esports admins regarding match results and
              penalties are final.</li>
          </ul>
        </section>

        {/* 5. Payments, Wallet, and Prizes */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            5. Payments, Wallet, and Prizes
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted">
            <li>Entry fees, deposits, and withdrawals are handled through your
              JE Esports wallet.</li>
            <li>Prizes are credited to your wallet once match results are
              verified by admins.</li>
            <li>Any chargebacks, fraudulent payments, or abuse of promotions may
              result in account suspension.</li>
          </ul>
        </section>

        {/* 6. User Conduct */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">6. User Conduct</h2>
          <p className="mt-2 text-sm text-muted">
            You agree not to engage in any behavior that:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted">
            <li>Violates any applicable law or regulation</li>
            <li>Harasses, threatens, or abuses other players or staff</li>
            <li>Attempts to hack, disrupt, or overload our systems</li>
            <li>Uses cheats, unauthorized software, or multiple accounts to gain
              unfair advantage</li>
          </ul>
        </section>

        {/* 7. Disclaimers */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">7. Disclaimers</h2>
          <p className="mt-2 text-sm text-muted">
            JE Esports is provided on an "as is" and "as available" basis. We do
            not guarantee uninterrupted access, error-free operation, or that any
            particular match result or prize outcome will meet your
            expectations.
          </p>
        </section>

        {/* 8. Limitation of Liability */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            8. Limitation of Liability
          </h2>
          <p className="mt-2 text-sm text-muted">
            To the maximum extent permitted by law, JE Esports shall not be
            liable for any indirect, incidental, special, or consequential
            damages arising out of your use of the platform or participation in
            tournaments.
          </p>
        </section>

        {/* 9. Changes to These Terms */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">
            9. Changes to These Terms
          </h2>
          <p className="mt-2 text-sm text-muted">
            We may update these Terms of Service from time to time. Continued use
            of JE Esports after changes take effect constitutes your acceptance
            of the updated Terms.
          </p>
        </section>

        {/* 10. Contact Us */}
        <section className="rounded-3xl bg-[#080f0c] px-6 py-5">
          <h2 className="text-base font-semibold text-white">10. Contact Us</h2>
          <p className="mt-2 text-sm text-muted">
            If you have any questions about these Terms of Service, please
            contact us at:
          </p>
          <p className="mt-1 text-sm text-muted">
            Email: support@fftournaments.com
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
