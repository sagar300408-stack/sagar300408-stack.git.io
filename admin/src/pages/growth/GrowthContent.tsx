import { FileText, Plus, ImageIcon, BookOpen } from 'lucide-react';
import GrowthPlaceholder from './GrowthPlaceholder';

export default function GrowthContent() {
  return (
    <GrowthPlaceholder
      id="content"
      title="Content"
      subtitle="Plan, create, schedule, and distribute content across Originyx channels."
      phase="Phase 3"
      status="planned"
      statusLabel="Phase 3 Planned"
      icon={FileText}
      accentColor="#0ea5e9"
      objective="Unify the Originyx editorial calendar, thought leadership publishing, case study production, and cross-channel distribution under a single synchronized engine."
      plannedFeatures={[
        {
          title: 'Editorial Calendar',
          description: 'Visualize article, case study, and technical whitepaper publishing schedules in monthly and weekly views.',
        },
        {
          title: 'Multi-Channel Distribution',
          description: 'Repurpose long-form insights into newsletter dispatches, social snippets, and external syndications.',
        },
        {
          title: 'SEO & Search Indexing',
          description: 'Real-time keyword scoring, meta description validation, and structured schema verification.',
        },
        {
          title: 'Collaborative Review Workflow',
          description: 'Multi-stage editorial review from draft submission through editor approval to scheduled release.',
        },
      ]}
      relatedActions={[
        {
          label: 'Write New Insight',
          to: '/editor/new',
          description: 'Compose a new long-form article in the TipTap CMS editor',
          icon: Plus,
        },
        {
          label: 'Manage Published Articles',
          to: '/insights',
          description: 'Browse, edit, and organize existing content nodes',
          icon: BookOpen,
        },
        {
          label: 'Media Library Assets',
          to: '/media',
          description: 'Upload and organize cover images and diagrams',
          icon: ImageIcon,
        },
      ]}
    />
  );
}
