import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }

  try {
    // Note: In production this should hit ElasticSearch/Typesense
    // Fallback using Supabase textSearch
    const { data, error } = await supabase
      .from('cms_nodes')
      .select('id, title, slug, excerpt, type:type_id(slug)')
      .eq('status', 'Published')
      .textSearch('title', q, { type: 'websearch' }) // Assumes title is indexable
      .limit(Number(limit));

    if (error) throw error;

    return res.status(200).json({ results: data });
  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
