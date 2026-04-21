import { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import './LenderDashboard.css';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Tools', 'Clothing', 'Sports', 'Furniture', 'Kitchen', 'Other'];
const AVAILABILITY_OPTIONS = ['All', 'Available', 'Out of Stock'];
const TABS = ['My Listings', 'Drafts', 'Requests', 'Active Rentals', 'Overdue Rentals'];

const LenderDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters (listings only)
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  // ─── Toast from navigation state ─────────────────────────
  useEffect(() => {
    if (location.state?.itemListed) {
      setSuccessMsg('🎉 Item published successfully!');
      window.history.replaceState({}, '');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    if (location.state?.draftSaved) {
      setSuccessMsg('📝 Draft saved successfully!');
      setActiveTab('Drafts');
      window.history.replaceState({}, '');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  }, [location.state]);

  // ─── Fetch published items ────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ status: 'published' });
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

  // ─── Fetch drafts ─────────────────────────────────────────
  const fetchDrafts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/inventory/my-items?status=draft`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setDrafts(data);
    } catch {}
  }, []);

  // ─── Fetch lender bookings ────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/lender-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(data);
    } catch {} finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => { fetchItems(); fetchDrafts(); fetchBookings(); }, [fetchItems, fetchDrafts, fetchBookings]);

  // ─── Item actions ─────────────────────────────────────────
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/inventory/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      setDrafts((prev) => prev.filter((i) => i._id !== itemId));
      setSuccessMsg('Item deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to delete item.');
    }
  };

  const handleDeactivateItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/inventory/items/${itemId}/deactivate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      // Remove from published items list
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      // Optionally re-fetch drafts so it appears there
      fetchDrafts();
      setSuccessMsg('Item deactivated and moved to drafts.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to deactivate item.');
    }
  };

  const handlePublishDraft = async (draft) => {
    // Prevent quick publish if draft has placeholder defaults
    if (draft.name === 'Untitled Draft' || draft.pricePerDay === 0 || !draft.description) {
      alert('Please fill out all required details before publishing this draft.');
      navigate('/list-item', { state: { draft } });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/inventory/items/${draft._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setSuccessMsg('🎉 Draft published!');
      setActiveTab('My Listings');
      fetchItems(); fetchDrafts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to publish draft.');
    }
  };

  // ─── Booking actions ──────────────────────────────────────
  const handleMarkReturned = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/mark-returned`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setSuccessMsg('✅ Marked as returned.');
      fetchBookings();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to mark returned.');
    }
  };

  const handleCollectFine = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/collect-fine`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setSuccessMsg('💰 Fine collected!');
      fetchBookings();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to collect fine.');
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setSuccessMsg('✅ Request approved!');
      fetchBookings();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to approve request.');
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setSuccessMsg('❌ Request rejected.');
      fetchBookings();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to reject request.');
    }
  };

  const handleConfirmReturn = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/confirm-return`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setSuccessMsg('✅ Return confirmed!');
      fetchBookings();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setFetchError(err.message || 'Failed to confirm return.');
    }
  };

  const overdueBookings = bookings.filter((b) => b.status === 'overdue');
  const activeBookings = bookings.filter((b) => b.status === 'active' || b.status === 'returned');
  const pendingRequests = bookings.filter((b) => b.status === 'pending');

  const stats = [
    { label: 'Items Listed', value: items.length.toString(), icon: '📦' },
    { label: 'Drafts', value: drafts.length.toString(), icon: '📝' },
    { label: 'Active Rentals', value: activeBookings.length.toString(), icon: '🔄' },
    { label: 'Overdue', value: overdueBookings.length.toString(), icon: '⚠️' },
  ];

  const resetFilters = () => { setSearch(''); setCategory('All'); setAvailability('All'); setMinPrice(''); setMaxPrice(''); };
  const hasActiveFilters = search || category !== 'All' || availability !== 'All' || minPrice || maxPrice;

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
            <a href="#" className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Dashboard'); }}><span className="nav-icon">📊</span> Dashboard</a>
            <a href="#" className={`nav-item ${activeTab === 'My Listings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('My Listings'); }}><span className="nav-icon">📦</span> My Listings</a>
            <a href="#" className={`nav-item ${activeTab === 'Requests' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Requests'); }}><span className="nav-icon">📥</span> Requests</a>
            <a href="#" className={`nav-item ${activeTab === 'Active Rentals' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Active Rentals'); }}><span className="nav-icon">🔄</span> Active Rentals</a>
            <a href="#" className={`nav-item ${activeTab === 'Drafts' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Drafts'); }}><span className="nav-icon">📝</span> Drafts {drafts.length > 0 && <span className="nav-badge">{drafts.length}</span>}</a>
            <a href="#" className={`nav-item ${activeTab === 'Overdue Rentals' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Overdue Rentals'); }}><span className="nav-icon">⚠️</span> Overdue {overdueBookings.length > 0 && <span className="nav-badge overdue-badge">{overdueBookings.length}</span>}</a>
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
              <h1 className="dashboard-greeting">
                Good day, <span className="lender-highlight">{user?.fullname?.split(' ')[0]}</span> 👋
              </h1>
              <p className="dashboard-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button className="add-item-btn" onClick={() => navigate('/list-item')}>+ Add New Item</button>
          </div>

          {/* Feedback */}
          {successMsg && <div className="alert-success fade-up">✅ {successMsg}</div>}
          {fetchError && <div className="alert-error fade-up">⚠️ {fetchError}</div>}

          {/* Stats Grid */}
          {activeTab === 'Dashboard' && (
            <>
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

          {/* Profile + Quick Actions */}
          <div className="content-grid fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card info-card">
              <h3 className="card-heading">Account Details</h3>
              <div className="info-list">
                <div className="info-row"><span className="info-label">📧 Email</span><span className="info-val">{user?.email}</span></div>
                <div className="info-row"><span className="info-label">📱 Phone</span><span className="info-val">{user?.phonenumber}</span></div>
                <div className="info-row"><span className="info-label">🎓 Reg. No.</span><span className="info-val">{user?.campusRegistrationNumber}</span></div>
                <div className="info-row"><span className="info-label">🎭 Role</span><span className="info-val lender-highlight" style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
              </div>
            </div>

            <div className="glass-card info-card">
              <h3 className="card-heading">Quick Actions</h3>
              <div className="quick-actions lender-actions">
                <button className="action-btn" onClick={() => navigate('/list-item')}>📦 List a New Item</button>
                <button className="action-btn" onClick={() => setActiveTab('Drafts')}>📝 View Drafts</button>
                <button className="action-btn" onClick={() => setActiveTab('Overdue Rentals')}>⚠️ Overdue Rentals</button>
                <button className="action-btn" onClick={() => setActiveTab('My Listings')}>📋 My Listings</button>
              </div>
            </div>
          </div>
          </>
          )}

          {/* ─── Tabs Section ─── */}
          {activeTab !== 'Dashboard' && (
            <div className="glass-card listings-section fade-up" style={{ animationDelay: '0.3s' }}>
            {/* Tab Bar */}
            <div className="tab-bar">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'My Listings' && '📦 '}
                  {tab === 'Drafts' && '📝 '}
                  {tab === 'Requests' && '📥 '}
                  {tab === 'Active Rentals' && '🔄 '}
                  {tab === 'Overdue Rentals' && '⚠️ '}
                  {tab}
                  {tab === 'Requests' && pendingRequests.length > 0 && <span className="tab-count">{pendingRequests.length}</span>}
                  {tab === 'Active Rentals' && activeBookings.length > 0 && <span className="tab-count">{activeBookings.length}</span>}
                  {tab === 'Overdue Rentals' && overdueBookings.length > 0 && <span className="tab-count overdue-count">{overdueBookings.length}</span>}
                </button>
              ))}
            </div>

            {/* ─── MY LISTINGS TAB ─── */}
            {activeTab === 'My Listings' && (
              <>
                <div className="listings-header">
                  <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>Published Items</h3>
                  <span className="listings-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                  <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input type="text" className="search-input" placeholder="Search your listings…" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (<option key={c} value={c}>{c === 'All' ? '📂 All Categories' : c}</option>))}
                  </select>
                  <select className="filter-select" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    {AVAILABILITY_OPTIONS.map((a) => (<option key={a} value={a}>{a === 'All' ? '🔄 All Status' : a}</option>))}
                  </select>
                  <div className="price-range-group">
                    <input type="number" className="price-input" placeholder="Min Rs." min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <span className="price-separator">–</span>
                    <input type="number" className="price-input" placeholder="Max Rs." min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                  {hasActiveFilters && <button className="reset-filter-btn" onClick={resetFilters}>✕ Clear</button>}
                </div>

                {loadingItems ? (
                  <div className="listings-loading"><div className="loading-spinner" /><p>Loading your items…</p></div>
                ) : items.length === 0 ? (
                  <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                    <div className="empty-icon">📭</div>
                    <h3>{hasActiveFilters ? 'No items match your filters.' : 'No published items yet'}</h3>
                    <p>{hasActiveFilters ? 'Try adjusting your search or filters.' : 'Start by adding your first item.'}</p>
                    {!hasActiveFilters && <button className="btn-empty lender-btn-empty" onClick={() => navigate('/list-item')}>+ List Your First Item</button>}
                  </div>
                ) : (
                  <div className="items-grid">
                    {items.map((item) => (
                      <ItemCard 
                        key={item._id} 
                        item={item} 
                        onDelete={handleDeleteItem} 
                        onDeactivate={handleDeactivateItem}
                        onEdit={() => navigate('/list-item', { state: { item } })}
                        isRented={bookings.some(b => b.item?._id === item._id && ['active', 'overdue'].includes(b.status))}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ─── DRAFTS TAB ─── */}
            {activeTab === 'Drafts' && (
              <>
                <div className="listings-header">
                  <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>📝 Saved Drafts</h3>
                  <span className="listings-count">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
                </div>
                {drafts.length === 0 ? (
                  <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                    <div className="empty-icon">📝</div>
                    <h3>No drafts saved</h3>
                    <p>Start filling out a listing and save as draft to continue later.</p>
                    <button className="btn-empty lender-btn-empty" onClick={() => navigate('/list-item')}>+ Create a New Listing</button>
                  </div>
                ) : (
                  <div className="items-grid">
                    {drafts.map((draft) => (
                      <DraftCard
                        key={draft._id}
                        draft={draft}
                        onEdit={() => navigate('/list-item', { state: { draft } })}
                        onPublish={() => handlePublishDraft(draft)}
                        onDelete={() => handleDeleteItem(draft._id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ─── REQUESTS TAB ─── */}
            {activeTab === 'Requests' && (
              <>
                <div className="listings-header">
                  <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>📥 Incoming Rental Requests</h3>
                  <span className="listings-count">{pendingRequests.length} requests</span>
                </div>
                {loadingBookings ? (
                  <div className="listings-loading"><div className="loading-spinner" /><p>Loading requests…</p></div>
                ) : pendingRequests.length === 0 ? (
                  <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                    <div className="empty-icon">📥</div>
                    <h3>No pending requests</h3>
                    <p>When borrowers request to rent your items, they will appear here for your approval.</p>
                  </div>
                ) : (
                  <div className="overdue-list">
                    {pendingRequests.map((req) => (
                      <div key={req._id} className="overdue-card">
                        <div className="overdue-card-left">
                          {req.item?.image ? (
                            <img src={`http://localhost:5000/${req.item.image.replace(/^[\\/]+/, '')}`} alt={req.item.name} className="overdue-item-img" />
                          ) : (
                            <div className="overdue-item-img-placeholder">📦</div>
                          )}
                        </div>
                        <div className="overdue-card-body">
                          <div className="overdue-card-top">
                            <div>
                              <h4 className="overdue-item-name">{req.item?.name}</h4>
                              <p className="overdue-borrower">
                                👤 {req.borrower?.fullname} · 🎓 {req.borrower?.campusRegistrationNumber}
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                                📧 {req.borrower?.email} · 📱 {req.borrower?.phonenumber}
                              </p>
                            </div>
                            <span className="active-days-badge" style={{ background: 'rgba(255,165,0,0.2)', color: 'orange' }}>
                              ⏳ Pending
                            </span>
                          </div>
                          <div className="overdue-dates">
                            <span>📅 Requested: <strong>{new Date(req.createdAt).toLocaleDateString()}</strong></span>
                          </div>
                          <div className="overdue-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                            <button 
                              className="overdue-btn returned-btn" 
                              style={{ flex: 1, padding: '10px', background: 'var(--primary-color)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                              onClick={() => handleApprove(req._id)}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              className="overdue-btn fine-btn" 
                              style={{ flex: 1, padding: '10px', background: 'var(--danger-color, #ef4444)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                              onClick={() => handleReject(req._id)}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ─── ACTIVE RENTALS TAB ─── */}
            {activeTab === 'Active Rentals' && (
              <>
                <div className="listings-header">
                  <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>🔄 Active Rentals</h3>
                  <span className="listings-count">{activeBookings.length} active</span>
                </div>
                {activeBookings.length === 0 ? (
                  <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                    <div className="empty-icon">🔄</div>
                    <h3>No active rentals</h3>
                    <p>None of your items are currently rented out.</p>
                  </div>
                ) : (
                  <div className="overdue-list">
                    {activeBookings.map((b) => (
                      <ActiveBookingCard key={b._id} booking={b} onConfirmReturn={() => handleConfirmReturn(b._id)} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ─── OVERDUE RENTALS TAB ─── */}
            {activeTab === 'Overdue Rentals' && (
              <>
                <div className="listings-header">
                  <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>⚠️ Overdue Rentals</h3>
                  <span className="listings-count overdue-count-text">{overdueBookings.length} overdue</span>
                </div>
                {loadingBookings ? (
                  <div className="listings-loading"><div className="loading-spinner" /><p>Loading bookings…</p></div>
                ) : overdueBookings.length === 0 ? (
                  <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                    <div className="empty-icon">✅</div>
                    <h3>No overdue rentals</h3>
                    <p>All items have been returned on time.</p>
                  </div>
                ) : (
                  <div className="overdue-list">
                    {overdueBookings.map((b) => (
                      <OverdueCard
                        key={b._id}
                        booking={b}
                        onMarkReturned={() => handleMarkReturned(b._id)}
                        onCollectFine={() => handleCollectFine(b._id)}
                      />
                    ))}
                  </div>
                )}

                {/* Also show all active bookings for reference */}
                {activeBookings.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                      🔄 Active Rentals ({activeBookings.length})
                    </h4>
                    <div className="overdue-list">
                      {activeBookings.map((b) => (
                        <ActiveBookingCard key={b._id} booking={b} onConfirmReturn={() => handleConfirmReturn(b._id)} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          )}
        </main>
      </div>
    </>
  );
};

// ─── Item Card ────────────────────────────────────────────────
const ItemCard = ({ item, onDelete, onEdit, onDeactivate, isRented }) => {
  const discountedPrice = item.discountPercentage > 0
    ? item.pricePerDay * (1 - item.discountPercentage / 100) : null;

  return (
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
          {item.finePerDay > 0 && <span className="item-meta-chip fine-chip">⚠️ Rs. {item.finePerDay}/day fine</span>}
        </div>
        <div className="item-card-actions" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="item-action-btn draft-edit-btn" 
            onClick={onEdit} 
            disabled={isRented}
            title={isRented ? "Cannot edit an item while it is currently rented" : "Edit item"}
            style={isRented ? { opacity: 0.5, cursor: 'not-allowed', flex: 1 } : { flex: 1 }}
          >
            ✏️ Edit
          </button>
          <button 
            className="item-action-btn item-action-delete" 
            onClick={() => onDeactivate(item._id)}
            style={{ flex: 1 }}
          >
            🚫 Deactivate
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Draft Card ───────────────────────────────────────────────
const DraftCard = ({ draft, onEdit, onPublish, onDelete }) => (
  <div className="item-card glass-card draft-card">
    <div className="item-card-image">
      {draft.image ? (
        <img src={`http://localhost:5000/${draft.image.replace(/^[\\/]+/, '')}`} alt={draft.name} className="item-img" />
      ) : (
        <div className="item-img-placeholder">📝</div>
      )}
      <div className="item-status-badge draft-status-badge">📝 Draft</div>
    </div>
    <div className="item-card-body">
      <div className="item-card-top">
        <div>
          <h4 className="item-name">{draft.name || 'Untitled Draft'}</h4>
          <span className="item-category">{draft.category || 'Uncategorized'}</span>
        </div>
        {draft.pricePerDay > 0 && (
          <span className="item-price lender-stat">Rs. {draft.pricePerDay.toFixed(2)}/day</span>
        )}
      </div>
      {draft.description && <p className="item-description">{draft.description}</p>}
      <div className="item-meta">
        {draft.pickupLocation && <span className="item-meta-chip">📍 {draft.pickupLocation}</span>}
        {draft.minRentalDays > 0 && <span className="item-meta-chip">📅 {draft.minRentalDays}–{draft.maxRentalDays} days</span>}
        <span className="item-meta-chip">✏️ Saved {new Date(draft.updatedAt).toLocaleDateString()}</span>
      </div>
      <div className="item-card-actions">
        <button className="item-action-btn draft-edit-btn" onClick={onEdit}>✏️ Edit</button>
        <button className="item-action-btn draft-publish-btn" onClick={onPublish}>🚀 Publish</button>
        <button className="item-action-btn item-action-delete" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  </div>
);

// ─── Overdue Booking Card ─────────────────────────────────────
const OverdueCard = ({ booking, onMarkReturned, onCollectFine }) => {
  const daysOverdue = Math.ceil((new Date() - new Date(booking.dueDate)) / (1000 * 60 * 60 * 24));

  return (
    <div className="overdue-card">
      <div className="overdue-card-left">
        {booking.item?.image ? (
          <img src={`http://localhost:5000/${booking.item.image.replace(/^[\\/]+/, '')}`} alt={booking.item.name} className="overdue-item-img" />
        ) : (
          <div className="overdue-item-img-placeholder">📦</div>
        )}
      </div>
      <div className="overdue-card-body">
        <div className="overdue-card-top">
          <div>
            <h4 className="overdue-item-name">{booking.item?.name}</h4>
            <p className="overdue-borrower">
              👤 {booking.borrower?.fullname} · 📧 {booking.borrower?.email} · 📱 {booking.borrower?.phonenumber}
            </p>
          </div>
          <div className="overdue-fine-block">
            <span className="overdue-days-badge">⏰ {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue</span>
            <span className="overdue-fine-amount">Rs. {booking.fineAmount?.toFixed(2) || '0.00'} fine</span>
          </div>
        </div>
        <div className="overdue-dates">
          <span>📅 Due: <strong>{new Date(booking.dueDate).toLocaleDateString()}</strong></span>
          <span>🔄 Rate: Rs. {booking.finePerDay}/day</span>
          <span>🎓 {booking.borrower?.campusRegistrationNumber}</span>
        </div>
        <div className="overdue-actions">
          <button className="overdue-btn returned-btn" onClick={onMarkReturned}>✅ Mark Returned</button>
          {!booking.fineCollected && booking.fineAmount > 0 && (
            <button className="overdue-btn fine-btn" onClick={onCollectFine}>💰 Collect Fine</button>
          )}
          {booking.fineCollected && <span className="fine-collected-badge">✅ Fine Collected</span>}
        </div>
      </div>
    </div>
  );
};

// ─── Active Booking Card ──────────────────────────────────────
const ActiveBookingCard = ({ booking, onConfirmReturn }) => {
  const daysLeft = Math.ceil((new Date(booking.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="overdue-card active-booking-card">
      <div className="overdue-card-left">
        {booking.item?.image ? (
          <img src={`http://localhost:5000/${booking.item.image.replace(/^[\\/]+/, '')}`} alt={booking.item.name} className="overdue-item-img" />
        ) : (
          <div className="overdue-item-img-placeholder">📦</div>
        )}
      </div>
      <div className="overdue-card-body">
        <div className="overdue-card-top">
          <div>
            <h4 className="overdue-item-name">{booking.item?.name}</h4>
            <p className="overdue-borrower">👤 {booking.borrower?.fullname} · 📱 {booking.borrower?.phonenumber}</p>
          </div>
          <span className="active-days-badge">{booking.status === 'returned' ? '✅ Returned (Pending Confirm)' : (daysLeft > 0 ? `⏳ ${daysLeft}d left` : '⚠️ Due today')}</span>
        </div>
        <div className="overdue-dates">
          <span>📅 Due: <strong>{new Date(booking.dueDate).toLocaleDateString()}</strong></span>
          <span>💰 Rs. {booking.totalCost?.toFixed(2)}</span>
        </div>
        {booking.status === 'returned' && (
          <div className="overdue-actions" style={{ marginTop: '16px' }}>
            <button className="overdue-btn returned-btn" onClick={onConfirmReturn} style={{ width: '100%', padding: '10px', background: 'var(--primary-color, #10b981)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              ✅ Confirm Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LenderDashboard;
