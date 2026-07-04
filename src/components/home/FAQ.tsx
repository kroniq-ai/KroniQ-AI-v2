"use client";

import { FaqMonochromeSection } from "@/components/ui/faq-monocrhome";

const CATEGORIES = {
    basics: "Basics",
    product: "Product",
    privacy: "Privacy & Access",
} as const;

const FAQ_DATA = {
    basics: [
        {
            question: "What does KroniQ actually do?",
            answer:
                "You brief it once on your company, who you sell to, and what growth looks like for you. After that it runs outreach, content drafts, lead research, and daily check ins in the background. You jump in through an action queue when something needs a human yes or no.",
            meta: "Basics",
        },
        {
            question: "Is this just ChatGPT with a dashboard?",
            answer:
                "Not really. ChatGPT resets every conversation. KroniQ keeps one workspace memory that every agent reads, and it can queue real work like sequences and follow ups instead of giving you one email and calling it a day.",
            meta: "Basics",
        },
        {
            question: "Who is this built for?",
            answer:
                "Solo founders and small B2B teams who still own growth themselves. If your week is Notion docs, Gmail threads, LinkedIn tabs, and manual follow up, you're probably the fit we're optimizing for.",
            meta: "Basics",
        },
        {
            question: "Can anyone sign up and use it today?",
            answer:
                "No. We're in a private pilot with a limited number of teams. Join the waitlist and we onboard in batches when we have room. Invited teams get app access by email.",
            meta: "Basics",
        },
    ],
    product: [
        {
            question: "Will it message people without me knowing?",
            answer:
                "Only if you set it that way. You can require approval on every outbound touch, run fully auto inside rules you define, or mix the two. The action queue shows what's waiting, what already ran, and why.",
            meta: "Product",
        },
        {
            question: "What do you mean by company memory?",
            answer:
                "Your ICP, positioning, tone, past campaign results, and contact history sit in one layer. Every agent reads it. You don't re paste your pitch deck into a fresh chat every Monday.",
            meta: "Product",
        },
        {
            question: "What tools does it plug into?",
            answer:
                "Gmail, LinkedIn, HubSpot, Slack, Notion, and more are rolling out during pilot. The integrations block on this page is the source of truth for what's live for new teams. We prioritize what waitlist teams keep asking for.",
            meta: "Product",
        },
        {
            question: "Can outreach and content run at the same time?",
            answer:
                "Yes. Research, sequences, content drafts, and overnight lead lists can run in parallel lanes. Agents sanity check each other before anything goes out so you're not sending from stale context.",
            meta: "Product",
        },
    ],
    privacy: [
        {
            question: "How is our company data stored?",
            answer:
                "Encrypted in transit and at rest, isolated per workspace. We don't train shared models on your brief or contact data. You can export or delete your workspace from settings.",
            meta: "Privacy & Access",
        },
        {
            question: "How do I get into the pilot?",
            answer:
                "Join the waitlist with a work email. If you're a fit and we have capacity, you'll get credentials for the app. Already invited? Use Sign in in the nav.",
            meta: "Privacy & Access",
        },
        {
            question: "Can we wipe everything if we leave?",
            answer:
                "Yes. Export or permanently delete company context, campaign history, and lead data from settings. No ticket to support required.",
            meta: "Privacy & Access",
        },
    ],
};

export function FAQSection() {
    return (
        <section id="faq" className="relative scroll-mt-16" style={{ background: "#000000" }}>
            <div className="section-divider" />
            <FaqMonochromeSection
                categories={CATEGORIES}
                faqData={FAQ_DATA}
                introLabel="FAQs"
                kicker=""
                title={<>Frequently asked questions</>}
                subtitle="What teams in the pilot usually ask before they turn anything on."
            />
            <div className="section-divider" />
        </section>
    );
}
