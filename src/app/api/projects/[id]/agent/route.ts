import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter";
import { parseJSON } from "@/lib/parse-json";
import {
  RESEARCH_PROMPT,
  PRODUCT_PROMPT,
  CTO_PROMPT,
  CMO_PROMPT,
  CFO_PROMPT,
  isQuestionPrompt,
} from "@/lib/agents/prompts";
import { enhanceUserInput } from "@/lib/agents/input-enhancement";
import { enhanceAgentResponse, beautifyWithLLM } from "@/lib/agents/output-enhancement";

const AGENTS = ["research", "product", "cto", "cmo", "cfo"] as const;

const QUESTION_ONLY_HINT = `
CRITICAL: The user asked a QUESTION (opinion, feedback, advice). You MUST output ONLY:
{"direct_response": "Your direct answer here. 2-4 paragraphs. Be specific."}
Do NOT include personas, mvp_features, roadmap, stack, code_scaffold, campaigns, pricing_options, market_research, or any other plan sections. Just the direct_response.
`;

/** When user asked a question, strip plan sections so UI shows only direct_response */
function stripPlanForQuestion(agent: string, response: string): string {
  try {
    const parsed = parseJSON<Record<string, unknown>>(response);
    if (!parsed?.direct_response || typeof parsed.direct_response !== "string") return response;
    return JSON.stringify({ direct_response: parsed.direct_response });
  } catch {
    return response;
  }
}

/** Puts user request FIRST so the model addresses it — not buried in JSON */
function buildUserMessage(userRequest: string, context: Record<string, unknown>, isQuestion?: boolean): string {
  const hint = isQuestion ? QUESTION_ONLY_HINT : "";
  return `${hint}USER REQUEST (address this first — do not ignore):
${userRequest}

Context:
${JSON.stringify(context, null, 2)}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, idea_text, context_text, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { agent, prompt } = body;

  if (!agent || !AGENTS.includes(agent)) {
    return NextResponse.json(
      { error: "agent required: research|product|cto|cmo|cfo" },
      { status: 400 }
    );
  }

  let rawPrompt = typeof prompt === "string" ? prompt.trim() : "";
  if (!rawPrompt || rawPrompt.length > 4000) {
    return NextResponse.json(
      { error: "prompt required (max 4000 chars)" },
      { status: 400 }
    );
  }

  // Enhance input: interpret intent, expand shorthand, add clarity
  const { enhanced: enhancedPrompt } = enhanceUserInput(rawPrompt, agent);
  rawPrompt = enhancedPrompt || rawPrompt;

  const apiKey = body.api_key || process.env.OPENROUTER_KEY;
  if (!apiKey && !process.env.OPENROUTER_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_KEY required" },
      { status: 400 }
    );
  }

  const serviceSupabase = await createServiceRoleClient();

  const job = await serviceSupabase
    .from("jobs")
    .insert({
      project_id: projectId,
      agent_name: agent,
      prompt: rawPrompt,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (!job.data) {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }

  try {
    let response = "";
    const taskType = agent as "research" | "product" | "marketing" | "code" | "strategy";

    const isQuestion = isQuestionPrompt(rawPrompt);
    if (agent === "research") {
      response = await callOpenRouter({
        task_type: "research",
        systemPrompt: RESEARCH_PROMPT,
        userPrompt: buildUserMessage(rawPrompt, {
          idea: project.idea_text ?? "",
          keywords: [],
        }, isQuestion),
        apiKey: apiKey || undefined,
      });
      if (isQuestion) response = stripPlanForQuestion(agent, response);
      if (!isQuestion) await storeResearch(serviceSupabase, projectId, response);
    } else if (agent === "product") {
      const [{ data: researchJob }, { data: existingFeatures }] = await Promise.all([
        serviceSupabase.from("jobs").select("response_ref").eq("project_id", projectId).eq("agent_name", "research").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        serviceSupabase.from("mvp_features").select("title, description, priority, est_hours").eq("project_id", projectId).order("priority"),
      ]);
      const researchSummary = (researchJob?.response_ref as { raw?: string } | null)?.raw ?? "";
      response = await callOpenRouter({
        task_type: "product",
        systemPrompt: PRODUCT_PROMPT,
        userPrompt: buildUserMessage(rawPrompt, {
          research_summary: researchSummary,
          idea: project.idea_text ?? "",
          current_mvp_features: existingFeatures ?? [],
        }, isQuestion),
        apiKey: apiKey || undefined,
      });
      if (isQuestion) response = stripPlanForQuestion(agent, response);
      if (!isQuestion) await storeProduct(serviceSupabase, projectId, response);
    } else if (agent === "cto") {
      const [mvpFeatures, existingCodeRow] = await Promise.all([
        serviceSupabase.from("mvp_features").select("*").eq("project_id", projectId),
        serviceSupabase.from("marketing_assets").select("content").eq("project_id", projectId).eq("type", "code_scaffold").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      const existingCode = existingCodeRow.data;
      response = await callOpenRouter({
        task_type: "code",
        systemPrompt: CTO_PROMPT,
        userPrompt: buildUserMessage(rawPrompt, {
          mvp_features: mvpFeatures.data ?? [],
          budget_hint: "normal",
          existing_code_scaffold: existingCode?.content ?? null,
        }, isQuestion),
        apiKey: apiKey || undefined,
      });
      if (isQuestion) response = stripPlanForQuestion(agent, response);
      if (!isQuestion) await storeCTO(serviceSupabase, projectId, response);
    } else if (agent === "cmo") {
      response = await callOpenRouter({
        task_type: "marketing",
        systemPrompt: CMO_PROMPT,
        userPrompt: buildUserMessage(rawPrompt, {
          project_summary: project.idea_text ?? "",
          target_audience: "early adopters",
        }, isQuestion),
        apiKey: apiKey || undefined,
      });
      if (isQuestion) response = stripPlanForQuestion(agent, response);
      if (!isQuestion) await storeCMO(serviceSupabase, projectId, response);
    } else if (agent === "cfo") {
      response = await callOpenRouter({
        task_type: "strategy",
        systemPrompt: CFO_PROMPT,
        userPrompt: buildUserMessage(rawPrompt, { pricing_hint: "SaaS" }, isQuestion),
        apiKey: apiKey || undefined,
      });
      if (isQuestion) response = stripPlanForQuestion(agent, response);
      if (!isQuestion) await storeCFO(serviceSupabase, projectId, response);
    }

    // Output enhancement: add emojis, improve spacing, ChatGPT-style polish
    const agentType = agent as "research" | "product" | "cto" | "cmo" | "cfo";
    response = enhanceAgentResponse(response, agentType);

    // Optional LLM beautify pass (set ENABLE_LLM_BEAUTIFY=true)
    if (process.env.ENABLE_LLM_BEAUTIFY === "true") {
      try {
        const parsed = parseJSON<{ direct_response?: string }>(response);
        if (parsed?.direct_response) {
          const beautified = await beautifyWithLLM(parsed.direct_response, apiKey || undefined);
          parsed.direct_response = beautified;
          response = JSON.stringify(parsed);
        }
      } catch {
        // Keep original on failure
      }
    }

    await serviceSupabase
      .from("jobs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        response_ref: { raw: response },
      })
      .eq("id", job.data.id);

    return NextResponse.json({ job_id: job.data.id, status: "completed" });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Agent failed";
    await serviceSupabase
      .from("jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        response_ref: { error: errMsg },
      })
      .eq("id", job.data.id);
    return NextResponse.json(
      { error: errMsg, job_id: job.data.id },
      { status: 500 }
    );
  }
}

async function storeResearch(supabase: Awaited<ReturnType<typeof createServiceRoleClient>>, projectId: string, response: string) {
  try {
    const parsed = parseJSON<{ market_research?: { top_competitors?: Array<{ name: string; url?: string; summary?: string }> }; top_competitors?: Array<{ name: string; url?: string; summary?: string }> }>(response);
    const competitors = parsed.market_research?.top_competitors ?? parsed.top_competitors ?? [];
    for (const c of competitors) {
      await supabase.from("competitors").insert({ project_id: projectId, name: c.name, url: c.url, summary: c.summary });
    }
  } catch {}
}

async function storeProduct(supabase: Awaited<ReturnType<typeof createServiceRoleClient>>, projectId: string, response: string) {
  try {
    const parsed = parseJSON<{ mvp_features?: Array<{ title: string; desc?: string; must_have?: boolean; est_hours?: number }> }>(response);
    if (parsed.mvp_features) {
      await supabase.from("mvp_features").delete().eq("project_id", projectId);
      for (let i = 0; i < parsed.mvp_features.length; i++) {
        const f = parsed.mvp_features[i];
        await supabase.from("mvp_features").insert({
          project_id: projectId,
          title: f.title,
          description: f.desc,
          must_have: f.must_have ?? true,
          est_hours: f.est_hours,
          priority: i + 1,
        });
      }
    }
  } catch {}
}

async function storeCTO(supabase: Awaited<ReturnType<typeof createServiceRoleClient>>, projectId: string, response: string) {
  try {
    const parsed = parseJSON<{ code_scaffold?: string }>(response);
    if (parsed.code_scaffold) {
      await supabase.from("marketing_assets").delete().eq("project_id", projectId).eq("type", "code_scaffold");
      await supabase.from("marketing_assets").insert({
        project_id: projectId,
        type: "code_scaffold",
        content: parsed.code_scaffold,
        metadata: { source: "cto" },
      });
    }
  } catch {}
}

async function storeCMO(supabase: Awaited<ReturnType<typeof createServiceRoleClient>>, projectId: string, response: string) {
  try {
    const parsed = parseJSON<{ social_posts?: Array<{ platform: string; post: string; hashtag_suggestions?: string[] }>; email_templates?: Array<{ subject: string; body: string }> }>(response);
    if (parsed.social_posts) {
      for (const p of parsed.social_posts) {
        await supabase.from("marketing_assets").insert({
          project_id: projectId,
          type: "social_post",
          content: p.post,
          metadata: { platform: p.platform, hashtag_suggestions: p.hashtag_suggestions ?? [] },
        });
      }
    }
    if (parsed.email_templates) {
      for (const e of parsed.email_templates) {
        await supabase.from("marketing_assets").insert({ project_id: projectId, type: "email_template", content: e.body, metadata: { subject: e.subject } });
      }
    }
  } catch {}
}

async function storeCFO(supabase: Awaited<ReturnType<typeof createServiceRoleClient>>, projectId: string, response: string) {
  try {
    const parsed = parseJSON<{ pricing_options?: unknown[]; unit_economics?: unknown; initial_costs?: unknown[] }>(response);
    await supabase.from("financials").insert({
      project_id: projectId,
      pricing_options: parsed.pricing_options,
      unit_economics: parsed.unit_economics,
      initial_costs: parsed.initial_costs,
    });
  } catch {}
}
