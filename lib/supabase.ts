import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire server-side application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (limited permissions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with admin privileges (for server components and API routes)
export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey
);
