import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export const supabaseUrl = "https://ffzgyauorgklffmfhzjg.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseKey)
	throw new Error(
		"Missing VITE_SUPABASE_KEY environment variable. Add it to your .env file."
	);

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
