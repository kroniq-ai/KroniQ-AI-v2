import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch related data
  const [jobs, competitors, mvpFeatures, marketingAssets, financials] =
    await Promise.all([
      supabase.from("jobs").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("competitors").select("*").eq("project_id", id),
      supabase.from("mvp_features").select("*").eq("project_id", id).order("priority"),
      supabase.from("marketing_assets").select("*").eq("project_id", id),
      supabase.from("financials").select("*").eq("project_id", id),
    ]);

  return NextResponse.json({
    ...project,
    jobs: jobs.data || [],
    competitors: competitors.data || [],
    mvp_features: mvpFeatures.data || [],
    marketing_assets: marketingAssets.data || [],
    financials: financials.data?.[0] || null,
  });
}
