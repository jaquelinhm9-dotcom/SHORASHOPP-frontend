import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.error("Faltan las variables de Supabase.");
}

export const supabase = createClient(
  supabaseUrl || "https://oycwqpqoxgohzqivclzd.supabase.co",
  supabasePublishableKey || ""
);
