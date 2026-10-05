import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ToastAlert from '../components/ToastAlert';
import Modal from '../components/Modal';
import { 
  Layers, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Calendar, 
  RotateCcw, 
  Printer, 
  ArrowUpDown
} from 'lucide-react';

const ReservationSupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations', 'invoices'
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Search & Filter State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(false);

  // Rejection modal state
  const [rejectModalRes, setRejectModalRes] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Cancellation review modal state
  const [rejectCancelModalRes, setRejectCancelModalRes] = useState(null);
  const [rejectCancelReason, setRejectCancelReason] = useState('');
  const [submittingRejectCancel, setSubmittingRejectCancel] = useState(false);
  const [approvingCancelId, setApprovingCancelId] = useState(null);

  // Reschedule modal state
  const [rescheduleRes, setRescheduleRes] = useState(null);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newGuestCount, setNewGuestCount] = useState(1);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadAllData = async () => {
    try {
      const [resRes, invRes] = await Promise.all([
        api.get('/reservations/manage/all').catch(() => ({ data: [] })),
        api.get('/reservations/manage/invoices/all').catch(() => api.get('/invoices')).catch(() => ({ data: [] }))
      ]);

      setReservations(Array.isArray(resRes.data) ? resRes.data : []);
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
    } catch (err) {
      console.error('Supervisor data load error:', err);
      setAlert({ type: 'error', message: 'Failed to fetch supervisor records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered & Sorted reservations
  const filteredReservations = reservations
    .filter(r => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' ||
        String(r.id).includes(q) ||
        (r.customer?.user?.fullName && r.customer.user.fullName.toLowerCase().includes(q)) ||
        (r.venueRoom?.name && r.venueRoom.name.toLowerCase().includes(q)) ||
        (r.eventPackage?.name && r.eventPackage.name.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const pendingCancellationCount = reservations.filter(r => r.status === 'CANCEL_REQUESTED').length;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // RESERVATION ACTIONS
  const handleApprove = async (id) => {
    try {
      await api.patch(`/reservations/manage/${id}/approve`);
      setAlert({ type: 'success', message: `Reservation #${id} APPROVED. Automated invoice generated.` });
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Approval failed due to conflict or error.';
      setAlert({ type: 'error', message: msg });
    }
  };

  const handleOpenRejectModal = (res) => {
    setRejectModalRes(res);
    setRejectReason('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalRes) return;
    setSubmittingReject(true);
    try {
      await api.patch(`/reservations/manage/${rejectModalRes.id}/reject`, null, {
        params: { reason: rejectReason || 'Scheduling or capacity conflict' }
      });
      setAlert({ type: 'info', message: `Reservation #${rejectModalRes.id} has been marked as REJECTED.` });
      setRejectModalRes(null);
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Rejection action failed.' });
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleApproveCancellation = async (id) => {
    if (!window.confirm(`Are you sure you want to APPROVE cancellation for Booking #${id}? This will cancel the reservation and issue any applicable automated refunds.`)) {
      return;
    }
    setApprovingCancelId(id);
    try {
      await api.patch(`/reservations/manage/${id}/approve-cancellation`);
      setAlert({ type: 'success', message: `Cancellation for Reservation #${id} APPROVED. Booking marked CANCELLED & any payment refunded.` });
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve cancellation.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setApprovingCancelId(null);
    }
  };

  const handleOpenRejectCancelModal = (res) => {
    setRejectCancelModalRes(res);
    setRejectCancelReason('');
  };

  const handleConfirmRejectCancellation = async (e) => {
    e.preventDefault();
    if (!rejectCancelModalRes) return;
    setSubmittingRejectCancel(true);
    try {
      await api.patch(`/reservations/manage/${rejectCancelModalRes.id}/reject-cancellation`, {
        reason: rejectCancelReason || 'Cancellation request declined by supervisor.'
      });
      setAlert({ type: 'info', message: `Cancellation request for #${rejectCancelModalRes.id} has been DECLINED. Booking remains active.` });
      setRejectCancelModalRes(null);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to decline cancellation.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingRejectCancel(false);
    }
  };

  const handleOpenReschedule = (res) => {
    setRescheduleRes(res);
    setNewStartDate(res.startDate);
    setNewEndDate(res.endDate);
    setNewGuestCount(res.guestCount);
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleRes) return;
    setSubmittingReschedule(true);
    try {
      await api.put(`/reservations/manage/${rescheduleRes.id}/reschedule`, {
        startDate: newStartDate,
        endDate: newEndDate,
        guestCount: parseInt(newGuestCount, 10)
      });
      setAlert({ type: 'success', message: `Reservation #${rescheduleRes.id} successfully rescheduled!` });
      setRescheduleRes(null);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Reschedule failed due to date conflict.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">PENDING</span>;
      case 'APPROVED': return <span className="badge badge-approved">APPROVED</span>;
      case 'CONFIRMED': return <span className="badge badge-confirmed">CONFIRMED</span>;
      case 'COMPLETED': return <span className="badge badge-confirmed">COMPLETED</span>;
      case 'CANCEL_REQUESTED': return <span className="badge" style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)' }}>CANCEL REQUESTED</span>;
      case 'REJECTED': return <span className="badge badge-rejected">REJECTED</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled">CANCELLED</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gold-primary)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>
          Loading Reservation Supervisor Portal...
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
              <Layers size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>
                Reservation Supervisor Portal
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Booking Audits • Conflict Prevention Engine • Automated Invoices • Payment Receipts
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={loadAllData} className="btn btn-gold btn-sm">
              <RotateCcw size={15} /> Refresh Records
            </button>
          </div>
        </div>
      </div>

      <ToastAlert 
        type={alert?.type} 
        message={alert?.message} 
        onClose={() => setAlert(null)} 
      />

      {/* Tabs */}
      <div className="tabs-container">
        {[
          { id: 'reservations', label: `Reservation Management (${reservations.length})`, icon: <Calendar size={17} /> },
          { id: 'invoices', label: `Invoice Records (${invoices.length})`, icon: <FileText size={17} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="animate-fade-in">
          {/* Pending Cancellation Review Banner */}
          {pendingCancellationCount > 0 && (
            <div className="glass-panel animate-fade-in" style={{
              padding: '1.1rem 1.5rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.06) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                <div>
                  <strong style={{ color: '#fbbf24', fontSize: '0.98rem' }}>
                    {pendingCancellationCount} Customer Cancellation Request{pendingCancellationCount > 1 ? 's' : ''} Awaiting Approval
                  </strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    Action required: Review customer cancellation to approve refund or decline cancellation to keep booking active.
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setStatusFilter('CANCEL_REQUESTED')}
                className="btn btn-sm btn-gold"
                style={{ fontSize: '0.8rem', fontWeight: 600 }}
              >
                Review Requests ({pendingCancellationCount})
              </button>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="glass-panel" style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'CANCEL_REQUESTED', 'CANCELLED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`btn btn-sm ${statusFilter === status ? 'btn-gold' : 'btn-outline'}`}
                  style={{ 
                    fontSize: '0.76rem',
                    ...(status === 'CANCEL_REQUESTED' && pendingCancellationCount > 0 && statusFilter !== 'CANCEL_REQUESTED'
                      ? { borderColor: '#fbbf24', color: '#fbbf24' }
                      : {})
                  }}
                >
                  {status === 'CANCEL_REQUESTED'
                    ? `CANCEL REQUESTS${pendingCancellationCount > 0 ? ` (${pendingCancellationCount})` : ''}`
                    : status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div style={{ minWidth: '240px', flex: 1, maxWidth: '340px' }}>
              <input 
                type="text" 
                placeholder="Search booking #, guest, space..."
                className="form-input"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Reservation Table */}
          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      ID <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Customer / Guest</th>
                  <th>Room / Venue Space</th>
                  <th>Event Package</th>
                  <th>Dates & Duration</th>
                  <th>Guests</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, color: 'var(--gold-primary)' }}>
                      #{r.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        {r.primaryGuestName || r.customer?.user?.fullName || r.customer?.user?.username || 'Guest'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.primaryGuestPhone || r.customer?.user?.phone || 'No phone'}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{r.venueRoom?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gold-light)' }}>
                        {r.venueRoom?.type ? r.venueRoom.type.replace('_', ' ') : 'SPACE'}
                      </div>
                    </td>
                    <td>
                      {r.eventPackage ? (
                        <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                          {r.eventPackage.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>None (Room Only)</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>{r.startDate} to {r.endDate}</div>
                    </td>
                    <td>{r.guestCount} Guests</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                      LKR {parseFloat(r.totalAmount || 0).toFixed(2)}
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {r.status === 'CANCEL_REQUESTED' && (
                          <>
                            <button 
                              onClick={() => handleApproveCancellation(r.id)} 
                              disabled={approvingCancelId === r.id}
                              className="btn btn-success btn-sm"
                              title="Approve Cancellation & Refund"
                              style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399' }}
                            >
                              <CheckCircle2 size={14} /> {approvingCancelId === r.id ? 'Approving...' : 'Approve Cancel'}
                            </button>
                            <button 
                              onClick={() => handleOpenRejectCancelModal(r)} 
                              className="btn btn-danger btn-sm"
                              title="Decline Cancellation Request"
                            >
                              <XCircle size={14} /> Decline Cancel
                            </button>
                          </>
                        )}

                        {r.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleApprove(r.id)} 
                              className="btn btn-success btn-sm"
                              title="Approve Reservation"
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => handleOpenRejectModal(r)} 
                              className="btn btn-danger btn-sm"
                              title="Reject Conflict"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}

                        <button 
                          onClick={() => handleOpenReschedule(r)} 
                          className="btn btn-outline btn-sm"
                          title="Reschedule Dates"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="animate-fade-in">
          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Reservation Ref</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Issue Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      {inv.invoiceNumber || `INV-${inv.id}`}
                    </td>
                    <td>
                      Booking #{inv.reservation?.id || inv.reservationId}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                      LKR {parseFloat(inv.totalAmount || inv.amount || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-confirmed">
                        {inv.status || 'GENERATED'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {inv.createdAt || 'Current'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => setSelectedInvoice(inv)} className="btn btn-outline btn-sm">
                        <FileText size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REJECT BOOKING */}
      {rejectModalRes && (
        <Modal isOpen={Boolean(rejectModalRes)} onClose={() => setRejectModalRes(null)} title={`Reject Reservation #${rejectModalRes.id}`}>
          <form onSubmit={handleConfirmReject}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Please state the reason for rejecting Booking #{rejectModalRes.id} for {rejectModalRes.venueRoom?.name}. The customer will be informed via automated in-app notification.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea 
                rows={3} 
                className="form-textarea" 
                placeholder="e.g. Venue maintenance scheduled on requested dates, guest count exceeds banquet license limit..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setRejectModalRes(null)} className="btn btn-outline">Cancel</button>
              <button type="submit" disabled={submittingReject} className="btn btn-danger">
                {submittingReject ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: RESCHEDULE BOOKING */}
      {rescheduleRes && (
        <Modal isOpen={Boolean(rescheduleRes)} onClose={() => setRescheduleRes(null)} title={`Reschedule Reservation #${rescheduleRes.id}`}>
          <form onSubmit={handleConfirmReschedule}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">New Start Date *</label>
                <input type="date" className="form-input" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New End Date *</label>
                <input type="date" className="form-input" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Revised Guest Count *</label>
              <input type="number" min="1" className="form-input" value={newGuestCount} onChange={(e) => setNewGuestCount(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setRescheduleRes(null)} className="btn btn-outline">Cancel</button>
              <button type="submit" disabled={submittingReschedule} className="btn btn-gold">
                {submittingReschedule ? 'Rescheduling...' : 'Save Reschedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: VIEW INVOICE */}
      {selectedInvoice && (
        <Modal isOpen={Boolean(selectedInvoice)} onClose={() => setSelectedInvoice(null)} title="Official Statement of Account" maxWidth="750px">
          <div>
            <div style={{ background: '#fff', color: '#0b101b', padding: '2rem', borderRadius: '8px', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #d4af37', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0b101b', fontWeight: 800 }}>GRAND LUXE HOTEL</h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>100 Grand Esplanade, Colombo 03, Sri Lanka</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d4af37' }}>INVOICE</div>
                  <div style={{ fontSize: '0.85rem' }}>#{selectedInvoice.invoiceNumber || selectedInvoice.id}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
                <span>Booking ID: #{selectedInvoice.reservation?.id || selectedInvoice.reservationId}</span>
                <span style={{ fontWeight: 700, color: '#d4af37', fontSize: '1.2rem' }}>
                  LKR {parseFloat(selectedInvoice.totalAmount || selectedInvoice.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => window.print()} className="btn btn-outline">
                <Printer size={16} /> Print Copy
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="btn btn-gold">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: DECLINE CANCELLATION REQUEST */}
      {rejectCancelModalRes && (
        <Modal 
          isOpen={Boolean(rejectCancelModalRes)} 
          onClose={() => setRejectCancelModalRes(null)} 
          title={`Decline Cancellation for Booking #${rejectCancelModalRes.id}`}
        >
          <form onSubmit={handleConfirmRejectCancellation}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Decline customer cancellation request for <strong style={{ color: '#fff' }}>Booking #{rejectCancelModalRes.id}</strong> ({rejectCancelModalRes.venueRoom?.name}). The booking will remain active, and the customer will receive an explanation notification.
            </p>
            <div className="form-group">
              <label className="form-label">Decline Reason *</label>
              <textarea 
                rows={3} 
                className="form-textarea" 
                placeholder="e.g. Non-refundable cancellation window reached, or event preparation expenses already incurred..."
                value={rejectCancelReason}
                onChange={(e) => setRejectCancelReason(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setRejectCancelModalRes(null)} className="btn btn-outline">Cancel</button>
              <button type="submit" disabled={submittingRejectCancel} className="btn btn-gold">
                {submittingRejectCancel ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default ReservationSupervisorDashboard;
