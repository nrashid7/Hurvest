export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  demoMode: process.env.HURVEST_DEMO_MODE,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@hurvest.local",
};

export function hasSupabaseConfig() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasStripeConfig() {
  return Boolean(env.stripeSecretKey);
}

export function isDemoModeAllowed(values: Partial<Pick<NodeJS.ProcessEnv, "NODE_ENV" | "HURVEST_DEMO_MODE">> = process.env) {
  if (values.HURVEST_DEMO_MODE === "true") return true;
  if (values.HURVEST_DEMO_MODE === "false") return false;
  return values.NODE_ENV !== "production";
}
