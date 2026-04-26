import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

const KIE_API_URL = "https://api.kie.ai/api/v1/gpt4o-image";

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
    .select("id, title, idea_text, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "KIE_API_KEY not set. Add it to .env.local" },
      { status: 400 }
    );
  }

  const prompt =
    `Modern minimalist logo for "${project.title}". Clean, professional, suitable for a tech startup. Simple geometric shapes, no text.`;

  try {
    const res = await fetch(`${KIE_API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        size: "1:1",
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { code?: number; msg?: string; data?: { taskId?: string } };

    if (data.code !== 200 || !data.data?.taskId) {
      const errMsg = data.msg || (res.status === 401 ? "Invalid KIE_API_KEY" : res.status === 402 ? "Insufficient credits" : "Failed to start logo generation");
      return NextResponse.json(
        { error: errMsg },
        { status: res.ok ? 500 : res.status }
      );
    }

    const taskId = data.data.taskId;

    // Poll for result (max 60s)
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const statusRes = await fetch(
        `${KIE_API_URL}/record-info?taskId=${taskId}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      const statusData = (await statusRes.json().catch(() => ({}))) as { code?: number; msg?: string; data?: { status?: string; response?: { resultUrls?: string[] }; errorMessage?: string } };

      if (statusData.code !== 200) {
        return NextResponse.json(
          { error: statusData.msg || "Failed to get status" },
          { status: 500 }
        );
      }

      const d = statusData.data;
      const status = d?.status;

      if (status === "SUCCESS") {
        const url = d?.response?.resultUrls?.[0];
        if (!url) {
          return NextResponse.json(
            { error: "No image URL in response" },
            { status: 500 }
          );
        }

        const serviceSupabase = await createServiceRoleClient();
        await serviceSupabase.from("marketing_assets").delete().eq("project_id", projectId).eq("type", "logo");
        await serviceSupabase.from("marketing_assets").insert({
          project_id: projectId,
          type: "logo",
          content: url,
          metadata: { prompt, source: "kie" },
        });

        return NextResponse.json({ url });
      }

      if (status === "CREATE_TASK_FAILED" || status === "GENERATE_FAILED") {
        return NextResponse.json(
          { error: d?.errorMessage || status || "Generation failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Logo generation timed out" },
      { status: 504 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Logo generation failed" },
      { status: 500 }
    );
  }
}
