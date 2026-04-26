"use client";

export default function ProjectPageSkeleton() {
  return (
    <div className="h-screen bg-zinc-950 flex overflow-hidden animate-pulse">
      {/* Sidebar skeleton */}
      <aside className="w-56 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="h-5 w-24 bg-zinc-800 rounded" />
          <div className="h-4 w-32 bg-zinc-800/60 rounded mt-3" />
        </div>
        <div className="flex-1 p-2 space-y-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-zinc-800/60 rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
          <div className="h-4 w-64 bg-zinc-800 rounded" />
          <div className="h-10 w-28 bg-zinc-800 rounded-lg" />
        </header>

        <div className="flex-1 flex flex-col overflow-hidden p-6">
          {/* Chat area skeleton */}
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <div className="flex justify-end">
              <div className="h-12 w-64 bg-zinc-800 rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-zinc-800/60 rounded" />
              <div className="h-4 w-5/6 bg-zinc-800/60 rounded" />
              <div className="h-20 w-full bg-zinc-800 rounded-2xl" />
              <div className="h-20 w-full bg-zinc-800 rounded-2xl" />
            </div>
          </div>

          {/* Input skeleton */}
          <div className="mt-auto pt-6 max-w-3xl mx-auto w-full">
            <div className="h-14 bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
