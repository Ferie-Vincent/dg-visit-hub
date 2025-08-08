// Supabase Edge Function: admin-create-user
// Creates a new Supabase Auth user and corresponding profile (role/display_name)
// Access: only authenticated admins (based on profiles.role === 'admin')

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

    // Client to validate caller and read profiles
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Check admin role from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const body = await req.json().catch(() => ({}));
    const { email, password, display_name, role } = body as { email?: string; password?: string; display_name?: string; role?: 'admin'|'user'|'viewer' };

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const safeRole = role === 'admin' || role === 'user' || role === 'viewer' ? role : 'user';

    // Admin client with service role for privileged actions
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "missing_service_role_key" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const adminClient = createClient(SUPABASE_URL, serviceRoleKey);

    // Create auth user (auto-confirm)
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name },
    });

    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: createErr?.message || 'create_failed' }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const newUserId = created.user.id;

    // Insert profile row
    const { error: profileErr } = await adminClient
      .from("profiles")
      .insert({ user_id: newUserId, display_name: display_name ?? null, role: safeRole });

    if (profileErr) {
      // Best-effort cleanup could be added here if desired
      return new Response(JSON.stringify({ error: profileErr.message, user_id: newUserId }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ success: true, user_id: newUserId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "unexpected", message: String(e) }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
