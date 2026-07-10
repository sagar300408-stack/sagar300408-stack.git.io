import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface OCEConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export class OCEClient {
  public supabase: SupabaseClient;

  constructor(config: OCEConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  // --- Base Setup ---
  async getBaseMetadata() {
    // Fetch default org and 'insights' content type
    const { data: orgData, error: orgError } = await this.supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'originyx')
      .single();

    if (orgError || !orgData) {
      throw new Error('SETUP_ERROR: Organization "originyx" not found. Please run the database seed script.');
    }

    const { data: typeData, error: typeError } = await this.supabase
      .from('cms_content_types')
      .select('id')
      .eq('slug', 'insights')
      .eq('org_id', orgData.id)
      .single();

    if (typeError || !typeData) {
      throw new Error('SETUP_ERROR: Content Type "insights" not found. Please run the database seed script.');
    }

    return { orgId: orgData.id, typeId: typeData.id };
  }

  // --- Content Engine ---
  
  async getNodes(typeSlug?: string, options?: { limit?: number; offset?: number; status?: string }) {
    let query = this.supabase.from('cms_nodes').select('*, cms_content_types!inner(slug)');
    
    if (typeSlug) {
      query = query.eq('cms_content_types.slug', typeSlug);
    }
    
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getNodeById(id: string) {
    const { data, error } = await this.supabase
      .from('cms_nodes')
      .select('*, cms_content_types(slug, schema)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }

  async getNodeBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('cms_nodes')
      .select('*, cms_content_types(slug, schema)')
      .eq('slug', slug)
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async createNode(payload: any) {
    const { data, error } = await this.supabase
      .from('cms_nodes')
      .insert(payload)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async updateNode(id: string, payload: any) {
    const { data, error } = await this.supabase
      .from('cms_nodes')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  // --- Revisions ---
  
  async createRevision(nodeId: string, title: string, content: any, authorId?: string) {
    const { error } = await this.supabase
      .from('cms_revisions')
      .insert({
        node_id: nodeId,
        title,
        content,
        author_id: authorId || null
      });
    if (error) throw error;
  }

  async getRevisions(nodeId: string) {
    const { data, error } = await this.supabase
      .from('cms_revisions')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // --- Media Library ---
  
  async uploadMedia(file: File, folder: string = 'general') {
    const filePath = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, '')}`;
    const { data, error } = await this.supabase.storage
      .from('oce_media')
      .upload(filePath, file);
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = this.supabase.storage.from('oce_media').getPublicUrl(filePath);
    return publicUrl;
  }

  async listMedia(folder: string = 'general') {
    const { data, error } = await this.supabase.storage
      .from('oce_media')
      .list(folder);
    if (error) throw error;
    return data;
  }

  async deleteMedia(path: string) {
    const { error } = await this.supabase.storage
      .from('oce_media')
      .remove([path]);
    if (error) throw error;
  }

  // --- Analytics & Search ---
  
  async searchNodes(query: string) {
    const { data, error } = await this.supabase
      .from('cms_nodes')
      .select('*')
      .textSearch('title_content', query);
      
    if (error) throw error;
    return data;
  }
}

let instance: OCEClient | null = null;
export function getOCEClient(): OCEClient {
  if (!instance) {
    instance = new OCEClient({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    });
  }
  return instance;
}
