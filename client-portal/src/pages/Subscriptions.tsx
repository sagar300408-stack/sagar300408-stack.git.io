import ComingSoon from '../components/UI/ComingSoon';

export default function Subscriptions() {
  return (
    <div style={{ padding: '24px' }}>
      <ComingSoon 
        title="Subscription management is being prepared."
        description="You will be able to view and manage your Originyx plans here once the subscription platform is launched."
        actionText="Explore Products"
        actionTo="/explore"
      />
    </div>
  );
}
