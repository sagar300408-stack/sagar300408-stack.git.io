import { useState, useEffect, useCallback } from 'react';
import {
  Search, Eye,
  ShieldCheck, FileText, Check, X, RotateCcw, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useToast } from '../../../components/Layout/ToastProvider';
import {
  getOCEClient,
  type GrowthContentItem,
  type GrowthContentReview
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  ContentNav,
  ContentEditorModal,
  GrowthEmptyState
} from '../../../components/growth';

export default function ContentApprovals() {
  const { systemStatus, role, user } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const isAuthorizedReviewer = role === 'owner' || role === 'admin';
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [items, setItems] = useState<GrowthContentItem[]>([]);
  const [reviews, setReviews] = useState<GrowthContentReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'pending' | 'changes' | 'approved' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Action Modal
  const [reviewingItem, setReviewingItem] = useState<GrowthContentItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'request_changes' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Full Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrowthContentItem | null>(null);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const allItems = await sdk.getContentItems(orgId);
      setItems(allItems);

      // Fetch reviews for items if in history tab or to show history
      const reviewPromises = allItems.slice(0, 20).map((i) => sdk.getContentReviews(orgId, i.id));
      const nestedReviews = await Promise.all(reviewPromises);
      const flattened = nestedReviews.flat().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReviews(flattened);
    } catch (e: any) {
      console.warn('[ContentApprovals] Error loading review data:', e);
      showToast(e.message || 'Failed to load approval queues', 'error');
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Review Submission
  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !reviewingItem) return;

    if (!isAuthorizedReviewer) {
      showToast('Unauthorized: Editorial approvals require Owner or Admin permissions.', 'error');
      return;
    }

    setSubmittingReview(true);
    const reviewerName = user?.user_metadata?.full_name || (role === 'owner' ? 'Organization Owner' : 'Lead Editor');
    const reviewerId = user?.id;

    try {
      if (reviewAction === 'approve') {
        await sdk.approveContent(orgId, reviewingItem.id, reviewNotes.trim() || undefined, reviewerName, reviewerId);
        showToast(`Approved "${reviewingItem.title}"`, 'success');
      } else if (reviewAction === 'request_changes') {
        if (!reviewNotes.trim()) {
          showToast('Please provide feedback notes explaining requested changes', 'error');
          setSubmittingReview(false);
          return;
        }
        await sdk.requestContentChanges(orgId, reviewingItem.id, reviewNotes.trim(), reviewerName, reviewerId);
        showToast(`Requested changes on "${reviewingItem.title}"`, 'success');
      } else if (reviewAction === 'reject') {
        if (!reviewNotes.trim()) {
          showToast('Please provide a reason for rejection', 'error');
          setSubmittingReview(false);
          return;
        }
        await sdk.rejectContent(orgId, reviewingItem.id, reviewNotes.trim(), reviewerName, reviewerId);
        showToast(`Rejected "${reviewingItem.title}"`, 'success');
      }

      setReviewingItem(null);
      setReviewNotes('');
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to submit review decision', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter items based on active tab
  const pendingItems = items.filter((i) => i.status === 'in_review');
  const changesItems = items.filter((i) => i.status === 'changes_requested');
  const approvedItems = items.filter((i) => i.status === 'approved');

  const displayedItems =
    activeTab === 'pending'
      ? pendingItems
      : activeTab === 'changes'
      ? changesItems
      : activeTab === 'approved'
      ? approvedItems
      : [];

  const filteredDisplay = displayedItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      const matchAuthor = item.author_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchAuthor) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
      <GrowthPageHeader
        title="Editorial Approval Workflow"
        description="Review submitted drafts, request revisions with precise notes, approve releases, and audit editorial feedback history."
      />

      <ContentNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {!isAuthorizedReviewer && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>Read-Only Mode:</strong> Your user role ({role || 'member'}) allows inspecting editorial submissions, but submitting review decisions requires Organization Owner or Admin privileges.
            </span>
          </div>
        )}

        {/* Metric summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Awaiting Review
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-amber-600">{pendingItems.length}</span>
              <span className="text-xs text-gray-400">items in queue</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Revisions Requested
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-orange-600">{changesItems.length}</span>
              <span className="text-xs text-gray-400">returned to author</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Editorial Approved
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-emerald-600">{approvedItems.length}</span>
              <span className="text-xs text-gray-400">ready for schedule/CMS</span>
            </div>
          </div>
        </div>

        {/* Tab Selector & Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'pending' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Pending Review ({pendingItems.length})
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'changes' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Changes Requested ({changesItems.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'approved' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Approved ({approvedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'history' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Decision History ({reviews.length})
            </button>
          </div>

          {activeTab !== 'history' && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queue by title, author..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:bg-white"
              />
            </div>
          )}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading editorial queue...</div>
        ) : activeTab === 'history' ? (
          /* Decision History Log */
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No review decisions logged yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {reviews.map((rev) => {
                  const item = items.find((i) => i.id === rev.content_id);

                  return (
                    <div key={rev.id} className="p-4 flex items-start gap-4 hover:bg-gray-50/60 transition-colors">
                      <div className="mt-0.5">
                        {rev.action === 'approved' && (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Check size={16} />
                          </div>
                        )}
                        {rev.action === 'changes_requested' && (
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                            <RotateCcw size={15} />
                          </div>
                        )}
                        {rev.action === 'rejected' && (
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                            <X size={16} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-900">
                            {item?.title || 'Unknown Content Asset'}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(rev.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-xs text-gray-600">
                          <span className="font-medium text-gray-800 capitalize">
                            {rev.action.replace('_', ' ')}
                          </span>
                          {' by '}
                          <span className="text-gray-700">{rev.reviewer_name || 'Editorial Staff'}</span>
                        </div>

                        {rev.feedback && (
                          <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600 mt-1 border border-gray-100 font-sans">
                            {rev.feedback}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : filteredDisplay.length === 0 ? (
          <GrowthEmptyState
            icon={ShieldCheck}
            title={
              activeTab === 'pending'
                ? 'No Pending Submissions'
                : activeTab === 'changes'
                ? 'No Revisions in Progress'
                : 'No Approved Assets'
            }
            description={
              activeTab === 'pending'
                ? 'All submitted content has been reviewed and cleared.'
                : activeTab === 'changes'
                ? 'No content currently requires author revisions.'
                : 'Approved articles and publications ready for scheduling will appear here.'
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredDisplay.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-xs p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                    <FileText size={20} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        {item.content_type.replace('_', ' ')}
                      </span>
                      {item.rejection_reason && (
                        <span className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                          Feedback notes attached
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditorOpen(true);
                      }}
                      className="text-sm font-semibold text-gray-900 hover:text-[#0ea5e9] cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="text-xs text-gray-500 line-clamp-2 max-w-xl">
                        {item.summary}
                      </p>
                    )}

                    {item.rejection_reason && (
                      <div className="mt-2 text-xs bg-amber-50/70 border border-amber-200 text-amber-900 p-2.5 rounded-lg">
                        <span className="font-semibold block mb-0.5 text-[11px]">Latest Editorial Notes:</span>
                        {item.rejection_reason}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                      {item.author_name && <span>Author: {item.author_name}</span>}
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsEditorOpen(true);
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!isAuthorizedReviewer) {
                        showToast('Only organization owners and administrators can submit review decisions.', 'error');
                        return;
                      }
                      setReviewingItem(item);
                      setReviewAction('approve');
                      setReviewNotes('');
                    }}
                    disabled={!isAuthorizedReviewer}
                    title={isAuthorizedReviewer ? 'Submit review decision' : 'Requires Owner or Admin role'}
                    className="px-3.5 py-1.5 bg-[#244235] text-white hover:bg-[#1a3026] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} />
                    <span>Review Decision</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Action Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#0ea5e9]" size={18} />
                <h3 className="text-sm font-semibold text-gray-900">
                  Editorial Decision: {reviewingItem.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewingItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitDecision} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approve')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      reviewAction === 'approve'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Check size={14} />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('request_changes')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      reviewAction === 'request_changes'
                        ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <RotateCcw size={13} />
                    <span>Request Changes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('reject')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      reviewAction === 'reject'
                        ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reviewer Notes & Feedback {reviewAction !== 'approve' ? '*' : '(Optional)'}
                </label>
                <textarea
                  rows={4}
                  required={reviewAction !== 'approve'}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'approve'
                      ? 'Optional praise, release notes, or scheduling recommendations...'
                      : 'Provide clear, constructive guidance on what needs to be improved or corrected before approval...'
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`px-4 py-2 text-white rounded-lg text-xs font-medium transition-colors shadow-xs ${
                    reviewAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : reviewAction === 'request_changes'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingReview ? 'Submitting...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && orgId && (
        <ContentEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSaved={() => {
            setIsEditorOpen(false);
            loadData();
          }}
          orgId={orgId}
          item={editingItem}
          defaultType="blog"
        />
      )}
    </div>
  );
}
