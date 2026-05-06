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
            question: "What exactly is KroniQ?",
            answer:
                "KroniQ is your autonomous AI Chief Marketing Officer. You brief it once — your company, ICP, goals, voice. Then it runs every growth campaign continuously: outreach, content creation, lead sourcing, and follow-up. No daily prompting. No hand-holding. It just works.",
            meta: "Basics",
        },
        {
            question: "How is KroniQ different from ChatGPT or Jasper?",
            answer:
                "ChatGPT and Jasper are one-shot tools — you prompt, they respond, nothing persists. KroniQ is a multi-agent execution engine with memory. It remembers your company context, tracks campaign outcomes, and improves autonomously. Think CMO, not copywriter.",
            meta: "Basics",
        },
        {
            question: "When does KroniQ launch publicly?",
            answer:
                "We're in private beta with a tight group of founder teams right now. Join the waitlist — the top 3 referrers on the leaderboard unlock free Pro access at launch, plus they skip the queue entirely.",
            meta: "Basics",
        },
        {
            question: "Who is KroniQ built for?",
            answer:
                "Founders, indie hackers, B2B SaaS teams, and growth operators who are tired of stitching together tools. If you're spending more than 2 hours a week on marketing execution, KroniQ gives that time back.",
            meta: "Basics",
        },
    ],
    product: [
        {
            question: "Do I have to approve every action KroniQ takes?",
            answer:
                "You set the rules. Full auto-run within guardrails. Approval-required for every outreach. Or anything in between. The approval queue surfaces pending actions cleanly — you review, click approve, and it's done. Nothing sends without meeting your criteria.",
            meta: "Product",
        },
        {
            question: "What platforms does KroniQ integrate with?",
            answer:
                "LinkedIn, Twitter/X, Gmail, HubSpot, Slack, Notion, OpenAI, and more rolling out each week. We prioritize integrations by waitlist demand — every upvote on the request board moves it up the roadmap.",
            meta: "Product",
        },
        {
            question: "How does the company memory system work?",
            answer:
                "When you brief KroniQ, it stores your ICP, brand voice, tone, past campaign results, and contact history in a persistent memory layer. Every agent — outreach, content, leads — reads from this single source of truth. Campaigns stay consistent and compound over time instead of resetting.",
            meta: "Product",
        },
        {
            question: "Can KroniQ run multiple campaigns at once?",
            answer:
                "Yes. KroniQ runs parallel agent lanes simultaneously: a research agent surfaces leads, an outreach agent sequences messages, a content agent drafts posts — all running concurrently, cross-checking each other before anything goes out.",
            meta: "Product",
        },
    ],
    privacy: [
        {
            question: "Is my company data safe?",
            answer:
                "Your data is encrypted at rest and in transit. It is never used to train shared models and never shared with other customers. You own your data, full stop. We operate with a strict data isolation policy per workspace.",
            meta: "Privacy & Access",
        },
        {
            question: "How do I get access to the private beta?",
            answer:
                "Join the waitlist with your email. Spots are limited and allocated by referral rank + use-case fit. Refer friends to climb the leaderboard — the top 3 get free Pro access and immediate early access when we open the gates.",
            meta: "Privacy & Access",
        },
        {
            question: "Can I delete all my data?",
            answer:
                "Absolutely. Export or permanently delete your entire company context, campaign history, and lead data from Settings at any time. One click, no waiting, no friction. We believe in data portability as a right, not a feature.",
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
                introLabel="KroniQ FAQ"
                kicker="Questions"
                title={
                    <>
                        Everything you need{" "}
                        <span className="gradient-amber">to know.</span>
                    </>
                }
                subtitle="Clear answers on how KroniQ's autonomous AI growth engine works, what it connects to, and how your data is protected."
            />
            <div className="section-divider" />
        </section>
    );
}
