import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found in environment variables.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, slug, limit = 10, offset = 0 } = req.query;

  try {
    if (slug) {
      // Fetch single node
      const { data, error } = await supabase
        .from('cms_nodes')
        .select(`
          *,
          type:type_id(slug, name)
        `)
        .eq('slug', slug)
        .eq('status', 'Published')
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Not found' });
      
      return res.status(200).json(data);
    }

    // Fetch list of nodes
    let query = supabase
      .from('cms_nodes')
      .select(`
        id, title, slug, excerpt, cover_image, reading_time_minutes, created_at,
        type:type_id!inner(slug, name)
      `)
      .eq('status', 'Published')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (type) {
      query = query.eq('type.slug', type);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ data, meta: { limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    // In production, strictly fail if DB error
    console.error('Content API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
