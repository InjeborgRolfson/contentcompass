import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a safe, initialized Supabase client.
 * Throws a descriptive error if environment variables are missing.
 */
export const createSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.');
  }
  return createSupabaseClient(supabaseUrl, supabaseKey);
};

// Default instance for simple use cases
export const supabase = (!supabaseUrl || !supabaseKey) 
  ? null 
  : createSupabaseClient(supabaseUrl, supabaseKey);
