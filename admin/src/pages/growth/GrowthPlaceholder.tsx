import type { ComponentType, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import { GrowthPageHeader, GrowthStatusBadge, type GrowthBadgeStatus } from '../../components/growth';

export interface PlannedFeature {
  title: string;
  description: string;
}

export interface RelatedAction {
  label: string;
  to: string;
  description?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
}

export interface GrowthPlaceholderProps {
  id: string;
  title: string;
  subtitle: string;
  phase: string;
  status?: GrowthBadgeStatus;
  statusLabel?: string;
  icon: ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  accentColor?: string;
  objective: string;
  plannedFeatures: PlannedFeature[];
  relatedActions?: RelatedAction[];
  extraContent?: ReactNode;
}

export default function GrowthPlaceholder({
  title,
  subtitle,
  phase,
  status = 'planned',
  statusLabel,
  icon: Icon,
  accentColor = '#244235',
  objective,
  plannedFeatures,
  relatedActions = [],
  extraContent,
}: GrowthPlaceholderProps) {
  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col">
      {/* Page Header with breadcrumbs */}
      <GrowthPageHeader
        title={title}
        description={subtitle}
        breadcrumb={[
          { label: 'Growth', to: '/growth' },
          { label: title },
        ]}
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 uppercase tracking-wide">
              {phase}
            </span>
            <GrowthStatusBadge status={status} label={statusLabel} />
          </div>
        }
        actions={
          <NavLink
            to="/growth"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Growth Overview
          </NavLink>
        }
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Module Scope Banner */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}12` }}
            >
              <Icon size={24} style={{ color: accentColor }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Module Scope & Architecture
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {title} Subsystem
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                {objective}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Planned Capabilities & Related Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Planned Features (2 columns wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100">
                <Layers size={16} className="text-[#244235]" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Planned Architecture & Capabilities
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plannedFeatures.map((feat) => (
                  <div
                    key={feat.title}
                    className="p-4 rounded-lg border border-gray-100 bg-[#fbfbfa] hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={15}
                        className="text-[#244235] mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-1">
                          {feat.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Phase Status: Foundational architecture ready</span>
                <span className="font-mono text-[11px] text-gray-400">Target: {phase}</span>
              </div>
            </div>

            {extraContent && <div>{extraContent}</div>}
          </div>

          {/* Right Column: Existing Integrations & Actions */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Working Foundation Actions
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                While this specific Growth view is being constructed, you can use existing Control Center infrastructure:
              </p>

              {relatedActions.length > 0 ? (
                <div className="space-y-2.5">
                  {relatedActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <NavLink
                        key={action.label}
                        to={action.to}
                        className="block p-3 rounded-lg border border-gray-100 hover:border-[#244235]/30 hover:bg-[#244235]/5 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {ActionIcon && (
                              <ActionIcon size={14} className="text-gray-400 group-hover:text-[#244235]" />
                            )}
                            <span className="text-xs font-medium text-gray-800 group-hover:text-[#244235]">
                              {action.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 group-hover:text-[#244235]">→</span>
                        </div>
                        {action.description && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            {action.description}
                          </p>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ) : (
                <NavLink
                  to="/growth"
                  className="block text-center p-3 rounded-lg border border-gray-200 text-xs font-medium text-[#244235] hover:bg-gray-50"
                >
                  Return to Growth Overview
                </NavLink>
              )}
            </div>

            {/* Architectural Guard Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-700 block mb-1">
                Zero-Fabrication Guarantee
              </span>
              Placeholder states do not generate mock or synthetic data. When this module goes live in its subsequent phase, it will connect directly to production databases and analytics channels.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
