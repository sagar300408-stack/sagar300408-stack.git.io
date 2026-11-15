import { Share2, Users, FileText, CheckSquare } from 'lucide-react';
import GrowthPlaceholder from './GrowthPlaceholder';

export default function GrowthSocial() {
  return (
    <GrowthPlaceholder
      id="social"
      title="Social"
      subtitle="Manage social channels, scheduled posts, and brand engagement activities."
      phase="Phase 4"
      status="planned"
      statusLabel="Phase 4 Planned"
      icon={Share2}
      accentColor="#8b5cf6"
      objective="Coordinate Originyx's social media presence across LinkedIn, X, and developer communities. Provides unified scheduling, engagement monitoring, and inbound social lead attribution."
      plannedFeatures={[
        {
          title: 'LinkedIn Company & Founder Engine',
          description: 'Draft, preview, schedule, and track engagement for executive and brand posts on LinkedIn.',
        },
        {
          title: 'Publishing Queue & Calendar',
          description: 'Drag-and-drop queue for social posts with automated peak-time slot optimization.',
        },
        {
          title: 'Engagement & Mentions Tracking',
          description: 'Aggregate comments, reposts, brand mentions, and inbound direct inquiries across platforms.',
        },
        {
          title: 'Social Lead Capture',
          description: 'Automatically attribute inbound leads and profile visits originating from specific social posts.',
        },
      ]}
      relatedActions={[
        {
          label: 'View Social & LinkedIn Leads',
          to: '/leads',
          description: 'Check leads originating from LinkedIn and social outreach',
          icon: Users,
        },
        {
          label: 'Browse CMS Insights for Snippets',
          to: '/insights',
          description: 'Find published articles to turn into social threads',
          icon: FileText,
        },
        {
          label: 'Create Social Task',
          to: '/my-work?new=1',
          description: 'Assign a social draft or campaign task',
          icon: CheckSquare,
        },
      ]}
    />
  );
}
