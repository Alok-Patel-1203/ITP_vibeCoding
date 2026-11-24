import { createClient } from '@supabase/supabase-js';

// Safe environment variable resolution for both Vite and Node/testing
const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = 
  getEnvVar('VITE_SUPABASE_URL') || 
  getEnvVar('SUPABASE_URL');

const supabaseAnonKey = 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  getEnvVar('SUPABASE_PUBLISHABLE_KEY') || 
  getEnvVar('SUPABASE_ANON_KEY') || 
  getEnvVar('VITE_SUPABASE_KEY') || 
  getEnvVar('SUPABASE_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('[Supabase Realtime] Connected successfully:', supabaseUrl);
  } else {
    console.warn('[Supabase Realtime] Environment variables missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }
}

