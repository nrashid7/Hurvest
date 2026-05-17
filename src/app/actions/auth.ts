"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { asSignupRole, sanitizeNextPath } from "@/lib/forms";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNextPath(formData.get("next"));
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect(`${next}?demo=1`);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const role = asSignupRole(formData.get("account_type")) ?? "customer";
  const supabase = await createSupabaseServerClient();

  if (!supabase) redirect(role === "farmer" ? "/farmer?demo=1" : "/account?demo=1");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        signup_role: role,
      },
    },
  });

  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
    });
  }

  redirect(role === "farmer" ? "/farmer/onboarding" : "/account");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
