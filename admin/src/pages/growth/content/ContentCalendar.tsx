import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Plus, Clock, CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useToast } from '../../../components/Layout/ToastProvider';
import {
  getOCEClient,
  type GrowthContentItem,
  type ContentType,
  type MarketingChannel
} from '../../../lib/sdk';
import {
  GrowthPageHeader,
  ContentNav,
  ContentEditorModal
} from '../../../components/growth';

const TYPE_COLORS: Record<ContentType, { bg: string; text: string; border: string }> = {
  blog: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  article: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  social: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  newsletter: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  case_study: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  whitepaper: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

export default function ContentCalendar() {
  const { systemStatus } = useAuth();
  const orgId = systemStatus?.organization?.id;
  const { showToast } = useToast();
  const sdk = getOCEClient();

  const [items, setItems] = useState<GrowthContentItem[]>([]);
  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modal / Drawer
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrowthContentItem | null>(null);

  // Reschedule Modal
  const [rescheduleItem, setRescheduleItem] = useState<GrowthContentItem | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [allItems, allChannels] = await Promise.all([
        sdk.getContentItems(orgId),
        sdk.getMarketingChannels(orgId)
      ]);
      setItems(allItems);
      setChannels(allChannels);
    } catch (e: any) {
      console.warn('[ContentCalendar] Error loading items:', e);
      showToast(e.message || 'Failed to load calendar items', 'error');
    } finally {
      setLoading(false);
    }
  }, [orgId, sdk, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedChannel !== 'all' && item.channel_id !== selectedChannel) return false;
      if (selectedType !== 'all' && item.content_type !== selectedType) return false;
      // Must have either scheduled_for or published_at or created_at to place on calendar
      return Boolean(item.scheduled_for || item.published_at);
    });
  }, [items, selectedChannel, selectedType]);

  // Month days builder
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Preceding month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date: d, isCurrentMonth: false, key: d.toISOString().split('T')[0] });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, key: d.toISOString().split('T')[0] });
    }

    // Following month padding (total grid cells should be 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, key: d.toISOString().split('T')[0] });
    }

    return days;
  }, [year, month]);

  // Week days builder
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === month,
        key: d.toISOString().split('T')[0],
      });
    }
    return days;
  }, [currentDate, month]);

  // Map items to date keys (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map: Record<string, GrowthContentItem[]> = {};
    filteredItems.forEach((item) => {
      const targetDate = item.scheduled_for || item.published_at;
      if (!targetDate) return;
      const key = new Date(targetDate).toISOString().split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [filteredItems]);

  // Reschedule handler
  const handleOpenReschedule = (item: GrowthContentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRescheduleItem(item);
    setNewScheduleDate(
      item.scheduled_for ? new Date(item.scheduled_for).toISOString().slice(0, 16) : ''
    );
  };

  const handleSaveReschedule = async () => {
    if (!orgId || !rescheduleItem || !newScheduleDate) return;
    setRescheduling(true);
    try {
      await sdk.scheduleContent(orgId, rescheduleItem.id, new Date(newScheduleDate).toISOString());
      showToast('Publication rescheduled', 'success');
      setRescheduleItem(null);
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to reschedule', 'error');
    } finally {
      setRescheduling(false);
    }
  };

  // Check if today
  const todayKey = new Date().toISOString().split('T')[0];

  // Scheduled count this month
  const scheduledThisMonth = filteredItems.filter((i) => {
    const d = i.scheduled_for ? new Date(i.scheduled_for) : null;
    return d && d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa]">
      <GrowthPageHeader
        title="Editorial Calendar"
        description="Orchestrate publication timelines, sync multi-channel release cadences, and reschedule editorial pipeline items."
        badge={
          <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full border border-blue-200">
            {scheduledThisMonth} scheduled this month
          </span>
        }
        actions={
          <button
            onClick={() => {
              setEditingItem(null);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#244235] text-white hover:bg-[#1a3026] rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Schedule Content</span>
          </button>
        }
      />

      <ContentNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-sm font-semibold text-gray-900 min-w-[150px] text-center">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={handleNext}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          {/* Filters & View Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700"
              >
                <option value="all">All Formats</option>
                <option value="blog">Blog Posts</option>
                <option value="article">Articles</option>
                <option value="social">Social Posts</option>
                <option value="newsletter">Newsletters</option>
                <option value="case_study">Case Studies</option>
              </select>

              {channels.length > 0 && (
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700"
                >
                  <option value="all">All Channels</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  viewMode === 'month' ? 'bg-white shadow-xs font-medium text-gray-900' : 'text-gray-500'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  viewMode === 'week' ? 'bg-white shadow-xs font-medium text-gray-900' : 'text-gray-500'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-xs text-gray-400">
            Loading editorial calendar...
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-[11px] font-semibold text-gray-500 uppercase py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className={`grid grid-cols-7 divide-x divide-y divide-gray-100 ${viewMode === 'week' ? 'min-h-[450px]' : 'min-h-[600px]'}`}>
            {(viewMode === 'month' ? monthDays : weekDays).map((day) => {
              const dayItems = itemsByDate[day.key] || [];
              const isToday = day.key === todayKey;

              return (
                <div
                  key={day.key}
                  className={`p-2 transition-colors flex flex-col justify-between ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50 text-gray-400'
                  } ${isToday ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-[#0ea5e9] text-white font-bold'
                          : day.isCurrentMonth
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>

                    {dayItems.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {dayItems.length} {dayItems.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>

                  {/* Items for this date */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-28 scrollbar-none">
                    {dayItems.map((item) => {
                      const colorCfg = TYPE_COLORS[item.content_type] || TYPE_COLORS.other;
                      const isPublished = item.status === 'published';

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditorOpen(true);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] cursor-pointer hover:shadow-xs transition-all ${colorCfg.bg} ${colorCfg.border} group`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`font-semibold truncate ${colorCfg.text}`}>
                              {item.title}
                            </span>
                            {isPublished ? (
                              <CheckCircle2 size={10} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Clock size={10} className="text-blue-500 shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-500">
                            <span className="capitalize">{item.content_type.replace('_', ' ')}</span>
                            <button
                              onClick={(e) => handleOpenReschedule(item, e)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-800 transition-opacity"
                              title="Reschedule"
                            >
                              <CalendarIcon size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

      {/* Reschedule Modal */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Reschedule Release</h3>
              <button
                onClick={() => setRescheduleItem(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Update release date and time for: <br />
              <span className="font-semibold text-gray-900">{rescheduleItem.title}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Publication Date & Time
              </label>
              <input
                type="datetime-local"
                value={newScheduleDate}
                onChange={(e) => setNewScheduleDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleItem(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                disabled={rescheduling || !newScheduleDate}
                className="px-3 py-1.5 bg-[#244235] text-white hover:bg-[#1a3026] disabled:opacity-50 rounded-lg text-xs font-medium transition-colors"
              >
                {rescheduling ? 'Saving...' : 'Update Schedule'}
              </button>
            </div>
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
