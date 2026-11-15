export type GrowthBadgeStatus = 'foundation' | 'active' | 'planned' | 'coming_soon' | 'beta';

export interface GrowthStatusBadgeProps {
  status: GrowthBadgeStatus;
  label?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<GrowthBadgeStatus, { defaultLabel: string; className: string }> = {
  foundation: {
    defaultLabel: 'Foundation Active',
    className: 'bg-[#244235]/10 text-[#244235] border-[#244235]/20',
  },
  active: {
    defaultLabel: 'Live',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  planned: {
    defaultLabel: 'Planned',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  coming_soon: {
    defaultLabel: 'Coming Soon',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  beta: {
    defaultLabel: 'Beta',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

export default function GrowthStatusBadge({
  status,
  label,
  size = 'sm',
}: GrowthStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.coming_soon;
  const displayLabel = label || config.defaultLabel;

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-wide ${config.className} ${sizeClasses}`}
    >
      {displayLabel}
    </span>
  );
}
