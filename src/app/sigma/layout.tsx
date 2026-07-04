import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redirect",
  robots: { index: false, follow: true },
};

export default function SigmaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
