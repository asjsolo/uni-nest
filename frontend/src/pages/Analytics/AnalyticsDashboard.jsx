import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStudentSummary,
  getRentalHistory,
  getTrustScore,
} from '../../api/analyticsApi';
import { useAuth } from '../../context/AuthContext';
import TrustScore from '../../components/TrustScore';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const { currentUser: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const currentUser = authUser?._id || '';

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trustData, setTrustData] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [rentalFilter, setRentalFilter] = useState({ status: '', role: '' });

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetchSummary(),
        fetchRentals(),
        fetchTrustScore(),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchRentals();
  }, [rentalFilter]);

  const fetchSummary = async () => {
    try {
      const res = await getStudentSummary(currentUser);
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const fetchTrustScore = async () => {
    try {
      const res = await getTrustScore(currentUser);
      setTrustData(res.data);
    } catch (err) {
      console.error('Failed to load trust score:', err);
    }
  };

  const fetchRentals = async () => {
    try {
      const params = {};
      if (rentalFilter.status) params.status = rentalFilter.status;
      if (rentalFilter.role) params.role = rentalFilter.role;
      const res = await getRentalHistory(currentUser, params);
      setRentals(res.data);
    } catch (err) {
      console.error('Failed to load rentals:', err);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="dash-back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <h1>UNI NEST</h1>
          <span className="header-subtitle">My Analytics</span>
        </div>
        <div className="header-right">
          <button className="dash-profile-btn" onClick={() => navigate('/profile')}>
            <div className="dash-avatar">{authUser?.name?.charAt(0)}</div>
            <span>{authUser?.name}</span>
          </button>
          <button className="dash-logout-btn" onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
        </div>
      </header>

      <div className="dashboard-body">
        {!currentUser ? (
          <div className="empty-state">
            <h2>Not logged in</h2>
            <p>Please log in to view your analytics.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <div className="summary-section">
                <h2>Savings & Earnings Summary</h2>
                <div className="summary-cards">
                  <div className="summary-card card-savings">
                    <div className="card-icon">&#8595;</div>
                    <div className="card-content">
                      <span className="card-label">Total Savings</span>
                      <span className="card-value">Rs.{summary.asBorrower.totalSavings.toLocaleString()}</span>
                      <span className="card-sub">vs buying at market price</span>
                    </div>
                  </div>
                  <div className="summary-card card-spent">
                    <div className="card-icon">&#8593;</div>
                    <div className="card-content">
                      <span className="card-label">Total Spent</span>
                      <span className="card-value">Rs.{summary.asBorrower.totalSpent.toLocaleString()}</span>
                      <span className="card-sub">on {summary.asBorrower.completedRentals} completed rental{summary.asBorrower.completedRentals !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="summary-card card-earnings">
                    <div className="card-icon">$</div>
                    <div className="card-content">
                      <span className="card-label">Total Earnings</span>
                      <span className="card-value">Rs.{summary.asLender.totalEarnings.toLocaleString()}</span>
                      <span className="card-sub">from {summary.asLender.completedRentals} item{summary.asLender.completedRentals !== 1 ? 's' : ''} lent</span>
                    </div>
                  </div>
                  <div className="summary-card card-ongoing">
                    <div className="card-icon">&#9654;</div>
                    <div className="card-content">
                      <span className="card-label">Ongoing Rentals</span>
                      <span className="card-value">{summary.totalOngoing}</span>
                      <span className="card-sub">{summary.asBorrower.ongoingRentals} borrowing, {summary.asLender.ongoingRentals} lending</span>
                    </div>
                  </div>
                </div>

                <div className="quick-stats">
                  <div className="stat-item">
                    <span className="stat-number">{summary.totalCompleted}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <span className="stat-number">{summary.totalOngoing}</span>
                    <span className="stat-label">Ongoing</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <span className="stat-number">{summary.totalCompleted + summary.totalOngoing}</span>
                    <span className="stat-label">Total Rentals</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Score */}
            <TrustScore trustData={trustData} />

            {/* Rental History */}
            <div className="rental-history-section">
              <div className="history-header">
                <h2>Rental History</h2>
                <div className="history-filters">
                  <select
                    value={rentalFilter.status}
                    onChange={(e) => setRentalFilter((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={rentalFilter.role}
                    onChange={(e) => setRentalFilter((f) => ({ ...f, role: e.target.value }))}
                  >
                    <option value="">All Roles</option>
                    <option value="borrower">As Borrower</option>
                    <option value="lender">As Lender</option>
                  </select>
                </div>
              </div>

              {rentals.length === 0 ? (
                <div className="empty-rentals">No rentals found matching the filters.</div>
              ) : (
                <div className="rental-table-wrapper">
                  <table className="rental-table">
                    <thead>
                      <tr>
                        <th>Rental ID</th>
                        <th>Item</th>
                        <th>Role</th>
                        <th>With</th>
                        <th>Duration</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map((r) => (
                        <tr key={r._id}>
                          <td className="rental-id-cell">{r.rentalId}</td>
                          <td>
                            <div className="rental-item-cell">
                              {r.item?.image && (
                                <img src={r.item.image} alt={r.itemName} className="rental-item-thumb" />
                              )}
                              <span>{r.itemName}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`role-badge role-${r.userRole}`}>
                              {r.userRole === 'borrower' ? 'Borrower' : 'Lender'}
                            </span>
                          </td>
                          <td>{r.userRole === 'borrower' ? r.lender?.name : r.borrower?.name}</td>
                          <td>{r.durationDays} day{r.durationDays !== 1 ? 's' : ''}</td>
                          <td className="cost-cell">
                            <span>Rs.{r.totalCost}</span>
                            {r.userRole === 'borrower' && (
                              <span className="saved-inline">
                                saved Rs.{(r.marketPrice * r.durationDays) - r.totalCost}
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge status-${r.status}`}>
                              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            </span>
                          </td>
                          <td className="date-cell">
                            {new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {r.endDate && (
                              <> - {new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
