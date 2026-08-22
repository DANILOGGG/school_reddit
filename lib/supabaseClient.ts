import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // This only throws in the browser/server at runtime if the env vars
  // were never set — it will not break the build itself.
  console.warn(
    "Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Post = {
  id: string;
  created_at: string;
  body: string;
  is_anonymous: boolean;
  author_name: string | null;
  image_url: string | null;
  report_count: number;
};

export type Comment = {
  id: string;
  post_id: string;
  created_at: string;
  body: string;
  is_anonymous: boolean;
  author_name: string | null;
};
