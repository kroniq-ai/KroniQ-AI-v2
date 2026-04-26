/**
 * KroniQ Orchestrator - CEO agent + subagent coordination
 * Sequential flow: CEO → Research → Product → CTO → CMO → CFO
 */

import { createServiceRoleClient } from "./supabase/server";
import { callOpenRouter } from "./openrouter";
import {
  CEO_PROMPT,
  RESEARCH_PROMPT,
  PRODUCT_PROMPT,
  CTO_PROMPT,
  CMO_PROMPT,
  CFO_PROMPT,
} from "./agents/prompts";

export interface OrchestratorInput {
  projectId: string;
  ideaText: string;
  contextText?: string;
  userConstraints?: string;
  apiKey?: string;
}

export interface CEOPlan {
  project_summary: string;
  tasks: Array<{
    task_id: string;
    agent: string;
    description: string;
    priority: number;
  }>;
  notes_for_user: string;
}

import { parseJSON as parseJsonUtil } from "./parse-json";

function parseJSON<T>(text: string): T {
  return parseJsonUtil<T>(text);
}

export async function runOrchestrator(input: OrchestratorInput): Promise<{
  jobId: string;
  status: string;
}> {
  const supabase = await createServiceRoleClient();

  // Create a parent "run" job to track overall progress
  const { data: runJob } = await supabase
    .from("jobs")
    .insert({
      project_id: input.projectId,
      agent_name: "orchestrator",
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (!runJob) throw new Error("Failed to create run job");
  const runJobId = runJob.id;

  // Update project status
  await supabase
    .from("projects")
    .update({ status: "running", updated_at: new Date().toISOString() })
    .eq("id", input.projectId);

  try {
    // 1. CEO agent - produce task plan
    const ceoUserPrompt = JSON.stringify({
      project_id: input.projectId,
      idea: input.ideaText,
      user_context: input.contextText || input.userConstraints || "",
    });

    const ceoResponse = await callOpenRouter({
      task_type: "strategy",
      systemPrompt: CEO_PROMPT,
      userPrompt: ceoUserPrompt,
      apiKey: input.apiKey,
    });

    const plan = parseJSON<CEOPlan>(ceoResponse);

    // Store CEO output in memory
    await supabase.from("memories").insert({
      project_id: input.projectId,
      key: "ceo_plan",
      value: JSON.stringify(plan),
    });

    // 2. Run subagents sequentially (simplified: Research → Product first for MVP)
    const agentOrder = ["research", "product", "cto", "cmo", "cfo"];
    let researchSummary = "";
    let mvpFeatures: unknown[] = [];

    for (const agentName of agentOrder) {
      const task = plan.tasks.find((t) => t.agent === agentName);
      if (!task) continue;

      const job = await supabase
        .from("jobs")
        .insert({
          project_id: input.projectId,
          agent_name: agentName,
          prompt: task.description,
          status: "running",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!job.data) continue;
      const jobId = job.data.id;

      try {
        let response = "";

        if (agentName === "research") {
          const userPrompt = JSON.stringify({
            idea: input.ideaText,
            keywords: extractKeywords(input.ideaText),
          });
          response = await callOpenRouter({
            task_type: "research",
            systemPrompt: RESEARCH_PROMPT,
            userPrompt,
            apiKey: input.apiKey,
          });
          researchSummary = response;
          await storeResearchOutput(supabase, input.projectId, response);
        } else if (agentName === "product") {
          const userPrompt = JSON.stringify({
            research_summary: researchSummary,
            idea: input.ideaText,
          });
          response = await callOpenRouter({
            task_type: "product",
            systemPrompt: PRODUCT_PROMPT,
            userPrompt,
            apiKey: input.apiKey,
          });
          const parsed = parseJSON<{ mvp_features?: unknown[] }>(response);
          mvpFeatures = parsed.mvp_features || [];
          await storeProductOutput(supabase, input.projectId, response);
        } else if (agentName === "cto") {
          const userPrompt = JSON.stringify({
            mvp_features: mvpFeatures,
            budget_hint: "normal",
          });
          response = await callOpenRouter({
            task_type: "code",
            systemPrompt: CTO_PROMPT,
            userPrompt,
            apiKey: input.apiKey,
          });
          await storeCTOOutput(supabase, input.projectId, response);
        } else if (agentName === "cmo") {
          const userPrompt = JSON.stringify({
            project_summary: plan.project_summary,
            target_audience: "early adopters",
          });
          response = await callOpenRouter({
            task_type: "marketing",
            systemPrompt: CMO_PROMPT,
            userPrompt,
            apiKey: input.apiKey,
          });
          await storeCMOOutput(supabase, input.projectId, response);
        } else if (agentName === "cfo") {
          const userPrompt = JSON.stringify({
            pricing_hint: "SaaS, B2B",
          });
          response = await callOpenRouter({
            task_type: "strategy",
            systemPrompt: CFO_PROMPT,
            userPrompt,
            apiKey: input.apiKey,
          });
          await storeCFOOutput(supabase, input.projectId, response);
        }

        await supabase
          .from("jobs")
          .update({
            status: "completed",
            finished_at: new Date().toISOString(),
            response_ref: { raw: response },
          })
          .eq("id", jobId);
      } catch (err) {
        await supabase
          .from("jobs")
          .update({
            status: "failed",
            finished_at: new Date().toISOString(),
            response_ref: { error: String(err) },
          })
          .eq("id", jobId);
      }
    }

    // Mark run complete
    await supabase
      .from("jobs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        response_ref: { plan },
      })
      .eq("id", runJobId);

    await supabase
      .from("projects")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", input.projectId);

    return { jobId: runJobId, status: "completed" };
  } catch (err) {
    await supabase
      .from("jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        response_ref: { error: String(err) },
      })
      .eq("id", runJobId);

    await supabase
      .from("projects")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", input.projectId);

    throw err;
  }
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  return [...new Set(words)].slice(0, 5);
}

async function storeResearchOutput(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>,
  projectId: string,
  response: string
) {
  try {
    const parsed = parseJSON<{
      market_research?: { top_competitors?: Array<{ name: string; url?: string; summary?: string }> };
      top_competitors?: Array<{ name: string; url?: string; summary?: string }>;
    }>(response);
    const competitors = parsed.market_research?.top_competitors ?? parsed.top_competitors ?? [];
    for (const c of competitors) {
      await supabase.from("competitors").insert({
        project_id: projectId,
        name: c.name,
        url: c.url,
        summary: c.summary,
      });
    }
  } catch {
    // Ignore parse errors
  }
}

async function storeProductOutput(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>,
  projectId: string,
  response: string
) {
  try {
    const parsed = parseJSON<{
      mvp_features?: Array<{
        title: string;
        desc?: string;
        must_have?: boolean;
        est_hours?: number;
      }>;
    }>(response);
    if (parsed.mvp_features) {
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
  } catch {
    // Ignore
  }
}

async function storeCTOOutput(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>,
  projectId: string,
  response: string
) {
  try {
    const parsed = parseJSON<{ code_scaffold?: string }>(response);
    if (parsed.code_scaffold) {
      await supabase.from("marketing_assets").insert({
        project_id: projectId,
        type: "code_scaffold",
        content: parsed.code_scaffold,
        metadata: { source: "cto" },
      });
    }
  } catch {
    // Ignore
  }
}

async function storeCMOOutput(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>,
  projectId: string,
  response: string
) {
  try {
    const parsed = parseJSON<{
      social_posts?: Array<{ platform: string; post: string }>;
      email_templates?: Array<{ subject: string; body: string }>;
    }>(response);
    if (parsed.social_posts) {
      for (const p of parsed.social_posts) {
        await supabase.from("marketing_assets").insert({
          project_id: projectId,
          type: "social_post",
          content: p.post,
          metadata: { platform: p.platform },
        });
      }
    }
    if (parsed.email_templates) {
      for (const e of parsed.email_templates) {
        await supabase.from("marketing_assets").insert({
          project_id: projectId,
          type: "email_template",
          content: e.body,
          metadata: { subject: e.subject },
        });
      }
    }
  } catch {
    // Ignore
  }
}

async function storeCFOOutput(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>,
  projectId: string,
  response: string
) {
  try {
    const parsed = parseJSON<{
      pricing_options?: unknown[];
      unit_economics?: unknown;
      initial_costs?: unknown[];
    }>(response);
    await supabase.from("financials").insert({
      project_id: projectId,
      pricing_options: parsed.pricing_options,
      unit_economics: parsed.unit_economics,
      initial_costs: parsed.initial_costs,
    });
  } catch {
    // Ignore
  }
}
