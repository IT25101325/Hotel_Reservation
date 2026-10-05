import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ToastAlert from '../components/ToastAlert';
import Modal from '../components/Modal';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  BedDouble,
  AlertCircle,
  X
} from 'lucide-react';

const VenueManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms', 'venues'
  const [allInventory, setAllInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Room / Venue Modal State
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [venueName, setVenueName] = useState('');
  const [venueType, setVenueType] = useState('ROOM');
  const [venueCategory, setVenueCategory] = useState('DELUXE_ROOM');
  const [venueCapacity, setVenueCapacity] = useState('');
  const [venuePricePerNight, setVenuePricePerNight] = useState('');
  const [venueFacilities, setVenueFacilities] = useState('');
  const [venueDescription, setVenueDescription] = useState('');
  const [venueImageUrl, setVenueImageUrl] = useState('');
  const [venueImageError, setVenueImageError] = useState(null);
  const [venueModalError, setVenueModalError] = useState(null);
  const [imagePreviewLoaded, setImagePreviewLoaded] = useState(false);
  const [venueAvailable, setVenueAvailable] = useState(true);
  const [submittingVenue, setSubmittingVenue] = useState(false);

  const loadAllData = async () => {
    try {
      const invRes = await api.get('/venue-ops/manage/all').catch(() => ({ data: [] }));
      setAllInventory(Array.isArray(invRes.data) ? invRes.data : []);
    } catch (err) {
      console.error('Failed to load venue management data', err);
      setAlert({ type: 'error', message: 'Failed to load venue & inventory details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered lists
  const roomsList = allInventory.filter(item => item.type === 'ROOM');
  const venuesList = allInventory.filter(item => item.type !== 'ROOM');

  // Open Room / Venue modal
  const openCreateItemModal = (defaultType = 'ROOM') => {
    setEditingVenueId(null);
    setVenueName('');
    setVenueType(defaultType);
    setVenueCategory(defaultType === 'ROOM' ? 'DELUXE' : 'GRAND_BALLROOM');
    setVenueCapacity(defaultType === 'ROOM' ? 2 : 100);
    setVenuePricePerNight('');
    setVenueFacilities('');
    setVenueDescription('');
    setVenueImageUrl('');
    setVenueImageError(null);
    setVenueModalError(null);
    setImagePreviewLoaded(false);
    setVenueAvailable(true);
    setIsVenueModalOpen(true);
  };

  const openEditItemModal = (v) => {
    setEditingVenueId(v.id);
    setVenueName(v.name);
    setVenueType(v.type);
    setVenueCategory(v.category || 'DELUXE');
    setVenueCapacity(v.capacity);
    setVenuePricePerNight(v.pricePerNight);
    setVenueFacilities(v.facilities || '');
    setVenueDescription(v.description || '');
    setVenueImageUrl(v.imageUrl || '');
    setVenueImageError(null);
    setVenueModalError(null);
    setImagePreviewLoaded(Boolean(v.imageUrl));
    setVenueAvailable(v.available);
    setIsVenueModalOpen(true);
  };

  const handleVenueFormSubmit = async (e) => {
    e.preventDefault();
    setVenueImageError(null);
    setVenueModalError(null);

    // Limitation: Photo URL is strictly required. Without a URL we cannot go forward!
    const trimmedUrl = (venueImageUrl || '').trim();
    if (!trimmedUrl) {
      setVenueImageError('High-Resolution Photo URL is strictly required. You cannot proceed or save without providing a photo URL.');
      setVenueModalError('Photo URL is strictly required to proceed.');
      return;
    }

    if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
      setVenueImageError('Please enter a valid web URL starting with http:// or https:// (e.g. https://images.unsplash.com/...)');
      setVenueModalError('Please enter a valid photo web URL starting with http:// or https://');
      return;
    }

    setSubmittingVenue(true);

    const payload = {
      name: venueName,
      type: venueType,
      category: venueCategory,
      capacity: parseInt(venueCapacity, 10),
      pricePerNight: parseFloat(venuePricePerNight),
      facilities: venueFacilities,
      description: venueDescription,
      imageUrl: trimmedUrl,
      available: venueAvailable
    };

    try {
      if (editingVenueId) {
        await api.put(`/venue-ops/manage/${editingVenueId}`, payload);
        setAlert({ type: 'success', message: `Space #${editingVenueId} updated successfully.` });
      } else {
        await api.post('/venue-ops/manage', payload);
        setAlert({ type: 'success', message: `New ${venueType === 'ROOM' ? 'Room' : 'Venue'} created.` });
      }
      setIsVenueModalOpen(false);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save space details.';
      setVenueModalError(msg);
    } finally {
      setSubmittingVenue(false);
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await api.patch(`/venue-ops/manage/${id}/status`, null, {
        params: { available: !currentStatus }
      });
      setAlert({ type: 'success', message: `Availability status updated for #${id}.` });
      loadAllData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update availability.';
      setAlert({ type: 'error', message: errorMsg });
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}" (#${id})? This cannot be undone.`)) return;
    try {
      await api.delete(`/venue-ops/manage/${id}`);
      setAlert({ type: 'info', message: `Item #${id} removed successfully.` });
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete item.';
      setAlert({ type: 'error', message: msg });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gold-primary)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>
          Loading Venue Operations Portal...
        </h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '2.5rem auto 5rem auto', padding: '0 1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '2.25rem',
        marginBottom: '2.5rem',
        background: 'linear-gradient(135deg, rgba(16, 25, 46, 0.95) 0%, rgba(10, 16, 31, 0.98) 100%)',
        border: '1px solid var(--border-accent)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'var(--gold-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000'
            }}>
              <Building2 size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>
                Venue & Accommodation Operations
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Inventory Management • Real-Time Availability Toggle • Facility Amenities • Nightly Tariffs
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => openCreateItemModal('ROOM')} className="btn btn-outline btn-sm">
              <Plus size={15} /> Add Room / Suite
            </button>
            <button onClick={() => openCreateItemModal('BANQUET_HALL')} className="btn btn-gold btn-sm">
              <Plus size={15} /> Add Event Venue
            </button>
          </div>
        </div>
      </div>

      <ToastAlert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Tabs */}
      <div className="tabs-container">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
        >
          <BedDouble size={17} /> Rooms & Luxury Suites ({roomsList.length})
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={`tab-btn ${activeTab === 'venues' ? 'active' : ''}`}
        >
          <Building2 size={17} /> Event Venues & Banquet Halls ({venuesList.length})
        </button>
      </div>

      {/* Grid of Spaces */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '2rem'
      }}>
        {(activeTab === 'rooms' ? roomsList : venuesList).map((space) => (
          <div key={space.id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
              <img 
                src={space.imageUrl || (activeTab === 'rooms' 
                  ? "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                  : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80")} 
                alt={space.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge badge-gold" style={{ position: 'absolute', top: '14px', left: '14px' }}>
                {space.type ? space.type.replace('_', ' ') : 'SPACE'}
              </span>

              {/* Real-time Availability Pill Toggle */}
              <button
                onClick={() => handleToggleAvailability(space.id, space.available)}
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                title="Click to toggle availability"
              >
                {space.available ? (
                  <span className="badge badge-confirmed">AVAILABLE</span>
                ) : (
                  <span className="badge badge-rejected">UNAVAILABLE</span>
                )}
              </button>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>{space.name}</h3>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                  LKR {space.pricePerNight}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Category: <strong>{space.category || 'STANDARD'}</strong> • Capacity: <strong>{space.capacity} Guests</strong>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem', flexGrow: 1 }}>
                {space.description}
              </p>

              {/* Facilities Chips */}
              {space.facilities && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {space.facilities.split(',').map((f, idx) => (
                    <span key={idx} style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem'
                    }}>
                      {f.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: 'auto' }}>
                <button onClick={() => openEditItemModal(space)} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                  <Edit3 size={14} /> Edit
                </button>
                <button onClick={() => handleDeleteItem(space.id, space.name)} className="btn btn-danger btn-sm">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal 
        isOpen={isVenueModalOpen} 
        onClose={() => {
          setIsVenueModalOpen(false);
          setVenueModalError(null);
          setVenueImageError(null);
        }} 
        title={editingVenueId ? `Edit Space: ${venueName}` : `Add New ${venueType === 'ROOM' ? 'Room' : 'Venue'}`}
      >
        {/* In-Modal Error Alert Banner */}
        {venueModalError && (
          <div className="animate-fade-in" style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1.1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.55)',
            color: '#fca5a5',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>{venueModalError}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setVenueModalError(null)} 
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0 }}
              title="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleVenueFormSubmit}>
          <div className="form-group">
            <label className="form-label">Space / Room Name *</label>
            <input type="text" className="form-input" value={venueName} onChange={(e) => setVenueName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={venueType} onChange={(e) => setVenueType(e.target.value)}>
                <option value="ROOM">Hotel Room / Suite</option>
                <option value="BANQUET_HALL">Banquet Ballroom</option>
                <option value="GARDEN_VENUE">Oceanfront Garden</option>
                <option value="CONFERENCE_HALL">Conference Hall</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category Code</label>
              <input type="text" className="form-input" value={venueCategory} onChange={(e) => setVenueCategory(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Guest Capacity *</label>
              <input type="number" className="form-input" value={venueCapacity} onChange={(e) => setVenueCapacity(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Price Per Night (LKR) *</label>
              <input type="number" step="0.01" className="form-input" value={venuePricePerNight} onChange={(e) => setVenuePricePerNight(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>High-Resolution Photo URL * (Required)</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: !venueImageUrl.trim() ? '#ef4444' : 'var(--emerald-primary)' }}>
                {!venueImageUrl.trim() ? 'Required to proceed' : '✓ Photo URL Added'}
              </span>
            </div>
            <input 
              type="url" 
              required
              className="form-input" 
              placeholder="https://images.unsplash.com/photo-..." 
              value={venueImageUrl} 
              onChange={(e) => {
                setVenueImageUrl(e.target.value);
                if (venueImageError) setVenueImageError(null);
                setImagePreviewLoaded(false);
              }}
              style={venueImageError || !venueImageUrl.trim() ? { borderColor: '#ef4444', background: 'rgba(38, 18, 28, 0.95)', color: '#ffffff', boxShadow: '0 0 0 1px #ef4444' } : {}}
            />

            {/* In-place Red Notice if URL is missing or invalid */}
            {venueImageError ? (
              <div className="animate-fade-in" style={{
                marginTop: '0.5rem',
                padding: '0.65rem 0.9rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.16)',
                border: '1px solid rgba(239, 68, 68, 0.55)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{venueImageError}</span>
              </div>
            ) : !venueImageUrl.trim() ? (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={13} color="#ef4444" />
                <span>Limitation: A photo URL is strictly required. You cannot proceed or save without adding a photo URL.</span>
              </div>
            ) : null}

            {/* Live Photo Preview Box */}
            {venueImageUrl.trim() && (
              <div className="animate-fade-in" style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}>
                <div style={{ width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#0b111e', flexShrink: 0, position: 'relative' }}>
                  <img 
                    src={venueImageUrl.trim()} 
                    alt="Space preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onLoad={() => setImagePreviewLoaded(true)}
                    onError={() => {
                      setImagePreviewLoaded(false);
                      setVenueImageError('Could not load image from this URL. Please verify the link points directly to a valid photo.');
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  <div style={{ color: '#fff', fontWeight: 600 }}>Live Photo Preview</div>
                  <div style={{ color: imagePreviewLoaded ? 'var(--emerald-primary)' : 'var(--text-muted)' }}>
                    {imagePreviewLoaded ? '✓ Photo loaded successfully' : 'Verifying image source...'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Facilities & Amenities (comma-separated)</label>
            <input type="text" className="form-input" placeholder="e.g. Central AC, Jacuzzi, Balcony, Wi-Fi..." value={venueFacilities} onChange={(e) => setVenueFacilities(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Description</label>
            <textarea rows={3} className="form-textarea" value={venueDescription} onChange={(e) => setVenueDescription(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            {!venueImageUrl.trim() && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={14} /> Photo URL required to save
              </span>
            )}
            <button type="button" onClick={() => setIsVenueModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button 
              type="submit" 
              disabled={submittingVenue || !venueImageUrl.trim()} 
              className="btn btn-gold"
              title={!venueImageUrl.trim() ? "A photo URL is strictly required before saving" : "Save Space"}
              style={{
                opacity: !venueImageUrl.trim() ? 0.55 : 1,
                cursor: !venueImageUrl.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {submittingVenue ? 'Saving...' : 'Save Space'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default VenueManagerDashboard;
