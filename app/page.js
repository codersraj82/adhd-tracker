import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg bg-white/85 p-8 text-center shadow-sm ring-1 ring-slate-200">
        <p className="mb-3 text-sm font-medium text-emerald-700">
          Offline-first focus support
        </p>

        <h1 className="text-3xl font-bold text-slate-900">
          ADHD Task Tracker
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600">
          A simple place to organize your day into calm, manageable sections.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
        >
          Go to Dashboard
        </Link>
      </section>
    </main>
  );
}
