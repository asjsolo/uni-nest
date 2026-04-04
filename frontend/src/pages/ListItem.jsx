import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';
import './ListItem.css';

const CATEGORIES = ['Electronics', 'Books', 'Tools', 'Clothing', 'Sports', 'Furniture', 'Kitchen', 'Other'];

const INITIAL_FORM = {
  name: '',
  category: '',
  description: '',
  pricePerDay: '',
  discountPercentage: '',
  quantity: '',
  availabilityStatus: 'Available',
  minRentalDays: '',
  maxRentalDays: '',
  pickupLocation: '',
  finePerDay: '10',
};

const ListItem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const editingData = location.state?.item || location.state?.draft || null;
  const isPublishedEdit = !!location.state?.item;

  const [form, setForm] = useState(editingData ? {
    name: editingData.name || '',
    category: editingData.category || '',
    description: editingData.description || '',
    pricePerDay: editingData.pricePerDay?.toString() || '',
    discountPercentage: editingData.discountPercentage?.toString() || '',
    quantity: editingData.quantity?.toString() || '',
    availabilityStatus: editingData.availabilityStatus || 'Available',
    minRentalDays: editingData.minRentalDays?.toString() || '',
    maxRentalDays: editingData.maxRentalDays?.toString() || '',
    pickupLocation: editingData.pickupLocation || '',
    finePerDay: editingData.finePerDay?.toString() || '10',
  } : INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editingData?.image ? `http://localhost:5000${editingData.image}` : null);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [serverError, setServerError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!editingData;

  // ─── Validation ───────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Item name is required.';
    if (!form.category) newErrors.category = 'Please select a category.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    else if (form.description.trim().length < 10)
      newErrors.description = 'Description must be at least 10 characters.';

    if (!form.pricePerDay) {
      newErrors.pricePerDay = 'Price per day is required.';
    } else if (isNaN(form.pricePerDay) || Number(form.pricePerDay) <= 0) {
      newErrors.pricePerDay = 'Price per day must be greater than 0.';
    }

    if (form.discountPercentage !== '') {
      const disc = Number(form.discountPercentage);
      if (isNaN(disc) || disc < 0 || disc > 100)
        newErrors.discountPercentage = 'Discount must be between 0 and 100.';
    }

    if (!form.quantity) {
      newErrors.quantity = 'Quantity is required.';
    } else if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1) {
      newErrors.quantity = 'Quantity must be a whole number ≥ 1.';
    }

    if (!form.minRentalDays) {
      newErrors.minRentalDays = 'Minimum rental days is required.';
    } else if (!Number.isInteger(Number(form.minRentalDays)) || Number(form.minRentalDays) < 1) {
      newErrors.minRentalDays = 'Minimum rental days must be ≥ 1.';
    }

    if (!form.maxRentalDays) {
      newErrors.maxRentalDays = 'Maximum rental days is required.';
    } else if (!Number.isInteger(Number(form.maxRentalDays)) || Number(form.maxRentalDays) < 1) {
      newErrors.maxRentalDays = 'Maximum rental days must be ≥ 1.';
    } else if (form.minRentalDays && Number(form.maxRentalDays) < Number(form.minRentalDays)) {
      newErrors.maxRentalDays = 'Max rental days must be ≥ min rental days.';
    }

    if (!form.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required.';

    if (form.finePerDay !== '' && (isNaN(form.finePerDay) || Number(form.finePerDay) < 0)) {
      newErrors.finePerDay = 'Fine per day must be 0 or greater.';
    }

    return newErrors;
  };

  // ─── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'discountPercentage' && value !== '') {
      const numValue = Number(value);
      if (numValue > 100) return;
      if (numValue < 0) return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (file) => {
    setImageError('');
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Only JPG and PNG images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size must not exceed 2MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buildFormData = (status) => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => { fd.append(key, val); });
    fd.append('status', status);
    if (imageFile) fd.append('image', imageFile);
    return fd;
  };

  const sendRequest = async (formData, itemId = null) => {
    const token = localStorage.getItem('token');
    const url = itemId
      ? `http://localhost:5000/api/inventory/items/${itemId}`
      : `http://localhost:5000/api/inventory/items/create`;
    const method = itemId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed.');
    return data;
  };

  const handleSaveDraft = async () => {
    setServerError('');
    setSavingDraft(true);
    try {
      const filledFields = Object.entries(form).filter(([key, val]) => {
        if (key === 'availabilityStatus' || key === 'finePerDay') return false;
        return val.trim() !== '';
      });

      if (filledFields.length === 0) {
        setServerError('Please fill at least one field before saving as draft.');
        setSavingDraft(false);
        return;
      }

      const fd = buildFormData('draft');
      await sendRequest(fd, editingData?._id);
      navigate('/lender-dashboard', { state: { draftSaved: true } });
    } catch (err) {
      setServerError(err.message || 'Failed to save draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorEl = document.querySelector('.input-error');
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const fd = buildFormData('published');
      await sendRequest(fd, editingData?._id);
      navigate('/lender-dashboard', { state: { itemListed: true } });
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-bg" />
      <div className="list-item-layout">
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
            <a href="/lender-dashboard" className="nav-item">
              <span className="nav-icon">📊</span> Dashboard
            </a>
            <a href="#" className="nav-item active">
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

          <button className="sidebar-logout" onClick={() => navigate('/lender-dashboard')}>
            <span>←</span> Back to Dashboard
          </button>
        </aside>

        {/* Main Content */}
        <main className="list-item-main">
          {/* Header */}
          <div className="list-item-header fade-up">
            <button className="back-btn" onClick={() => navigate('/lender-dashboard')}>
              ← Back
            </button>
            <div className="list-item-title-block">
              <h1>{isPublishedEdit ? '✏️ Edit Item' : (isEditing ? '✏️ Edit Draft' : '📦 List a New Item')}</h1>
              <p>
                {isPublishedEdit 
                  ? 'Update your published item details.'
                  : (isEditing
                     ? 'Continue editing your saved draft and publish when ready.'
                     : 'Fill in the details below to list your item or save it as a draft.')}
              </p>
            </div>
            {isEditing && !isPublishedEdit && (
              <span className="draft-badge-header">📝 Draft</span>
            )}
            {isPublishedEdit && (
              <span className="draft-badge-header" style={{backgroundColor: 'var(--success-color)', color: 'white'}}>✅ Published</span>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="alert-error fade-up">⚠️ {serverError}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="glass-card list-item-form-card fade-up" style={{ animationDelay: '0.1s' }}>

              {/* ── Section 1: Basic Info ── */}
              <div className="form-section">
                <div className="form-section-title">📋 Basic Information</div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="name">Item Name <span className="required-star">*</span></label>
                    <input
                      id="name" name="name" type="text"
                      className={`form-input ${errors.name ? 'input-error' : ''}`}
                      placeholder="e.g. Wireless Headphones"
                      value={form.name} onChange={handleChange}
                    />
                    {errors.name && <span className="field-error">⚠ {errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category <span className="required-star">*</span></label>
                    <select
                      id="category" name="category"
                      className={`form-select ${errors.category ? 'input-error' : ''}`}
                      value={form.category} onChange={handleChange}
                    >
                      <option value="">Select a category…</option>
                      {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                    {errors.category && <span className="field-error">⚠ {errors.category}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description <span className="required-star">*</span></label>
                  <textarea
                    id="description" name="description"
                    className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                    placeholder="Describe your item — condition, brand, features…"
                    value={form.description} onChange={handleChange} maxLength={200}
                  />
                  <span className="field-hint">{form.description.length}/200 characters</span>
                  {errors.description && <span className="field-error">⚠ {errors.description}</span>}
                </div>
              </div>

              {/* ── Section 2: Pricing ── */}
              <div className="form-section">
                <div className="form-section-title">💰 Pricing Details</div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="pricePerDay">Price Per Day <span className="required-star">*</span></label>
                    <div className="input-prefix-wrapper">
                      <span className="input-prefix">Rs.</span>
                      <input
                        id="pricePerDay" name="pricePerDay" type="number"
                        min="0.01" step="0.01"
                        className={`form-input ${errors.pricePerDay ? 'input-error' : ''}`}
                        placeholder="0.00" value={form.pricePerDay} onChange={handleChange}
                      />
                    </div>
                    <span className="field-hint">Must be greater than 0</span>
                    {errors.pricePerDay && <span className="field-error">⚠ {errors.pricePerDay}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="discountPercentage">Discount Percentage</label>
                    <div className="input-suffix-wrapper">
                      <input
                        id="discountPercentage" name="discountPercentage" type="number"
                        min="0" max="100" step="1"
                        className={`form-input ${errors.discountPercentage ? 'input-error' : ''}`}
                        placeholder="0" value={form.discountPercentage} onChange={handleChange}
                      />
                      <span className="input-suffix">%</span>
                    </div>
                    <span className="field-hint">Optional. Range: 0–100%</span>
                    {errors.discountPercentage && <span className="field-error">⚠ {errors.discountPercentage}</span>}
                  </div>
                </div>

                {/* Fine Per Day */}
                <div className="form-group fine-per-day-group">
                  <label htmlFor="finePerDay">
                    ⚠️ Late Return Fine Per Day
                    <span className="fine-badge">Overdue Policy</span>
                  </label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">Rs.</span>
                    <input
                      id="finePerDay" name="finePerDay" type="number"
                      min="0" step="1"
                      className={`form-input ${errors.finePerDay ? 'input-error' : ''}`}
                      placeholder="10" value={form.finePerDay} onChange={handleChange}
                    />
                  </div>
                  <span className="field-hint">Amount charged per day if the borrower returns the item late. Default: Rs. 10/day</span>
                  {errors.finePerDay && <span className="field-error">⚠ {errors.finePerDay}</span>}
                </div>
              </div>

              {/* ── Section 3: Availability ── */}
              <div className="form-section">
                <div className="form-section-title">📦 Availability</div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity <span className="required-star">*</span></label>
                    <input
                      id="quantity" name="quantity" type="number" min="1" step="1"
                      className={`form-input ${errors.quantity ? 'input-error' : ''}`}
                      placeholder="1" value={form.quantity} onChange={handleChange}
                    />
                    <span className="field-hint">Must be at least 1</span>
                    {errors.quantity && <span className="field-error">⚠ {errors.quantity}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="availabilityStatus">Availability Status <span className="required-star">*</span></label>
                    <select id="availabilityStatus" name="availabilityStatus" className="form-select"
                      value={form.availabilityStatus} onChange={handleChange}>
                      <option value="Available">✅ Available</option>
                      <option value="Out of Stock">❌ Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Section 4: Rental Conditions ── */}
              <div className="form-section">
                <div className="form-section-title">📅 Rental Conditions</div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label htmlFor="minRentalDays">Min. Rental Days <span className="required-star">*</span></label>
                    <input
                      id="minRentalDays" name="minRentalDays" type="number" min="1" step="1"
                      className={`form-input ${errors.minRentalDays ? 'input-error' : ''}`}
                      placeholder="1" value={form.minRentalDays} onChange={handleChange}
                    />
                    {errors.minRentalDays && <span className="field-error">⚠ {errors.minRentalDays}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxRentalDays">Max. Rental Days <span className="required-star">*</span></label>
                    <input
                      id="maxRentalDays" name="maxRentalDays" type="number" min="1" step="1"
                      className={`form-input ${errors.maxRentalDays ? 'input-error' : ''}`}
                      placeholder="30" value={form.maxRentalDays} onChange={handleChange}
                    />
                    {errors.maxRentalDays && <span className="field-error">⚠ {errors.maxRentalDays}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pickupLocation">Pickup Location <span className="required-star">*</span></label>
                    <input
                      id="pickupLocation" name="pickupLocation" type="text"
                      className={`form-input ${errors.pickupLocation ? 'input-error' : ''}`}
                      placeholder="e.g. Block A, Room 204"
                      value={form.pickupLocation} onChange={handleChange}
                    />
                    {errors.pickupLocation && <span className="field-error">⚠ {errors.pickupLocation}</span>}
                  </div>
                </div>
              </div>

              {/* ── Section 5: Image Upload ── */}
              <div className="form-section">
                <div className="form-section-title">🖼️ Item Images</div>

                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button type="button" className="image-remove-btn" onClick={handleRemoveImage}>✕</button>
                  </div>
                ) : (
                  <div
                    className={`image-upload-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleImageChange(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">Click or drag &amp; drop an image here</div>
                    <div className="upload-hint">Accepted: JPG, PNG &nbsp;•&nbsp; Max size: 2MB</div>
                  </div>
                )}
                {imageError && <span className="field-error">⚠ {imageError}</span>}
              </div>

              {/* ── Submit ── */}
              <div className="form-submit-area">
                <button
                  type="button" className="btn-cancel-item"
                  onClick={() => navigate('/lender-dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-draft-item"
                  onClick={handleSaveDraft}
                  disabled={savingDraft || submitting}
                >
                  {savingDraft ? <><span className="spin" /> Saving…</> : <>📝 Save as Draft</>}
                </button>
                <button
                  type="submit" className="btn-submit-item"
                  disabled={submitting || savingDraft}
                >
                  {submitting ? <><span className="spin" /> Publishing…</> : <>🚀 {isPublishedEdit ? 'Save Changes' : 'Publish Item'}</>}
                </button>
              </div>

            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default ListItem;
