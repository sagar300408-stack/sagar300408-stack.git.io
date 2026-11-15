import { Radio, FolderKanban, Users, Target } from 'lucide-react';
import GrowthPlaceholder from './GrowthPlaceholder';

export default function GrowthCampaigns() {
  return (
    <GrowthPlaceholder
      id="campaigns"
      title="Campaigns"
      subtitle="Plan, execute, and coordinate multi-channel marketing campaigns."
      phase="Phase 5"
      status="planned"
      statusLabel="Phase 5 Planned"
      icon={Radio}
      accentColor="#f59e0b"
      objective="Orchestrate integrated marketing campaigns across product launches, webinars, quarterly initiatives, and outbound account-based marketing sprints."
      plannedFeatures={[
        {
          title: 'Integrated Campaign Workspace',
          description: 'Tie together landing pages, email cadences, social posts, and ad creative under unified campaign briefs.',
        },
        {
          title: 'Budget & Spend Tracking',
          description: 'Monitor allocated marketing budgets, platform spend, cost per lead (CPL), and campaign ROI.',
        },
        {
          title: 'Milestone Timelines',
          description: 'Coordinate campaign launch checklists, creative asset deliverables, and cross-functional signoffs.',
        },
        {
          title: 'Campaign Outcome Attribution',
          description: 'Attribute inbound demos, qualified leads, and closed revenue back to specific campaign initiatives.',
        },
      ]}
      relatedActions={[
        {
          label: 'Campaign Initiatives in Projects',
          to: '/projects',
          description: 'Track campaign development as operational projects',
          icon: FolderKanban,
        },
        {
          label: 'Track Resulting Leads',
          to: '/leads',
          description: 'Inspect leads generated from active campaigns',
          icon: Users,
        },
        {
          label: 'Review Associated Opportunities',
          to: '/opportunities',
          description: 'Monitor pipeline value influenced by campaigns',
          icon: Target,
        },
      ]}
    />
  );
}
