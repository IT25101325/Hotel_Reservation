import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ToastAlert from '../components/ToastAlert';
import Modal from '../components/Modal';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Eye,
  EyeOff, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';

const EventCoordinatorDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  // Package Modal State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('WEDDING');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(null);
  const [capacityError, setCapacityError] = useState(null);
  const [packageModalError, setPackageModalError] = useState(null);
  const [imagePreviewLoaded, setImagePreviewLoaded] = useState(false);
  const [servicesInput, setServicesInput] = useState('');
  const [submittingPackage, setSubmittingPackage] = useState(false);

  // Package Service Inline Add State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedPkgForService, setSelectedPkgForService] = useState(null);
  const [newServiceName, setNewServiceName] = useState('');

  const loadAllData = async () => {
    try {
      const pkgRes = await api.get('/event-packages/manage/all').catch(() => ({ data: [] }));
      setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
    } catch (err) {
      console.error('Failed to fetch event packages', err);
      setAlert({ type: 'error', message: 'Failed to load event packages.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered packages
  const filteredPackages = packages.filter(p => {
    if (filterType === 'ALL') return true;
    return p.eventType === filterType;
  });

  const publishedCount = packages.filter(p => p.published || p.isPublished).length;
  const draftCount = packages.length - publishedCount;

  // PACKAGE HANDLERS
  const openCreatePackageModal = () => {
    setEditingPkgId(null);
    setName('');
    setEventType('WEDDING');
    setDescription('');
    setPrice('');
    setMaxCapacity('');
    setDiscountPercentage(0);
    setImageUrl('');
    setImageError(null);
    setCapacityError(null);
    setPackageModalError(null);
    setImagePreviewLoaded(false);
    setServicesInput('');
    setIsPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg) => {
    setEditingPkgId(pkg.id);
    setName(pkg.name);
    setEventType(pkg.eventType);
    setDescription(pkg.description || '');
    setPrice(pkg.price);
    setMaxCapacity(pkg.maxCapacity);
    setDiscountPercentage(pkg.discountPercentage || 0);
    setImageUrl(pkg.imageUrl || '');
    setImageError(null);
    setCapacityError(null);
    setPackageModalError(null);
    setImagePreviewLoaded(Boolean(pkg.imageUrl));
    setServicesInput(pkg.includedServices ? pkg.includedServices.join(', ') : '');
    setIsPackageModalOpen(true);
  };

  const handlePackageFormSubmit = async (e) => {
    e.preventDefault();
    setImageError(null);
    setCapacityError(null);
    setPackageModalError(null);

    // Limitation: Photo URL is strictly required. Without a URL we cannot go forward!
    const trimmedUrl = (imageUrl || '').trim();
    if (!trimmedUrl) {
      setImageError('Package Photo URL is strictly required. You cannot proceed or save without providing a photo URL.');
      setPackageModalError('Package photo URL is strictly required. You cannot proceed or save without adding a photo URL.');
      return;
    }

    if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
      setImageError('Please enter a valid web URL starting with http:// or https:// (e.g. https://images.unsplash.com/...)');
      setPackageModalError('Please enter a valid web URL starting with http:// or https://');
      return;
    }

    // Capacity validation (Backend requirement: Package maximum capacity must be at least 2 person.)
    const parsedCapacity = parseInt(maxCapacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity < 2) {
      const capMsg = 'Package maximum capacity must be at least 2 person.';
      setCapacityError(capMsg);
      setPackageModalError(capMsg);
      return;
    }

    setSubmittingPackage(true);
    const servicesList = servicesInput.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name,
      eventType,
      description,
      price: parseFloat(price),
      maxCapacity: parsedCapacity,
      discountPercentage: parseFloat(discountPercentage),
      imageUrl: trimmedUrl,
      includedServices: servicesList
    };

    try {
      if (editingPkgId) {
        await api.put(`/event-packages/manage/${editingPkgId}`, payload);
        setAlert({ type: 'success', message: `Event package #${editingPkgId} updated successfully.` });
      } else {
        await api.post('/event-packages/manage', payload);
        setAlert({ type: 'success', message: 'New event package created as Draft.' });
      }
      setIsPackageModalOpen(false);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save package.';
      setPackageModalError(msg);
      if (msg.toLowerCase().includes('capacity')) {
        setCapacityError(msg);
      }
    } finally {
      setSubmittingPackage(false);
    }
  };

  const handlePublishToggle = async (id, currentPublishedStatus) => {
    let isCurrentlyPublished = currentPublishedStatus;
    if (typeof isCurrentlyPublished !== 'boolean') {
      const target = packages.find(p => p.id === id);
      isCurrentlyPublished = target ? Boolean(target.published || target.isPublished) : false;
    }

    try {
      const endpoint = isCurrentlyPublished 
        ? `/event-packages/manage/${id}/unpublish` 
        : `/event-packages/manage/${id}/publish`;

      const res = await api.patch(endpoint);
      const isNowPublished = res.data.published !== undefined ? res.data.published : res.data.isPublished;
      const newStatus = isNowPublished ? 'PUBLISHED & ACTIVE' : 'UNPUBLISHED (Draft)';
      setAlert({ type: 'success', message: `Package #${id} is now ${newStatus}.` });
      loadAllData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to change publish status.';
      setAlert({ type: 'error', message: errorMsg });
    }
  };

  const handleDeletePackage = async (id, pkgName) => {
    if (!window.confirm(`Delete package "${pkgName}" (#${id})?`)) return;
    try {
      await api.delete(`/event-packages/manage/${id}`);
      setAlert({ type: 'info', message: `Package #${id} removed.` });
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete package.';
      setAlert({ type: 'error', message: msg });
    }
  };

  // SERVICE MANAGEMENT HANDLERS
  const openServiceModal = (pkg) => {
    setSelectedPkgForService(pkg);
    setNewServiceName('');
    setServiceModalOpen(true);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!selectedPkgForService || !newServiceName.trim()) return;
    try {
      await api.post(`/event-packages/manage/${selectedPkgForService.id}/services`, {
        serviceName: newServiceName.trim()
      });
      setAlert({ type: 'success', message: `Service "${newServiceName.trim()}" added to package.` });
      setNewServiceName('');
      const updated = await api.get('/event-packages/manage/all');
      setPackages(updated.data);
      const cur = updated.data.find(p => p.id === selectedPkgForService.id);
      if (cur) setSelectedPkgForService(cur);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to add service.' });
    }
  };

  const handleRemoveService = async (serviceName) => {
    if (!selectedPkgForService) return;
    try {
      await api.delete(`/event-packages/manage/${selectedPkgForService.id}/services`, {
        params: { serviceName }
      });
      setAlert({ type: 'info', message: `Service "${serviceName}" removed.` });
      const updated = await api.get('/event-packages/manage/all');
      setPackages(updated.data);
      const cur = updated.data.find(p => p.id === selectedPkgForService.id);
      if (cur) setSelectedPkgForService(cur);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to remove service.' });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gold-primary)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>
          Loading Event Package Management...
        </h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '2.5rem auto 5rem auto', padding: '0 1.5rem' }}>
      
      {/* Top Banner */}
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
              <Sparkles size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>
                Event Package Management
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Curate signature experiences, configure included amenities, and publish all-inclusive event offerings.
              </p>
            </div>
          </div>

          <button onClick={openCreatePackageModal} className="btn btn-gold">
            <Plus size={16} /> Create Event Package
          </button>
        </div>
      </div>

      <ToastAlert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* KPI Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div className="stat-card">
          <div className="stat-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Packages</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{packages.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-primary)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Published & Live</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>{publishedCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <EyeOff size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Drafts</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{draftCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['ALL', 'WEDDING', 'CONFERENCE', 'BIRTHDAY', 'BANQUET'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`btn btn-sm ${filterType === cat ? 'btn-gold' : 'btn-outline'}`}
          >
            {cat === 'ALL' ? 'All Packages' : cat}
          </button>
        ))}
      </div>

      {/* Package Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '2rem'
      }}>
        {filteredPackages.map((pkg) => {
          const isPublished = pkg.published || pkg.isPublished;
          return (
            <div key={pkg.id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '220px', position: 'relative' }}>
                <img 
                  src={pkg.imageUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"} 
                  alt={pkg.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="badge badge-gold" style={{ position: 'absolute', top: '14px', left: '14px' }}>
                  {pkg.eventType}
                </span>

                <button
                  onClick={() => handlePublishToggle(pkg.id, isPublished)}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    padding: 0
                  }}
                  title={isPublished ? "Click to Unpublish package (set to Draft)" : "Click to Publish package live"}
                >
                  {isPublished ? (
                    <span className="badge badge-confirmed" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}>
                      <CheckCircle2 size={12} /> LIVE / PUBLISHED
                    </span>
                  ) : (
                    <span className="badge badge-pending" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' }}>
                      <EyeOff size={12} /> DRAFT / HIDDEN
                    </span>
                  )}
                </button>
              </div>

              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>{pkg.name}</h3>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                    LKR {pkg.price}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  Max Capacity: <strong>{pkg.maxCapacity} Guests</strong> • Discount: <strong>{pkg.discountPercentage || 0}%</strong>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem', flexGrow: 1 }}>
                  {pkg.description}
                </p>

                {/* Included Services */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                      SERVICES ({pkg.includedServices ? pkg.includedServices.length : 0})
                    </span>
                    <button 
                      onClick={() => openServiceModal(pkg)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--gold-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Manage Services
                    </button>
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {pkg.includedServices && pkg.includedServices.slice(0, 3).map((s, idx) => (
                      <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Check size={13} color="var(--emerald-primary)" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions Toolbar */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handlePublishToggle(pkg.id, isPublished)} 
                    className={`btn btn-sm ${isPublished ? 'btn-outline' : 'btn-gold'}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    title={isPublished ? "Unpublish to draft" : "Publish to live catalog"}
                  >
                    {isPublished ? (
                      <>
                        <EyeOff size={14} style={{ color: '#fbbf24' }} /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Publish
                      </>
                    )}
                  </button>
                  <button onClick={() => openEditPackageModal(pkg)} className="btn btn-outline btn-sm" style={{ padding: '0.45rem 0.85rem' }}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDeletePackage(pkg.id, pkg.name)} className="btn btn-danger btn-sm" title="Delete Package">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PACKAGE MODAL */}
      <Modal 
        isOpen={isPackageModalOpen} 
        onClose={() => {
          setIsPackageModalOpen(false);
          setPackageModalError(null);
          setCapacityError(null);
          setImageError(null);
        }} 
        title={editingPkgId ? 'Edit Event Package' : 'Create New Event Package'}
      >
        {/* In-Modal Error Alert Banner */}
        {packageModalError && (
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
              <span style={{ fontWeight: 500 }}>{packageModalError}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setPackageModalError(null)} 
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0 }}
              title="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handlePackageFormSubmit}>
          <div className="form-group">
            <label className="form-label">Package Name *</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Event Category</label>
              <select className="form-select" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="WEDDING">Wedding</option>
                <option value="CONFERENCE">Corporate Conference</option>
                <option value="BIRTHDAY">Birthday Jubilee</option>
                <option value="BANQUET">Gala Banquet</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price (LKR) *</label>
              <input type="number" step="0.01" min="0" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Max Guest Capacity *</label>
                {(capacityError || (maxCapacity !== '' && parseInt(maxCapacity, 10) < 2)) ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444' }}>Min 2 persons required</span>
                ) : maxCapacity !== '' && parseInt(maxCapacity, 10) >= 2 ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--emerald-primary)' }}>✓ Valid Capacity</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minimum 2</span>
                )}
              </div>
              <input 
                type="number" 
                min="2"
                className="form-input" 
                placeholder="e.g. 100"
                value={maxCapacity} 
                onChange={(e) => {
                  setMaxCapacity(e.target.value);
                  if (capacityError) setCapacityError(null);
                  if (packageModalError && packageModalError.toLowerCase().includes('capacity')) {
                    setPackageModalError(null);
                  }
                }} 
                required 
                style={
                  (capacityError || (maxCapacity !== '' && parseInt(maxCapacity, 10) < 2))
                    ? { borderColor: '#ef4444', background: 'rgba(38, 18, 28, 0.95)', color: '#ffffff', boxShadow: '0 0 0 1px #ef4444' }
                    : {}
                }
              />
              {/* In-place Red Notice if capacity is less than 2 or backend returns capacity error */}
              {capacityError ? (
                <div className="animate-fade-in" style={{
                  marginTop: '0.4rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.16)',
                  border: '1px solid rgba(239, 68, 68, 0.55)',
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span>{capacityError}</span>
                </div>
              ) : maxCapacity !== '' && parseInt(maxCapacity, 10) < 2 ? (
                <div className="animate-fade-in" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={13} color="#ef4444" />
                  <span>Limitation: Package maximum capacity must be at least 2 person.</span>
                </div>
              ) : null}
            </div>
            <div className="form-group">
              <label className="form-label">Discount Percentage (%)</label>
              <input type="number" step="0.5" min="0" max="100" className="form-input" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>High-Resolution Photo URL * (Required)</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: !imageUrl.trim() ? '#ef4444' : 'var(--emerald-primary)' }}>
                {!imageUrl.trim() ? 'Required to proceed' : '✓ Photo URL Added'}
              </span>
            </div>
            <input 
              type="url" 
              required
              className="form-input" 
              placeholder="https://images.unsplash.com/photo-..." 
              value={imageUrl} 
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (imageError) setImageError(null);
                setImagePreviewLoaded(false);
              }} 
              style={imageError || !imageUrl.trim() ? { borderColor: '#ef4444', background: 'rgba(38, 18, 28, 0.95)', color: '#ffffff', boxShadow: '0 0 0 1px #ef4444' } : {}}
            />

            {/* In-place Red Notice if URL is missing or invalid */}
            {imageError ? (
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
                <span>{imageError}</span>
              </div>
            ) : !imageUrl.trim() ? (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={13} color="#ef4444" />
                <span>Limitation: A photo URL is strictly required. You cannot proceed or save without adding a photo URL.</span>
              </div>
            ) : null}

            {/* Live Photo Preview Box */}
            {imageUrl.trim() && (
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
                    src={imageUrl.trim()} 
                    alt="Package preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onLoad={() => setImagePreviewLoaded(true)}
                    onError={() => {
                      setImagePreviewLoaded(false);
                      setImageError('Could not load image from this URL. Please verify the link points directly to a valid photo.');
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  <div style={{ color: '#fff', fontWeight: 600 }}>Live Photo Preview</div>
                  <div style={{ color: imagePreviewLoaded ? 'var(--emerald-primary)' : 'var(--text-muted)' }}>
                    {imagePreviewLoaded ? '✓ Image loaded successfully' : 'Verifying image source...'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Package Description</label>
            <textarea rows={3} className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Included Services (comma-separated)</label>
            <textarea rows={2} className="form-textarea" placeholder="e.g. 5-Course Banquet Buffet, Floral Decor, DJ Sound System..." value={servicesInput} onChange={(e) => setServicesInput(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            {!imageUrl.trim() && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={14} /> Photo URL required to save
              </span>
            )}
            <button type="button" onClick={() => setIsPackageModalOpen(false)} className="btn btn-outline">Cancel</button>
            <button 
              type="submit" 
              disabled={submittingPackage || !imageUrl.trim()} 
              className="btn btn-gold"
              title={!imageUrl.trim() ? "A photo URL is strictly required before saving" : "Save Package"}
              style={{
                opacity: !imageUrl.trim() ? 0.55 : 1,
                cursor: !imageUrl.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {submittingPackage ? 'Saving...' : 'Save Package'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MANAGE SERVICES INLINE MODAL */}
      {selectedPkgForService && (
        <Modal isOpen={serviceModalOpen} onClose={() => setServiceModalOpen(false)} title={`Manage Services: ${selectedPkgForService.name}`}>
          <div>
            <form onSubmit={handleAddService} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="New service name (e.g. Red Carpet Arrival)..." 
                className="form-input" 
                value={newServiceName} 
                onChange={(e) => setNewServiceName(e.target.value)} 
                required 
              />
              <button type="submit" className="btn btn-gold" style={{ whiteSpace: 'nowrap' }}>
                Add Service
              </button>
            </form>

            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '0.75rem' }}>
              Currently Attached Services:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
              {selectedPkgForService.includedServices && selectedPkgForService.includedServices.map((svc, idx) => (
                <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>{svc}</span>
                  <button onClick={() => handleRemoveService(svc)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setServiceModalOpen(false)} className="btn btn-outline">
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default EventCoordinatorDashboard;
