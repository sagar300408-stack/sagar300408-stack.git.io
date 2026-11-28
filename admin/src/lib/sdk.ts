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

export interface GrowthModuleSetting {
  id?: string;
  org_id: string;
  enabled_modules: string[];
  metadata: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface GrowthOverviewStats {
  totalContent: number;
  publishedContent: number;
  growthLeads: number;
  totalGrowthTasks: number;
  activeGrowthTasks: number;
  growthTasks: number;
  activeTasks: number;
}

export interface GrowthActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  created_at: string;
  details?: any;
  user_id?: string;
}

// ─── MARKETING SYSTEM TYPES (Phase 2) ───────────────────────────
export type ObjectiveStatus = 'active' | 'achieved' | 'behind' | 'paused' | 'archived';
export type AudienceIntent = 'low' | 'medium' | 'high' | 'urgent';
export type ChannelCategory = 'Inbound' | 'Outbound' | 'Referral' | 'Organic' | 'Paid' | 'Event' | 'Other';
export type ChannelStatus = 'active' | 'inactive' | 'evaluating' | 'paused';
export type ExperimentStatus = 'draft' | 'planned' | 'running' | 'paused' | 'completed' | 'analyzed' | 'cancelled';
export type ExperimentVerdict = 'success' | 'failure' | 'inconclusive';
export type InitiativeStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type InitiativePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MarketingObjective {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  target_metric: string;
  current_value: number;
  target_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: ObjectiveStatus;
  owner_id?: string | null;
  owner_name?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingAudience {
  id: string;
  org_id: string;
  name: string;
  industry: string;
  company_size: string;
  geographic_market: string;
  business_type: string;
  target_roles: string[];
  pain_points: string[];
  buying_intent: AudienceIntent;
  description?: string;
  status: 'active' | 'evaluating' | 'archived';
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingICPProfile {
  id: string;
  org_id: string;
  name: string;
  industry: string;
  company_size: string;
  revenue_range?: string;
  geography: string;
  technology_maturity: string;
  business_challenges: string[];
  decision_maker_roles: string[];
  qualification_criteria: string[];
  is_primary: boolean;
  notes?: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingChannel {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  category: ChannelCategory;
  crm_source_mapping?: string;
  description?: string;
  status: ChannelStatus;
  owner_id?: string | null;
  owner_name?: string | null;
  monthly_budget: number;
  target_cpl?: number | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Computed fields
  leadCount?: number;
  qualifiedLeadCount?: number;
  conversionRate?: number;
}

export interface MarketingExperiment {
  id: string;
  org_id: string;
  name: string;
  hypothesis: string;
  objective_id?: string | null;
  target_audience?: string;
  channel_id?: string | null;
  channel_name?: string;
  start_date?: string | null;
  end_date?: string | null;
  owner_id?: string | null;
  owner_name?: string | null;
  success_metric: string;
  target_value: string;
  actual_result?: string | null;
  status: ExperimentStatus;
  expected_outcome?: string | null;
  actual_outcome?: string | null;
  result_verdict?: ExperimentVerdict | null;
  observations?: string | null;
  lessons_learned?: string | null;
  recommendations?: string | null;
  conclusion?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingInitiative {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  objective_id?: string | null;
  channel_id?: string | null;
  channel_name?: string;
  owner_id?: string | null;
  owner_name?: string | null;
  priority: InitiativePriority;
  start_date?: string | null;
  target_completion_date?: string | null;
  budget: number;
  spend: number;
  status: InitiativeStatus;
  related_experiment_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  taskCount?: number;
}

export interface MarketingOverviewMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  activeOpportunities: number;
  opportunityValue: number;
  conversionRate: number;
  activeInitiatives: number;
  activeExperiments: number;
  activeChannels: number;
  topChannel: string;
}

export interface LeadSourceDistribution {
  source: string;
  label: string;
  count: number;
  percentage: number;
  qualifiedCount: number;
  isOutbound: boolean;
}

// ─── CONTENT SYSTEM TYPES (Phase 3) ──────────────────────────────
export type ContentType = 'blog' | 'article' | 'social' | 'newsletter' | 'case_study' | 'whitepaper' | 'landing_page' | 'other';
export type ContentStatus = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'scheduled' | 'published' | 'rejected' | 'archived';
export type IdeaStatus = 'new' | 'under_review' | 'approved' | 'converted' | 'rejected' | 'archived';
export type IdeaPriority = 'low' | 'medium' | 'high';
export type ReviewAction = 'submitted' | 'approved' | 'rejected' | 'changes_requested' | 'commented';

export const VALID_CONTENT_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ['in_review', 'archived'],
  in_review: ['approved', 'changes_requested', 'rejected', 'draft'],
  changes_requested: ['in_review', 'draft', 'archived'],
  approved: ['scheduled', 'published', 'changes_requested', 'archived'],
  scheduled: ['published', 'approved', 'archived'],
  published: ['archived'],
  rejected: ['draft', 'archived'],
  archived: ['draft'],
};

export function isValidContentTransition(current: ContentStatus, next: ContentStatus): boolean {
  if (current === next) return true;
  return VALID_CONTENT_TRANSITIONS[current]?.includes(next) ?? false;
}

export interface ContentPerformanceMetrics {
  totalPublished: number;
  cmsPublishedCount: number;
  publishedByChannel: Array<{ channelId: string; channelName: string; count: number }>;
  byContentType: Array<{ type: ContentType; label: string; count: number }>;
  telemetryConnected: boolean;
  telemetryNotice: string;
}

export interface GrowthContentItem {
  id: string;
  org_id: string;
  title: string;
  slug: string;
  content_type: ContentType;
  status: ContentStatus;
  summary?: string | null;
  content: any;
  body_text?: string | null;
  cover_image?: string | null;
  media_urls: string[];
  category?: string | null;
  tags: string[];
  channel_id?: string | null;
  objective_id?: string | null;
  audience_id?: string | null;
  campaign_id?: string | null;
  idea_id?: string | null;
  cms_node_id?: string | null;
  author_id?: string | null;
  author_name?: string | null;
  reviewer_id?: string | null;
  reviewer_name?: string | null;
  scheduled_for?: string | null;
  published_at?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  version: number;
  metadata: Record<string, any>;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  channel_name?: string;
  objective_title?: string;
  audience_name?: string;
  campaign_name?: string;
}

export interface GrowthContentIdea {
  id: string;
  org_id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  category?: string | null;
  tags: string[];
  target_channels: string[];
  status: IdeaStatus;
  priority: IdeaPriority;
  objective_id?: string | null;
  audience_id?: string | null;
  converted_content_id?: string | null;
  author_name?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  objective_title?: string;
  audience_name?: string;
}

export interface GrowthContentReview {
  id: string;
  org_id: string;
  content_id: string;
  reviewer_id?: string | null;
  reviewer_name: string;
  action: ReviewAction;
  feedback?: string | null;
  created_at: string;
}

export interface GrowthContentRevision {
  id: string;
  org_id: string;
  content_id: string;
  version: number;
  title: string;
  summary?: string | null;
  content: any;
  change_summary?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface ContentOverviewMetrics {
  totalContent: number;
  publishedCount: number;
  scheduledCount: number;
  inReviewCount: number;
  draftCount: number;
  totalIdeas: number;
  approvedIdeas: number;
  convertedIdeas: number;
  topCategory: string;
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
    // Collect Auth context before querying
    const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    
    console.log('[getBaseMetadata] === DIAGNOSTICS START ===');
    console.log('[getBaseMetadata] Current session:', session);
    console.log('[getBaseMetadata] Current user:', user);
    console.log('[getBaseMetadata] Session error:', sessionError);
    console.log('[getBaseMetadata] User error:', userError);
    
    // Step 1: Fetch the first organization
    console.log('[getBaseMetadata] Executing query: supabase.from("organizations").select("id, name, slug").limit(1).maybeSingle()');
    const { data: orgData, error: orgError } = await this.supabase
      .from('organizations')
      .select('id, name, slug')
      .limit(1)
      .maybeSingle(); // maybeSingle() returns null (not an error) when no rows exist

    console.log('[getBaseMetadata] Organization query result:', orgData);
    console.log('[getBaseMetadata] Organization query error:', orgError);

    if (orgError) {
      console.error('[getBaseMetadata] Organization lookup threw a DB error:', orgError);
      throw new Error(`SETUP_ERROR: Organization lookup failed — ${orgError.message}`);
    }

    if (!orgData || !orgData.id) {
      console.error('[getBaseMetadata] Organization lookup returned no rows. Table may be empty OR RLS is blocking the read.');
      console.error('[getBaseMetadata] Auth UID is:', user?.id);
      throw new Error('SETUP_ERROR: Organization lookup failed — no organizations exist in the database, OR you do not have permission to view them (RLS policy check failed).');
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
      .select(`
        *,
        cms_content_types(slug, schema),
        cms_node_taxonomies(
          cms_taxonomies(type, name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Map taxonomies back to flat category/tags for the editor
    if (data && data.cms_node_taxonomies) {
      const taxes = data.cms_node_taxonomies.map((t: any) => t.cms_taxonomies).filter(Boolean);
      data.category = taxes.find((t: any) => t.type === 'category')?.name || '';
      data.tags = taxes.filter((t: any) => t.type === 'tag').map((t: any) => t.name) || [];
      delete data.cms_node_taxonomies;
    }

    return data;
  }

  async getNodeBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('cms_nodes')
      .select(`
        *,
        cms_content_types(slug, schema),
        cms_node_taxonomies(
          cms_taxonomies(type, name)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    if (data && data.cms_node_taxonomies) {
      const taxes = data.cms_node_taxonomies.map((t: any) => t.cms_taxonomies).filter(Boolean);
      data.category = taxes.find((t: any) => t.type === 'category')?.name || '';
      data.tags = taxes.filter((t: any) => t.type === 'tag').map((t: any) => t.name) || [];
      delete data.cms_node_taxonomies;
    }

    return data;
  }

  async createNode(payload: any) {
    // 1. Separate generic metadata from node fields
    const { category, tags, featured, ...nodePayload } = payload;
    
    // 2. Ensure a slug exists
    if (!nodePayload.slug && nodePayload.title) {
      nodePayload.slug = nodePayload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    // We can store generic unstructured metadata (like 'featured') in the JSONB content field if we want,
    // but for now we just omit it from the top-level insert.

    const { data, error } = await this.supabase
      .from('cms_nodes')
      .insert(nodePayload)
      .select()
      .single();

    if (error) throw error;
    
    // 3. Sync taxonomies
    if (payload.org_id && data.id && (category || (tags && tags.length > 0))) {
      await this.syncTaxonomies(payload.org_id, data.id, category, tags);
    }

    await this.logActivity('CREATE_NODE', 'cms_nodes', data.id, { title: payload.title });
    return data;
  }

  async updateNode(id: string, payload: any) {
    // 1. Separate generic metadata from node fields
    const { category, tags, featured, ...nodePayload } = payload;
    
    // 2. Ensure a slug exists if title is updating
    if (nodePayload.title && !nodePayload.slug) {
      nodePayload.slug = nodePayload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const { data, error } = await this.supabase
      .from('cms_nodes')
      .update({ ...nodePayload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // 3. Sync taxonomies
    if (payload.org_id && data.id && (category !== undefined || tags !== undefined)) {
      await this.syncTaxonomies(payload.org_id, data.id, category, tags);
    }

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

  private async syncTaxonomies(orgId: string, nodeId: string, category: string | undefined, tags: string[] | undefined) {
    try {
      // Clear existing mappings
      await this.supabase.from('cms_node_taxonomies').delete().eq('node_id', nodeId);

      const toSync: Array<{ type: string, name: string }> = [];
      if (category && category.trim()) {
        toSync.push({ type: 'category', name: category.trim() });
      }
      if (tags && Array.isArray(tags)) {
        tags.forEach(t => {
          if (t.trim()) toSync.push({ type: 'tag', name: t.trim() });
        });
      }

      for (const tax of toSync) {
        const slug = tax.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        // 1. Ensure the taxonomy exists
        const { data: taxData, error: taxError } = await this.supabase
          .from('cms_taxonomies')
          .upsert({ org_id: orgId, type: tax.type, name: tax.name, slug }, { onConflict: 'org_id,type,slug' })
          .select()
          .single();

        if (taxError) {
          console.warn(`[syncTaxonomies] Failed to upsert taxonomy ${tax.name}:`, taxError);
        }

        if (taxData) {
          // 2. Create the relationship
          await this.supabase.from('cms_node_taxonomies').insert({
            node_id: nodeId,
            taxonomy_id: taxData.id
          });
        }
      }
    } catch (e) {
      console.error('[syncTaxonomies] Failed to sync taxonomies', e);
    }
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

  // --- Growth Module Foundation ---

  async getGrowthModuleSettings(orgId: string): Promise<GrowthModuleSetting> {
    const defaultSettings: GrowthModuleSetting = {
      org_id: orgId,
      enabled_modules: ['marketing', 'content', 'social', 'campaigns', 'analytics'],
      metadata: {},
    };

    try {
      const { data, error } = await this.supabase
        .from('growth_module_settings')
        .select('*')
        .eq('org_id', orgId)
        .maybeSingle();

      if (error) {
        // Suppress expected error if table has not been migrated yet in the target db
        console.warn('[Growth] Module settings lookup failed, using defaults:', error.message);
        return defaultSettings;
      }

      if (!data) return defaultSettings;
      return data as GrowthModuleSetting;
    } catch (e) {
      console.warn('[Growth] Module settings exception:', e);
      return defaultSettings;
    }
  }

  async getGrowthActivity(orgId: string, limit: number = 8): Promise<GrowthActivityItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('cms_activity_log')
        .select('id, action, entity_type, entity_id, created_at, details, user_id')
        .eq('org_id', orgId)
        .in('entity_type', ['growth', 'marketing', 'content', 'social', 'campaigns', 'analytics', 'cms_nodes', 'insight'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('[Growth] Activity fetch warning:', error.message);
        return [];
      }
      return (data as GrowthActivityItem[]) ?? [];
    } catch (e) {
      console.warn('[Growth] Activity query exception:', e);
      return [];
    }
  }

  async getGrowthStats(orgId: string): Promise<GrowthOverviewStats> {
    const stats: GrowthOverviewStats = {
      totalContent: 0,
      publishedContent: 0,
      growthLeads: 0,
      totalGrowthTasks: 0,
      activeGrowthTasks: 0,
      growthTasks: 0,
      activeTasks: 0,
    };

    try {
      const [
        totalContentRes,
        publishedContentRes,
        growthLeadsRes,
        totalGrowthTasksRes,
        activeGrowthTasksRes,
      ] = await Promise.all([
        this.supabase
          .from('cms_nodes')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId),
        this.supabase
          .from('cms_nodes')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'Published'),
        this.supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .in('source', ['Website', 'LinkedIn', 'Referral', 'Event', 'Inbound']),
        this.supabase
          .from('internal_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('area', 'Growth'),
        this.supabase
          .from('internal_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('area', 'Growth')
          .in('status', ['To Do', 'In Progress', 'Blocked']),
      ]);

      // Prefer growth_content_items count if available, falling back to cms_nodes
      try {
        const { count: gcTotal } = await this.supabase
          .from('growth_content_items')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId);
        const { count: gcPublished } = await this.supabase
          .from('growth_content_items')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('status', 'published');

        if (gcTotal !== null && gcTotal !== undefined && gcTotal > 0) {
          stats.totalContent = gcTotal;
          stats.publishedContent = gcPublished ?? 0;
        } else {
          stats.totalContent = totalContentRes.count ?? 0;
          stats.publishedContent = publishedContentRes.count ?? 0;
        }
      } catch {
        stats.totalContent = totalContentRes.count ?? 0;
        stats.publishedContent = publishedContentRes.count ?? 0;
      }

      stats.growthLeads = growthLeadsRes.count ?? 0;
      stats.totalGrowthTasks = totalGrowthTasksRes.count ?? 0;
      stats.activeGrowthTasks = activeGrowthTasksRes.count ?? 0;
      stats.growthTasks = totalGrowthTasksRes.count ?? 0;
      stats.activeTasks = activeGrowthTasksRes.count ?? 0;
    } catch (e) {
      console.warn('[Growth] Stats fetch exception:', e);
    }

    return stats;
  }

  async logGrowthActivity(orgId: string, action: string, entityId?: string, details?: any): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) return;

      await this.supabase.from('cms_activity_log').insert({
        org_id: orgId,
        user_id: user.id,
        action,
        entity_type: 'growth',
        entity_id: entityId || orgId,
        details,
      });
    } catch (e) {
      console.warn('[Growth] Failed to log growth activity:', e);
    }
  }

  // ─── MARKETING SYSTEM METHODS (Phase 2) ─────────────────────────

  // --- Local Fallback Storage Helper (safeguards against unapplied remote migrations) ---
  private getLocalMarketingStorage<T>(key: string, orgId: string): T[] {
    try {
      if (typeof window === 'undefined') return [];
      const item = localStorage.getItem(`originyx_${key}_${orgId}`);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  private setLocalMarketingStorage<T>(key: string, orgId: string, data: T[]): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(`originyx_${key}_${orgId}`, JSON.stringify(data));
    } catch (e) {
      console.warn('[Storage] Local storage write warning:', e);
    }
  }

  // --- Marketing Overview Metrics & Analytics ---

  async getMarketingOverviewMetrics(orgId: string): Promise<MarketingOverviewMetrics> {
    const metrics: MarketingOverviewMetrics = {
      totalLeads: 0,
      qualifiedLeads: 0,
      activeOpportunities: 0,
      opportunityValue: 0,
      conversionRate: 0,
      activeInitiatives: 0,
      activeExperiments: 0,
      activeChannels: 0,
      topChannel: 'None',
    };

    try {
      const [
        leadsTotalRes,
        leadsQualifiedRes,
        oppsRes,
        initiatives,
        experiments,
        channels,
      ] = await Promise.all([
        this.supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId),
        this.supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .in('status', ['Qualified', 'Converted']),
        this.supabase
          .from('opportunities')
          .select('value, stage')
          .eq('org_id', orgId)
          .not('stage', 'in', '("Won","Lost")'),
        this.getMarketingInitiatives(orgId),
        this.getMarketingExperiments(orgId),
        this.getMarketingChannels(orgId),
      ]);

      metrics.totalLeads = leadsTotalRes.count ?? 0;
      metrics.qualifiedLeads = leadsQualifiedRes.count ?? 0;
      metrics.conversionRate = metrics.totalLeads > 0
        ? Math.round((metrics.qualifiedLeads / metrics.totalLeads) * 1000) / 10
        : 0;

      if (oppsRes.data) {
        metrics.activeOpportunities = oppsRes.data.length;
        metrics.opportunityValue = oppsRes.data.reduce((sum, opp) => sum + (Number(opp.value) || 0), 0);
      }

      metrics.activeInitiatives = initiatives.filter(i => i.status === 'active').length;
      metrics.activeExperiments = experiments.filter(e => e.status === 'running').length;
      metrics.activeChannels = channels.filter(c => c.status === 'active').length;

      // Find top acquisition channel
      const channelsWithLeads = channels.filter(c => (c.leadCount ?? 0) > 0);
      if (channelsWithLeads.length > 0) {
        channelsWithLeads.sort((a, b) => (b.leadCount ?? 0) - (a.leadCount ?? 0));
        metrics.topChannel = channelsWithLeads[0].name;
      }
    } catch (e) {
      console.warn('[Marketing] Error fetching overview metrics:', e);
    }

    return metrics;
  }

  async getLeadAcquisitionDistribution(orgId: string): Promise<LeadSourceDistribution[]> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select('source, status')
        .eq('org_id', orgId);

      if (error) {
        console.warn('[Marketing] Lead distribution fetch error:', error.message);
        return [];
      }

      const rows = data ?? [];
      const total = rows.length;

      const sourceMap: Record<string, { count: number; qualified: number }> = {
        Website: { count: 0, qualified: 0 },
        LinkedIn: { count: 0, qualified: 0 },
        Referral: { count: 0, qualified: 0 },
        Inbound: { count: 0, qualified: 0 },
        'Cold Outreach': { count: 0, qualified: 0 },
        Event: { count: 0, qualified: 0 },
        Other: { count: 0, qualified: 0 },
      };

      rows.forEach((row) => {
        const src = row.source || 'Other';
        if (!sourceMap[src]) sourceMap[src] = { count: 0, qualified: 0 };
        sourceMap[src].count += 1;
        if (row.status === 'Qualified' || row.status === 'Converted') {
          sourceMap[src].qualified += 1;
        }
      });

      return Object.entries(sourceMap).map(([source, stats]) => ({
        source,
        label: source,
        count: stats.count,
        percentage: total > 0 ? Math.round((stats.count / total) * 1000) / 10 : 0,
        qualifiedCount: stats.qualified,
        isOutbound: source === 'Cold Outreach',
      })).sort((a, b) => b.count - a.count);
    } catch (e) {
      console.warn('[Marketing] Lead distribution exception:', e);
      return [];
    }
  }

  // --- Marketing Objectives ---

  async getMarketingObjectives(orgId: string): Promise<MarketingObjective[]> {
    try {
      const { data, error } = await this.supabase
        .from('marketing_objectives')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.getLocalMarketingStorage<MarketingObjective>('objectives', orgId);
      }
      return (data as MarketingObjective[]) ?? [];
    } catch {
      return this.getLocalMarketingStorage<MarketingObjective>('objectives', orgId);
    }
  }

  async createMarketingObjective(orgId: string, payload: Partial<MarketingObjective>): Promise<MarketingObjective> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const newRecord: MarketingObjective = {
      id: crypto.randomUUID(),
      org_id: orgId,
      title: payload.title || 'Untitled Objective',
      description: payload.description || '',
      target_metric: payload.target_metric || 'Qualified Leads',
      current_value: Number(payload.current_value) || 0,
      target_value: Number(payload.target_value) || 100,
      unit: payload.unit || 'count',
      start_date: payload.start_date || new Date().toISOString().split('T')[0],
      target_date: payload.target_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      status: payload.status || 'active',
      owner_name: payload.owner_name || user?.user_metadata?.full_name || 'Marketing Lead',
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await this.supabase
        .from('marketing_objectives')
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_OBJECTIVE', data.id, { title: data.title });
        return data as MarketingObjective;
      }
    } catch (e) {
      console.warn('[Marketing] Remote objective insert failed, using fallback:', e);
    }

    const items = this.getLocalMarketingStorage<MarketingObjective>('objectives', orgId);
    this.setLocalMarketingStorage('objectives', orgId, [newRecord, ...items]);
    await this.logGrowthActivity(orgId, 'CREATE_OBJECTIVE', newRecord.id, { title: newRecord.title });
    return newRecord;
  }

  async updateMarketingObjective(orgId: string, id: string, payload: Partial<MarketingObjective>): Promise<MarketingObjective | null> {
    const updates = { ...payload, updated_at: new Date().toISOString() };
    try {
      const { data, error } = await this.supabase
        .from('marketing_objectives')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'UPDATE_OBJECTIVE', id, { title: data.title, status: data.status });
        return data as MarketingObjective;
      }
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingObjective>('objectives', orgId);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.setLocalMarketingStorage('objectives', orgId, items);
      await this.logGrowthActivity(orgId, 'UPDATE_OBJECTIVE', id, { title: items[idx].title, status: items[idx].status });
      return items[idx];
    }
    return null;
  }

  async archiveMarketingObjective(orgId: string, id: string): Promise<void> {
    await this.updateMarketingObjective(orgId, id, { status: 'archived' });
  }

  // --- Marketing Audiences ---

  async getMarketingAudiences(orgId: string): Promise<MarketingAudience[]> {
    try {
      const { data, error } = await this.supabase
        .from('marketing_audiences')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.getLocalMarketingStorage<MarketingAudience>('audiences', orgId);
      }
      return (data as MarketingAudience[]) ?? [];
    } catch {
      return this.getLocalMarketingStorage<MarketingAudience>('audiences', orgId);
    }
  }

  async createMarketingAudience(orgId: string, payload: Partial<MarketingAudience>): Promise<MarketingAudience> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const newRecord: MarketingAudience = {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: payload.name || 'Target Audience',
      industry: payload.industry || 'Technology',
      company_size: payload.company_size || '51-200',
      geographic_market: payload.geographic_market || 'India & Global',
      business_type: payload.business_type || 'B2B SaaS',
      target_roles: payload.target_roles || ['Founder', 'CTO', 'VP Engineering'],
      pain_points: payload.pain_points || [],
      buying_intent: payload.buying_intent || 'medium',
      description: payload.description || '',
      status: payload.status || 'active',
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await this.supabase
        .from('marketing_audiences')
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_AUDIENCE', data.id, { name: data.name });
        return data as MarketingAudience;
      }
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingAudience>('audiences', orgId);
    this.setLocalMarketingStorage('audiences', orgId, [newRecord, ...items]);
    await this.logGrowthActivity(orgId, 'CREATE_AUDIENCE', newRecord.id, { name: newRecord.name });
    return newRecord;
  }

  async updateMarketingAudience(orgId: string, id: string, payload: Partial<MarketingAudience>): Promise<MarketingAudience | null> {
    const updates = { ...payload, updated_at: new Date().toISOString() };
    try {
      const { data, error } = await this.supabase
        .from('marketing_audiences')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) return data as MarketingAudience;
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingAudience>('audiences', orgId);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.setLocalMarketingStorage('audiences', orgId, items);
      return items[idx];
    }
    return null;
  }

  async archiveMarketingAudience(orgId: string, id: string): Promise<void> {
    await this.updateMarketingAudience(orgId, id, { status: 'archived' });
  }

  // --- Marketing ICP Profiles ---

  async getMarketingICPProfiles(orgId: string): Promise<MarketingICPProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('marketing_icp_profiles')
        .select('*')
        .eq('org_id', orgId)
        .order('is_primary', { ascending: false });

      if (error) {
        return this.getLocalMarketingStorage<MarketingICPProfile>('icps', orgId);
      }
      return (data as MarketingICPProfile[]) ?? [];
    } catch {
      return this.getLocalMarketingStorage<MarketingICPProfile>('icps', orgId);
    }
  }

  async createMarketingICPProfile(orgId: string, payload: Partial<MarketingICPProfile>): Promise<MarketingICPProfile> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const newRecord: MarketingICPProfile = {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: payload.name || 'Ideal Customer Profile',
      industry: payload.industry || 'AI / B2B SaaS',
      company_size: payload.company_size || '20-500 employees',
      revenue_range: payload.revenue_range || '$1M - $10M ARR',
      geography: payload.geography || 'North America / India',
      technology_maturity: payload.technology_maturity || 'Scaling Cloud Infrastructure',
      business_challenges: payload.business_challenges || [],
      decision_maker_roles: payload.decision_maker_roles || ['CTO', 'Head of AI', 'Founder'],
      qualification_criteria: payload.qualification_criteria || [],
      is_primary: payload.is_primary || false,
      notes: payload.notes || '',
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await this.supabase
        .from('marketing_icp_profiles')
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_ICP', data.id, { name: data.name });
        return data as MarketingICPProfile;
      }
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingICPProfile>('icps', orgId);
    this.setLocalMarketingStorage('icps', orgId, [newRecord, ...items]);
    await this.logGrowthActivity(orgId, 'CREATE_ICP', newRecord.id, { name: newRecord.name });
    return newRecord;
  }

  async updateMarketingICPProfile(orgId: string, id: string, payload: Partial<MarketingICPProfile>): Promise<MarketingICPProfile | null> {
    const updates = { ...payload, updated_at: new Date().toISOString() };
    try {
      const { data, error } = await this.supabase
        .from('marketing_icp_profiles')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) return data as MarketingICPProfile;
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingICPProfile>('icps', orgId);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.setLocalMarketingStorage('icps', orgId, items);
      return items[idx];
    }
    return null;
  }

  async deleteMarketingICPProfile(orgId: string, id: string): Promise<void> {
    try {
      await this.supabase.from('marketing_icp_profiles').delete().eq('id', id).eq('org_id', orgId);
    } catch {}
    const items = this.getLocalMarketingStorage<MarketingICPProfile>('icps', orgId).filter(i => i.id !== id);
    this.setLocalMarketingStorage('icps', orgId, items);
  }

  // --- Marketing Acquisition Channels ---

  async getMarketingChannels(orgId: string): Promise<MarketingChannel[]> {
    const defaultChannels: MarketingChannel[] = [
      { id: '1', org_id: orgId, name: 'Website', slug: 'website', category: 'Inbound', crm_source_mapping: 'Website', description: 'Organic web traffic and direct inbound conversion forms', status: 'active', monthly_budget: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', org_id: orgId, name: 'LinkedIn', slug: 'linkedin', category: 'Inbound', crm_source_mapping: 'LinkedIn', description: 'Executive personal branding, company page, and direct inquiries', status: 'active', monthly_budget: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '3', org_id: orgId, name: 'Referrals', slug: 'referrals', category: 'Referral', crm_source_mapping: 'Referral', description: 'Client word-of-mouth, network, and investor referrals', status: 'active', monthly_budget: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '4', org_id: orgId, name: 'Organic Search', slug: 'organic-search', category: 'Organic', crm_source_mapping: 'Inbound', description: 'SEO discovery for AI consulting and autonomous agent services', status: 'active', monthly_budget: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '5', org_id: orgId, name: 'Direct Outreach', slug: 'direct-outreach', category: 'Outbound', crm_source_mapping: 'Cold Outreach', description: 'Targeted account-based prospecting and cold messaging', status: 'active', monthly_budget: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '6', org_id: orgId, name: 'Events & Conferences', slug: 'events', category: 'Event', crm_source_mapping: 'Event', description: 'Industry summits, hackathons, and founder demo days', status: 'active', monthly_budget: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '7', org_id: orgId, name: 'Email Marketing', slug: 'email-marketing', category: 'Inbound', crm_source_mapping: 'Inbound', description: 'Thought leadership dispatches and insight newsletter', status: 'active', monthly_budget: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '8', org_id: orgId, name: 'Other Channels', slug: 'other', category: 'Other', crm_source_mapping: 'Other', description: 'Unclassified and emerging inbound touchpoints', status: 'active', monthly_budget: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];

    let channels: MarketingChannel[] = [];
    try {
      const { data, error } = await this.supabase
        .from('marketing_channels')
        .select('*')
        .eq('org_id', orgId);

      if (!error && data && data.length > 0) {
        channels = data as MarketingChannel[];
      } else {
        const stored = this.getLocalMarketingStorage<MarketingChannel>('channels', orgId);
        channels = stored.length > 0 ? stored : defaultChannels;
      }
    } catch {
      const stored = this.getLocalMarketingStorage<MarketingChannel>('channels', orgId);
      channels = stored.length > 0 ? stored : defaultChannels;
    }

    // Attach actual CRM lead statistics mapped via crm_source_mapping
    try {
      const { data: leads } = await this.supabase
        .from('leads')
        .select('source, status')
        .eq('org_id', orgId);

      if (leads) {
        channels = channels.map(ch => {
          const mapping = ch.crm_source_mapping || ch.name;
          const matchingLeads = leads.filter(l => l.source === mapping);
          const qualified = matchingLeads.filter(l => l.status === 'Qualified' || l.status === 'Converted');
          return {
            ...ch,
            leadCount: matchingLeads.length,
            qualifiedLeadCount: qualified.length,
            conversionRate: matchingLeads.length > 0
              ? Math.round((qualified.length / matchingLeads.length) * 1000) / 10
              : 0,
          };
        });
      }
    } catch (e) {
      console.warn('[Marketing] Channel stats attachment warning:', e);
    }

    return channels;
  }

  async createMarketingChannel(orgId: string, payload: Partial<MarketingChannel>): Promise<MarketingChannel> {
    const slug = payload.slug || payload.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'channel';
    const newRecord: MarketingChannel = {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: payload.name || 'New Channel',
      slug,
      category: payload.category || 'Inbound',
      crm_source_mapping: payload.crm_source_mapping || 'Other',
      description: payload.description || '',
      status: payload.status || 'active',
      monthly_budget: Number(payload.monthly_budget) || 0,
      target_cpl: payload.target_cpl ? Number(payload.target_cpl) : null,
      metadata: payload.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await this.supabase
        .from('marketing_channels')
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_CHANNEL', data.id, { name: data.name });
        return data as MarketingChannel;
      }
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingChannel>('channels', orgId);
    this.setLocalMarketingStorage('channels', orgId, [...items, newRecord]);
    await this.logGrowthActivity(orgId, 'CREATE_CHANNEL', newRecord.id, { name: newRecord.name });
    return newRecord;
  }

  async updateMarketingChannel(orgId: string, id: string, payload: Partial<MarketingChannel>): Promise<MarketingChannel | null> {
    const updates = { ...payload, updated_at: new Date().toISOString() };
    try {
      const { data, error } = await this.supabase
        .from('marketing_channels')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) return data as MarketingChannel;
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingChannel>('channels', orgId);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.setLocalMarketingStorage('channels', orgId, items);
      return items[idx];
    }
    return null;
  }

  async toggleMarketingChannelStatus(orgId: string, id: string, status: ChannelStatus): Promise<void> {
    await this.updateMarketingChannel(orgId, id, { status });
  }

  // --- Growth Experiments ---

  async getMarketingExperiments(orgId: string): Promise<MarketingExperiment[]> {
    try {
      const { data, error } = await this.supabase
        .from('marketing_experiments')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.getLocalMarketingStorage<MarketingExperiment>('experiments', orgId);
      }
      return (data as MarketingExperiment[]) ?? [];
    } catch {
      return this.getLocalMarketingStorage<MarketingExperiment>('experiments', orgId);
    }
  }

  async createMarketingExperiment(orgId: string, payload: Partial<MarketingExperiment>): Promise<MarketingExperiment> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const newRecord: MarketingExperiment = {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: payload.name || 'Growth Experiment',
      hypothesis: payload.hypothesis || '',
      objective_id: payload.objective_id || null,
      target_audience: payload.target_audience || '',
      channel_id: payload.channel_id || null,
      channel_name: payload.channel_name || '',
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      owner_name: payload.owner_name || user?.user_metadata?.full_name || 'Growth Lead',
      success_metric: payload.success_metric || 'Lead Conversion Rate',
      target_value: payload.target_value || '5%',
      actual_result: payload.actual_result || null,
      status: payload.status || 'draft',
      expected_outcome: payload.expected_outcome || '',
      actual_outcome: payload.actual_outcome || '',
      result_verdict: payload.result_verdict || null,
      observations: payload.observations || '',
      lessons_learned: payload.lessons_learned || '',
      recommendations: payload.recommendations || '',
      conclusion: payload.conclusion || '',
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await this.supabase
        .from('marketing_experiments')
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_EXPERIMENT', data.id, { name: data.name });
        return data as MarketingExperiment;
      }
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingExperiment>('experiments', orgId);
    this.setLocalMarketingStorage('experiments', orgId, [newRecord, ...items]);
    await this.logGrowthActivity(orgId, 'CREATE_EXPERIMENT', newRecord.id, { name: newRecord.name });
    return newRecord;
  }

  async updateMarketingExperiment(orgId: string, id: string, payload: Partial<MarketingExperiment>): Promise<MarketingExperiment | null> {
    const updates = { ...payload, updated_at: new Date().toISOString() };
    try {
      const { data, error } = await this.supabase
        .from('marketing_experiments')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'UPDATE_EXPERIMENT', id, { name: data.name, status: data.status });
        return data as MarketingExperiment;
      }
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingExperiment>('experiments', orgId);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.setLocalMarketingStorage('experiments', orgId, items);
      await this.logGrowthActivity(orgId, 'UPDATE_EXPERIMENT', id, { name: items[idx].name, status: items[idx].status });
      return items[idx];
    }
    return null;
  }

  async deleteMarketingExperiment(orgId: string, id: string): Promise<void> {
    try {
      await this.supabase.from('marketing_experiments').delete().eq('id', id).eq('org_id', orgId);
    } catch {}
    const items = this.getLocalMarketingStorage<MarketingExperiment>('experiments', orgId).filter(i => i.id !== id);
    this.setLocalMarketingStorage('experiments', orgId, items);
  }

  // --- Marketing Initiatives & Tasks Integration ---

  async getMarketingInitiatives(orgId: string): Promise<MarketingInitiative[]> {
    let list: MarketingInitiative[] = [];
    try {
      const { data, error } = await this.supabase
        .from('marketing_initiatives')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (!error && data) list = data as MarketingInitiative[];
      else list = this.getLocalMarketingStorage<MarketingInitiative>('initiatives', orgId);
    } catch {
      list = this.getLocalMarketingStorage<MarketingInitiative>('initiatives', orgId);
    }

    // Attach task counts from internal_tasks
    try {
      const { data: tasks } = await this.supabase
        .from('internal_tasks')
        .select('related_entity_id')
        .eq('org_id', orgId)
        .eq('related_entity_type', 'marketing_initiative');

      if (tasks && tasks.length > 0) {
        const countMap = tasks.reduce((acc: Record<string, number>, t) => {
          if (t.related_entity_id) acc[t.related_entity_id] = (acc[t.related_entity_id] || 0) + 1;
          return acc;
        }, {});
        list = list.map(init => ({ ...init, taskCount: countMap[init.id] || 0 }));
      }
    } catch {}

    return list;
  }

  async createMarketingInitiative(orgId: string, payload: Partial<MarketingInitiative>): Promise<MarketingInitiative> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const newRecord: MarketingInitiative = {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: payload.name || 'Marketing Initiative',
      description: payload.description || '',
      objective_id: payload.objective_id || null,
      channel_id: payload.channel_id || null,
      channel_name: payload.channel_name || '',
      owner_name: payload.owner_name || user?.user_metadata?.full_name || 'Marketing Lead',
      priority: payload.priority || 'Medium',
      start_date: payload.start_date || new Date().toISOString().split('T')[0],
      target_completion_date: payload.target_completion_date || null,
      budget: Number(payload.budget) || 0,
      spend: Number(payload.spend) || 0,
      status: payload.status || 'planned',
      related_experiment_id: payload.related_experiment_id || null,
      notes: payload.notes || '',
      created_by: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await this.supabase
        .from('marketing_initiatives')
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_INITIATIVE', data.id, { name: data.name });
        return data as MarketingInitiative;
      }
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingInitiative>('initiatives', orgId);
    this.setLocalMarketingStorage('initiatives', orgId, [newRecord, ...items]);
    await this.logGrowthActivity(orgId, 'CREATE_INITIATIVE', newRecord.id, { name: newRecord.name });
    return newRecord;
  }

  async updateMarketingInitiative(orgId: string, id: string, payload: Partial<MarketingInitiative>): Promise<MarketingInitiative | null> {
    const updates = { ...payload, updated_at: new Date().toISOString() };
    try {
      const { data, error } = await this.supabase
        .from('marketing_initiatives')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'UPDATE_INITIATIVE', id, { name: data.name, status: data.status });
        return data as MarketingInitiative;
      }
    } catch {}

    const items = this.getLocalMarketingStorage<MarketingInitiative>('initiatives', orgId);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.setLocalMarketingStorage('initiatives', orgId, items);
      await this.logGrowthActivity(orgId, 'UPDATE_INITIATIVE', id, { name: items[idx].name, status: items[idx].status });
      return items[idx];
    }
    return null;
  }

  async deleteMarketingInitiative(orgId: string, id: string): Promise<void> {
    try {
      await this.supabase.from('marketing_initiatives').delete().eq('id', id).eq('org_id', orgId);
    } catch {}
    const items = this.getLocalMarketingStorage<MarketingInitiative>('initiatives', orgId).filter(i => i.id !== id);
    this.setLocalMarketingStorage('initiatives', orgId, items);
  }

  // --- Operations Task Linking for Marketing Initiatives ---

  async getInitiativeTasks(orgId: string, initiativeId: string) {
    try {
      const { data, error } = await this.supabase
        .from('internal_tasks')
        .select('*')
        .eq('org_id', orgId)
        .eq('related_entity_type', 'marketing_initiative')
        .eq('related_entity_id', initiativeId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch {}
    const local = this.getLocalMarketingStorage<any>('initiative_tasks', orgId);
    return local.filter((t: any) => t.related_entity_id === initiativeId);
  }

  async createInitiativeTask(orgId: string, initiativeId: string, title: string, priority: string = 'Medium', dueDate?: string) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      const { data, error } = await this.supabase
        .from('internal_tasks')
        .insert({
          org_id: orgId,
          title,
          status: 'To Do',
          priority,
          due_date: dueDate || null,
          area: 'Growth',
          related_entity_type: 'marketing_initiative',
          related_entity_id: initiativeId,
          created_by: user?.id,
        })
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_INITIATIVE_TASK', data.id, { title, initiativeId });
        return data;
      }
    } catch (e) {
      console.warn('[Marketing] Error creating initiative task in Supabase, using local fallback:', e);
    }

    const fallbackTask = {
      id: crypto.randomUUID(),
      org_id: orgId,
      title,
      status: 'To Do',
      priority,
      due_date: dueDate || null,
      area: 'Growth',
      related_entity_type: 'marketing_initiative',
      related_entity_id: initiativeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const local = this.getLocalMarketingStorage<any>('initiative_tasks', orgId);
    this.setLocalMarketingStorage('initiative_tasks', orgId, [fallbackTask, ...local]);
    await this.logGrowthActivity(orgId, 'CREATE_INITIATIVE_TASK', fallbackTask.id, { title, initiativeId });
    return fallbackTask;
  }

  async updateInitiativeTaskStatus(orgId: string, taskId: string, status: string) {
    try {
      const { data, error } = await this.supabase
        .from('internal_tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) return data;
    } catch {}

    const local = this.getLocalMarketingStorage<any>('initiative_tasks', orgId);
    const idx = local.findIndex((t: any) => t.id === taskId);
    if (idx !== -1) {
      local[idx].status = status;
      local[idx].updated_at = new Date().toISOString();
      this.setLocalMarketingStorage('initiative_tasks', orgId, local);
      return local[idx];
    }
    return null;
  }

  // ─── CONTENT SYSTEM METHODS (Phase 3) ───────────────────────────

  async getContentOverviewMetrics(orgId: string): Promise<ContentOverviewMetrics> {
    const metrics: ContentOverviewMetrics = {
      totalContent: 0,
      publishedCount: 0,
      scheduledCount: 0,
      inReviewCount: 0,
      draftCount: 0,
      totalIdeas: 0,
      approvedIdeas: 0,
      convertedIdeas: 0,
      topCategory: 'General',
    };

    try {
      const [items, ideas] = await Promise.all([
        this.getContentItems(orgId),
        this.getContentIdeas(orgId),
      ]);

      metrics.totalContent = items.length;
      metrics.publishedCount = items.filter(i => i.status === 'published').length;
      metrics.scheduledCount = items.filter(i => i.status === 'scheduled').length;
      metrics.inReviewCount = items.filter(i => i.status === 'in_review').length;
      metrics.draftCount = items.filter(i => i.status === 'draft').length;

      metrics.totalIdeas = ideas.length;
      metrics.approvedIdeas = ideas.filter(i => i.status === 'approved').length;
      metrics.convertedIdeas = ideas.filter(i => i.status === 'converted').length;

      // Find top category
      const catCounts: Record<string, number> = {};
      items.forEach(i => {
        if (i.category) {
          catCounts[i.category] = (catCounts[i.category] || 0) + 1;
        }
      });
      const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
      if (topCat) metrics.topCategory = topCat[0];

      return metrics;
    } catch (e) {
      console.warn('[Content] Error calculating overview metrics:', e);
      return metrics;
    }
  }

  async getContentItems(orgId: string, options?: { type?: string; status?: string; search?: string; channelId?: string; limit?: number; offset?: number }): Promise<GrowthContentItem[]> {
    try {
      let query = this.supabase
        .from('growth_content_items')
        .select(`
          *,
          channel:marketing_channels(id, name),
          objective:marketing_objectives(id, title),
          audience:marketing_audiences(id, name)
        `)
        .eq('org_id', orgId)
        .order('updated_at', { ascending: false });

      if (options?.type && options.type !== 'all') {
        query = query.eq('content_type', options.type);
      }
      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }
      if (options?.channelId) {
        query = query.eq('channel_id', options.channelId);
      }
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%`);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          channel_name: item.channel?.name,
          objective_title: item.objective?.title,
          audience_name: item.audience?.name,
        }));
      }
    } catch (e) {
      console.warn('[Content] Remote fetch failed, using local storage:', e);
    }

    // Local fallback
    let items = this.getLocalMarketingStorage<GrowthContentItem>('content_items', orgId);
    if (options?.type && options.type !== 'all') {
      items = items.filter(i => i.content_type === options.type);
    }
    if (options?.status && options.status !== 'all') {
      items = items.filter(i => i.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || (i.summary && i.summary.toLowerCase().includes(q)));
    }
    return items;
  }

  async getContentItemById(orgId: string, id: string): Promise<GrowthContentItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('growth_content_items')
        .select(`
          *,
          channel:marketing_channels(id, name),
          objective:marketing_objectives(id, title),
          audience:marketing_audiences(id, name)
        `)
        .eq('id', id)
        .eq('org_id', orgId)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          channel_name: data.channel?.name,
          objective_title: data.objective?.title,
          audience_name: data.audience?.name,
        };
      }
    } catch {}

    const items = this.getLocalMarketingStorage<GrowthContentItem>('content_items', orgId);
    return items.find(i => i.id === id) || null;
  }

  async createContentItem(orgId: string, payload: Partial<GrowthContentItem>): Promise<GrowthContentItem> {
    const { data: { user } } = await this.supabase.auth.getUser();

    const insertPayload = {
      org_id: orgId,
      title: payload.title || 'Untitled Draft',
      slug: payload.slug || `draft-${Date.now()}`,
      content_type: payload.content_type || 'blog',
      status: payload.status || 'draft',
      summary: payload.summary || null,
      content: payload.content || { type: 'doc', content: [{ type: 'paragraph' }] },
      body_text: payload.body_text || null,
      cover_image: payload.cover_image || null,
      media_urls: payload.media_urls || [],
      category: payload.category || null,
      tags: payload.tags || [],
      channel_id: payload.channel_id || null,
      objective_id: payload.objective_id || null,
      audience_id: payload.audience_id || null,
      campaign_id: payload.campaign_id || null,
      idea_id: payload.idea_id || null,
      author_id: user?.id || null,
      author_name: payload.author_name || user?.user_metadata?.full_name || 'Admin',
      reviewer_id: payload.reviewer_id || null,
      reviewer_name: payload.reviewer_name || null,
      scheduled_for: payload.scheduled_for || null,
      version: 1,
      metadata: payload.metadata || {},
      created_by: user?.id || null,
      updated_by: user?.id || null,
    };

    try {
      const { data, error } = await this.supabase
        .from('growth_content_items')
        .insert(insertPayload)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_CONTENT_ITEM', data.id, {
          title: data.title,
          type: data.content_type,
        });
        return data as GrowthContentItem;
      }
    } catch (e) {
      console.warn('[Content] Error creating content item in Supabase, using local fallback:', e);
    }

    const fallback: GrowthContentItem = {
      ...insertPayload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as GrowthContentItem;

    const local = this.getLocalMarketingStorage<GrowthContentItem>('content_items', orgId);
    this.setLocalMarketingStorage('content_items', orgId, [fallback, ...local]);
    await this.logGrowthActivity(orgId, 'CREATE_CONTENT_ITEM', fallback.id, {
      title: fallback.title,
      type: fallback.content_type,
    });
    return fallback;
  }

  async updateContentItem(orgId: string, id: string, payload: Partial<GrowthContentItem>, options?: { skipTransitionCheck?: boolean }): Promise<GrowthContentItem | null> {
    const { data: { user } } = await this.supabase.auth.getUser();

    // Enforce valid editorial lifecycle transitions when status is updated
    if (payload.status && !options?.skipTransitionCheck) {
      const current = await this.getContentItemById(orgId, id);
      if (current && current.status !== payload.status) {
        if (!isValidContentTransition(current.status, payload.status)) {
          throw new Error(`Invalid status transition from "${current.status}" to "${payload.status}". Must follow editorial workflow: Draft → In Review → Changes Requested / Approved → Scheduled → Published.`);
        }
      }
    }

    const updatePayload = {
      ...payload,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await this.supabase
        .from('growth_content_items')
        .update(updatePayload)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'UPDATE_CONTENT_ITEM', id, {
          title: data.title,
          status: data.status,
        });
        return data as GrowthContentItem;
      }
    } catch (e) {
      console.warn('[Content] Remote update failed, using local storage:', e);
    }

    const local = this.getLocalMarketingStorage<GrowthContentItem>('content_items', orgId);
    const idx = local.findIndex(i => i.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updatePayload } as GrowthContentItem;
      this.setLocalMarketingStorage('content_items', orgId, local);
      await this.logGrowthActivity(orgId, 'UPDATE_CONTENT_ITEM', id, {
        title: local[idx].title,
        status: local[idx].status,
      });
      return local[idx];
    }
    return null;
  }

  async deleteContentItem(orgId: string, id: string): Promise<void> {
    try {
      await this.supabase
        .from('growth_content_items')
        .delete()
        .eq('id', id)
        .eq('org_id', orgId);
    } catch {}

    const local = this.getLocalMarketingStorage<GrowthContentItem>('content_items', orgId);
    this.setLocalMarketingStorage('content_items', orgId, local.filter(i => i.id !== id));
    await this.logGrowthActivity(orgId, 'DELETE_CONTENT_ITEM', id);
  }

  async submitContentForReview(orgId: string, id: string, reviewerName?: string, notes?: string): Promise<GrowthContentItem> {
    const updated = await this.updateContentItem(orgId, id, {
      status: 'in_review',
      submitted_at: new Date().toISOString(),
      reviewer_name: reviewerName || null,
    });

    // Record in reviews table
    await this.recordContentReview(orgId, id, 'submitted', notes || 'Submitted for editorial review', reviewerName);
    return updated!;
  }

  async approveContent(orgId: string, id: string, notes?: string, reviewerName?: string, reviewerId?: string): Promise<GrowthContentItem> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const effectiveReviewerId = reviewerId || user?.id || null;
    const effectiveReviewerName = reviewerName || user?.user_metadata?.full_name || 'Editorial Staff';

    const updated = await this.updateContentItem(orgId, id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      reviewer_id: effectiveReviewerId,
      reviewer_name: effectiveReviewerName,
    });

    await this.recordContentReview(orgId, id, 'approved', notes || 'Approved for scheduling / release', effectiveReviewerName);
    return updated!;
  }

  async rejectContent(orgId: string, id: string, reason: string, reviewerName?: string, reviewerId?: string): Promise<GrowthContentItem> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const effectiveReviewerId = reviewerId || user?.id || null;
    const effectiveReviewerName = reviewerName || user?.user_metadata?.full_name || 'Editorial Staff';

    const updated = await this.updateContentItem(orgId, id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
      reviewer_id: effectiveReviewerId,
      reviewer_name: effectiveReviewerName,
    });

    await this.recordContentReview(orgId, id, 'rejected', reason, effectiveReviewerName);
    return updated!;
  }

  async requestContentChanges(orgId: string, id: string, feedback: string, reviewerName?: string, reviewerId?: string): Promise<GrowthContentItem> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const effectiveReviewerId = reviewerId || user?.id || null;
    const effectiveReviewerName = reviewerName || user?.user_metadata?.full_name || 'Editorial Staff';

    const updated = await this.updateContentItem(orgId, id, {
      status: 'changes_requested',
      rejection_reason: feedback,
      reviewer_id: effectiveReviewerId,
      reviewer_name: effectiveReviewerName,
    });

    await this.recordContentReview(orgId, id, 'changes_requested', feedback, effectiveReviewerName);
    return updated!;
  }

  async scheduleContent(orgId: string, id: string, scheduledFor: string): Promise<GrowthContentItem> {
    const updated = await this.updateContentItem(orgId, id, {
      status: 'scheduled',
      scheduled_for: scheduledFor,
    });

    await this.recordContentReview(orgId, id, 'commented', `Content scheduled for release at ${new Date(scheduledFor).toLocaleString()}`);
    return updated!;
  }

  async publishContent(orgId: string, id: string): Promise<GrowthContentItem> {
    const updated = await this.updateContentItem(orgId, id, {
      status: 'published',
      published_at: new Date().toISOString(),
    });

    await this.recordContentReview(orgId, id, 'commented', 'Content marked published');
    return updated!;
  }

  async archiveContent(orgId: string, id: string): Promise<void> {
    await this.updateContentItem(orgId, id, {
      status: 'archived',
    });
  }

  private async recordContentReview(orgId: string, contentId: string, action: ReviewAction, feedback?: string, reviewerName?: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();

    try {
      await this.supabase.from('growth_content_reviews').insert({
        org_id: orgId,
        content_id: contentId,
        reviewer_id: user?.id || null,
        reviewer_name: reviewerName || user?.user_metadata?.full_name || 'Reviewer',
        action,
        feedback: feedback || null,
      });
    } catch {}

    const reviews = this.getLocalMarketingStorage<GrowthContentReview>('content_reviews', orgId);
    reviews.unshift({
      id: crypto.randomUUID(),
      org_id: orgId,
      content_id: contentId,
      reviewer_id: user?.id || null,
      reviewer_name: reviewerName || user?.user_metadata?.full_name || 'Reviewer',
      action,
      feedback: feedback || null,
      created_at: new Date().toISOString(),
    });
    this.setLocalMarketingStorage('content_reviews', orgId, reviews);
  }

  async getContentReviews(orgId: string, contentId: string): Promise<GrowthContentReview[]> {
    try {
      const { data, error } = await this.supabase
        .from('growth_content_reviews')
        .select('*')
        .eq('content_id', contentId)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (!error && data) return data as GrowthContentReview[];
    } catch {}

    const local = this.getLocalMarketingStorage<GrowthContentReview>('content_reviews', orgId);
    return local.filter(r => r.content_id === contentId);
  }

  async getContentRevisions(orgId: string, contentId: string): Promise<GrowthContentRevision[]> {
    try {
      const { data, error } = await this.supabase
        .from('growth_content_revisions')
        .select('*')
        .eq('content_id', contentId)
        .eq('org_id', orgId)
        .order('version', { ascending: false });

      if (!error && data) return data as GrowthContentRevision[];
    } catch {}

    const local = this.getLocalMarketingStorage<GrowthContentRevision>('content_revisions', orgId);
    return local.filter(r => r.content_id === contentId);
  }

  async createContentRevision(orgId: string, contentId: string, title: string, summary: string | null, content: any, changeSummary?: string): Promise<GrowthContentRevision> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const existing = await this.getContentRevisions(orgId, contentId);
    const nextVersion = existing.length > 0 ? Math.max(...existing.map(r => r.version)) + 1 : 1;

    const revision: GrowthContentRevision = {
      id: crypto.randomUUID(),
      org_id: orgId,
      content_id: contentId,
      version: nextVersion,
      title,
      summary,
      content,
      change_summary: changeSummary || `Version ${nextVersion} saved`,
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
    };

    try {
      await this.supabase.from('growth_content_revisions').insert({
        org_id: orgId,
        content_id: contentId,
        version: revision.version,
        title: revision.title,
        summary: revision.summary,
        content: revision.content,
        change_summary: revision.change_summary,
        created_by: revision.created_by,
      });
    } catch {}

    const local = this.getLocalMarketingStorage<GrowthContentRevision>('content_revisions', orgId);
    this.setLocalMarketingStorage('content_revisions', orgId, [revision, ...local]);
    return revision;
  }

  async restoreContentRevision(orgId: string, contentId: string, version: number): Promise<GrowthContentItem | null> {
    const revisions = await this.getContentRevisions(orgId, contentId);
    const targetRev = revisions.find(r => r.version === version);
    if (!targetRev) throw new Error(`Revision version ${version} not found`);

    const updated = await this.updateContentItem(orgId, contentId, {
      title: targetRev.title,
      summary: targetRev.summary,
      content: targetRev.content,
    }, { skipTransitionCheck: true });

    await this.createContentRevision(
      orgId,
      contentId,
      targetRev.title,
      targetRev.summary,
      targetRev.content,
      `Restored from Version ${version}`
    );

    await this.logGrowthActivity(orgId, 'RESTORE_CONTENT_REVISION', contentId, {
      version,
      title: targetRev.title,
    });

    return updated;
  }

  async getContentPerformanceMetrics(orgId: string): Promise<ContentPerformanceMetrics> {
    const [items, channels] = await Promise.all([
      this.getContentItems(orgId),
      this.getMarketingChannels(orgId)
    ]);

    const publishedItems = items.filter(i => i.status === 'published');
    const channelCounts: Record<string, number> = {};
    const typeCounts: Record<ContentType, number> = {
      blog: 0,
      article: 0,
      social: 0,
      newsletter: 0,
      case_study: 0,
      whitepaper: 0,
      landing_page: 0,
      other: 0,
    };

    items.forEach(i => {
      if (i.content_type && typeCounts[i.content_type] !== undefined) {
        typeCounts[i.content_type]++;
      }
      if (i.status === 'published' && i.channel_id) {
        channelCounts[i.channel_id] = (channelCounts[i.channel_id] || 0) + 1;
      }
    });

    const channelMap = new Map(channels.map(c => [c.id, c.name]));
    const publishedByChannel = Object.entries(channelCounts).map(([chId, count]) => ({
      channelId: chId,
      channelName: channelMap.get(chId) || 'Unassigned Channel',
      count,
    }));

    const typeLabels: Record<ContentType, string> = {
      blog: 'Blog Posts',
      article: 'Articles & Guides',
      social: 'Social Drafts',
      newsletter: 'Newsletters',
      case_study: 'Case Studies',
      whitepaper: 'Whitepapers',
      landing_page: 'Landing Pages',
      other: 'Other Documents',
    };

    const byContentType = (Object.keys(typeCounts) as ContentType[]).map(type => ({
      type,
      label: typeLabels[type] || type,
      count: typeCounts[type],
    }));

    return {
      totalPublished: publishedItems.length,
      cmsPublishedCount: items.filter(i => Boolean(i.cms_node_id)).length,
      publishedByChannel,
      byContentType,
      telemetryConnected: false,
      telemetryNotice: 'External engagement telemetry (impressions, clicks, CTR, conversions) is currently unavailable because live analytics tracking pixels and webhook streams have not been connected for this tenant.',
    };
  }

  // ─── CMS INTEGRATION ───────────────────────────────────────────

  async publishContentToCMS(orgId: string, contentId: string): Promise<{ cmsNodeId: string }> {
    const item = await this.getContentItemById(orgId, contentId);
    if (!item) throw new Error('Content item not found');

    const { data: { user } } = await this.supabase.auth.getUser();

    // If already linked to a CMS node, update it
    if (item.cms_node_id) {
      await this.updateNode(item.cms_node_id, {
        title: item.title,
        slug: item.slug,
        excerpt: item.summary || '',
        cover_image: item.cover_image || '',
        content: item.content,
        status: 'Published',
        category: item.category,
        tags: item.tags,
      });

      await this.updateContentItem(orgId, contentId, {
        status: 'published',
        published_at: new Date().toISOString(),
      });

      await this.logGrowthActivity(orgId, 'PUBLISH_CONTENT_TO_CMS', contentId, {
        title: item.title,
        cmsNodeId: item.cms_node_id,
        action: 'updated'
      });

      return { cmsNodeId: item.cms_node_id };
    }

    // Resolve 'insights' content type from CMS
    let typeId = '';
    try {
      const { data: typeData } = await this.supabase
        .from('cms_content_types')
        .select('id')
        .eq('org_id', orgId)
        .eq('slug', 'insights')
        .maybeSingle();

      if (typeData?.id) {
        typeId = typeData.id;
      } else {
        const { data: anyType } = await this.supabase
          .from('cms_content_types')
          .select('id')
          .eq('org_id', orgId)
          .limit(1)
          .maybeSingle();
        if (anyType?.id) typeId = anyType.id;
      }
    } catch {}

    // Create node via standard CMS method
    const newNode = await this.createNode({
      type_id: typeId,
      title: item.title,
      slug: item.slug,
      excerpt: item.summary || '',
      cover_image: item.cover_image || '',
      content: item.content,
      status: 'Published',
      category: item.category,
      tags: item.tags,
      author_id: user?.id || item.author_id,
    });

    const cmsNodeId = newNode.id;

    // Link back to Growth content item
    await this.updateContentItem(orgId, contentId, {
      cms_node_id: cmsNodeId,
      status: 'published',
      published_at: new Date().toISOString(),
    });

    await this.logGrowthActivity(orgId, 'PUBLISH_CONTENT_TO_CMS', contentId, {
      title: item.title,
      cmsNodeId,
      action: 'created'
    });

    return { cmsNodeId };
  }

  // ─── IDEAS MANAGEMENT ──────────────────────────────────────────

  async getContentIdeas(orgId: string, options?: { status?: string; priority?: string; search?: string }): Promise<GrowthContentIdea[]> {
    try {
      let query = this.supabase
        .from('growth_content_ideas')
        .select(`
          *,
          objective:marketing_objectives(id, title),
          audience:marketing_audiences(id, name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }
      if (options?.priority && options.priority !== 'all') {
        query = query.eq('priority', options.priority);
      }
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map((idea: any) => ({
          ...idea,
          objective_title: idea.objective?.title,
          audience_name: idea.audience?.name,
        }));
      }
    } catch {}

    let ideas = this.getLocalMarketingStorage<GrowthContentIdea>('content_ideas', orgId);
    if (options?.status && options.status !== 'all') {
      ideas = ideas.filter(i => i.status === options.status);
    }
    if (options?.priority && options.priority !== 'all') {
      ideas = ideas.filter(i => i.priority === options.priority);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      ideas = ideas.filter(i => i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
    }
    return ideas;
  }

  async createContentIdea(orgId: string, payload: Partial<GrowthContentIdea>): Promise<GrowthContentIdea> {
    const { data: { user } } = await this.supabase.auth.getUser();

    const insertPayload = {
      org_id: orgId,
      title: payload.title || 'Untitled Idea',
      description: payload.description || null,
      notes: payload.notes || null,
      category: payload.category || null,
      tags: payload.tags || [],
      target_channels: payload.target_channels || [],
      status: payload.status || 'new',
      priority: payload.priority || 'medium',
      objective_id: payload.objective_id || null,
      audience_id: payload.audience_id || null,
      author_name: payload.author_name || user?.user_metadata?.full_name || 'Contributor',
      created_by: user?.id || null,
    };

    try {
      const { data, error } = await this.supabase
        .from('growth_content_ideas')
        .insert(insertPayload)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'CREATE_CONTENT_IDEA', data.id, { title: data.title });
        return data as GrowthContentIdea;
      }
    } catch (e) {
      console.warn('[Content] Error creating idea in Supabase, using local fallback:', e);
    }

    const fallback: GrowthContentIdea = {
      ...insertPayload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as GrowthContentIdea;

    const local = this.getLocalMarketingStorage<GrowthContentIdea>('content_ideas', orgId);
    this.setLocalMarketingStorage('content_ideas', orgId, [fallback, ...local]);
    await this.logGrowthActivity(orgId, 'CREATE_CONTENT_IDEA', fallback.id, { title: fallback.title });
    return fallback;
  }

  async updateContentIdea(orgId: string, id: string, payload: Partial<GrowthContentIdea>): Promise<GrowthContentIdea | null> {
    const updatePayload = {
      ...payload,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await this.supabase
        .from('growth_content_ideas')
        .update(updatePayload)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (!error && data) {
        await this.logGrowthActivity(orgId, 'UPDATE_CONTENT_IDEA', id, { title: data.title, status: data.status });
        return data as GrowthContentIdea;
      }
    } catch {}

    const local = this.getLocalMarketingStorage<GrowthContentIdea>('content_ideas', orgId);
    const idx = local.findIndex(i => i.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updatePayload } as GrowthContentIdea;
      this.setLocalMarketingStorage('content_ideas', orgId, local);
      return local[idx];
    }
    return null;
  }

  async deleteContentIdea(orgId: string, id: string): Promise<void> {
    try {
      await this.supabase
        .from('growth_content_ideas')
        .delete()
        .eq('id', id)
        .eq('org_id', orgId);
    } catch {}

    const local = this.getLocalMarketingStorage<GrowthContentIdea>('content_ideas', orgId);
    this.setLocalMarketingStorage('content_ideas', orgId, local.filter(i => i.id !== id));
    await this.logGrowthActivity(orgId, 'DELETE_CONTENT_IDEA', id);
  }

  async convertIdeaToDraft(orgId: string, ideaId: string, contentType: ContentType = 'blog'): Promise<{ contentItem: GrowthContentItem; idea: GrowthContentIdea }> {
    const ideas = await this.getContentIdeas(orgId);
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) throw new Error('Idea not found');

    const slug = idea.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const contentItem = await this.createContentItem(orgId, {
      title: idea.title,
      slug,
      content_type: contentType,
      status: 'draft',
      summary: idea.description,
      category: idea.category,
      tags: idea.tags,
      objective_id: idea.objective_id,
      audience_id: idea.audience_id,
      idea_id: idea.id,
      metadata: { original_idea_notes: idea.notes, target_channels: idea.target_channels }
    });

    const updatedIdea = await this.updateContentIdea(orgId, ideaId, {
      status: 'converted',
      converted_content_id: contentItem.id,
    });

    await this.logGrowthActivity(orgId, 'CONVERT_IDEA_TO_DRAFT', ideaId, {
      ideaTitle: idea.title,
      contentId: contentItem.id,
      contentType
    });

    return { contentItem, idea: updatedIdea || idea };
  }
}

let instance: OCEClient | null = null;
export function getOCEClient(): OCEClient {
  if (!instance) {
    instance = new OCEClient({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '',
    });
  }
  return instance;
}
