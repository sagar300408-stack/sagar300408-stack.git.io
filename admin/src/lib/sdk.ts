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
    
    const { data, error } = await query;
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
      .update(payload)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  // --- Media Library ---
  
  async uploadMedia(file: File, folder: string = 'general') {
    const filePath = `${folder}/${Date.now()}-${file.name}`;
    const { data, error } = await this.supabase.storage
      .from('oce_media')
      .upload(filePath, file);
      
    if (error) throw error;
    return data;
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
