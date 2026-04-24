export const TIER_STYLES = {
  gold: {
    gradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    glow: '0 8px 28px rgba(245, 158, 11, 0.45)',
    ring: 'rgba(245, 158, 11, 0.5)',
    icon: '🏆',
  },
  silver: {
    gradient: 'linear-gradient(135deg, #cbd5e1, #64748b)',
    glow: '0 8px 28px rgba(148, 163, 184, 0.35)',
    ring: 'rgba(203, 213, 225, 0.45)',
    icon: '🥈',
  },
  bronze: {
    gradient: 'linear-gradient(135deg, #d97706, #78350f)',
    glow: '0 8px 28px rgba(180, 83, 9, 0.4)',
    ring: 'rgba(217, 119, 6, 0.5)',
    icon: '🥉',
  },
  new: {
    gradient: 'linear-gradient(135deg, #475569, #1e293b)',
    glow: '0 8px 28px rgba(71, 85, 105, 0.35)',
    ring: 'rgba(148, 163, 184, 0.3)',
    icon: '🌱',
  },
};

const TrustStat = ({ label, value }) => (
  <div
    style={{
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
      {label}
    </div>
  </div>
);

const TrustScoreCard = ({ trust, maxWidth = '620px' }) => {
  const tier = TIER_STYLES[trust.tier] || TIER_STYLES.new;
  const pct = Math.max(0, Math.min(100, trust.trustScore));

  return (
    <div
      className="glass-card fade-up"
      style={{
        width: '100%',
        maxWidth,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: tier.gradient,
            boxShadow: tier.glow,
            border: `2px solid ${tier.ring}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>{tier.icon}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, marginTop: '4px' }}>
            {trust.trustScore}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', textAlign: 'left' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '4px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              Trust Score
            </h2>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '99px',
                background: tier.gradient,
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: `1px solid ${tier.ring}`,
              }}
            >
              {trust.label}
            </span>
            {trust.isTrusted && (
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '99px',
                  background: 'rgba(16,185,129,0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.35)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                ✓ Verified Trusted
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Built from item reviews, average rating, and completed rentals.
          </p>

          <div
            style={{
              marginTop: '10px',
              height: '8px',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: tier.gradient,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
        }}
      >
        <TrustStat
          label="Avg Rating"
          value={trust.avgRating ? `${trust.avgRating.toFixed(1)} ★` : '—'}
        />
        <TrustStat label="Reviews" value={trust.reviewCount} />
        <TrustStat label="Completed Rentals" value={trust.completedBookings} />
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px',
          padding: '10px 12px',
          lineHeight: 1.5,
          textAlign: 'left',
        }}
      >
        <strong style={{ color: 'var(--text-secondary)' }}>How it's calculated:</strong>{' '}
        avg rating × 20, weighted by review confidence (5+ reviews = full weight), plus up to +20
        for completed rentals. Gold requires score ≥ 80 with 5+ reviews and 5+ rentals.
      </div>
    </div>
  );
};

export default TrustScoreCard;
