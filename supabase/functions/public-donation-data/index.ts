import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [stats, children, sponsors] = await Promise.all([
      supabase.from("pix_stats").select("month_goal,current_amount,donor_count,month_label").limit(1).maybeSingle(),
      supabase.from("sponsorship_children").select("id,name,cause,description,amount,payment_link").order("created_at", { ascending: true }),
      supabase.from("sponsorship_sponsors").select("child_id"),
    ]);

    const counts: Record<string, number> = {};
    (sponsors.data || []).forEach((s: any) => {
      counts[s.child_id] = (counts[s.child_id] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        pix_stats: stats.data ?? null,
        children: children.data ?? [],
        sponsor_counts: counts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
