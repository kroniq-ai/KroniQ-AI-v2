import type { Metadata } from "next";
import { LegalDocShell } from "@/components/legal/LegalDocShell";
import { LEGAL_LAST_UPDATED_ISO, formatLegalLastUpdatedDisplay } from "@/lib/legal-last-updated";
import { openGraphImage, siteName } from "@/lib/seo/site";

const lastDisplay = formatLegalLastUpdatedDisplay(LEGAL_LAST_UPDATED_ISO);

const title = "Terms of service";
const description = "Terms for using the KroniQ website, waitlist, and preview or beta features.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `${title} | ${siteName}`,
    description: "Rules for using the KroniQ site, waitlist, and previews.",
    url: "/terms",
    type: "website",
    siteName,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${siteName}`,
    description: "Rules for the KroniQ site, waitlist, and beta access.",
    images: [openGraphImage.url],
  },
};

export default function TermsPage() {
    return (
        <LegalDocShell title="Terms of service" lastUpdated={lastDisplay}>
            <p>
                These terms govern your use of the KroniQ website, waitlist, and any preview or beta features we make
                available. By accessing or using the site, you agree to these terms. If you do not agree, do not use the
                site.
            </p>

            <h2>Eligibility</h2>
            <p>
                You must be old enough to enter a binding contract in your jurisdiction and have authority to agree on
                behalf of yourself or the organization you represent.
            </p>

            <h2>Waitlist, email verification, and communications</h2>
            <p>
                Joining the waitlist does not guarantee access, timing, or pricing. We may require you to verify control of
                your email address using a one-time code before we treat the signup as valid. We may email you about the
                product, security, or legal notices. You can unsubscribe from marketing emails using the link in those
                messages where applicable; transactional or legally required messages may still be sent.
            </p>

            <h2>Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
                <li>Probe, scan, or test the vulnerability of our systems without authorization;</li>
                <li>Overload, disrupt, or attempt to gain unauthorized access to the service or other users’ data;</li>
                <li>Submit unlawful, infringing, or harmful content, or use the site to violate applicable law;</li>
                <li>Misuse referral or leaderboard features, including fake signups or coordinated abuse.</li>
            </ul>
            <p>We may suspend or terminate access for violations or security reasons.</p>

            <h2>Your content</h2>
            <p>
                You retain rights to content you submit. You grant us a limited license to host, process, and display that
                content only as needed to operate the site and communicate with you. Do not submit secrets, credentials,
                or regulated data you are not allowed to share.
            </p>

            <h2>Intellectual property</h2>
            <p>
                The site, branding, and materials we provide are owned by KroniQ or its licensors. Except as expressly
                allowed, you may not copy, modify, or distribute them without permission.
            </p>

            <h2>Third-party services</h2>
            <p>
                The site may link to or integrate third-party services (for example hosting, analytics, authentication, and
                databases). Their terms and privacy practices apply to those services. You are responsible for keeping your
                email inbox and devices secure when you receive sign-in or verification codes.
            </p>

            <h2>Disclaimer</h2>
            <p>
                The site and any preview are provided <strong className="text-foreground">“as is”</strong> and{" "}
                <strong className="text-foreground">“as available”</strong>. We disclaim warranties of any kind, whether
                express or implied, including merchantability, fitness for a particular purpose, and non-infringement, to
                the fullest extent permitted by law.
            </p>

            <h2>Limitation of liability</h2>
            <p>
                To the fullest extent permitted by law, KroniQ and its affiliates will not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill,
                arising from your use of the site. Our total liability for any claim relating to the site is limited to
                the greater of (a) one hundred Canadian dollars (CAD $100) or (b) the amount you paid us in the twelve
                months before the claim (if any).
            </p>

            <h2>Indemnity</h2>
            <p>
                You will defend and indemnify us against claims arising from your misuse of the site, your content, or
                your violation of these terms or applicable law, to the extent permitted by law.
            </p>

            <h2>Governing law</h2>
            <p>
                These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable
                there, excluding conflict-of-law rules. Courts in Ontario, Canada have exclusive jurisdiction, subject to
                mandatory consumer protections in your jurisdiction where they cannot be waived.
            </p>

            <h2>Changes</h2>
            <p>
                We may update these terms. We will post the revised “Last updated” date at the top of this page.
                Continued use after changes means you accept the updated terms. If you do not agree, stop using the site.
            </p>

            <h2>Contact</h2>
            <p>
                <a href="mailto:support@kroniqai.com" className="text-foreground underline-offset-4 hover:underline">
                    support@kroniqai.com
                </a>
            </p>
        </LegalDocShell>
    );
}
