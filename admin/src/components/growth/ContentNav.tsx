import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Library, Lightbulb, BookOpen,
  Share2, Mail, Calendar, CheckCircle2,
} from 'lucide-react';

const TABS = [
  { name: 'Overview', path: '/growth/content', icon: LayoutDashboard, end: true },
  { name: 'Content Library', path: '/growth/content/library', icon: Library },
  { name: 'Ideas Backlog', path: '/growth/content/ideas', icon: Lightbulb },
  { name: 'Blog & Articles', path: '/growth/content/blog', icon: BookOpen },
  { name: 'Social Drafts', path: '/growth/content/social', icon: Share2 },
  { name: 'Newsletters', path: '/growth/content/newsletters', icon: Mail },
  { name: 'Editorial Calendar', path: '/growth/content/calendar', icon: Calendar },
  { name: 'Approval Workflow', path: '/growth/content/approvals', icon: CheckCircle2 },
];

export default function ContentNav() {
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
                    ? 'border-[#0ea5e9] text-[#0ea5e9] font-semibold'
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
