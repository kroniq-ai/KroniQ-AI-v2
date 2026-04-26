import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer access",
  description: "Internal access — not for public search indexing.",
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default function DevAccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
