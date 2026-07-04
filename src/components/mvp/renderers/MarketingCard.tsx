"use client";

import { useState } from "react";
import { Megaphone, Share2, Mail, Copy } from "lucide-react";
import FormattedResponse from "@/components/mvp/FormattedResponse";

interface MarketingData {
  direct_response?: string;
  campaigns?: Array<{ name: string; goal?: string; ktis?: string[] }>;
  social_posts?: Array<{
    platform: string;
    post: string;
    hashtag_suggestions?: string[];
  }>;
  email_templates?: Array<{ subject: string; body: string }>;
  launch_timing?: string;
}

interface Props {
  data: MarketingData | null;
  assets?: Array<{
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>;
}

function EmailTemplateCard({ subject, body }: { subject: string; body: string }) {
  const [copied, setCopied] = useState(false);
  const textToCopy = `Subject: ${subject}\n\n${body}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
        title="Copy to clipboard"
      >
        {copied ? (
          <span className="text-[10px] text-neutral-300">Copied</span>
        ) : (
          <Copy size={14} />
        )}
      </button>
      <p className="font-medium text-white/95 pr-10">{subject}</p>
      <p className="text-white/70 text-sm mt-2 whitespace-pre-wrap">{body}</p>
    </div>
  );
}

function SocialPostCard({
  post,
}: {
  post: { platform: string; post: string; hashtag_suggestions?: string[] };
}) {
  const [copied, setCopied] = useState(false);
  const textToCopy = post.hashtag_suggestions?.length
    ? `${post.post}\n\n${post.hashtag_suggestions.map((h) => `#${h}`).join(" ")}`
    : post.post;
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
        title="Copy to clipboard"
      >
        {copied ? (
          <span className="text-[10px] text-neutral-300">Copied</span>
        ) : (
          <Copy size={14} />
        )}
      </button>
      <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-white/60 bg-white/[0.06]">
        {post.platform}
      </span>
      <p className="text-white/90 text-sm mt-2 whitespace-pre-wrap pr-10">
        {post.post}
      </p>
      {post.hashtag_suggestions && post.hashtag_suggestions.length > 0 && (
        <p className="text-white/50 text-xs mt-2">
          {post.hashtag_suggestions.map((h) => `#${h}`).join(" ")}
        </p>
      )}
    </div>
  );
}

export default function MarketingCard({ data, assets }: Props) {
  const hasPlanInResponse = !!(data?.campaigns?.length || data?.social_posts?.length || data?.email_templates?.length || data?.launch_timing);
  const isQuestionOnly = data?.direct_response && !hasPlanInResponse;
  const socialFromAssets = isQuestionOnly ? [] : (assets?.filter((a) => a.type === "social_post") ?? []);
  const emailsFromAssets = isQuestionOnly ? [] : (assets?.filter((a) => a.type === "email_template") ?? []);
  const socialPosts = data?.social_posts?.length
    ? data.social_posts
    : socialFromAssets.map((a) => ({
        platform: String(a.metadata?.platform ?? "social"),
        post: a.content,
        hashtag_suggestions: (a.metadata?.hashtag_suggestions as string[]) ?? [],
      }));
  const emailTemplates = data?.email_templates?.length
    ? data.email_templates
    : emailsFromAssets.map((a) => ({
        subject: String(a.metadata?.subject ?? "Email"),
        body: a.content,
      }));

  if (!data && socialPosts.length === 0 && emailTemplates.length === 0) {
    return (
      <p className="text-white/50 text-sm">Run KroniQ to generate marketing assets.</p>
    );
  }

  return (
    <div className="space-y-8">
      {data?.direct_response && (
        <section>
          <FormattedResponse content={data.direct_response} />
        </section>
      )}
      {!isQuestionOnly && (
      <>
      {/* Campaigns */}
      {data?.campaigns && data.campaigns.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <Megaphone size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Launch Campaigns
            </h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {data.campaigns.map((c, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white/[0.04]"
              >
                <p className="font-medium text-white/95">{c.name}</p>
                {c.goal && (
                  <p className="text-white/60 text-sm mt-1">{c.goal}</p>
                )}
                {c.ktis && c.ktis.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {c.ktis.map((k, j) => (
                      <li key={j} className="text-xs text-white/50">
                        • {k}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Social Posts */}
      {socialPosts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <Share2 size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Social Posts
            </h4>
          </div>
          <div className="space-y-4">
            {socialPosts.map((p, i) => (
              <SocialPostCard key={i} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* Email Templates */}
      {emailTemplates.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <Mail size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Email Templates
            </h4>
          </div>
          <div className="space-y-4">
            {emailTemplates.map((e, i) => (
              <EmailTemplateCard key={i} subject={e.subject} body={e.body} />
            ))}
          </div>
        </section>
      )}

      {data?.launch_timing && (
        <section>
          <p className="text-sm text-white/70 italic">{data.launch_timing}</p>
        </section>
      )}
      </>
      )}
    </div>
  );
}
