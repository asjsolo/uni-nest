import { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import './LenderDashboard.css';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Tools', 'Clothing', 'Sports', 'Furniture', 'Kitchen', 'Other'];
const AVAILABILITY_OPTIONS = ['All', 'Available', 'Out of Stock'];

const LenderDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show success toast when redirected after listing
  useEffect(() => {
    if (location.state?.itemListed) {
      setSuccessMsg('🎉 Item listed successfully!');
      // Clear the state so refresh doesn't re-show
      window.history.replaceState({}, '');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  }, [location.state]);

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (availability !== 'All') params.append('availability', availability);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await fetch(`http://localhost:5000/api/inventory/my-items?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load items');
      setItems(data);
    } catch (err) {
      setFetchError(err.message || 'Could not load your items.');
    } finally {
      setLoadingItems(false);
    }
  }, [search, category, availability, minPrice, maxPrice]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/inventory/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      setSuccessMsg('Item deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to delete item.');
    }
  };

  const stats = [
    { label: 'Items Listed', value: items.length.toString(), icon: '📦' },
    {
      label: 'Available',
      value: items.filter((i) => i.availabilityStatus === 'Available').length.toString(),
      icon: '✅',
    },
    {
      label: 'Out of Stock',
      value: items.filter((i) => i.availabilityStatus === 'Out of Stock').length.toString(),
      icon: '❌',
    },
    { label: 'Rating', value: '—', icon: '⭐' },
  ];

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setAvailability('All');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters =
    search || category !== 'All' || availability !== 'All' || minPrice || maxPrice;

  return (
    <>
      <div className="page-bg" />
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar lender-sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">UniNest</span>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar lender-avatar">
              {user?.fullname?.charAt(0).toUpperCase() || 'L'}
            </div>
            <div className="profile-info">
              <p className="profile-name">{user?.fullname}</p>
              <div className="profile-role-badge lender-role-badge">🏷️ Lender</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <span className="nav-icon">📊</span> Dashboard
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">📦</span> My Listings
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">📋</span> Requests
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">💬</span> Messages
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">⚙️</span> Settings
            </a>
          </nav>

          <button className="sidebar-logout" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </aside>

        {/* Main content */}
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header fade-up">
            <div>
              <h1 className="dashboard-greeting">
                Good day, <span className="lender-highlight">{user?.fullname?.split(' ')[0]}</span> 👋
              </h1>
              <p className="dashboard-date">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button className="add-item-btn" onClick={() => navigate('/list-item')}>
              + Add New Item
            </button>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="alert-success fade-up">✅ {successMsg}</div>
          )}
          {fetchError && (
            <div className="alert-error fade-up">⚠️ {fetchError}</div>
          )}

          {/* Stats Grid */}
          <div className="stats-grid fade-up" style={{ animationDelay: '0.1s' }}>
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card glass-card">
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <div className="stat-value lender-stat">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Profile Details + Quick Actions */}
          <div className="content-grid fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card info-card">
              <h3 className="card-heading">Account Details</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">📧 Email</span>
                  <span className="info-val">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📱 Phone</span>
                  <span className="info-val">{user?.phonenumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🎓 Reg. No.</span>
                  <span className="info-val">{user?.campusRegistrationNumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🎭 Role</span>
                  <span className="info-val lender-highlight" style={{ textTransform: 'capitalize' }}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card info-card">
              <h3 className="card-heading">Quick Actions</h3>
              <div className="quick-actions lender-actions">
                <button className="action-btn" onClick={() => navigate('/list-item')}>
                  📦 List a New Item
                </button>
                <button className="action-btn">📋 View All Requests</button>
                <button className="action-btn">💬 Open Messages</button>
                <button className="action-btn">📈 View Analytics</button>
              </div>
            </div>
          </div>

          {/* ─── My Listings Section ─── */}
          <div className="glass-card listings-section fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="listings-header">
              <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                📦 My Listings
              </h3>
              <span className="listings-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Search + Filter Bar */}
            <div className="filter-bar">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search your listings…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? '📂 All Categories' : c}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                {AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a === 'All' ? '🔄 All Status' : a}</option>
                ))}
              </select>

              <div className="price-range-group">
                <input
                  type="number"
                  className="price-input"
                  placeholder="Min Rs."
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="price-separator">–</span>
                <input
                  type="number"
                  className="price-input"
                  placeholder="Max Rs."
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {hasActiveFilters && (
                <button className="reset-filter-btn" onClick={resetFilters}>
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Items Grid */}
            {loadingItems ? (
              <div className="listings-loading">
                <div className="loading-spinner" />
                <p>Loading your items…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                <div className="empty-icon">📭</div>
                <h3>{hasActiveFilters ? 'No items match your filters.' : 'No items listed yet'}</h3>
                <p>
                  {hasActiveFilters
                    ? 'Try adjusting your search or filters.'
                    : 'Start by adding your first item to make it available for borrowing.'}
                </p>
                {!hasActiveFilters && (
                  <button className="btn-empty lender-btn-empty" onClick={() => navigate('/list-item')}>
                    + List Your First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="items-grid">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} onDelete={handleDeleteItem} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

// ─── Item Card Component ─────────────────────────────────────────
const ItemCard = ({ item, onDelete }) => {
  const discountedPrice =
    item.discountPercentage > 0
      ? item.pricePerDay * (1 - item.discountPercentage / 100)
      : null;

  return (
    <div className="item-card glass-card">
      <div className="item-card-image">
        {item.image ? (
          <img
            src={`http://localhost:5000${item.image}`}
            alt={item.name}
            className="item-img"
          />
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
                <span className="item-price lender-stat">Rs. {discountedPrice.toFixed(2)}/day</span>
                <span className="item-discount-badge">-{item.discountPercentage}%</span>
              </>
            ) : (
              <span className="item-price lender-stat">Rs. {item.pricePerDay.toFixed(2)}/day</span>
            )}
          </div>
        </div>

        <p className="item-description">{item.description}</p>

        <div className="item-meta">
          <span className="item-meta-chip">📦 Qty: {item.quantity}</span>
          <span className="item-meta-chip">📅 {item.minRentalDays}–{item.maxRentalDays} days</span>
          <span className="item-meta-chip">📍 {item.pickupLocation}</span>
        </div>

        <div className="item-card-actions">
          <button className="item-action-btn item-action-delete" onClick={() => onDelete(item._id)}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
