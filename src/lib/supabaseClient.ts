/**
 * @deprecated Use direct imports from './supabase' instead.
 * This file is maintained for backward compatibility.
 */

// Re-export do cliente Supabase principal
export * from './supabase';

// Export default para compatibilidade
export { default } from './supabase';

// Log a warning in development to encourage migration
try {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'supabaseClient.ts is deprecated. Please update your imports to use "@/lib/supabase" directly.'
    );
  }
} catch (e) {
  // Ignore errors in environments where process is not available
}
