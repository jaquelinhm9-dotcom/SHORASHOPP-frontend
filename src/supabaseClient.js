import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey);

const unavailableError = new Error(
  "Supabase no está configurado correctamente. Verifica las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY."
);

const fallbackSupabase = {
  auth: {
    getSession: async () => ({
      data: {
        session: null,
      },
      error: null,
    }),

    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),

    signInWithPassword: async () => ({
      data: null,
      error: unavailableError,
    }),

    signUp: async () => ({
      data: null,
      error: unavailableError,
    }),

    verifyOtp: async () => ({
      data: null,
      error: unavailableError,
    }),

    resend: async () => ({
      data: null,
      error: unavailableError,
    }),

    signOut: async () => ({
      error: null,
    }),
  },
};

export const supabase =
  isSupabaseConfigured
    ? createClient(
        supabaseUrl,
        supabaseAnonKey
      )
    : fallbackSupabase;
