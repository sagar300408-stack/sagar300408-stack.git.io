import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Target, Share2, Users,
  FlaskConical, Rocket,
} from 'lucide-react';

const TABS = [
  { name: 'Overview', path: '/growth/marketing', icon: LayoutDashboard, end: true },
  { name: 'Strategy & Planning', path: '/growth/marketing/strategy', icon: Target },
  { name: 'Acquisition Channels', path: '/growth/marketing/channels', icon: Share2 },
  { name: 'Lead Generation', path: '/growth/marketing/leads', icon: Users },
  { name: 'Growth Experiments', path: '/growth/marketing/experiments', icon: FlaskConical },
  { name: 'Marketing Initiatives', path: '/growth/marketing/initiatives', icon: Rocket },
];

export default function MarketingNav() {
  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `flex items-center gap-2 py-3 px-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#244235] text-[#244235] font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                }`
              }
            >
              <Icon size={14} />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
