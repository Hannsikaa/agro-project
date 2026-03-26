import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 py-16 font-sans dark:from-black dark:to-zinc-950">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/50">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Crop Demand Intelligence System
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Predict profitable crops and avoid market oversupply
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/analyze"
              className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              Start Analysis
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
