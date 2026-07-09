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
          author:author_id(email),
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
        author:author_id(email),
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
    console.warn('Content API Error (Fallback to mock data):', error);
    
    // Fallback Mock Data for demo purposes when DB is not connected
    const mockData = [
      {
        id: '1', title: 'The Future of AI Operations', slug: 'future-ai-operations', 
        excerpt: 'How autonomous agents are transforming modern business workflows and decision making.',
        cover_image: 'https://placehold.co/800x450/244235/ffffff?text=AI+Operations',
        reading_time_minutes: 5, created_at: new Date().toISOString(),
        author: { email: 'sagar@originyx.in' }, type: { slug: 'ai-automation', name: 'AI Automation' },
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is the full article content about AI operations.' }] }] }
      },
      {
        id: '2', title: 'Scaling Engineering Teams in 2026', slug: 'scaling-engineering-teams', 
        excerpt: 'Best practices for managing distributed teams while maintaining high code quality.',
        cover_image: 'https://placehold.co/800x450/f5f5f2/244235?text=Engineering',
        reading_time_minutes: 7, created_at: new Date(Date.now() - 86400000).toISOString(),
        author: { email: 'team@originyx.in' }, type: { slug: 'engineering', name: 'Engineering' },
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Engineering teams are changing...' }] }] }
      },
      {
        id: '3', title: 'Real Estate Automation Systems', slug: 'real-estate-automation', 
        excerpt: 'How property managers are using AI to automate tenant communications and maintenance requests.',
        cover_image: 'https://placehold.co/800x450/c09b68/ffffff?text=Real+Estate',
        reading_time_minutes: 4, created_at: new Date(Date.now() - 86400000*2).toISOString(),
        author: { email: 'sagar@originyx.in' }, type: { slug: 'real-estate', name: 'Real Estate' },
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Property management can be complex...' }] }] }
      }
    ];

    if (slug) {
      const insight = mockData.find(d => d.slug === slug);
      if (insight) return res.status(200).json(insight);
      return res.status(404).json({ error: 'Not found' });
    }

    const filteredData = type && type !== 'all' ? mockData.filter(d => d.type.slug === type) : mockData;
    return res.status(200).json({ data: filteredData, meta: { limit: Number(limit), offset: Number(offset) } });
  }
}
