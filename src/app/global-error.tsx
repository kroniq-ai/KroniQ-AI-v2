"use client";

import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en-CA">
            <body className="flex min-h-screen flex-col items-center justify-center bg-[#020202] px-6 text-center text-white">
                <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
                <p className="mt-2 max-w-md text-sm text-white/50">
                    {error.digest ? `Reference: ${error.digest}` : "Please try again or return home."}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/15"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white/80 hover:text-white"
                    >
                        Back to home
                    </Link>
                </div>
            </body>
        </html>
    );
}
