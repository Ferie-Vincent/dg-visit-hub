// Supabase Edge Function: bootstrap-admin
// Purpose: One-time bootstrap to create the first admin account securely using a setup token
// Auth: verify_jwt = false (protected by SETUP_BOOTSTRAP_TOKEN secret)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jghcvawrtmrymmulknau.supabase.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-setup-token",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const setupTokenHeader = req.headers.get("x-setup-token") || "";
    const setupTokenSecret = Deno.env.get("SETUP_BOOTSTRAP_TOKEN") || "";
    if (!setupTokenSecret) {
      console.error("Missing SETUP_BOOTSTRAP_TOKEN secret");
      return new Response(JSON.stringify({ error: "missing_setup_secret" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (setupTokenHeader !== setupTokenSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { email, password, display_name } = body as { email?: string; password?: string; display_name?: string };

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "missing_fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY secret");
      return new Response(JSON.stringify({ error: "missing_service_role_key" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const admin = createClient(SUPABASE_URL, serviceRoleKey);

    // Check if an admin already exists in profiles
    const { data: existingAdmin, error: existErr } = await admin
      .from("profiles")
      .select("user_id, role")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (existErr) {
      console.error("Error checking existing admin:", existErr);
    }

    // Create auth user (email confirmed)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name ?? "Administrateur" },
    });

    if (createErr || !created?.user) {
      console.error("Create user error:", createErr);
      return new Response(JSON.stringify({ error: createErr?.message || "create_failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = created.user.id;

    // Insert or upsert profile as admin
    const { error: profileErr } = await admin
      .from("profiles")
      .upsert({ user_id: userId, display_name: display_name ?? "Administrateur", role: "admin" }, {
        onConflict: "user_id",
      });

    if (profileErr) {
      console.error("Profile insert error:", profileErr);
      return new Response(JSON.stringify({ error: profileErr.message, user_id: userId }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(JSON.stringify({ error: "unexpected", message: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
