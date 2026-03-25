import StarRating from './StarRating';

const BADGE_ICONS = {
  shield: '\u{1F6E1}',
  check: '\u2705',
  star: '\u2B50',
  zap: '\u26A1',
  message: '\u{1F4AC}',
  wave: '\u{1F44B}',
};

const TrustScore = ({ trustData }) => {
  if (!trustData) return null;

  const { trustScore, reliabilityLevel, breakdown, badges } = trustData;

  // Meter color based on score
  const getMeterColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  };

  const meterColor = getMeterColor(trustScore);

  return (
    <div className="trust-score-card">
      <h2>Trust Score</h2>

      {/* Circular Score Display */}
      <div className="trust-meter">
        <svg viewBox="0 0 120 120" className="trust-circle">
          {/* Background circle */}
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          {/* Score arc */}
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={meterColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(trustScore / 100) * 327} 327`}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="trust-meter-text">
          <span className="trust-score-number" style={{ color: meterColor }}>{trustScore}</span>
          <span className="trust-score-label">/100</span>
        </div>
      </div>

      {/* Reliability Level */}
      <div className={`reliability-badge reliability-${reliabilityLevel.toLowerCase()}`}>
        {reliabilityLevel} Reliability
      </div>

      {/* Score Breakdown */}
      <div className="trust-breakdown">
        <div className="breakdown-row">
          <span className="breakdown-label">Rating Score</span>
          <div className="breakdown-bar-bg">
            <div
              className="breakdown-bar-fill"
              style={{ width: `${(breakdown.ratingScore / 60) * 100}%`, background: '#4f46e5' }}
            />
          </div>
          <span className="breakdown-value">{breakdown.ratingScore}/60</span>
        </div>
        <div className="breakdown-row">
          <span className="breakdown-label">Activity Score</span>
          <div className="breakdown-bar-bg">
            <div
              className="breakdown-bar-fill"
              style={{ width: `${(breakdown.activityScore / 40) * 100}%`, background: '#059669' }}
            />
          </div>
          <span className="breakdown-value">{breakdown.activityScore}/40</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="trust-stats">
        <div className="trust-stat">
          <StarRating rating={Math.round(breakdown.avgRating)} size={14} />
          <span className="trust-stat-val">{breakdown.avgRating}/5</span>
          <span className="trust-stat-label">Avg Rating ({breakdown.reviewCount} reviews)</span>
        </div>
        <div className="trust-stat">
          <span className="trust-stat-val">{breakdown.totalCompleted}</span>
          <span className="trust-stat-label">Completed Rentals</span>
        </div>
        <div className="trust-stat">
          <span className="trust-stat-val">{breakdown.reviewsWritten}</span>
          <span className="trust-stat-label">Reviews Written</span>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="trust-badges">
          <h3>Badges Earned</h3>
          <div className="badges-grid">
            {badges.map((badge) => (
              <div key={badge.name} className="trust-badge-item">
                <span className="trust-badge-icon">{BADGE_ICONS[badge.icon] || '\u{1F3C6}'}</span>
                <div className="trust-badge-info">
                  <strong>{badge.name}</strong>
                  <span>{badge.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustScore;
