import type { Metadata } from "next";
import CTOPageClient from "@/components/cto/CTOPageClient";

export const metadata: Metadata = {
    title: "CTO",
    description:
        "AI agents that architect, build, deploy, and secure your product. Not a tool — a tech department.",
};

export default function CTOPage() {
    return <CTOPageClient />;
}
