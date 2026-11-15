import type { ComponentType, ReactNode } from 'react';

export interface GrowthEmptyStateProps {
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export default function GrowthEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: GrowthEmptyStateProps) {
  return (
    <div
      className={`text-center flex flex-col items-center justify-center ${
        compact ? 'py-8 px-4' : 'py-12 px-6'
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3 shadow-xs">
        <Icon size={22} strokeWidth={1.5} className="text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800 mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
