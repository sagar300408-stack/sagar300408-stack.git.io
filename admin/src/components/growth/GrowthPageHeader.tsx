import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface GrowthPageHeaderProps {
  title: string;
  description: string;
  breadcrumb?: { label: string; to?: string }[];
  badge?: ReactNode;
  actions?: ReactNode;
}

export default function GrowthPageHeader({
  title,
  description,
  breadcrumb,
  badge,
  actions,
}: GrowthPageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5" aria-label="Breadcrumb">
              {breadcrumb.map((crumb, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <div key={crumb.label} className="flex items-center gap-1.5">
                    {crumb.to && !isLast ? (
                      <NavLink
                        to={crumb.to}
                        className="hover:text-[#244235] transition-colors"
                      >
                        {crumb.label}
                      </NavLink>
                    ) : (
                      <span className={isLast ? 'text-gray-700 font-medium' : ''}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && <ChevronRight size={12} className="text-gray-300" />}
                  </div>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
