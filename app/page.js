import Link from "next/link";

export default function HomePage() {
  return (
    <main className="fade-in flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-xl border border-yellow-400/10 bg-slate-900/80 p-8 text-center shadow-xl shadow-black/25">
        <p className="mb-3 text-sm font-medium text-yellow-300">
          Offline-first focus support
        </p>

        <h1 className="text-3xl font-bold text-white">Get It Done</h1>

        <p className="mt-4 text-base leading-7 text-slate-400">
          A simple place to organize your day into calm, manageable sections.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/10 transition hover:shadow-[0_0_10px_rgba(255,215,0,0.4)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300/40 sm:w-auto"
        >
          Go to Dashboard
        </Link>
      </section>
    </main>
  );
}
