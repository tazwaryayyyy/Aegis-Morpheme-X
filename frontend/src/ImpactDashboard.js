import React, { useMemo } from 'react';

const ImpactDashboard = ({ events, stakes }) => {
  const stats = useMemo(() => {
    const decisionsVerified = events.filter(e => e.type === 'agent_decision').length;
    const anomaliesBlocked = events.filter(e => e.type === 'sentinel_block').length;
    const payoutsTriggered = events.filter(e => e.type === 'payout_triggered' || e.type === 'hcvr_payout').length;
    const agentsActive = Object.values(stakes).filter(s => s > 0).length;

    return {
      decisionsVerified,
      anomaliesBlocked,
      payoutsTriggered,
      agentsActive
    };
  }, [events, stakes]);

  const cards = [
    { label: 'DECISIONS_VERIFIED', value: stats.decisionsVerified, sub: 'Sealed Decisions', color: 'var(--cyan)' },
    { label: 'ANOMALIES_BLOCKED', value: stats.anomaliesBlocked, sub: 'Sentinel Intercepts', color: 'var(--orange)' },
    { label: 'PAYOUTS_TRIGGERED', value: stats.payoutsTriggered, sub: 'Parametric Disbursals', color: 'var(--acid)' },
    { label: 'AGENTS_ACTIVE', value: stats.agentsActive, sub: 'Network Nodes Status', color: 'var(--cyan)' },
  ];

  return (
    <div className="stats-row" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '12px', 
      marginBottom: '24px' 
    }}>
      {cards.map((card, i) => (
        <div key={i} className="stat-card" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '4px',
          padding: '16px',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'transform 0.2s ease',
        }}>
          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '8px' }}>
            {card.label}
          </div>
          <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', color: card.color, marginBottom: '2px' }}>
            {card.value}
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImpactDashboard;
