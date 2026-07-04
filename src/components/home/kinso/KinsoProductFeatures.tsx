"use client";

import type { ReactNode } from "react";
import { KinsoFeatureSection } from "./KinsoFeatureSection";
import { ShowcaseVideo } from "./ShowcaseVideo";
import { MockOutreachDraft } from "./mocks/MockOutreachDraft";
import { MockLeadResearch } from "./mocks/MockLeadResearch";
import { MockCmoAudit } from "./mocks/MockCmoAudit";

const GRADIENT = {
  outreach: "linear-gradient(90deg, #ea580c 0%, #f472b6 55%, #22d3ee 100%)",
  research: "linear-gradient(90deg, #ea580c 0%, #eab308 100%)",
  brain: "linear-gradient(90deg, #f472b6 0%, #a78bfa 50%, #22d3ee 100%)",
} as const;

function Accent({ children, gradient }: { children: ReactNode; gradient: string }) {
  return (
    <span
      style={{
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

export function KinsoProductFeatures() {
  return (
    <div id="product" data-nav-theme="light" className="light-zone relative bg-[#fafafa]">
      <KinsoFeatureSection
        id="feature-outreach"
        label="Autonomous outreach"
        title={
          <>
            Respond faster with <Accent gradient={GRADIENT.outreach}>personalized sequences.</Accent>
          </>
        }
        description="KroniQ researches each lead, picks a strategy, and drafts outreach in your voice. You approve — or let it run within your guardrails."
        visual={
          <ShowcaseVideo
            src="/images/showcase/outreach-sequences.mp4"
            poster="/images/showcase/outreach-sequences-poster.png"
            bleed="right"
            fallback={<MockOutreachDraft />}
          />
        }
      />

      <KinsoFeatureSection
        id="feature-research"
        reversed
        label="Lead intelligence"
        title={
          <>
            Research every lead <Accent gradient={GRADIENT.research}>before you reach out.</Accent>
          </>
        }
        description="Signals from LinkedIn, the web, and your CRM surface fit scores, angles, and timing — so the first touch is specific, not spray-and-pray."
        visual={
          <ShowcaseVideo
            src="/images/showcase/lead-research.mp4"
            poster="/images/showcase/lead-research-poster.png"
            bleed="left"
            fallback={<MockLeadResearch />}
          />
        }
      />

      <KinsoFeatureSection
        id="feature-brain"
        divider={false}
        label="Daily CMO audit"
        title={
          <>
            See your growth stack <Accent gradient={GRADIENT.brain}>connect itself.</Accent>
          </>
        }
        description="Every morning KroniQ audits outreach, content, and analytics — surfaces gaps, critiques its own work, and queues what to do next."
        visual={
          <ShowcaseVideo
            src="/images/showcase/cmo-audit.mp4"
            poster="/images/showcase/cmo-audit-poster.png"
            bleed="right"
            fallback={<MockCmoAudit />}
          />
        }
      />
    </div>
  );
}
