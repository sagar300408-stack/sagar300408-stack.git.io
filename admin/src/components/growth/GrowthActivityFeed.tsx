import { Activity, Clock } from 'lucide-react';
import type { GrowthActivityItem } from '../../lib/sdk';
import GrowthEmptyState from './GrowthEmptyState';

export interface GrowthActivityFeedProps {
  activities: GrowthActivityItem[];
  loading?: boolean;
}

export default function GrowthActivityFeed({
  activities,
  loading = false,
}: GrowthActivityFeedProps) {
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts || 'recently';
      const now = new Date();
      const diffM = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diffM < 1) return 'just now';
      if (diffM < 60) return `${diffM}m ago`;
      if (diffM < 1440) return `${Math.floor(diffM / 60)}h ago`;
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return ts || 'recently';
    }
  };

  const formatAction = (action: string, entityType: string) => {
    const formattedAction = action.replace(/_/g, ' ').toLowerCase();
    const formattedEntity = entityType.replace(/_/g, ' ');
    return `${formattedAction} · ${formattedEntity}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-gray-500" />
          <h2 className="font-semibold text-gray-900 text-sm">Growth Activity</h2>
        </div>
        {activities.length > 0 && (
          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
            {activities.length} recent
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#244235]" />
          <p className="text-xs">Loading activity stream…</p>
        </div>
      ) : activities.length === 0 ? (
        <GrowthEmptyState
          icon={Activity}
          title="No growth activities recorded yet"
          description="Real-time events from marketing initiatives, content updates, campaign launches, and social publishing will appear here as they occur."
        />
      ) : (
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {activities.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-[#244235] mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 capitalize truncate">
                  {formatAction(item.action, item.entity_type)}
                </p>
                {item.details?.title && (
                  <p className="text-[11px] text-gray-600 truncate mt-0.5">
                    {item.details.title}
                  </p>
                )}
                {item.details?.name && !item.details?.title && (
                  <p className="text-[11px] text-gray-600 truncate mt-0.5">
                    {item.details.name}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                  <Clock size={10} />
                  <span>{formatTime(item.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
