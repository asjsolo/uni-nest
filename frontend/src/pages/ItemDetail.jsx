import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/inventory/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch item');
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return <div className="page-bg"><div className="listings-loading" style={{ marginTop: '20vh' }}><div className="loading-spinner"/></div></div>;
  }

  if (error || !item) {
    return (
      <div className="page-bg">
        <div className="dashboard-layout">
          <main className="dashboard-main" style={{ marginLeft: 0, width: '100%', maxWidth: '800px', margin: '40px auto' }}>
            <div className="alert-error fade-up">⚠️ {error || 'Item not found'}</div>
            <button className="back-btn" onClick={() => navigate(-1)} style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>← Back</button>
          </main>
        </div>
      </div>
    );
  }

  const discountedPrice = item.discountPercentage > 0
    ? item.pricePerDay * (1 - item.discountPercentage / 100) : null;

  const handleRentNow = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: item._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit request');
      setSuccessMsg('Request sent successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-bg" />
      <div className="dashboard-layout">
        <main className="dashboard-main" style={{ marginLeft: 0, width: '100%', maxWidth: '900px', margin: '40px auto' }}>
          
          <div className="dashboard-header fade-up">
            <button 
              className="back-btn" 
              onClick={() => navigate(-1)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
            >
              ← Back
            </button>
            <div>
              <h1 className="dashboard-greeting">Item Details</h1>
              <p className="dashboard-date">Viewing details for: {item.name}</p>
            </div>
          </div>

          {successMsg && <div className="alert-success fade-up">✅ {successMsg}</div>}
          {error && <div className="alert-error fade-up">⚠️ {error}</div>}

          <div className="glass-card fade-up" style={{ animationDelay: '0.1s', padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 350px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
                {item.image ? (
                  <img src={`http://localhost:5000/${item.image.replace(/^[\\/]+/, '')}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '6rem' }}>📦</div>
                )}
              </div>
              
              <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '2.2rem', marginBottom: '12px' }}>{item.name}</h2>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="item-meta-chip">📂 {item.category}</span>
                  <span className={`item-status-badge ${item.availabilityStatus === 'Available' ? 'badge-available' : 'badge-out'}`}>
                    {item.availabilityStatus === 'Available' ? '✅ Available' : '❌ Out of Stock'}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '32px', fontSize: '1.05rem' }}>
                  {item.description}
                </p>

                <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Rental Rate</div>
                  
                  {discountedPrice ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span className="item-price borrower-stat" style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>Rs. {discountedPrice.toFixed(2)}<span style={{fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>/day</span></span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Rs. {item.pricePerDay.toFixed(2)}</span>
                      <span className="item-discount-badge">-{item.discountPercentage}%</span>
                    </div>
                  ) : (
                    <span className="item-price borrower-stat" style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>Rs. {item.pricePerDay.toFixed(2)}<span style={{fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>/day</span></span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Owner</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '1.05rem' }}>👤 {item.owner?.fullname || 'Unknown'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Pickup Location</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '1.05rem' }}>📍 {item.pickupLocation}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Rental Period</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '1.05rem' }}>📅 {item.minRentalDays} - {item.maxRentalDays} days</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Late Fine</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '1.05rem' }}>⚠️ Rs. {item.finePerDay}/day</div>
                  </div>
                </div>

                <button 
                  className="item-action-btn" 
                  disabled={item.availabilityStatus !== 'Available' || isSubmitting || successMsg}
                  style={{ 
                    background: item.availabilityStatus === 'Available' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', 
                    color: item.availabilityStatus === 'Available' ? 'white' : 'var(--text-secondary)', 
                    border: item.availabilityStatus !== 'Available' ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                    padding: '18px', 
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    borderRadius: '12px',
                    cursor: item.availabilityStatus === 'Available' && !isSubmitting && !successMsg ? 'pointer' : 'not-allowed',
                    boxShadow: item.availabilityStatus === 'Available' ? '0 8px 32px rgba(99, 102, 241, 0.4)' : 'none',
                    transition: 'all 0.3s ease',
                    marginTop: 'auto'
                  }}
                  onClick={handleRentNow}
                >
                  {isSubmitting ? 'Sending Request...' : successMsg ? '✅ Request Sent' : item.availabilityStatus === 'Available' ? '🎒 Rent Now' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </>
  );
};

export default ItemDetail;
