"use client";

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-32 bg-zinc-800 rounded" />
          <div className="h-10 w-28 bg-zinc-800 rounded-lg" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4"
            >
              <div className="h-5 w-3/4 bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-800/60 rounded" />
              <div className="h-4 w-1/2 bg-zinc-800/60 rounded" />
              <div className="h-9 w-24 bg-zinc-800 rounded-lg mt-4" />
            </div>
          ))}
        </div>
    </div>
  );
}
