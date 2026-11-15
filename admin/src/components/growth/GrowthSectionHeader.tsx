import type { ReactNode } from 'react';

export interface GrowthSectionHeaderProps {
  category?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function GrowthSectionHeader({
  category,
  title,
  description,
  action,
}: GrowthSectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <div>
        {category && (
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            {category}
          </p>
        )}
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
