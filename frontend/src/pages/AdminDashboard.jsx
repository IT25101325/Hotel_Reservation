import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ToastAlert from '../components/ToastAlert';
import Modal from '../components/Modal';
import { 
  ShieldAlert, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Megaphone, 
  FileText, 
  Trash2, 
  Plus, 
  Edit3, 
  Printer,
  Calendar,
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports', 'users', 'feedback', 'announcements', 'logs'
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [venues, setVenues] = useState([]);
  const [packages, setPackages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('ROLE_CUSTOMER');
  const [submittingUser, setSubmittingUser] = useState(false);
  const [userModalError, setUserModalError] = useState(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('ROLE_CUSTOMER');
  const [editPassword, setEditPassword] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [submittingEditUser, setSubmittingEditUser] = useState(false);
  const [editUserModalError, setEditUserModalError] = useState(null);

  // Feedback Reply State
  const [respondFeedback, setRespondFeedback] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('RESOLVED');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAudience, setAnnAudience] = useState('ALL');
  const [submittingAnn, setSubmittingAnn] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnContent, setEditAnnContent] = useState('');
  const [editAnnAudience, setEditAnnAudience] = useState('ALL');
  const [submittingEditAnn, setSubmittingEditAnn] = useState(false);

  // Role & Permissions Dictionary State (Component 6 RBAC)
  const [rolesMap, setRolesMap] = useState({});

  // Feedback & Complaint Creation State (Component 6 Complaint & Feedback CRUD)
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('ALL');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [fbUserId, setFbUserId] = useState('');
  const [fbType, setFbType] = useState('COMPLAINT');
  const [fbSubject, setFbSubject] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbStatus, setFbStatus] = useState('OPEN');
  const [submittingCreateFeedback, setSubmittingCreateFeedback] = useState(false);

  // Saved Reports State (Component 6 Report Management)
  const [savedReports, setSavedReports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hotel_saved_executive_reports') || '[]');
    } catch {
      return [];
    }
  });

  // Custom Report Date Filter
  const [repStartDate, setRepStartDate] = useState('');
  const [repEndDate, setRepEndDate] = useState('');
  const [customReportResult, setCustomReportResult] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const loadAllData = async () => {
    try {
      const [
        repRes, 
        userRes, 
        fbRes, 
        annRes, 
        logRes,
        venRes,
        pkgRes,
        empRes,
        allocRes,
        resRes,
        roleRes
      ] = await Promise.all([
        api.get('/admin/reports/executive').catch(() => ({ data: null })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/feedback').catch(() => ({ data: [] })),
        api.get('/admin/announcements').catch(() => ({ data: [] })),
        api.get('/admin/activity-logs').catch(() => ({ data: [] })),
        api.get('/venue-ops/manage/all').catch(() => ({ data: [] })),
        api.get('/event-packages/manage/all').catch(() => ({ data: [] })),
        api.get('/hr/employees').catch(() => ({ data: [] })),
        api.get('/hr/allocations').catch(() => ({ data: [] })),
        api.get('/reservations/manage/all').catch(() => ({ data: [] })),
        api.get('/admin/roles').catch(() => ({ data: {} }))
      ]);

      setReport(repRes.data);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setFeedbackList(Array.isArray(fbRes.data) ? fbRes.data : []);
      setAnnouncements(Array.isArray(annRes.data) ? annRes.data : []);
      setActivityLogs(Array.isArray(logRes.data) ? logRes.data : []);
      setVenues(Array.isArray(venRes.data) ? venRes.data : []);
      setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setAllocations(Array.isArray(allocRes.data) ? allocRes.data : []);
      setReservations(Array.isArray(resRes.data) ? resRes.data : []);
      setRolesMap(roleRes.data || {});
    } catch (err) {
      console.error('Error fetching admin data', err);
      setAlert({ type: 'error', message: 'Failed to fetch executive data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Real data calculations
  const totalCustomers = users.filter(u => u.role === 'ROLE_CUSTOMER').length;
  const availableRoomsCount = venues.filter(v => v.type === 'ROOM' && v.available).length;
  const availableVenuesCount = venues.filter(v => v.type !== 'ROOM' && v.available).length;
  const pendingReservationsCount = reservations.filter(r => r.status === 'PENDING').length;
  const approvedReservationsCount = reservations.filter(r => r.status === 'APPROVED' || r.status === 'CONFIRMED').length;

  // USER MANAGEMENT HANDLERS
  const openCreateUserModal = () => {
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('ROLE_CUSTOMER');
    setUserModalError(null);
    setIsUserModalOpen(true);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setUserModalError(null);

    // Limitation 1: Password (length: 6 to 40)
    if (!newPassword || newPassword.length < 6) {
      setUserModalError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword.length > 40) {
      setUserModalError('Password cannot exceed 40 characters.');
      return;
    }

    // Limitation 2: Email format & max length
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newEmail.trim())) {
      setUserModalError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }
    if (newEmail.trim().length > 80) {
      setUserModalError('Email address cannot exceed 80 characters.');
      return;
    }

    // Limitation 3: Phone number format & length
    const cleanPhone = newPhone.replace(/[\s-]/g, '');
    if (cleanPhone) {
      const phoneRegex = /^(?:0\d{9}|\+\d{10,14})$/;
      if (!phoneRegex.test(cleanPhone)) {
        setUserModalError('Please enter a valid phone number: 10 digits for local numbers (e.g. 0771234567) or international format (e.g. +94771234567).');
        return;
      }
    }

    setSubmittingUser(true);
    try {
      const payload = {
        username: newUsername.trim(),
        password: newPassword,
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        phone: cleanPhone || '',
        role: newRole
      };
      await api.post('/admin/users', payload);
      setAlert({ type: 'success', message: `User "${newUsername}" created successfully!` });
      setIsUserModalOpen(false);
      setUserModalError(null);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user.';
      setUserModalError(msg);
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingUser(false);
    }
  };

  const openEditUserModal = (u) => {
    setEditingUser(u);
    setEditFullName(u.fullName || '');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditRole(u.role || 'ROLE_CUSTOMER');
    setEditActive(u.active !== false);
    setEditPassword('');
    setEditUserModalError(null);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditUserModalError(null);

    // Limitation: Email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(editEmail.trim())) {
      setEditUserModalError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }
    if (editEmail.trim().length > 80) {
      setEditUserModalError('Email address cannot exceed 80 characters.');
      return;
    }

    // Limitation: Phone number format
    const cleanPhone = editPhone.replace(/[\s-]/g, '');
    if (cleanPhone) {
      const phoneRegex = /^(?:0\d{9}|\+\d{10,14})$/;
      if (!phoneRegex.test(cleanPhone)) {
        setEditUserModalError('Please enter a valid phone number: 10 digits for local numbers (e.g. 0771234567) or international format (e.g. +94771234567).');
        return;
      }
    }

    // Limitation: Password (if being reset)
    if (editPassword.trim()) {
      if (editPassword.trim().length < 6) {
        setEditUserModalError('New password must be at least 6 characters long.');
        return;
      }
      if (editPassword.trim().length > 40) {
        setEditUserModalError('New password cannot exceed 40 characters.');
        return;
      }
    }

    setSubmittingEditUser(true);
    try {
      const payload = {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        phone: cleanPhone || '',
        role: editRole,
        active: editActive
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }
      await api.put(`/admin/users/${editingUser.id}`, payload);
      setAlert({ type: 'success', message: `User "${editingUser.username}" updated successfully!` });
      setEditingUser(null);
      setEditUserModalError(null);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user.';
      setEditUserModalError(msg);
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingEditUser(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, null, { params: { active: !currentActive } });
      setAlert({ type: 'success', message: `User #${userId} status updated.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update user status.' });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Permanently remove user "${username}" (#${userId})?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setAlert({ type: 'success', message: `User "${username}" removed.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to remove user.' });
    }
  };

  // FEEDBACK / COMPLAINT HANDLERS
  const handleRespondSubmit = async (e) => {
    e.preventDefault();
    if (!respondFeedback) return;
    setSubmittingReply(true);
    try {
      await api.post(`/admin/feedback/${respondFeedback.id}/respond`, {
        response: adminReply,
        status: feedbackStatus
      });
      setAlert({ type: 'success', message: `Response saved for Feedback #${respondFeedback.id}.` });
      setRespondFeedback(null);
      setAdminReply('');
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to save response.' });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm(`Delete feedback #${id}?`)) return;
    try {
      await api.delete(`/admin/feedback/${id}`);
      setAlert({ type: 'info', message: `Feedback record #${id} removed.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete feedback.' });
    }
  };

  // RECORD COMPLAINT / FEEDBACK HANDLERS (Component 6 Complaint & Feedback CRUD)
  const openCreateFeedbackModal = (type = 'COMPLAINT') => {
    setFbUserId(users.length > 0 ? String(users[0].id) : '');
    setFbType(type);
    setFbSubject('');
    setFbMessage('');
    setFbRating(5);
    setFbStatus('OPEN');
    setIsFeedbackModalOpen(true);
  };

  const handleCreateFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!fbSubject.trim() || !fbMessage.trim()) {
      setAlert({ type: 'warning', message: 'Subject and detailed message are required.' });
      return;
    }
    setSubmittingCreateFeedback(true);
    try {
      const payload = {
        type: fbType,
        subject: fbSubject.trim(),
        message: fbMessage.trim(),
        rating: parseInt(fbRating, 10),
        status: fbStatus
      };
      const params = fbUserId ? { userId: fbUserId } : {};
      await api.post('/admin/feedback', payload, { params });
      setAlert({ type: 'success', message: `${fbType === 'COMPLAINT' ? 'Customer Complaint' : 'Customer Feedback'} recorded successfully!` });
      setIsFeedbackModalOpen(false);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record entry.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingCreateFeedback(false);
    }
  };

  // ACTIVITY LOGS RETENTION & PURGE (Component 6 Audit Log CRUD)
  const handleDeleteLog = async (id) => {
    if (!window.confirm(`Delete activity audit log #${id}?`)) return;
    try {
      await api.delete(`/admin/activity-logs/${id}`);
      setAlert({ type: 'info', message: `Activity log #${id} purged.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete activity log.' });
    }
  };

  const handleClearOldLogs = async () => {
    if (!window.confirm('Purge all audit logs older than 30 days according to system retention policy?')) return;
    try {
      const res = await api.delete('/admin/activity-logs/clear-old?days=30');
      setAlert({ type: 'success', message: res.data?.message || 'Old audit logs purged successfully.' });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to purge old logs.' });
    }
  };

  // SAVED REPORT SNAPSHOTS (Component 6 Report Management CRUD)
  const handleSaveReportSnapshot = () => {
    if (!customReportResult) return;
    const rev = customReportResult.revenue || customReportResult.totalRevenue || customReportResult.grossRevenue || 0;
    const count = customReportResult.reservationCount || customReportResult.totalBookings || customReportResult.matchingBookingsCount || 0;
    const newSnapshot = {
      id: Date.now(),
      title: `Executive Revenue Audit (${repStartDate} to ${repEndDate})`,
      startDate: repStartDate,
      endDate: repEndDate,
      generatedAt: new Date().toLocaleString(),
      revenue: parseFloat(rev),
      bookings: count
    };
    const updated = [newSnapshot, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem('hotel_saved_executive_reports', JSON.stringify(updated));
    setAlert({ type: 'success', message: 'Report snapshot successfully saved to archive.' });
  };

  const handleDeleteSavedReport = (id) => {
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem('hotel_saved_executive_reports', JSON.stringify(updated));
    setAlert({ type: 'info', message: 'Saved report removed from archive.' });
  };

  // PRINT EXECUTIVE REPORT
  const handlePrintAuditReport = (reportData, start, end) => {
    const data = reportData || customReportResult;
    if (!data) return;
    const startDate = start || repStartDate || 'N/A';
    const endDate = end || repEndDate || 'N/A';
    const revenue = parseFloat(data.revenue || data.totalRevenue || data.grossRevenue || 0).toFixed(2);
    const totalBookings = data.reservationCount || data.totalBookings || data.matchingBookingsCount || 0;
    const confirmed = data.confirmedBookingsCount || 0;
    const cancelled = data.cancelledBookingsCount || 0;
    const avgRev = totalBookings > 0 ? (parseFloat(revenue) / totalBookings).toFixed(2) : '0.00';
    const confirmationRate = totalBookings > 0 ? Math.round((confirmed / totalBookings) * 100) : 0;
    const printDate = new Date().toLocaleString();

    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Executive Audit Report (${startDate} to ${endDate})</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #1a1a1a;
              margin: 0;
              padding: 40px;
              background: #fff;
              line-height: 1.5;
            }
            .header {
              border-bottom: 3px double #d4af37;
              padding-bottom: 20px;
              margin-bottom: 25px;
              display: flex;
              justifyContent: space-between;
              align-items: flex-start;
            }
            .brand h1 {
              font-family: 'Cinzel', Georgia, serif;
              font-size: 24px;
              margin: 0 0 5px 0;
              color: #0b1a30;
              letter-spacing: 1px;
            }
            .brand p {
              margin: 0;
              font-size: 13px;
              color: #666;
            }
            .badge {
              display: inline-block;
              padding: 6px 14px;
              background: #f4ede0;
              border: 1px solid #d4af37;
              color: #8c6d1f;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-radius: 4px;
            }
            .title-section {
              margin-bottom: 25px;
            }
            .title-section h2 {
              margin: 0 0 6px 0;
              font-size: 20px;
              color: #111;
            }
            .period-bar {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 12px 18px;
              border-radius: 6px;
              font-size: 13px;
              color: #334155;
              display: flex;
              justifyContent: space-between;
              margin-bottom: 30px;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-bottom: 30px;
            }
            .kpi-card {
              border: 1px solid #e2e8f0;
              background: #fafafa;
              padding: 18px;
              border-radius: 8px;
            }
            .kpi-card.highlight {
              background: #fcf9ee;
              border-color: #d4af37;
            }
            .kpi-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 6px;
            }
            .kpi-val {
              font-size: 22px;
              font-weight: 700;
              color: #0f172a;
            }
            .kpi-val.gold {
              color: #b48608;
            }
            .kpi-val.green {
              color: #059669;
            }
            .kpi-val.red {
              color: #dc2626;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th, td {
              padding: 12px 14px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }
            th {
              background: #f1f5f9;
              font-weight: 600;
              color: #334155;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            .footer-sign {
              display: flex;
              justifyContent: space-between;
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #cbd5e1;
            }
            .sign-box {
              width: 220px;
              text-align: center;
            }
            .sign-line {
              border-bottom: 1px solid #475569;
              margin-bottom: 8px;
              height: 40px;
            }
            .sign-label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
            }
            @media print {
              body { padding: 15px; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <h1>GRAND HORIZON LUXURY HOTEL</h1>
              <p>Special Events, Banquet Operations & Executive Administration</p>
            </div>
            <div class="badge">CONFIDENTIAL AUDIT</div>
          </div>

          <div class="title-section">
            <h2>Executive Revenue & Reservation Audit Report</h2>
            <div style="font-size: 13px; color: #64748b;">Official corporate management snapshot</div>
          </div>

          <div class="period-bar">
            <div><strong>Audit Period:</strong> ${startDate} &nbsp;to&nbsp; ${endDate}</div>
            <div><strong>Generated At:</strong> ${printDate}</div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card highlight">
              <div class="kpi-label">Total Period Revenue</div>
              <div class="kpi-val gold">LKR ${revenue}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Reservations Evaluated</div>
              <div class="kpi-val">${totalBookings}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Confirmed & Approved Bookings</div>
              <div class="kpi-val green">${confirmed} (${confirmationRate}%)</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Cancelled / Declined Bookings</div>
              <div class="kpi-val red">${cancelled}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Audit Parameter</th>
                <th>Metric Detail</th>
                <th style="text-align: right;">Status / Evaluation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Audit Start Date</strong></td>
                <td>${startDate}</td>
                <td style="text-align: right;">Scope Beginning</td>
              </tr>
              <tr>
                <td><strong>Audit End Date</strong></td>
                <td>${endDate}</td>
                <td style="text-align: right;">Scope Concluded</td>
              </tr>
              <tr>
                <td><strong>Gross Event Revenue</strong></td>
                <td>LKR ${revenue}</td>
                <td style="text-align: right; color: #059669; font-weight: 600;">Audited</td>
              </tr>
              <tr>
                <td><strong>Average Revenue Per Booking</strong></td>
                <td>LKR ${avgRev}</td>
                <td style="text-align: right;">Calculated Yield</td>
              </tr>
              <tr>
                <td><strong>Booking Confirmation Ratio</strong></td>
                <td>${confirmationRate}%</td>
                <td style="text-align: right; font-weight: 600;">${confirmed} / ${totalBookings}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div class="sign-label">Prepared By: Financial Auditor</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div class="sign-label">Approved By: Executive Management</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintSavedReport = (sr) => {
    handlePrintAuditReport({
      revenue: sr.revenue,
      reservationCount: sr.bookings,
      confirmedBookingsCount: sr.bookings,
      cancelledBookingsCount: 0
    }, sr.startDate, sr.endDate);
  };

  // ROLE ASSIGNMENT HANDLER (Component 6 Role & Permission Management CRUD)
  const handleQuickRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, null, { params: { role: newRole } });
      setAlert({ type: 'success', message: `Role changed to ${newRole.replace('ROLE_', '')} for user #${userId}.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to reassign role.' });
    }
  };

  // ANNOUNCEMENT HANDLERS
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAnn(true);
    try {
      await api.post('/admin/announcements', {
        title: annTitle,
        content: annContent,
        targetAudience: annAudience
      });
      setAlert({ type: 'success', message: 'Announcement broadcasted!' });
      setAnnTitle('');
      setAnnContent('');
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to post announcement.' });
    } finally {
      setSubmittingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm(`Delete announcement #${id}?`)) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      setAlert({ type: 'success', message: 'Announcement removed.' });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete announcement.' });
    }
  };

  const handleOpenEditAnnouncement = (ann) => {
    setEditingAnnouncement(ann);
    setEditAnnTitle(ann.title || '');
    setEditAnnContent(ann.content || '');
    setEditAnnAudience(ann.targetAudience || 'ALL');
  };

  const handleEditAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    setSubmittingEditAnn(true);
    try {
      await api.put(`/admin/announcements/${editingAnnouncement.id}`, {
        title: editAnnTitle.trim(),
        content: editAnnContent.trim(),
        targetAudience: editAnnAudience
      });
      setAlert({ type: 'success', message: 'Announcement updated successfully!' });
      setEditingAnnouncement(null);
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update announcement.' });
    } finally {
      setSubmittingEditAnn(false);
    }
  };

  // DYNAMIC CUSTOM REPORT GENERATOR
  const handleGenerateCustomReport = async (e) => {
    e.preventDefault();
    if (!repStartDate || !repEndDate) {
      setAlert({ type: 'warning', message: 'Please select both start date and end date for the report.' });
      return;
    }
    setGeneratingReport(true);
    try {
      const res = await api.get('/admin/reports/custom', {
        params: {
          startDate: repStartDate,
          endDate: repEndDate,
          category: 'ALL'
        }
      });
      setCustomReportResult(res.data);
      setAlert({ type: 'success', message: 'Custom Executive Report generated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to generate custom report.' });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Filtered User list
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesSearch = userSearchQuery === '' ||
      u.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gold-primary)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>
          Loading Executive Administration Suite...
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
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>
                General Manager & Executive Suite
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Executive Analytics • User Directory & RBAC • Guest Complaints • Broadcast Notices • Audit Trail
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => window.print()} className="btn btn-outline btn-sm">
              <Printer size={15} /> Print Reports
            </button>
            <button onClick={openCreateUserModal} className="btn btn-gold btn-sm">
              <Plus size={15} /> Create User
            </button>
          </div>
        </div>
      </div>

      <ToastAlert 
        type={alert?.type} 
        message={alert?.message} 
        onClose={() => setAlert(null)} 
      />

      {/* KPI Real-Time Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Customers</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{totalCustomers}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reservations</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{reservations.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>{pendingReservationsCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-primary)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approved / Paid</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>{approvedReservationsCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Spaces</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
              {availableRoomsCount + availableVenuesCount}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.12)', color: 'var(--gold-primary)' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event Packages</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-light)' }}>{packages.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#a5b4fc' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Staff & Allocations</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
              {employees.length} / {allocations.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {[
          { id: 'reports', label: 'Executive Reports & Analytics', icon: <BarChart3 size={17} /> },
          { id: 'users', label: `User Accounts (${users.length})`, icon: <Users size={17} /> },
          { id: 'roles', label: 'Roles & Permissions (RBAC)', icon: <ShieldAlert size={17} /> },
          { id: 'feedback', label: `Complaints & Feedback (${feedbackList.length})`, icon: <MessageSquare size={17} /> },
          { id: 'announcements', label: `Broadcast Announcements (${announcements.length})`, icon: <Megaphone size={17} /> },
          { id: 'logs', label: `Activity Audit Logs (${activityLogs.length})`, icon: <FileText size={17} /> }
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

      {/* TAB 1: EXECUTIVE REPORTS & REPORT MANAGEMENT */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Revenue & Bookings Overview Card */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--gold-primary)" /> Financial & Reservation Metrics
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL SYSTEM REVENUE</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                      LKR {parseFloat(report?.totalRevenue || 0).toFixed(2)}
                    </div>
                  </div>
                  <span className="badge badge-confirmed">AUDITED REAL-TIME</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="glass-panel" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONFIRMED BOOKINGS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--emerald-primary)' }}>
                      {report?.confirmedReservations || approvedReservationsCount}
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PENDING REQUESTS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>
                      {report?.pendingReservations || pendingReservationsCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Report Date Picker */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="var(--gold-primary)" /> Generate Custom Executive Audit
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                Filter reservation revenue, occupancy, and package utilization between exact dates.
              </p>

              <form onSubmit={handleGenerateCustomReport}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Audit Start Date</label>
                    <input type="date" className="form-input" value={repStartDate} onChange={(e) => setRepStartDate(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Audit End Date</label>
                    <input type="date" className="form-input" value={repEndDate} onChange={(e) => setRepEndDate(e.target.value)} required />
                  </div>
                </div>

                <button type="submit" disabled={generatingReport} className="btn btn-gold" style={{ width: '100%' }}>
                  {generatingReport ? 'Computing Analytics...' : 'Generate Date-Range Report'}
                </button>
              </form>

              {customReportResult && (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 700, color: '#a7f3d0', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Audit Summary ({repStartDate} to {repEndDate})</span>
                    <span className="badge badge-confirmed">Generated</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <div>Revenue in Period: <strong style={{ color: 'var(--gold-primary)' }}>LKR {parseFloat(customReportResult.revenue || customReportResult.totalRevenue || customReportResult.grossRevenue || 0).toFixed(2)}</strong></div>
                    <div>Reservations: <strong>{customReportResult.reservationCount || customReportResult.totalBookings || customReportResult.matchingBookingsCount || 0}</strong></div>
                    <div>Confirmed: <strong style={{ color: 'var(--emerald-primary)' }}>{customReportResult.confirmedBookingsCount || 0}</strong></div>
                    <div>Cancelled: <strong style={{ color: '#f87171' }}>{customReportResult.cancelledBookingsCount || 0}</strong></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <button 
                      type="button" 
                      onClick={() => handlePrintAuditReport()} 
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontWeight: 600 }}
                    >
                      <Printer size={15} /> Print Report
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSaveReportSnapshot} 
                      className="btn btn-gold btn-sm"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontWeight: 600 }}
                    >
                      <Plus size={15} /> Save to Archive
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Saved Executive Reports Archive (Component 6 Report Management) */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Saved Executive Reports Archive</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  Persisted audit snapshots and generated compliance records.
                </p>
              </div>
              <span className="badge badge-gold">{savedReports.length} Saved Snapshots</span>
            </div>

            {savedReports.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No saved report snapshots found. Generate a date-range report above and click "Save Report Snapshot to Archive".
              </div>
            ) : (
              <div className="table-responsive">
                <table className="luxury-table">
                  <thead>
                    <tr>
                      <th>Report Title</th>
                      <th>Period Scope</th>
                      <th>Revenue (LKR)</th>
                      <th>Bookings Count</th>
                      <th>Snapshot Timestamp</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedReports.map((sr) => (
                      <tr key={sr.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{sr.title}</td>
                        <td style={{ color: 'var(--gold-light)', fontFamily: 'monospace' }}>{sr.startDate} → {sr.endDate}</td>
                        <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>LKR {parseFloat(sr.revenue || 0).toFixed(2)}</td>
                        <td>{sr.bookings} Bookings</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{sr.generatedAt}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handlePrintSavedReport(sr)} 
                              className="btn btn-outline btn-sm" 
                              title="Print Report Snapshot"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.65rem' }}
                            >
                              <Printer size={13} /> Print
                            </button>
                            <button 
                              onClick={() => handleDeleteSavedReport(sr.id)} 
                              className="btn btn-danger btn-sm" 
                              title="Remove Saved Report"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER & USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          {/* Search & Filter Toolbar */}
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
              {['ALL', 'ROLE_CUSTOMER', 'ROLE_RESERVATION_SUPERVISOR', 'ROLE_EVENT_COORDINATOR', 'ROLE_VENUE_MANAGER', 'ROLE_HR_MANAGER', 'ROLE_ADMIN'].map(role => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`btn btn-sm ${userRoleFilter === role ? 'btn-gold' : 'btn-outline'}`}
                  style={{ fontSize: '0.76rem' }}
                >
                  {role === 'ALL' ? 'All Roles' : role.replace('ROLE_', '').replace('_', ' ')}
                </button>
              ))}
            </div>

            <div style={{ minWidth: '240px', flex: 1, maxWidth: '340px' }}>
              <input 
                type="text" 
                placeholder="Search by name, email, or username..."
                className="form-input"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* User Table */}
          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>User / Customer</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Contact Phone</th>
                  <th>Role Scope</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: u.role === 'ROLE_ADMIN' ? 'var(--gold-gradient)' : 'rgba(99, 102, 241, 0.18)',
                          color: u.role === 'ROLE_ADMIN' ? '#000' : '#fff',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {(u.fullName || u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>
                          {u.fullName || u.username}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <span className="badge badge-approved" style={{ fontSize: '0.68rem' }}>
                        {u.role.replace('ROLE_', '').replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.active !== false)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {u.active !== false ? (
                          <span className="badge badge-confirmed">ACTIVE</span>
                        ) : (
                          <span className="badge badge-rejected">SUSPENDED</span>
                        )}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button onClick={() => openEditUserModal(u)} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id, u.username)} className="btn btn-danger btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                          <Trash2 size={14} />
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

      {/* TAB 3: ROLES & PERMISSIONS MANAGEMENT (RBAC) */}
      {activeTab === 'roles' && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>Role-Based Access Control (RBAC) & Permissions</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
                View granted system permissions and assign governance roles across internal personnel and registered customers.
              </p>
            </div>
            <span className="badge badge-confirmed">ACTIVE RBAC ENFORCED</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {Object.entries(rolesMap).map(([roleKey, perms]) => {
              const userCount = users.filter(u => u.role === roleKey).length;
              return (
                <div key={roleKey} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                        {roleKey.replace('ROLE_', '').replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {userCount} Assigned {userCount === 1 ? 'User' : 'Users'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                      {roleKey}
                    </h4>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Granted Capabilities & Permissions:
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {Array.isArray(perms) && perms.map((p, idx) => (
                        <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle2 size={13} color="var(--emerald-primary)" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Role Assignment Quick Matrix */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.25rem' }}>
              Personnel & User Role Assignments
            </h3>
            <div className="table-responsive">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Current System Role</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'right' }}>Modify Role Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                          {u.role ? u.role.replace('ROLE_', '') : 'CUSTOMER'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.active !== false ? 'badge-confirmed' : 'badge-rejected'}`}>
                          {u.active !== false ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {u.username === 'admin' ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Primary Root Admin</span>
                        ) : (
                          <select 
                            className="form-select" 
                            style={{ maxWidth: '210px', display: 'inline-block', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                            value={u.role}
                            onChange={(e) => handleQuickRoleChange(u.id, e.target.value)}
                          >
                            <option value="ROLE_CUSTOMER">CUSTOMER</option>
                            <option value="ROLE_RESERVATION_SUPERVISOR">RESERVATION SUPERVISOR</option>
                            <option value="ROLE_EVENT_COORDINATOR">EVENT COORDINATOR</option>
                            <option value="ROLE_VENUE_MANAGER">VENUE MANAGER</option>
                            <option value="ROLE_HR_MANAGER">HR MANAGER</option>
                            <option value="ROLE_ADMIN">ADMIN</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER COMPLAINTS & FEEDBACK (Component 6 Complaint & Feedback CRUD) */}
      {activeTab === 'feedback' && (
        <div className="animate-fade-in">
          {/* Toolbar with Type Filter & Record Button */}
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
              {[
                { id: 'ALL', label: `All Entries (${feedbackList.length})` },
                { id: 'COMPLAINT', label: `Complaints (${feedbackList.filter(f => f.type === 'COMPLAINT').length})` },
                { id: 'FEEDBACK', label: `Feedback (${feedbackList.filter(f => f.type === 'FEEDBACK').length})` },
                { id: 'INQUIRY', label: `Inquiries (${feedbackList.filter(f => f.type === 'INQUIRY').length})` }
              ].map(fType => (
                <button
                  key={fType.id}
                  onClick={() => setFeedbackTypeFilter(fType.id)}
                  className={`btn btn-sm ${feedbackTypeFilter === fType.id ? 'btn-gold' : 'btn-outline'}`}
                  style={{ fontSize: '0.76rem' }}
                >
                  {fType.label}
                </button>
              ))}
            </div>

            <button onClick={() => openCreateFeedbackModal('COMPLAINT')} className="btn btn-gold btn-sm">
              <Plus size={15} /> Record Complaint / Feedback
            </button>
          </div>

          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer User</th>
                  <th>Type</th>
                  <th>Subject & Message</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList
                  .filter(fb => feedbackTypeFilter === 'ALL' || fb.type === feedbackTypeFilter)
                  .map((fb) => (
                  <tr key={fb.id}>
                    <td>#{fb.id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {fb.user?.fullName || fb.user?.username || 'Guest'}
                    </td>
                    <td>
                      <span className={`badge ${fb.type === 'COMPLAINT' ? 'badge-rejected' : fb.type === 'INQUIRY' ? 'badge-pending' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                        {fb.type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '350px' }}>
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{fb.subject}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'normal' }}>{fb.message}</div>
                      {fb.adminResponse && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--gold-light)', marginTop: '0.4rem', borderLeft: '2px solid var(--gold-primary)', paddingLeft: '0.5rem' }}>
                          <strong>Response:</strong> {fb.adminResponse}
                        </div>
                      )}
                    </td>
                    <td>{fb.rating ? `${fb.rating} / 5 ★` : 'N/A'}</td>
                    <td>
                      <span className={`badge ${fb.status === 'RESOLVED' ? 'badge-confirmed' : fb.status === 'OPEN' ? 'badge-pending' : 'badge-approved'}`}>
                        {fb.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => { setRespondFeedback(fb); setAdminReply(fb.adminResponse || ''); setFeedbackStatus(fb.status || 'RESOLVED'); }} 
                          className="btn btn-gold btn-sm"
                        >
                          Respond
                        </button>
                        <button onClick={() => handleDeleteFeedback(fb.id)} className="btn btn-danger btn-sm" title="Archive / Delete Record">
                          <Trash2 size={13} />
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

      {/* TAB 4: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
          {/* Post Announcement */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1.25rem' }}>
              Broadcast Announcement
            </h3>
            <form onSubmit={handleAnnouncementSubmit}>
              <div className="form-group">
                <label className="form-label">Notice Headline *</label>
                <input type="text" className="form-input" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select className="form-select" value={annAudience} onChange={(e) => setAnnAudience(e.target.value)}>
                  <option value="ALL">All Hotel Residents & Staff</option>
                  <option value="CUSTOMERS">Customers Only</option>
                  <option value="STAFF">Internal Hotel Employees</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Announcement Content *</label>
                <textarea rows={4} className="form-textarea" value={annContent} onChange={(e) => setAnnContent(e.target.value)} required />
              </div>

              <button type="submit" disabled={submittingAnn} className="btn btn-gold" style={{ width: '100%' }}>
                {submittingAnn ? 'Broadcasting...' : 'Publish Announcement'}
              </button>
            </form>
          </div>

          {/* Announcements List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map((a) => (
              <div key={a.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>{a.targetAudience}</span>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff' }}>{a.title}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleOpenEditAnnouncement(a)} 
                      className="btn btn-outline btn-sm" 
                      style={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.4)' }}
                      title="Edit Announcement"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAnnouncement(a.id)} 
                      className="btn btn-outline btn-sm" 
                      style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.4)' }}
                      title="Delete Announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS (Component 6 Audit Log CRUD) */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>System Audit & Security Logs</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Immutable historical tracking of user governance, reservations, employee rosters, and revenue events.
              </p>
            </div>
            <button onClick={handleClearOldLogs} className="btn btn-outline btn-sm" style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <Trash2 size={14} /> Purge Logs Older Than 30 Days
            </button>
          </div>

          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Username</th>
                  <th>Action</th>
                  <th>Details & Context</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{log.timestamp || 'Recent'}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{log.username || 'System'}</td>
                    <td>
                      <span className="badge badge-approved">{log.action}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{log.details}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteLog(log.id)} className="btn btn-danger btn-sm" title="Purge Log Entry">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE USER */}
      <Modal 
        isOpen={isUserModalOpen} 
        onClose={() => {
          setIsUserModalOpen(false);
          setUserModalError(null);
        }} 
        title="Create New System User Account"
      >
        <form onSubmit={handleCreateUserSubmit}>
          {userModalError && (
            <ToastAlert type="error" message={userModalError} onClose={() => setUserModalError(null)} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Username *</label>
              <input 
                type="text" 
                className="form-input" 
                value={newUsername} 
                onChange={(e) => {
                  setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  if (userModalError) setUserModalError(null);
                }} 
                minLength={3}
                maxLength={30}
                placeholder="e.g. staff_member"
                required 
              />
              <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                Min 3 chars (letters, numbers, underscore)
              </small>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Password *</label>
              <input 
                type="password" 
                className="form-input" 
                value={newPassword} 
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (userModalError) setUserModalError(null);
                }} 
                minLength={6}
                maxLength={40}
                placeholder="Min 6 characters"
                required 
              />
              <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                Must be 6 to 40 characters
              </small>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Full Name *</label>
            <input 
              type="text" 
              className="form-input" 
              value={newFullName} 
              onChange={(e) => {
                setNewFullName(e.target.value);
                if (userModalError) setUserModalError(null);
              }} 
              maxLength={70}
              placeholder="e.g. Eleanor Sinclair"
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Email Address *</label>
              <input 
                type="email" 
                className="form-input" 
                value={newEmail} 
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (userModalError) setUserModalError(null);
                }} 
                maxLength={80}
                placeholder="e.g. user@hotel.com"
                required 
              />
              <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                Valid format (e.g. name@domain.com)
              </small>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Phone</label>
              <input 
                type="tel" 
                className="form-input" 
                value={newPhone} 
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d+\s-]/g, '');
                  if (val.length <= 16) setNewPhone(val);
                  if (userModalError) setUserModalError(null);
                }} 
                maxLength={16}
                placeholder="e.g. 0771234567 or +94771234567"
              />
              <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                10 digits (077...) or int'l format (+94...)
              </small>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Assigned Role</label>
            <select className="form-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="ROLE_CUSTOMER">Customer (Guest / Resident)</option>
              <option value="ROLE_RESERVATION_SUPERVISOR">Reservation Supervisor</option>
              <option value="ROLE_EVENT_COORDINATOR">Event Coordination Manager</option>
              <option value="ROLE_VENUE_MANAGER">Venue Operations Manager</option>
              <option value="ROLE_HR_MANAGER">HR & Resource Manager</option>
              <option value="ROLE_ADMIN">General Manager / Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E8E2D8', paddingTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => {
                setIsUserModalOpen(false);
                setUserModalError(null);
              }} 
              className="btn btn-outline"
              style={{ color: '#141414', borderColor: '#D0C9BE' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submittingUser} 
              className="btn"
              style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}
            >
              {submittingUser ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <Modal 
          isOpen={Boolean(editingUser)} 
          onClose={() => {
            setEditingUser(null);
            setEditUserModalError(null);
          }} 
          title={`Edit Account: ${editingUser.username}`}
        >
          <form onSubmit={handleEditUserSubmit}>
            {editUserModalError && (
              <ToastAlert type="error" message={editUserModalError} onClose={() => setEditUserModalError(null)} />
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Full Name *</label>
              <input 
                type="text" 
                className="form-input" 
                value={editFullName} 
                onChange={(e) => {
                  setEditFullName(e.target.value);
                  if (editUserModalError) setEditUserModalError(null);
                }} 
                maxLength={70}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Email Address *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={editEmail} 
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    if (editUserModalError) setEditUserModalError(null);
                  }} 
                  maxLength={80}
                  required 
                />
                <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                  Valid format (e.g. name@domain.com)
                </small>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Phone</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={editPhone} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d+\s-]/g, '');
                    if (val.length <= 16) setEditPhone(val);
                    if (editUserModalError) setEditUserModalError(null);
                  }} 
                  maxLength={16}
                  placeholder="e.g. 0771234567 or +94771234567"
                />
                <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                  10 digits (077...) or int'l format (+94...)
                </small>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Assigned Role Scope</label>
              <select className="form-select" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                <option value="ROLE_CUSTOMER">Customer</option>
                <option value="ROLE_RESERVATION_SUPERVISOR">Reservation Supervisor</option>
                <option value="ROLE_EVENT_COORDINATOR">Event Coordinator</option>
                <option value="ROLE_VENUE_MANAGER">Venue Manager</option>
                <option value="ROLE_HR_MANAGER">HR Manager</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Reset Password (leave blank to keep unchanged)</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="New password (min 6 characters)..." 
                value={editPassword} 
                onChange={(e) => {
                  setEditPassword(e.target.value);
                  if (editUserModalError) setEditUserModalError(null);
                }} 
                minLength={6}
                maxLength={40}
              />
              <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                Leave empty or provide 6 to 40 characters
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E8E2D8', paddingTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => {
                  setEditingUser(null);
                  setEditUserModalError(null);
                }} 
                className="btn btn-outline"
                style={{ color: '#141414', borderColor: '#D0C9BE' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submittingEditUser} 
                className="btn"
                style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}
              >
                {submittingEditUser ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: RESPOND TO FEEDBACK */}
      {respondFeedback && (
        <Modal isOpen={Boolean(respondFeedback)} onClose={() => setRespondFeedback(null)} title={`Respond to Feedback #${respondFeedback.id}`}>
          <form onSubmit={handleRespondSubmit}>
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{respondFeedback.subject}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>"{respondFeedback.message}"</div>
            </div>

            <div className="form-group">
              <label className="form-label">Resolution Status</label>
              <select className="form-select" value={feedbackStatus} onChange={(e) => setFeedbackStatus(e.target.value)}>
                <option value="RESOLVED">Resolved (Issue Addressed)</option>
                <option value="OPEN">Keep Under Review (Open)</option>
                <option value="REJECTED">Dismissed</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Executive Response Message</label>
              <textarea rows={4} className="form-textarea" placeholder="Type official response to customer..." value={adminReply} onChange={(e) => setAdminReply(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setRespondFeedback(null)} className="btn btn-outline">Cancel</button>
              <button type="submit" disabled={submittingReply} className="btn btn-gold">
                {submittingReply ? 'Transmitting...' : 'Dispatch Response'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: RECORD CUSTOMER COMPLAINT / FEEDBACK (Component 6 Complaint & Feedback CRUD) */}
      <Modal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
        title={fbType === 'COMPLAINT' ? 'Record Customer Complaint' : fbType === 'INQUIRY' ? 'Record Customer Inquiry' : 'Record Customer Feedback'}
      >
        <form onSubmit={handleCreateFeedbackSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Associated Customer / Account</label>
              <select className="form-select" value={fbUserId} onChange={(e) => setFbUserId(e.target.value)}>
                <option value="">-- Unregistered Guest / Walk-in Customer --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} (@{u.username} • {u.role.replace('ROLE_', '')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Record Classification *</label>
              <select className="form-select" value={fbType} onChange={(e) => setFbType(e.target.value)} required>
                <option value="COMPLAINT">Customer Complaint (Escalated Concern)</option>
                <option value="FEEDBACK">Customer Review / Experience Feedback</option>
                <option value="INQUIRY">General Customer Inquiry</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Subject / Issue Headline *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Banquet sound system issue, dining service delay, invoice clarification..." 
              value={fbSubject} 
              onChange={(e) => setFbSubject(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Initial Status</label>
              <select className="form-select" value={fbStatus} onChange={(e) => setFbStatus(e.target.value)}>
                <option value="OPEN">OPEN (Under Investigation)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Staff Assigned)</option>
                <option value="RESOLVED">RESOLVED (Immediate Action Taken)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Service Rating (Optional)</label>
              <select className="form-select" value={fbRating} onChange={(e) => setFbRating(e.target.value)}>
                <option value={5}>5 Stars (Exceptional)</option>
                <option value={4}>4 Stars (Good)</option>
                <option value={3}>3 Stars (Average)</option>
                <option value={2}>2 Stars (Poor / Concern)</option>
                <option value={1}>1 Star (Critical Complaint)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Detailed Description / Customer Testimony *</label>
            <textarea 
              rows={4} 
              className="form-textarea" 
              placeholder="Provide complete notes on the customer's complaint or feedback..." 
              value={fbMessage} 
              onChange={(e) => setFbMessage(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E8E2D8', paddingTop: '1rem' }}>
            <button type="button" onClick={() => setIsFeedbackModalOpen(false)} className="btn btn-outline" style={{ color: '#141414', borderColor: '#D0C9BE' }}>
              Cancel
            </button>
            <button type="submit" disabled={submittingCreateFeedback} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
              {submittingCreateFeedback ? 'Recording Entry...' : 'Save Customer Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: EDIT ANNOUNCEMENT */}
      {editingAnnouncement && (
        <Modal 
          isOpen={Boolean(editingAnnouncement)} 
          onClose={() => setEditingAnnouncement(null)} 
          title={`Edit Broadcast Announcement #${editingAnnouncement.id}`}
        >
          <form onSubmit={handleEditAnnouncementSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Notice Headline *</label>
              <input 
                type="text" 
                className="form-input" 
                value={editAnnTitle} 
                onChange={(e) => setEditAnnTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Target Audience</label>
              <select 
                className="form-select" 
                value={editAnnAudience} 
                onChange={(e) => setEditAnnAudience(e.target.value)}
              >
                <option value="ALL">All Hotel Residents & Staff</option>
                <option value="CUSTOMERS">Customers Only</option>
                <option value="STAFF">Internal Hotel Employees</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Announcement Content *</label>
              <textarea 
                rows={4} 
                className="form-textarea" 
                value={editAnnContent} 
                onChange={(e) => setEditAnnContent(e.target.value)} 
                required 
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E8E2D8', paddingTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setEditingAnnouncement(null)} 
                className="btn btn-outline"
                style={{ color: '#141414', borderColor: '#D0C9BE' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submittingEditAnn} 
                className="btn"
                style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}
              >
                {submittingEditAnn ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminDashboard;
