import React from 'react';
import './Dashboard.css';

const BrowseItems = () => {
  return (
    <div className="dashboard-layout">
      <main className="dashboard-main">
        <div className="dashboard-header fade-up">
          <h1 className="dashboard-greeting">Browse Items</h1>
          <p className="dashboard-date">Find items to borrow from lenders on your campus.</p>
        </div>
        <div className="glass-card empty-state fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="empty-icon">🔍</div>
          <h3>Items will appear here</h3>
          <p>The browse items feature is under construction.</p>
        </div>
      </main>
    </div>
  );
};

export default BrowseItems;
