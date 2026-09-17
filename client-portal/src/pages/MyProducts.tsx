import ComingSoon from '../components/UI/ComingSoon';

export default function MyProducts() {
  return (
    <div style={{ padding: '24px' }}>
      <ComingSoon 
        title="Your purchased and assigned products will appear here."
        description="Once products are available for your organization, they will be displayed in this workspace."
        actionText="Explore Products"
        actionTo="/explore"
      />
    </div>
  );
}
