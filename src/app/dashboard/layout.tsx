import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your KroniQ workspace — missions and projects. Not indexed for search engines.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
