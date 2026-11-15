import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import GrowthStatusBadge, { type GrowthBadgeStatus } from './GrowthStatusBadge';

export interface GrowthModuleCardProps {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  to: string;
  status: GrowthBadgeStatus;
  statusLabel?: string;
  color?: string;
  phaseLabel?: string;
}

export default function GrowthModuleCard({
  name,
  description,
  icon: Icon,
  to,
  status,
  statusLabel,
  color = '#244235',
  phaseLabel,
}: GrowthModuleCardProps) {
  return (
    <NavLink
      to={to}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-150 flex flex-col justify-between group h-full"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${color}12` }}
          >
            <Icon size={19} style={{ color }} strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {phaseLabel && (
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {phaseLabel}
              </span>
            )}
            <GrowthStatusBadge status={status} label={statusLabel} />
          </div>
        </div>

        <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#244235] transition-colors">
          {name}
        </h3>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500 group-hover:text-[#244235] transition-colors">
        <span>Open module</span>
        <ArrowRight
          size={14}
          className="transform transition-transform group-hover:translate-x-1"
        />
      </div>
    </NavLink>
  );
}
