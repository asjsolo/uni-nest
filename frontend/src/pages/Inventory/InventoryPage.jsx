import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getAllItems } from '../../api/analyticsApi';
import StarRating from '../../components/StarRating';
import './InventoryPage.css';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Sports', 'Tools', 'Clothing'];

const InventoryPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllItems()
      .then((res) => { setItems(res.data); setFiltered(res.data); })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter whenever search or category changes
  useEffect(() => {
    let result = items;
    if (activeCategory !== 'All') {
      result = result.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeCategory, items]);

  const getReliability = (avg, count) => {
    if (count === 0) return { label: 'No Reviews', cls: 'badge-none' };
    if (avg >= 4)   return { label: 'Highly Rated', cls: 'badge-high' };
    if (avg >= 2)   return { label: 'Average', cls: 'badge-medium' };
    return               { label: 'Low Rated', cls: 'badge-low' };
  };

  if (loading) {
    return (
      <div className="inv-loading">
        <div className="inv-spinner" />
        <span>Loading items...</span>
      </div>
    );
  }

  return (
    <div className="inv-page">

      {/* Header */}
      <header className="inv-header">
        <div className="inv-header-left">
          <button className="inv-back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <span className="inv-logo">🏠</span>
          <span className="inv-title">UNI NEST</span>
          <span className="inv-subtitle">Browse Items</span>
        </div>
        <div className="inv-header-right">
          <button className="inv-profile-btn" onClick={() => navigate('/profile')}>
            <div className="inv-avatar">{currentUser?.name?.charAt(0)}</div>
            <span>{currentUser?.name}</span>
          </button>
          <button className="inv-logout-btn" onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
        </div>
      </header>

      <div className="inv-body">

        {/* Search + Filter Bar */}
        <div className="inv-controls">
          <div className="inv-search-wrap">
            <span className="inv-search-icon">🔍</span>
            <input
              type="text"
              className="inv-search"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="inv-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <div className="inv-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`inv-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="inv-count">{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Item Detail Panel */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              className="inv-detail-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                className="inv-detail-panel"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="inv-detail-close" onClick={() => setSelectedItem(null)}>✕</button>
                <img
                  src={selectedItem.image || 'https://placehold.co/600x300/e5e7eb/9ca3af?text=No+Image'}
                  alt={selectedItem.name}
                  className="inv-detail-img"
                />
                <div className="inv-detail-body">
                  <div className="inv-detail-top">
                    <div>
                      <span className="inv-detail-category">{selectedItem.category}</span>
                      <h2 className="inv-detail-name">{selectedItem.name}</h2>
                      <p className="inv-detail-desc">{selectedItem.description}</p>
                    </div>
                    <div className="inv-detail-prices">
                      <span className="inv-detail-rental">Rs.{selectedItem.rentalPrice}<span>/day</span></span>
                      <span className="inv-detail-market">Market: Rs.{selectedItem.marketPrice}</span>
                      <span className="inv-detail-save">
                        Save Rs.{selectedItem.marketPrice - selectedItem.rentalPrice}
                      </span>
                    </div>
                  </div>
                  <div className="inv-detail-meta">
                    <div className="inv-detail-rating">
                      <StarRating rating={Math.round(selectedItem.averageRating)} size={18} />
                      <span>{selectedItem.averageRating > 0 ? `${selectedItem.averageRating}/5` : 'No ratings'}</span>
                      <span className="inv-detail-revcount">({selectedItem.totalReviews} review{selectedItem.totalReviews !== 1 ? 's' : ''})</span>
                    </div>
                    <p className="inv-detail-owner">
                      Listed by{' '}
                      <button
                        className="inv-owner-link"
                        onClick={() => navigate(`/profile/${selectedItem.lender?._id}`)}
                      >
                        {selectedItem.lender?.name}
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        {filtered.length === 0 ? (
          <div className="inv-empty">
            <span>📦</span>
            <p>No items match your search.</p>
          </div>
        ) : (
          <div className="inv-grid">
            {filtered.map((item) => {
              const badge = getReliability(item.averageRating, item.totalReviews);
              return (
                <motion.div
                  key={item._id}
                  className="inv-card"
                  whileHover={{ y: -4, boxShadow: '0 8px 28px rgba(40,28,89,0.13)' }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="inv-card-img">
                    <img
                      src={item.image || 'https://placehold.co/300x200/e5e7eb/9ca3af?text=No+Image'}
                      alt={item.name}
                    />
                    <span className="inv-card-cat">{item.category}</span>
                  </div>
                  <div className="inv-card-body">
                    <h3 className="inv-card-name">{item.name}</h3>
                    <div className="inv-card-prices">
                      <span className="inv-card-rental">Rs.{item.rentalPrice}/day</span>
                      <span className="inv-card-market">Rs.{item.marketPrice}</span>
                    </div>
                    <div className="inv-card-rating">
                      <StarRating rating={Math.round(item.averageRating)} size={14} />
                      <span className="inv-card-rating-val">
                        {item.averageRating > 0 ? `${item.averageRating}/5` : 'No ratings'}
                      </span>
                      <span className={`inv-badge ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <p className="inv-card-owner">
                      By{' '}
                      <button
                        className="inv-owner-link"
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.lender?._id}`); }}
                      >
                        {item.lender?.name}
                      </button>
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
