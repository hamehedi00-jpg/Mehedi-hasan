import { createClient } from '@supabase/supabase-js';

// Both values are public by design: the publishable key only grants what the
// row level security policies allow (reading published posts).
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnszbaryqnpdzcaujebj.supabase.co';
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhuc3piYXJ5cW5wZHpjYXVqZWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4ODc1MDMsImV4cCI6MjEwNDQ2MzUwM30.kEy1OXYfjwuhP3XmNa7_lsALyKNhGHheFTEPazz4kE0';

let browserClient;

export function serverClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function browserSupabase() {
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, storageKey: 'wsr-studio' },
    });
  }
  return browserClient;
}
