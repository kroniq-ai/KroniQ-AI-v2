import type { Metadata } from "next";
import { LegalDocShell } from "@/components/legal/LegalDocShell";
import { LEGAL_LAST_UPDATED_ISO, formatLegalLastUpdatedDisplay } from "@/lib/legal-last-updated";

const lastDisplay = formatLegalLastUpdatedDisplay(LEGAL_LAST_UPDATED_ISO);

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "How KroniQ collects, uses, and protects information when you use our site, join the waitlist, or contact us.",
    robots: { index: true, follow: true },
    alternates: { canonical: "/privacy" },
    openGraph: {
        title: "Privacy Policy | KroniQ",
        description: "How we handle your data for the waitlist and website.",
        url: "/privacy",
    },
};

export default function PrivacyPage() {
    return (
        <LegalDocShell title="Privacy policy" lastUpdated={lastDisplay}>
            <p>
                KroniQ (“we”, “us”) explains how we handle information when you visit our website, join the waitlist,
                verify your email with a one-time code, email us, or use preview or beta features. This notice is designed
                to align with Canadian privacy expectations, including the principles in the{" "}
                <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) where they apply. It is not
                legal advice. If you do not agree with this policy, please do not submit personal data through our site.
            </p>

            <h2>What we collect</h2>
            <p>We may collect:</p>
            <ul>
                <li>
                    <strong className="text-foreground">Information you provide</strong> — name, email, role, company, or
                    messages you send when you join the waitlist or contact us. To confirm you control the address, we may
                    send a short-lived one-time code by email (OTP); we process the fact of verification and timestamps as
                    needed to run the waitlist and prevent abuse.
                </li>
                <li>
                    <strong className="text-foreground">Technical data</strong> — browser type, device type, approximate
                    region (from IP), and similar signals used for security, abuse prevention, and basic analytics.
                </li>
                <li>
                    <strong className="text-foreground">Referral and campaign data</strong> — if you use a referral link or
                    promotion, we may store identifiers needed to attribute signups fairly.
                </li>
            </ul>

            <h2>How we use information</h2>
            <p>We use information to:</p>
            <ul>
                <li>Run the waitlist and communicate about the product;</li>
                <li>Improve the site, fix errors, and understand aggregate usage;</li>
                <li>Detect abuse, fraud, and protect the service;</li>
                <li>Comply with law and respond to lawful requests.</li>
            </ul>
            <p>
                We do <strong className="text-foreground">not</strong> sell your email address to data brokers. Marketing
                messages, where we send them, will include a way to opt out where required by law.
            </p>

            <h2>Cookies and similar technologies</h2>
            <p>
                We may use cookies or local storage for session state, preferences, and analytics. You can control cookies
                in your browser settings. Blocking cookies may limit some site features.
            </p>

            <h2>Service providers</h2>
            <p>
                We use hosting, analytics, email, and infrastructure providers to operate the product. They process data on
                our instructions and under contractual obligations appropriate to the service.
            </p>

            <h2>Retention</h2>
            <p>
                We keep waitlist and contact data only as long as needed for the purposes above, unless a longer period is
                required for security, legal compliance, or dispute resolution. When data is no longer needed, we delete or
                anonymize it where feasible.
            </p>

            <h2>Security</h2>
            <p>
                We use reasonable technical and organizational measures to protect information, including access controls,
                encryption in transit where supported by our stack, and monitoring for abuse. No method of transmission over
                the internet is 100% secure; we cannot guarantee absolute security. If we become aware of a breach that
                poses a risk of significant harm and we are required to notify you, we will do so in line with applicable
                law and will describe sensible steps you can take.
            </p>

            <h2>International transfers</h2>
            <p>
                If you access the site from outside Canada, your information may be processed in Canada or other
                countries where our providers operate. Where required, we rely on appropriate safeguards or contractual
                clauses.
            </p>

            <h2>Your choices</h2>
            <p>
                Depending on your jurisdiction, you may have rights to access, correct, delete, or export personal data,
                or to object to certain processing. To exercise these rights, contact us at the email below. We may need
                to verify your identity before responding.
            </p>

            <h2>Children</h2>
            <p>
                The site is not directed at children under 16 (or the age required in your region). We do not knowingly
                collect personal data from children.
            </p>

            <h2>Changes to this policy</h2>
            <p>
                We may update this page from time to time. The “Last updated” date at the top will change when we do.
                Continued use of the site after changes means you accept the updated policy.
            </p>

            <h2>Contact</h2>
            <p>
                Questions:{" "}
                <a href="mailto:atirek.sd11@gmail.com" className="text-foreground underline-offset-4 hover:underline">
                    atirek.sd11@gmail.com
                </a>
            </p>
        </LegalDocShell>
    );
}
