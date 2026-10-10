/**
 * Translates Supabase/PostgREST error codes into human-readable, actionable messages.
 *
 * PostgREST error codes:
 *   PGRST116 - 0 rows returned when exactly 1 expected
 *   PGRST200 - Ambiguous foreign key
 *   PGRST204 - No Content
 *   PGRST301 - JWT Expired
 *   PGRST302 - JWT Invalid
 *   42501    - Postgres: insufficient privilege (RLS)
 *   42703    - Postgres: column does not exist
 *   42P01    - Postgres: table/relation does not exist
 *
 * Supabase uses "PGRST" codes which are distinct from raw Postgres codes.
 * When a table does not exist, Supabase returns code "42P01" (not PGRST205).
 * PGRST205 is "no schema cache entry" — an older code that also indicates
 * the table is not found in Supabase's schema cache.
 */
export function classifyDbError(e: any): {
  type: 'table_missing' | 'column_missing' | 'permission_denied' | 'auth_required' | 'network' | 'unknown';
  message: string;
} {
  const code = e?.code as string | undefined;
  const msg = (e?.message as string | undefined) ?? '';

  // Table/relation does not exist
  if (code === '42P01' || code === 'PGRST205') {
    return { type: 'table_missing', message: 'Required database tables are missing. Please run supabase/migrations/012_control_center_schema_repair.sql in your Supabase SQL Editor.' };
  }

  // Column does not exist
  if (code === '42703' || msg.toLowerCase().includes('column') && msg.toLowerCase().includes('does not exist')) {
    return { type: 'column_missing', message: 'Database schema mismatch (missing column). Please run supabase/migrations/012_control_center_schema_repair.sql.' };
  }

  // Permission denied (RLS)
  if (code === '42501' || msg.toLowerCase().includes('permission denied') || msg.toLowerCase().includes('rls')) {
    return { type: 'permission_denied', message: 'Access denied. Your account does not have permission to view this data.' };
  }

  // Auth required
  if (code === 'PGRST301' || code === 'PGRST302' || msg.toLowerCase().includes('jwt')) {
    return { type: 'auth_required', message: 'Your session has expired. Please sign in again.' };
  }

  // Network or fetch error
  if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
    return { type: 'network', message: 'Could not connect to the database. Check your internet connection.' };
  }

  return { type: 'unknown', message: msg || 'An unexpected database error occurred.' };
}
