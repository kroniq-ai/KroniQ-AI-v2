import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { runOrchestrator } from "@/lib/orchestrator";

export async function POST(
  _request: Request,
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
    .select("id, idea_text, context_text")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: currentProject } = await supabase
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .single();
  if (currentProject?.status === "running") {
    return NextResponse.json(
      { error: "A run is already in progress. Wait for it to finish." },
      { status: 409 }
    );
  }

  const body = await _request.json().catch(() => ({}));
  const apiKey = body.api_key || process.env.OPENROUTER_KEY;

  if (!apiKey && !process.env.OPENROUTER_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key required. Set OPENROUTER_KEY or pass api_key." },
      { status: 400 }
    );
  }

  try {
    const ORCHESTRATOR_TIMEOUT_MS = 180_000; // 3 min for full pipeline
    const result = await Promise.race([
      runOrchestrator({
        projectId,
        ideaText: project.idea_text ?? "",
        contextText: project.context_text ?? undefined,
        userConstraints: body.user_constraints,
        apiKey: apiKey || undefined,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Run timed out (3 min). Try again or use individual agents.")),
          ORCHESTRATOR_TIMEOUT_MS
        )
      ),
    ]);
    return NextResponse.json({
      job_id: result.jobId,
      status: result.status,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Orchestrator failed";
    console.error("[run] Orchestrator error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
