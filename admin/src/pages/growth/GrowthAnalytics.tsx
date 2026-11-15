import { BarChart2, TrendingUp, Users, DollarSign } from 'lucide-react';
import GrowthPlaceholder from './GrowthPlaceholder';

export default function GrowthAnalytics() {
  return (
    <GrowthPlaceholder
      id="analytics"
      title="Analytics"
      subtitle="Measure and understand growth performance, conversion funnels, and channel attribution."
      phase="Phase 6"
      status="planned"
      statusLabel="Phase 6 Planned"
      icon={BarChart2}
      accentColor="#10b981"
      objective="Deliver full-funnel growth intelligence for Originyx, from initial site impression through content engagement, lead capture, sales conversion, and customer expansion."
      plannedFeatures={[
        {
          title: 'Full-Funnel Conversion Analysis',
          description: 'Track drop-off stages from visitors to leads, MQLs, SQLs, and closed-won customers.',
        },
        {
          title: 'Content Performance & Readership',
          description: 'Analyze article pageviews, average read times, scroll depths, and conversion CTA click-through rates.',
        },
        {
          title: 'Channel Efficiency Metrics',
          description: 'Compare customer acquisition costs (CAC) and customer lifetime value (LTV) across organic and paid channels.',
        },
        {
          title: 'Growth Forecasting',
          description: 'Predictive pipeline volume forecasting based on leading engagement indicators and velocity.',
        },
      ]}
      relatedActions={[
        {
          label: 'Command Center Pulse',
          to: '/dashboard',
          description: 'View overall business and operational metrics',
          icon: TrendingUp,
        },
        {
          label: 'Customer Accounts Overview',
          to: '/customers',
          description: 'Analyze customer retention and active accounts',
          icon: Users,
        },
        {
          label: 'Revenue Overview',
          to: '/revenue',
          description: 'Check subscription MRR and deal value pipelines',
          icon: DollarSign,
        },
      ]}
    />
  );
}
