import { useState } from 'react';

const StarRating = ({ rating = 0, onRate = null, size = 24 }) => {
  const [hover, setHover] = useState(0);
  const interactive = !!onRate;

  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <span
            key={star}
            onClick={() => interactive && onRate(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            style={{
              fontSize: size,
              color: filled ? '#f59e0b' : '#d1d5db',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 0.1s',
              transform: interactive && hover === star ? 'scale(1.2)' : 'scale(1)',
              userSelect: 'none',
            }}
            role={interactive ? 'button' : 'img'}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
