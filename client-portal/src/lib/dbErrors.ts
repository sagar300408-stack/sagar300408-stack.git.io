/**
 * Translates Supabase/PostgREST error codes into human-readable, actionable messages.
 */
export function classifyDbError(e: any): {
  type: 'table_missing' | 'column_missing' | 'permission_denied' | 'auth_required' | 'network' | 'unknown';
  message: string;
} {
  const code = e?.code as string | undefined;
  const msg = (e?.message as string | undefined) ?? '';

  // Table/relation does not exist
  if (code === '42P01' || code === 'PGRST205') {
    return { 
      type: 'table_missing', 
      message: 'Product catalogue tables are currently unavailable. Please verify database migrations.' 
    };
  }

  // Column does not exist
  if (code === '42703' || (msg.toLowerCase().includes('column') && msg.toLowerCase().includes('does not exist'))) {
    return { 
      type: 'column_missing', 
      message: 'Database schema mismatch. Please contact Originyx system support.' 
    };
  }

  // Permission denied (RLS)
  if (code === '42501' || msg.toLowerCase().includes('permission denied') || msg.toLowerCase().includes('rls')) {
    return { 
      type: 'permission_denied', 
      message: 'Access denied. The product catalogue could not be retrieved due to permission policies.' 
    };
  }

  // Auth required / JWT
  if (code === 'PGRST301' || code === 'PGRST302' || msg.toLowerCase().includes('jwt')) {
    return { 
      type: 'auth_required', 
      message: 'Your authentication session has expired. Please sign in again.' 
    };
  }

  // Network or fetch error
  if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
    return { 
      type: 'network', 
      message: 'Could not connect to the database. Please check your network connection and try again.' 
    };
  }

  return { 
    type: 'unknown', 
    message: msg || 'An unexpected error occurred while loading the product catalogue.' 
  };
}
