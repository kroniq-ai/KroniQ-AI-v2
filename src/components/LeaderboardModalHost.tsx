"use client";

import { useEffect, useState } from "react";
import LeaderboardModal from "@/components/LeaderboardModal";

/**
 * Single global instance so `openLeaderboardModal()` works from any route (footer, hero, etc.).
 */
export default function LeaderboardModalHost() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onOpen = () => setOpen(true);
        window.addEventListener("voyd-open-leaderboard", onOpen);
        return () => window.removeEventListener("voyd-open-leaderboard", onOpen);
    }, []);

    return <LeaderboardModal open={open} onClose={() => setOpen(false)} />;
}
