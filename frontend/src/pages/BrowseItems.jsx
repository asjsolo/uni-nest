import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Tools', 'Clothing', 'Sports', 'Furniture', 'Kitchen', 'Other'];

const BrowseItems = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await fetch(`http://localhost:5000/api/inventory/items?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load items');
      setItems(data);
    } catch (err) {
      setError(err.message || 'Could not load items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, category, minPrice, maxPrice]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = search || category !== 'All' || minPrice || maxPrice;

  return (
    <>
      <div className="page-bg" />
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar borrower-sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">UniNest</span>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar borrower-avatar">
              {user?.fullname?.charAt(0).toUpperCase() || 'B'}
            </div>
            <div className="profile-info">
              <p className="profile-name">{user?.fullname}</p>
              <div className="profile-role-badge borrower-role-badge">🎒 Borrower</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/borrower-dashboard'); }}>
              <span className="nav-icon">📊</span> Dashboard
            </a>
            <a href="#" className="nav-item active">
              <span className="nav-icon">🔍</span> Browse Items
            </a>
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/borrower-dashboard', { state: { activeTab: 'My Requests' } }); }}>
              <span className="nav-icon">📋</span> My Requests
            </a>
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/borrower-dashboard', { state: { activeTab: 'Messages' } }); }}>
              <span className="nav-icon">💬</span> Messages
            </a>
          </nav>

          <div className="sidebar-bottom-actions">
            <button className="sidebar-switch-role" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginBottom: '10px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>🔄</span> Back to Main Hub
            </button>
            <button className="sidebar-logout" onClick={handleLogout} style={{ width: '100%' }}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header fade-up">
            <div>
              <h1 className="dashboard-greeting">Browse Items</h1>
              <p className="dashboard-date">Find items to borrow from lenders on your campus.</p>
            </div>
          </div>

          {error && <div className="alert-error fade-up">⚠️ {error}</div>}

          <div className="glass-card listings-section fade-up" style={{ animationDelay: '0.1s' }}>
            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input type="text" className="search-input" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c === 'All' ? '📂 All Categories' : c}</option>))}
              </select>
              <div className="price-range-group">
                <input type="number" className="price-input" placeholder="Min Rs." min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <span className="price-separator">–</span>
                <input type="number" className="price-input" placeholder="Max Rs." min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
              {hasActiveFilters && <button className="reset-filter-btn" onClick={resetFilters}>✕ Clear</button>}
            </div>

            {loading ? (
              <div className="listings-loading"><div className="loading-spinner" /><p>Loading items…</p></div>
            ) : items.length === 0 ? (
              <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                <div className="empty-icon">🔍</div>
                <h3>{hasActiveFilters ? 'No items match your filters.' : 'No items available right now'}</h3>
                <p>{hasActiveFilters ? 'Try adjusting your search or filters.' : 'Check back later as lenders add more items.'}</p>
              </div>
            ) : (
              <div className="items-grid">
                {items.map((item) => {
                  const discountedPrice = item.discountPercentage > 0
                    ? item.pricePerDay * (1 - item.discountPercentage / 100) : null;
                  
                  return (
                    <Link to={`/item/${item._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="item-card glass-card">
                        <div className="item-card-image">
                          {item.image ? (
                            <img src={`http://localhost:5000/${item.image.replace(/^[\\/]+/, '')}`} alt={item.name} className="item-img" />
                          ) : (
                            <div className="item-img-placeholder">📦</div>
                          )}
                          <div className={`item-status-badge ${item.availabilityStatus === 'Available' ? 'badge-available' : 'badge-out'}`}>
                            {item.availabilityStatus === 'Available' ? '✅ Available' : '❌ Out of Stock'}
                          </div>
                        </div>
                        <div className="item-card-body">
                          <div className="item-card-top">
                            <div>
                              <h4 className="item-name">{item.name}</h4>
                              <span className="item-category">{item.category}</span>
                            </div>
                            <div className="item-price-block">
                              {discountedPrice ? (
                                <>
                                  <span className="item-price-original">Rs. {item.pricePerDay.toFixed(2)}</span>
                                  <span className="item-price borrower-stat">Rs. {discountedPrice.toFixed(2)}/day</span>
                                  <span className="item-discount-badge">-{item.discountPercentage}%</span>
                                </>
                              ) : (
                                <span className="item-price borrower-stat">Rs. {item.pricePerDay.toFixed(2)}/day</span>
                              )}
                            </div>
                          </div>
                          <p className="item-description">{item.description}</p>
                          <div className="item-meta">
                            <span className="item-meta-chip">👤 {item.owner?.fullname || 'Unknown'}</span>
                            <span className="item-meta-chip">📍 {item.pickupLocation}</span>
                            <span className="item-meta-chip">📅 {item.minRentalDays}–{item.maxRentalDays} days</span>
                          </div>
                          <div className="item-card-actions" style={{ marginTop: '16px' }}>
                            <button 
                              className="item-action-btn" 
                              style={{ width: '100%', background: 'var(--primary-color)', color: 'white', border: 'none' }}
                              disabled={item.availabilityStatus !== 'Available'}
                            >
                              🎒 Request to Borrow
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default BrowseItems;
