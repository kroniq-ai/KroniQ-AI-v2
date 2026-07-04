/** Public-safe label for leaderboard (never expose full email). */
export function publicLeaderboardName(fullName: string): string {
  const t = fullName.trim().replace(/\s+/g, " ");
  if (!t) return "Member";
  const parts = t.split(" ");
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  const initial = last[0]?.toUpperCase() ?? "";
  return initial ? `${first} ${initial}.` : first;
}
