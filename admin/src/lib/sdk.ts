import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface OCEConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface SystemStatus {
  initialized: boolean;
  version: string | null;
  organization: { id: string; name: string; slug: string } | null;
  workspace: { id: string; name: string; slug: string } | null;
  content_types: Array<{ id: string; name: string; slug: string }>;
}

export interface InitializeCMSPayload {
  orgName: string;
  orgSlug: string;
  workspaceName: string;
  workspaceSlug: string;
}

export class OCEClient {
  public supabase: SupabaseClient;

  constructor(config: OCEConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  // --- System Bootstrap ---

  /**
   * Single RPC call to determine if CMS is initialized.
   * Returns full status: initialized flag, version, org, workspace, content types.
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const { data, error } = await this.supabase.rpc('get_system_status');
    if (error) throw error;
    return data as SystemStatus;
  }

  /**
   * Runs the CMS initialization transaction.
   * Protected server-side by pg_advisory_xact_lock (concurrent-safe).
   * Only succeeds if cms_initialized flag is not already set.
   */
  async initializeCMS(payload: InitializeCMSPayload): Promise<{ org_id: string; workspace_id: string }> {
    const { data, error } = await this.supabase.rpc('initialize_cms', {
      _org_name: payload.orgName,
      _org_slug: payload.orgSlug,
      _workspace_name: payload.workspaceName,
      _workspace_slug: payload.workspaceSlug,
    });
    if (error) throw error;
    return data;
  }

  // --- Auth ---

  async signIn(email: string, pass: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  }

  // --- Base Metadata (post-initialization) ---

  async getBaseMetadata() {
    // Step 1: Fetch the first organization
    const { data: orgData, error: orgError } = await this.supabase
      .from('organizations')
      .select('id, name, slug')
      .limit(1)
      .maybeSingle(); // maybeSingle() returns null (not an error) when no rows exist

    console.log('[getBaseMetadata] Organization query result:', orgData, 'Error:', orgError);

    if (orgError) {
      console.error('[getBaseMetadata] Organization lookup threw a DB error:', orgError);
      throw new Error(`SETUP_ERROR: Organization lookup failed — ${orgError.message}`);
    }

    if (!orgData || !orgData.id) {
      console.error('[getBaseMetadata] Organization lookup returned no rows. Table may be empty.');
      throw new Error('SETUP_ERROR: Organization lookup failed — no organizations exist in the database. Run the Setup Wizard first.');
    }

    // Step 2: Fetch the "insights" content type
    const { data: typeData, error: typeError } = await this.supabase
      .from('cms_content_types')
      .select('id, name, slug')
      .eq('slug', 'insights') // exact slug match — must be lowercase
      .limit(1)
      .maybeSingle();

    console.log('[getBaseMetadata] Content type (insights) query result:', typeData, 'Error:', typeError);

    if (typeError) {
      console.error('[getBaseMetadata] Content type lookup threw a DB error:', typeError);
      throw new Error(`SETUP_ERROR: Insights content type lookup failed — ${typeError.message}`);
    }

    if (!typeData || !typeData.id) {
      console.error('[getBaseMetadata] No row found in cms_content_types where slug = "insights".');
      throw new Error('SETUP_ERROR: Insights content type lookup failed — no content type with slug "insights" found. Run the Setup Wizard to seed it.');
    }

    console.log('[getBaseMetadata] ✓ Success — orgId:', orgData.id, 'typeId:', typeData.id);
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
    await this.logActivity('CREATE_NODE', 'cms_nodes', data.id, { title: payload.title });
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
    await this.logActivity('UPDATE_NODE', 'cms_nodes', id, { status: payload.status });
    return data;
  }

  async deleteNode(id: string) {
    const { error } = await this.supabase
      .from('cms_nodes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await this.logActivity('DELETE_NODE', 'cms_nodes', id);
  }

  // --- Revisions ---

  async createRevision(nodeId: string, title: string, content: any, authorId?: string) {
    const { error } = await this.supabase
      .from('cms_revisions')
      .insert({
        node_id: nodeId,
        title,
        content,
        author_id: authorId || null,
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

  // --- Taxonomies ---

  async getTaxonomies(orgId: string, type: 'category' | 'tag') {
    const { data, error } = await this.supabase
      .from('cms_taxonomies')
      .select('*')
      .eq('org_id', orgId)
      .eq('type', type)
      .order('name');
    if (error) throw error;
    return data;
  }

  // --- Media Library ---

  async uploadMedia(file: File, folder: string = 'general') {
    const filePath = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, '')}`;
    const { error } = await this.supabase.storage.from('oce_media').upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('oce_media').getPublicUrl(filePath);
    return publicUrl;
  }

  async listMedia(folder: string = 'general') {
    const { data, error } = await this.supabase.storage.from('oce_media').list(folder);
    if (error) throw error;
    return data;
  }

  async deleteMedia(path: string) {
    const { error } = await this.supabase.storage.from('oce_media').remove([path]);
    if (error) throw error;
  }

  // --- Search ---

  async searchNodes(query: string) {
    const { data, error } = await this.supabase
      .from('cms_nodes')
      .select('*')
      .textSearch('title_content', query);

    if (error) throw error;
    return data;
  }

  // --- Audit Logging ---

  async logActivity(action: string, entityType: string, entityId?: string, details?: any) {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) return;

      // Fetch org_id for the log (best effort — skip if unavailable)
      const { data: orgData } = await this.supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single();

      await this.supabase.from('cms_activity_log').insert({
        org_id: orgData?.id || null,
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
    } catch (e) {
      console.warn('Failed to log activity', e);
    }
  }
}

let instance: OCEClient | null = null;
export function getOCEClient(): OCEClient {
  if (!instance) {
    instance = new OCEClient({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    });
  }
  return instance;
}
