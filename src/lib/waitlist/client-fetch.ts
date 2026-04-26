/** Client-side waitlist / leaderboard API calls — always bound so buttons don’t spin forever if the server hangs. */
export const WAITLIST_CLIENT_FETCH_MS = 30_000;

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const timeout = timeoutSignal(WAITLIST_CLIENT_FETCH_MS);
  if (!init?.signal) {
    return fetch(input, { ...init, signal: timeout });
  }
  const merged = new AbortController();
  const abort = () => merged.abort();
  timeout.addEventListener("abort", abort);
  init.signal.addEventListener("abort", abort);
  return fetch(input, { ...init, signal: merged.signal }).finally(() => {
    timeout.removeEventListener("abort", abort);
    init.signal?.removeEventListener("abort", abort);
  });
}

export function isTimeoutAbort(e: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError") ||
    (e instanceof Error && e.name === "AbortError")
  );
}
