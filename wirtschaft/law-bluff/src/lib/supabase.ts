import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://xvgbisxwptnfupibcbpg.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_WF742ZbvUE8BzCTT2MZw2w_K2wFvYyt";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);