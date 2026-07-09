import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * Pseudo-function representing an external embedding API (e.g., OpenAI or local transformer)
 */
async function generateEmbedding(text) {
  // In a real scenario, this calls `https://api.openai.com/v1/embeddings`
  return Array.from({ length: 1536 }, () => Math.random() - 0.5);
}

/**
 * Simple sentence-level text chunker for demonstration
 * In production, use LangChain's RecursiveCharacterTextSplitter
 */
function chunkText(text, maxWords = 200) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];

  for (const word of words) {
    currentChunk.push(word);
    if (currentChunk.length >= maxWords) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  
  return chunks;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authorize via Edge function secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.VECTOR_SYNC_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { node_id } = req.body;

  if (!node_id) {
    return res.status(400).json({ error: 'Missing node_id' });
  }

  try {
    // 1. Fetch the node content
    const { data: node, error: fetchError } = await supabase
      .from('cms_nodes')
      .select('id, title, excerpt, content, status')
      .eq('id', node_id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Clear old vector chunks for this node
    // Assume `cms_node_vectors` is a table with pgvector configured
    await supabase.from('cms_node_vectors').delete().eq('node_id', node_id);

    // If the document is deleted or archived, we stop here (effectively removing it from the RAG source)
    if (node.status !== 'Published') {
      return res.status(200).json({ message: 'Node not published. Embeddings cleared.' });
    }

    // 3. Extract text from TipTap JSON (Naive stringification for demo)
    // In production, parse the TipTap JSON tree properly
    const rawText = `${node.title}. ${node.excerpt || ''}. ${JSON.stringify(node.content)}`;
    
    // 4. Chunk text
    const chunks = chunkText(rawText);
    
    // 5. Generate Embeddings and Sync to Postgres
    const vectorsToInsert = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      vectorsToInsert.push({
        node_id: node.id,
        chunk_index: i,
        content: chunks[i],
        embedding: embedding, // This maps to the `vector(1536)` column in pgvector
      });
    }

    const { error: insertError } = await supabase
      .from('cms_node_vectors')
      .insert(vectorsToInsert);

    if (insertError) throw insertError;

    return res.status(200).json({ 
      message: 'Vector embedding sync complete',
      chunksProcessed: chunks.length 
    });

  } catch (error) {
    console.error('Vector Pipeline Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
