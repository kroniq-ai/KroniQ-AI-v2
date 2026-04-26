export const KRONIQ_FAQ_CATEGORIES = {
    kroniq: "KroniQ",
} as const;

export type KroniQFaqCategory = keyof typeof KRONIQ_FAQ_CATEGORIES;

export type KroniQFaqEntry = {
    question: string;
    answer: string;
    /** Short label for FAQ cards (defaults to category name in UI) */
    meta?: string;
};

export const KRONIQ_FAQ_BY_CATEGORY: Record<KroniQFaqCategory, KroniQFaqEntry[]> = {
    kroniq: [
        {
            question: "Is this a chatbot?",
            answer:
                "No. KroniQ is a mission-driven execution system. You set a growth goal, it builds a plan and proposes real actions (DMs, posts, outreach). You approve, it sends.",
            meta: "KroniQ",
        },
        {
            question: "What does the private beta include?",
            answer:
                "Full workspace access — mission runs, lead sourcing, LinkedIn outreach, content generation, and the learning loop. Seat count is capped.",
            meta: "KroniQ",
        },
        {
            question: "Do I need to connect LinkedIn?",
            answer:
                "LinkedIn (via Unipile) unlocks DM outreach. KroniQ works without it — content and research still run — but outreach requires a connected account.",
            meta: "KroniQ",
        },
        {
            question: "How is this different from an AI assistant?",
            answer:
                "An assistant waits for your input. KroniQ runs campaigns autonomously, queues real actions, and builds persistent memory about your company across every run.",
            meta: "KroniQ",
        },
        {
            question: "When do I get access?",
            answer:
                "We're reviewing waitlist signups and inviting in batches. You'll get an email when your seat opens.",
            meta: "KroniQ",
        },
        {
            question: "What's the pricing?",
            answer:
                "Early access is free. Paid plans launch at general availability. Waitlist members get founder pricing.",
            meta: "KroniQ",
        },
    ],
};

/** @deprecated use KRONIQ_FAQ_CATEGORIES */
export const VOYD_FAQ_CATEGORIES = KRONIQ_FAQ_CATEGORIES;
/** @deprecated use KroniQFaqEntry */
export type VoydFaqEntry = KroniQFaqEntry;
/** @deprecated use KroniQFaqCategory */
export type VoydFaqCategory = KroniQFaqCategory;
/** @deprecated use KRONIQ_FAQ_BY_CATEGORY */
export const VOYD_FAQ_BY_CATEGORY = KRONIQ_FAQ_BY_CATEGORY;
