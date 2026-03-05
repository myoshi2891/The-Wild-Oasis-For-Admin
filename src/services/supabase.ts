import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

if (!supabaseUrl)
	throw new Error(
		"Missing VITE_SUPABASE_URL environment variable. Add it to your .env file."
	);

if (!supabaseKey)
	throw new Error(
		"Missing VITE_SUPABASE_KEY environment variable. Add it to your .env file."
	);

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
