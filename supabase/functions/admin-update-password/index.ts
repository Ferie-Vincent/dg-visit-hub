// Supabase Edge Function: admin-update-password
// Updates a user's password via Admin API. Only authenticated admins can call it.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jghcvawrtmrymmulknau.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGN2YXdydG1yeW1tdWxrbmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTI0NTQsImV4cCI6MjA2OTU2ODQ1NH0.zmzQNC4cT78EQhS4LH981J4AfXjSNvDp6u58sIYAR7k";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing_auth" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const body = await req.json().catch(() => ({}));
    const { user_id, new_password } = body as { user_id?: string; new_password?: string };

    if (!user_id || !new_password) {
      return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "missing_service_role_key" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const adminClient = createClient(SUPABASE_URL, serviceRoleKey);

    const { data, error } = await adminClient.auth.admin.updateUserById(user_id, {
      password: new_password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ success: true, user: data?.user?.id }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "unexpected", message: String(e) }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
