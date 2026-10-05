import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ToastAlert from '../components/ToastAlert';
import Modal from '../components/Modal';
import { 
  Users, 
  Calendar, 
  Clock, 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';

const HRManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees', 'schedules', 'allocations', 'leaves'
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Search & Filter
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('ALL');

  // Employee Modal State
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [empCode, setEmpCode] = useState('');
  const [empFullName, setEmpFullName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empPhoneError, setEmpPhoneError] = useState('');
  const [empHireDate, setEmpHireDate] = useState('');
  const [empUserId, setEmpUserId] = useState('');
  const [empDepartment, setEmpDepartment] = useState('F&B / Catering');
  const [empDesignation, setEmpDesignation] = useState('Service Captain');
  const [empSalary, setEmpSalary] = useState('');
  const [empActive, setEmpActive] = useState(true);
  const [submittingEmp, setSubmittingEmp] = useState(false);
  const [usersList, setUsersList] = useState([]);

  // Allocation State (Component 5: C. Resource Allocation — CRUD)
  const [allocEventFilter, setAllocEventFilter] = useState('ALL');
  const [allocSearchQuery, setAllocSearchQuery] = useState('');
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [allocResId, setAllocResId] = useState('');
  const [allocEmpId, setAllocEmpId] = useState('');
  const [allocResourceName, setAllocResourceName] = useState('');
  const [allocRole, setAllocRole] = useState('');
  const [allocDate, setAllocDate] = useState('');
  const [submittingAlloc, setSubmittingAlloc] = useState(false);
  const [editingAllocId, setEditingAllocId] = useState(null);

  // Schedule Modal State (Component 5 Staff Scheduling CRUD)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [schEmpId, setSchEmpId] = useState('');
  const [schShiftType, setSchShiftType] = useState('MORNING');
  const [schShiftDate, setSchShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [schStartTime, setSchStartTime] = useState('07:00');
  const [schEndTime, setSchEndTime] = useState('15:00');
  const [schDutyStation, setSchDutyStation] = useState('Grand Ballroom');
  const [schStatus, setSchStatus] = useState('ASSIGNED');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Leave Modal State (Component 5 Leave Management CRUD)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [leaveEmpId, setLeaveEmpId] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStatus, setLeaveStatus] = useState('PENDING');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const loadAllData = async () => {
    try {
      const [empRes, schRes, leaveRes, allocRes, bookingRes, userRes] = await Promise.all([
        api.get('/hr/employees').catch(() => ({ data: [] })),
        api.get('/hr/schedules').catch(() => ({ data: [] })),
        api.get('/hr/leaves').catch(() => ({ data: [] })),
        api.get('/hr/allocations').catch(() => ({ data: [] })),
        api.get('/reservations/manage/all').catch(() => ({ data: [] })),
        api.get('/hr/users').catch(() => ({ data: [] }))
      ]);

      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setSchedules(Array.isArray(schRes.data) ? schRes.data : []);
      setLeaves(Array.isArray(leaveRes.data) ? leaveRes.data : []);
      setAllocations(Array.isArray(allocRes.data) ? allocRes.data : []);
      setReservations(Array.isArray(bookingRes.data) ? bookingRes.data : []);
      setUsersList(Array.isArray(userRes.data) ? userRes.data : []);
    } catch (err) {
      console.error('HR load error:', err);
      setAlert({ type: 'error', message: 'Failed to fetch HR records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered employees
  const filteredEmployees = employees.filter(e => {
    const matchesDept = empDeptFilter === 'ALL' || e.department === empDeptFilter;
    const matchesQuery = empSearchQuery === '' ||
      e.fullName?.toLowerCase().includes(empSearchQuery.toLowerCase()) ||
      e.employeeCode?.toLowerCase().includes(empSearchQuery.toLowerCase()) ||
      e.phone?.toLowerCase().includes(empSearchQuery.toLowerCase()) ||
      e.designation?.toLowerCase().includes(empSearchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  // EMPLOYEE HANDLERS & PHONE VALIDATION
  const validateEmpPhone = (raw) => {
    if (!raw || !raw.trim()) {
      return 'Contact phone number is required.';
    }
    const clean = raw.replace(/[\s-]/g, '');
    const phoneRegex = /^(?:0\d{9}|\+94\d{9}|\+\d{10,14})$/;
    if (!phoneRegex.test(clean)) {
      return 'Invalid phone number format. Must be 10 digits for local numbers (e.g. 0771234567) or 10–15 digits with country code (e.g. +94771234567).';
    }
    return '';
  };

  const openCreateEmpModal = () => {
    setEditingEmpId(null);
    setEmpCode(`EMP-00${employees.length + 1}`);
    setEmpFullName('');
    setEmpPhone('');
    setEmpPhoneError('');
    setEmpHireDate(new Date().toISOString().split('T')[0]);
    setEmpUserId('');
    setEmpDepartment('F&B / Catering');
    setEmpDesignation('Service Captain');
    setEmpSalary('95000');
    setEmpActive(true);
    setIsEmployeeModalOpen(true);
  };

  const openEditEmpModal = (emp) => {
    setEditingEmpId(emp.id);
    setEmpCode(emp.employeeCode);
    setEmpFullName(emp.fullName);
    setEmpPhone(emp.phone || '');
    setEmpPhoneError('');
    setEmpHireDate(emp.hireDate || '');
    setEmpUserId(emp.user?.id ? String(emp.user.id) : '');
    setEmpDepartment(emp.department);
    setEmpDesignation(emp.designation);
    setEmpSalary(emp.salary);
    setEmpActive(emp.active !== false);
    setIsEmployeeModalOpen(true);
  };

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    const phoneErr = validateEmpPhone(empPhone);
    if (phoneErr) {
      setEmpPhoneError(phoneErr);
      return;
    }
    setEmpPhoneError('');
    setSubmittingEmp(true);
    const cleanPhone = empPhone.replace(/[\s-]/g, '');
    const payload = {
      employeeCode: empCode.trim().toUpperCase(),
      fullName: empFullName.trim(),
      phone: cleanPhone,
      hireDate: empHireDate || new Date().toISOString().split('T')[0],
      department: empDepartment,
      designation: empDesignation.trim(),
      salary: parseFloat(empSalary),
      user: empUserId ? { id: parseInt(empUserId, 10) } : null,
      active: empActive
    };

    try {
      if (editingEmpId) {
        await api.put(`/hr/employees/${editingEmpId}`, payload);
        setAlert({ type: 'success', message: `Employee #${empCode} updated.` });
      } else {
        await api.post('/hr/employees', payload);
        setAlert({ type: 'success', message: `Employee #${empCode} registered.` });
      }
      setIsEmployeeModalOpen(false);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save employee profile.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingEmp(false);
    }
  };

  const handleDeleteEmp = async (id, name) => {
    if (!window.confirm(`Delete employee "${name}" (#${id})?`)) return;
    try {
      await api.delete(`/hr/employees/${id}`);
      setAlert({ type: 'info', message: `Employee record removed.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete employee.' });
    }
  };

  // LEAVE HANDLERS (Component 5 Leave Management CRUD)
  const openCreateLeaveModal = () => {
    setEditingLeaveId(null);
    setLeaveEmpId(employees.length > 0 ? String(employees[0].id) : '');
    const today = new Date().toISOString().split('T')[0];
    setLeaveStartDate(today);
    setLeaveEndDate(today);
    setLeaveReason('');
    setLeaveStatus('PENDING');
    setIsLeaveModalOpen(true);
  };

  const openEditLeaveModal = (l) => {
    setEditingLeaveId(l.id);
    setLeaveEmpId(String(l.employee?.id || l.employeeId || ''));
    setLeaveStartDate(l.startDate || '');
    setLeaveEndDate(l.endDate || '');
    setLeaveReason(l.reason || '');
    setLeaveStatus(l.status || 'PENDING');
    setIsLeaveModalOpen(true);
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveEmpId || !leaveStartDate || !leaveEndDate || !leaveReason.trim()) {
      setAlert({ type: 'warning', message: 'Please complete all required leave details.' });
      return;
    }
    setSubmittingLeave(true);
    try {
      const payload = {
        employeeId: parseInt(leaveEmpId, 10),
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveReason.trim(),
        status: leaveStatus
      };
      if (editingLeaveId) {
        await api.put(`/hr/leaves/${editingLeaveId}`, payload);
        setAlert({ type: 'success', message: `Leave record #${editingLeaveId} modified successfully.` });
      } else {
        await api.post('/hr/leaves', payload);
        setAlert({ type: 'success', message: 'Leave request recorded successfully!' });
      }
      setIsLeaveModalOpen(false);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process leave request.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleApproveLeave = async (id) => {
    try {
      await api.patch(`/hr/leaves/${id}/approve`);
      setAlert({ type: 'success', message: `Leave request #${id} approved.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Approval failed.' });
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      await api.patch(`/hr/leaves/${id}/reject`);
      setAlert({ type: 'info', message: `Leave request #${id} rejected.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Rejection failed.' });
    }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm(`Cancel/remove leave record #${id}?`)) return;
    try {
      await api.delete(`/hr/leaves/${id}`);
      setAlert({ type: 'info', message: `Leave request #${id} removed successfully.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete leave request.' });
    }
  };

  // EMPLOYEE AVAILABILITY EVALUATION (Enforce inactive and approved leave guards)
  const getEmployeeAvailability = (empId, targetDate) => {
    if (!empId) return { available: true };
    const emp = employees.find(e => String(e.id) === String(empId));
    if (!emp) return { available: true };

    // 1. Check if employee is marked as inactive
    if (emp.active === false) {
      return { 
        available: false, 
        reason: 'Inactive Employee',
        detail: `Staff member "${emp.fullName}" is marked as INACTIVE (Off-duty).`
      };
    }

    // 2. Check if employee is on an approved leave on targetDate
    if (targetDate) {
      const activeLeave = leaves.find(l => {
        const matchesEmp = String(l.employee?.id || l.employeeId) === String(empId);
        const isApproved = l.status === 'APPROVED';
        const inRange = l.startDate <= targetDate && targetDate <= l.endDate;
        return matchesEmp && isApproved && inRange;
      });

      if (activeLeave) {
        return {
          available: false,
          reason: 'On Approved Leave',
          detail: `Staff member "${emp.fullName}" is on APPROVED LEAVE from ${activeLeave.startDate} to ${activeLeave.endDate} (${activeLeave.reason}).`
        };
      }
    }

    return { available: true };
  };

  // C. RESOURCE ALLOCATION — CRUD HANDLERS (Component 5)
  // Create: Assign a resource to an event
  const openCreateAllocModal = (targetEventId) => {
    setEditingAllocId(null);
    const chosenResId = targetEventId || (allocEventFilter !== 'ALL' ? allocEventFilter : (reservations.length > 0 ? String(reservations[0].id) : ''));
    setAllocResId(chosenResId);
    const res = reservations.find(r => String(r.id) === String(chosenResId));
    setAllocDate(res?.startDate || new Date().toISOString().split('T')[0]);
    setAllocEmpId('');
    setAllocResourceName('');
    setAllocRole('Event Coordinator');
    setIsAllocModalOpen(true);
  };

  // Update: Change the resource allocation
  const openEditAllocModal = (a) => {
    setEditingAllocId(a.id);
    setAllocResId(String(a.reservation?.id || a.reservationId || ''));
    setAllocEmpId(a.employee?.id ? String(a.employee.id) : '');
    setAllocResourceName(a.resourceName || '');
    setAllocRole(a.roleAssigned || '');
    setAllocDate(a.allocationDate || '');
    setIsAllocModalOpen(true);
  };

  const handleCreateOrUpdateAllocation = async (e) => {
    e.preventDefault();
    if (!allocResId || !allocResourceName.trim() || !allocDate) {
      setAlert({ type: 'warning', message: 'Target event reservation, resource name, and allocation date are required.' });
      return;
    }

    // Guard: Prevent assigning inactive or on-leave employee
    if (allocEmpId) {
      const avail = getEmployeeAvailability(allocEmpId, allocDate);
      if (!avail.available) {
        setAlert({ type: 'error', message: `Staff Allocation Conflict: ${avail.detail} Cannot be allocated to this event.` });
        return;
      }
    }

    setSubmittingAlloc(true);
    try {
      const payload = {
        reservationId: parseInt(allocResId, 10),
        resourceName: allocResourceName.trim(),
        roleAssigned: allocRole.trim() || 'Event Operations',
        allocationDate: allocDate,
        ...(allocEmpId ? { employeeId: parseInt(allocEmpId, 10) } : {})
      };

      if (editingAllocId) {
        await api.put(`/hr/allocations/${editingAllocId}`, payload);
        setAlert({ type: 'success', message: `Resource allocation #${editingAllocId} successfully updated!` });
      } else {
        await api.post('/hr/allocations', payload);
        setAlert({ type: 'success', message: `Resource "${payload.resourceName}" assigned to Event #${allocResId} successfully!` });
      }
      setIsAllocModalOpen(false);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Resource allocation conflict or error.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingAlloc(false);
    }
  };

  // Delete: Release/remove a resource allocation
  const handleDeleteAllocation = async (id, resourceName, eventId) => {
    const label = resourceName ? `"${resourceName}"` : `Allocation #${id}`;
    if (!window.confirm(`Release and remove resource ${label} from Event #${eventId || ''}?`)) return;
    try {
      await api.delete(`/hr/allocations/${id}`);
      setAlert({ type: 'info', message: `Resource allocation #${id} released successfully.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to release resource allocation.' });
    }
  };

  // Read: View resources assigned to an event
  const filteredAllocations = allocations.filter(a => {
    const resId = String(a.reservation?.id || a.reservationId || '');
    const matchesEvent = allocEventFilter === 'ALL' || resId === allocEventFilter;
    const q = allocSearchQuery.trim().toLowerCase();
    if (!matchesEvent) return false;
    if (!q) return true;
    return (
      (a.resourceName && a.resourceName.toLowerCase().includes(q)) ||
      (a.roleAssigned && a.roleAssigned.toLowerCase().includes(q)) ||
      (a.employee?.fullName && a.employee.fullName.toLowerCase().includes(q)) ||
      resId.includes(q) ||
      (a.reservation?.venueRoom?.name && a.reservation.venueRoom.name.toLowerCase().includes(q))
    );
  });

  // SCHEDULE HANDLERS (Component 5 Staff Duty Scheduling CRUD)
  const openCreateScheduleModal = () => {
    setEditingScheduleId(null);
    const today = new Date().toISOString().split('T')[0];
    const firstAvailable = employees.find(e => getEmployeeAvailability(e.id, today).available);
    setSchEmpId(firstAvailable ? String(firstAvailable.id) : (employees.length > 0 ? String(employees[0].id) : ''));
    setSchShiftType('MORNING');
    setSchShiftDate(today);
    setSchStartTime('07:00');
    setSchEndTime('15:00');
    setSchDutyStation('Grand Ballroom');
    setSchStatus('ASSIGNED');
    setIsScheduleModalOpen(true);
  };

  const openEditScheduleModal = (s) => {
    setEditingScheduleId(s.id);
    setSchEmpId(String(s.employee?.id || s.employeeId || ''));
    setSchShiftType(s.shiftType || 'MORNING');
    setSchShiftDate(s.shiftDate || s.scheduleDate || '');
    setSchStartTime(s.startTime || '07:00');
    setSchEndTime(s.endTime || '15:00');
    setSchDutyStation(s.dutyStation || s.department || s.notes || 'Grand Ballroom');
    setSchStatus(s.status || 'ASSIGNED');
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schEmpId || !schShiftDate) {
      setAlert({ type: 'warning', message: 'Staff member and shift date are required.' });
      return;
    }

    // Guard: Prevent assigning inactive or on-leave employee
    const avail = getEmployeeAvailability(schEmpId, schShiftDate);
    if (!avail.available) {
      setAlert({ type: 'error', message: `Duty Schedule Blocked: ${avail.detail}` });
      return;
    }

    setSubmittingSchedule(true);
    try {
      const payload = {
        employee: { id: parseInt(schEmpId, 10) },
        shiftType: schShiftType,
        shiftDate: schShiftDate,
        scheduleDate: schShiftDate,
        startTime: schStartTime,
        endTime: schEndTime,
        dutyStation: schDutyStation,
        notes: schDutyStation,
        status: schStatus
      };
      if (editingScheduleId) {
        await api.put(`/hr/schedules/${editingScheduleId}`, payload);
        setAlert({ type: 'success', message: `Duty schedule #${editingScheduleId} updated successfully!` });
      } else {
        await api.post(`/hr/schedules?employeeId=${schEmpId}`, payload);
        setAlert({ type: 'success', message: 'New duty schedule created successfully!' });
      }
      setIsScheduleModalOpen(false);
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save duty schedule.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id, staffName) => {
    if (!window.confirm(`Cancel/remove duty schedule for "${staffName}" (#${id})?`)) return;
    try {
      await api.delete(`/hr/schedules/${id}`);
      setAlert({ type: 'info', message: `Schedule #${id} removed successfully.` });
      loadAllData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete schedule.' });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gold-primary)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>
          Loading HR & Resource Management Portal...
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
              <Users size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>
                HR & Resource Management Portal
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Employee Profiles • Duty Scheduling • Leave Approvals • Conflict-Free Event Staff Allocation
              </p>
            </div>
          </div>

          <button onClick={openCreateEmpModal} className="btn btn-gold">
            <Plus size={16} /> Register Employee
          </button>
        </div>
      </div>

      <ToastAlert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Tabs: Employee → Staff Schedule → Resource Allocation → Leave */}
      <div className="tabs-container">
        {[
          { id: 'employees', label: `Employee Management (${employees.length})`, icon: <Users size={17} /> },
          { id: 'schedules', label: `Staff Scheduling (${schedules.length})`, icon: <Clock size={17} /> },
          { id: 'allocations', label: `Resource Allocation (${allocations.length})`, icon: <Briefcase size={17} /> },
          { id: 'leaves', label: `Leave Management (${leaves.length})`, icon: <Calendar size={17} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EMPLOYEE MANAGEMENT */}
      {activeTab === 'employees' && (
        <div className="animate-fade-in">
          {/* Search & Filter */}
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
              {['ALL', 'F&B / Catering', 'Banquet Operations', 'Front Office & Concierge', 'Executive Admin'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setEmpDeptFilter(dept)}
                  className={`btn btn-sm ${empDeptFilter === dept ? 'btn-gold' : 'btn-outline'}`}
                  style={{ fontSize: '0.76rem' }}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div style={{ minWidth: '240px', flex: 1, maxWidth: '340px' }}>
              <input 
                type="text" 
                placeholder="Search staff by name, code, designation..."
                className="form-input"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                value={empSearchQuery}
                onChange={(e) => setEmpSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Employee Profile</th>
                  <th>Contact Phone</th>
                  <th>Hire Date</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Monthly Salary</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold-primary)' }}>
                      {e.employeeCode}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
                          {e.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{e.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {e.user ? `@${e.user.username} (${e.user.email})` : 'Unlinked Staff'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#fff', fontWeight: 500 }}>
                      {e.phone ? (
                        <span style={{ color: 'var(--gold-light)', fontFamily: 'monospace' }}>{e.phone}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>
                      )}
                    </td>
                    <td style={{ color: '#fff', fontSize: '0.88rem' }}>
                      {e.hireDate || 'N/A'}
                    </td>
                    <td>{e.department}</td>
                    <td>
                      <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                        {e.designation}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      LKR {parseFloat(e.salary || 0).toFixed(2)}
                    </td>
                    <td>
                      {e.active !== false ? (
                        <span className="badge badge-confirmed">ACTIVE ON-DUTY</span>
                      ) : (
                        <span className="badge badge-rejected">ON LEAVE / INACTIVE</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button onClick={() => openEditEmpModal(e)} className="btn btn-outline btn-sm">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteEmp(e.id, e.fullName)} className="btn btn-danger btn-sm">
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

      {/* TAB 2: STAFF SCHEDULING (B. Staff Scheduling — CRUD) */}
      {activeTab === 'schedules' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Staff Shift & Duty Rostering</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Create, view, change, and remove employee duty schedules across venue stations.
              </p>
            </div>
            <button onClick={openCreateScheduleModal} className="btn btn-gold btn-sm">
              <Plus size={15} /> Assign Duty Schedule
            </button>
          </div>
          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff Member</th>
                  <th>Duty Shift</th>
                  <th>Working Hours</th>
                  <th>Department / Station</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      No staff duty schedules recorded yet.
                    </td>
                  </tr>
                ) : (
                  schedules.map((s) => (
                    <tr key={s.id}>
                      <td>{s.scheduleDate || s.shiftDate || s.date}</td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>
                        {s.employee?.fullName || `Staff #${s.employeeId}`}
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                          {s.shiftType || 'MORNING'}
                        </span>
                      </td>
                      <td>{s.startTime || '07:00'} - {s.endTime || '15:00'}</td>
                      <td>{s.department || s.dutyStation || s.notes || 'Grand Ballroom'}</td>
                      <td>
                        <span className={`badge ${s.status === 'COMPLETED' ? 'badge-approved' : s.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-confirmed'}`}>
                          {s.status || 'ASSIGNED'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button onClick={() => openEditScheduleModal(s)} className="btn btn-outline btn-sm" title="Change Schedule">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDeleteSchedule(s.id, s.employee?.fullName || 'Staff')} className="btn btn-danger btn-sm" title="Remove Schedule">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESOURCE ALLOCATION (C. Resource Allocation — CRUD) */}
      {activeTab === 'allocations' && (
        <div className="animate-fade-in">
          {/* Controls: Read (View resources assigned to an event) & Filter & Create Action */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
              {/* Event Selector - Read: View resources assigned to an event */}
              <div style={{ minWidth: '300px', flex: 1, maxWidth: '450px' }}>
                <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gold-light)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  View Resources Assigned to Event:
                </label>
                <select 
                  className="form-select" 
                  value={allocEventFilter} 
                  onChange={(e) => setAllocEventFilter(e.target.value)}
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.86rem' }}
                >
                  <option value="ALL">Show All Events ({allocations.length} Allocated Resources)</option>
                  {reservations.map(r => (
                    <option key={r.id} value={String(r.id)}>
                      Event #{r.id} - {r.venueRoom?.name || 'Grand Venue'} ({r.startDate}) {r.guestName ? `• ${r.guestName}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search resources */}
              <div style={{ minWidth: '220px', flex: 1, maxWidth: '320px', marginTop: '1.35rem' }}>
                <input 
                  type="text" 
                  placeholder="Search resources, equipment, staff..."
                  className="form-input"
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                  value={allocSearchQuery}
                  onChange={(e) => setAllocSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Create Operation: Assign a resource to an event */}
            <div style={{ marginTop: '1.35rem' }}>
              <button onClick={() => openCreateAllocModal()} className="btn btn-gold">
                <Plus size={16} /> Assign Resource to Event
              </button>
            </div>
          </div>

          {/* Active Event Banner (when viewing resources assigned to a specific event) */}
          {allocEventFilter !== 'ALL' && (
            <div className="glass-card" style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderLeft: '4px solid var(--gold-primary)'
            }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem', marginBottom: '0.3rem' }}>
                  EVENT RESOURCE VIEW
                </span>
                <h4 style={{ color: '#fff', margin: '0.2rem 0', fontSize: '1.15rem' }}>
                  Event #{allocEventFilter}: {reservations.find(r => String(r.id) === allocEventFilter)?.venueRoom?.name || 'Banquet Event'}
                </h4>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                  Date: <strong style={{ color: '#fff' }}>{reservations.find(r => String(r.id) === allocEventFilter)?.startDate || 'N/A'}</strong> • Guest: <strong style={{ color: '#fff' }}>{reservations.find(r => String(r.id) === allocEventFilter)?.guestName || 'Valued Client'}</strong> • Resources Assigned: <strong style={{ color: 'var(--gold-light)' }}>{filteredAllocations.length}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => openCreateAllocModal(allocEventFilter)} className="btn btn-gold btn-sm">
                  <Plus size={14} /> Assign Another Resource
                </button>
                <button onClick={() => setAllocEventFilter('ALL')} className="btn btn-outline btn-sm">
                  View All Events
                </button>
              </div>
            </div>
          )}

          {/* Resource Allocation Table */}
          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Allocation ID</th>
                  <th>Assigned Event</th>
                  <th>Resource / Equipment / Service</th>
                  <th>Assigned Staff Member</th>
                  <th>Role / Operational Purpose</th>
                  <th>Allocation Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                      <Briefcase size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4, display: 'block' }} />
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>
                        No Resources Found
                      </div>
                      <p style={{ fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
                        {allocEventFilter !== 'ALL' 
                          ? `No resources or equipment are currently assigned to Event #${allocEventFilter}.`
                          : 'No resource allocations match your search or filter.'}
                      </p>
                      <button onClick={() => openCreateAllocModal(allocEventFilter !== 'ALL' ? allocEventFilter : null)} className="btn btn-gold btn-sm">
                        <Plus size={14} /> Assign Resource to Event
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredAllocations.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold-primary)' }}>
                        #{a.id}
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>
                            Event #{a.reservation?.id || a.reservationId}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {a.reservation?.venueRoom?.name || 'Grand Venue'} ({a.reservation?.startDate || a.allocationDate})
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(212, 175, 55, 0.12)',
                            color: 'var(--gold-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Briefcase size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>
                              {a.resourceName || 'Executive Resource'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gold-light)' }}>
                              Allocated Asset / Service
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {a.employee ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>
                              {a.employee.fullName}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {a.employee.designation || a.employee.department}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Equipment / Facility (Unassigned)
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                          {a.roleAssigned || 'Operations Lead'}
                        </span>
                      </td>
                      <td style={{ color: '#fff', fontSize: '0.86rem' }}>
                        {a.allocationDate}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button 
                            onClick={() => openEditAllocModal(a)} 
                            className="btn btn-outline btn-sm" 
                            title="Change Resource Allocation"
                          >
                            <Edit3 size={13} /> Change
                          </button>
                          <button 
                            onClick={() => handleDeleteAllocation(a.id, a.resourceName, a.reservation?.id || a.reservationId)} 
                            className="btn btn-danger btn-sm" 
                            title="Release / Remove Resource Allocation"
                          >
                            <Trash2 size={13} /> Release
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE MANAGEMENT (D. Leave Management — CRUD) */}
      {activeTab === 'leaves' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Staff Leave Records & Management</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Submit, review, approve, reject, modify, and cancel employee leave requests.
              </p>
            </div>
            <button onClick={openCreateLeaveModal} className="btn btn-gold btn-sm">
              <Plus size={15} /> Submit Leave Request
            </button>
          </div>
          <div className="table-responsive glass-card">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Leave Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.id}>
                      <td>#{l.id}</td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>
                        {l.employee?.fullName || `Employee #${l.employeeId}`}
                      </td>
                      <td>{l.startDate} to {l.endDate}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{l.reason}</td>
                      <td>
                        <span className={`badge ${l.status === 'APPROVED' ? 'badge-confirmed' : l.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>
                          {l.status || 'PENDING'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                          {l.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleApproveLeave(l.id)} className="btn btn-success btn-sm" title="Approve Leave">
                                <CheckCircle2 size={14} /> Approve
                              </button>
                              <button onClick={() => handleRejectLeave(l.id)} className="btn btn-danger btn-sm" title="Reject Leave">
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => openEditLeaveModal(l)} className="btn btn-outline btn-sm" title="Modify Leave Request">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDeleteLeave(l.id)} className="btn btn-danger btn-sm" title="Cancel/Delete Leave">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER / EDIT EMPLOYEE */}
      <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title={editingEmpId ? `Edit Employee #${empCode}` : 'Register New Employee'}>
        <form onSubmit={handleEmpSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Employee Code *</label>
              <input type="text" className="form-input" placeholder="e.g. EMP-007" value={empCode} onChange={(e) => setEmpCode(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Full Name *</label>
              <input type="text" className="form-input" placeholder="e.g. Johnathan Smith" value={empFullName} onChange={(e) => setEmpFullName(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Contact Phone / Mobile *</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="+94 77 123 4567 or 0771234567" 
                value={empPhone} 
                onChange={(e) => {
                  setEmpPhone(e.target.value);
                  if (empPhoneError) {
                    setEmpPhoneError(validateEmpPhone(e.target.value));
                  }
                }} 
                onBlur={() => {
                  if (empPhone) {
                    setEmpPhoneError(validateEmpPhone(empPhone));
                  }
                }}
                required 
                style={empPhoneError ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.2)' } : {}}
              />
              {empPhoneError ? (
                <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 600 }}>
                  {empPhoneError}
                </div>
              ) : (
                <div style={{ color: '#6B7280', fontSize: '0.74rem', marginTop: '0.25rem' }}>
                  Format: 10 digits (e.g. 0771234567) or country code (e.g. +94771234567)
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Hire Date / Joining Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={empHireDate} 
                onChange={(e) => setEmpHireDate(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Department *</label>
              <select className="form-select" value={empDepartment} onChange={(e) => setEmpDepartment(e.target.value)}>
                <option value="F&B / Catering">F&B / Catering</option>
                <option value="Banquet Operations">Banquet Operations</option>
                <option value="Front Office & Concierge">Front Office & Concierge</option>
                <option value="Housekeeping & Facilities">Housekeeping & Facilities</option>
                <option value="Venue Operations">Venue Operations</option>
                <option value="Event Coordination">Event Coordination</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Executive Admin">Executive Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Designation *</label>
              <input type="text" className="form-input" placeholder="e.g. Service Captain, Event Host" value={empDesignation} onChange={(e) => setEmpDesignation(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Monthly Salary (LKR) *</label>
              <input type="number" step="1000" min="0" className="form-input" value={empSalary} onChange={(e) => setEmpSalary(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Link User Login Account (Optional)</label>
              <select className="form-select" value={empUserId} onChange={(e) => setEmpUserId(e.target.value)}>
                <option value="">-- No User Account Link (Staff Record Only) --</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    @{u.username} ({u.fullName} • {u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: '#141414', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={empActive} 
                onChange={(e) => setEmpActive(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: '#0B3B2C' }}
              />
              <span style={{ fontWeight: 600 }}>Active On-Duty Staff Member</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E8E2D8', paddingTop: '1rem' }}>
            <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="btn btn-outline" style={{ color: '#141414', borderColor: '#D0C9BE' }}>
              Cancel
            </button>
            <button type="submit" disabled={submittingEmp} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
              {submittingEmp ? 'Saving Profile...' : 'Save Employee Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE / EDIT DUTY SCHEDULE */}
      <Modal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        title={editingScheduleId ? `Edit Duty Schedule #${editingScheduleId}` : 'Assign New Duty Schedule'}
      >
        <form onSubmit={handleScheduleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Staff Member *</label>
              <select className="form-select" value={schEmpId} onChange={(e) => setSchEmpId(e.target.value)} required>
                <option value="">-- Select Employee --</option>
                {employees.map(e => {
                  const avail = getEmployeeAvailability(e.id, schShiftDate);
                  return (
                    <option key={e.id} value={e.id} style={!avail.available ? { color: '#991B1B', background: '#FEE2E2' } : {}}>
                      {e.fullName} ({e.designation} • {e.department}) {!avail.available ? `⚠️ [${avail.reason}]` : '✓ Available'}
                    </option>
                  );
                })}
              </select>
              {(() => {
                if (!schEmpId) return null;
                const avail = getEmployeeAvailability(schEmpId, schShiftDate);
                if (!avail.available) {
                  return (
                    <div style={{
                      marginTop: '0.45rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#991B1B',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      ⚠️ {avail.detail} Cannot be scheduled for this duty shift.
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Shift Category *</label>
              <select className="form-select" value={schShiftType} onChange={(e) => setSchShiftType(e.target.value)} required>
                <option value="MORNING">Morning Shift (07:00 - 15:00)</option>
                <option value="EVENING">Evening Shift (15:00 - 23:00)</option>
                <option value="NIGHT">Night Shift (23:00 - 07:00)</option>
                <option value="EVENT_DUTY">Event Duty (Custom / Extended)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Roster / Duty Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={schShiftDate} 
                onChange={(e) => setSchShiftDate(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Schedule Status</label>
              <select className="form-select" value={schStatus} onChange={(e) => setSchStatus(e.target.value)}>
                <option value="ASSIGNED">ASSIGNED (Upcoming)</option>
                <option value="COMPLETED">COMPLETED (Concluded)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Start Time</label>
              <input 
                type="time" 
                className="form-input" 
                value={schStartTime} 
                onChange={(e) => setSchStartTime(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>End Time</label>
              <input 
                type="time" 
                className="form-input" 
                value={schEndTime} 
                onChange={(e) => setSchEndTime(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Duty Station / Venue / Instructions</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Grand Ballroom - Lead Table Service, Concierge Desk..." 
              value={schDutyStation} 
              onChange={(e) => setSchDutyStation(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E8E2D8', paddingTop: '1rem' }}>
            <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="btn btn-outline" style={{ color: '#141414', borderColor: '#D0C9BE' }}>
              Cancel
            </button>
            <button type="submit" disabled={submittingSchedule} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
              {submittingSchedule ? 'Saving Schedule...' : editingScheduleId ? 'Update Schedule' : 'Assign Duty Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SUBMIT / MODIFY LEAVE REQUEST */}
      <Modal 
        isOpen={isLeaveModalOpen} 
        onClose={() => setIsLeaveModalOpen(false)} 
        title={editingLeaveId ? `Modify Leave Record #${editingLeaveId}` : 'Submit Staff Leave Request'}
      >
        <form onSubmit={handleLeaveSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Staff Member *</label>
              <select className="form-select" value={leaveEmpId} onChange={(e) => setLeaveEmpId(e.target.value)} required>
                <option value="">-- Select Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Leave Status</label>
              <select className="form-select" value={leaveStatus} onChange={(e) => setLeaveStatus(e.target.value)}>
                <option value="PENDING">PENDING (Review Required)</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Leave Start Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={leaveStartDate} 
                onChange={(e) => setLeaveStartDate(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Leave End Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={leaveEndDate} 
                onChange={(e) => setLeaveEndDate(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Reason / Justification *</label>
            <textarea 
              rows={3} 
              className="form-textarea" 
              placeholder="e.g. Annual family vacation, medical appointment, urgent personal matter..." 
              value={leaveReason} 
              onChange={(e) => setLeaveReason(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E8E2D8', paddingTop: '1rem' }}>
            <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="btn btn-outline" style={{ color: '#141414', borderColor: '#D0C9BE' }}>
              Cancel
            </button>
            <button type="submit" disabled={submittingLeave} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
              {submittingLeave ? 'Saving Record...' : editingLeaveId ? 'Update Leave Record' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN / CHANGE RESOURCE ALLOCATION (Component 5: C. Resource Allocation — CRUD) */}
      <Modal 
        isOpen={isAllocModalOpen} 
        onClose={() => setIsAllocModalOpen(false)} 
        title={editingAllocId ? `Change Resource Allocation #${editingAllocId}` : 'Assign Resource to Event'}
      >
        <form onSubmit={handleCreateOrUpdateAllocation}>
          {/* Target Event */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Target Event / Reservation *</label>
            <select 
              className="form-select" 
              value={allocResId} 
              onChange={(e) => {
                const resId = e.target.value;
                setAllocResId(resId);
                const r = reservations.find(item => String(item.id) === String(resId));
                if (r?.startDate) setAllocDate(r.startDate);
              }} 
              required
            >
              <option value="">-- Select Event Reservation --</option>
              {reservations.map(r => (
                <option key={r.id} value={r.id}>
                  Event #{r.id} - {r.venueRoom?.name || 'Grand Venue'} ({r.startDate}) {r.guestName ? `[${r.guestName}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Name */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Resource / Equipment / Service Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Audio-Visual Sound Stage, Projector & 4K Display, Lead Banquet Team" 
              value={allocResourceName} 
              onChange={(e) => setAllocResourceName(e.target.value)} 
              required 
            />
            {/* Quick Suggestion Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {[
                'Sound & PA Audio System', 
                'Projector & 4K Display', 
                'Stage Lighting Rig', 
                'Lead Banquet Captain', 
                'Luxury Catering Service Unit', 
                'VIP Chauffeur & Escort'
              ].map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAllocResourceName(preset)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.55rem',
                    background: '#F0ECE4',
                    border: '1px solid #D8D2C6',
                    borderRadius: '4px',
                    color: '#2A2A2A',
                    cursor: 'pointer'
                  }}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Assigned Staff Member (Optional) */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Assigned Personnel (Optional)</label>
              <select className="form-select" value={allocEmpId} onChange={(e) => setAllocEmpId(e.target.value)}>
                <option value="">-- Equipment Only (No Staff) --</option>
                {employees.map(e => {
                  const avail = getEmployeeAvailability(e.id, allocDate);
                  return (
                    <option key={e.id} value={e.id} style={!avail.available ? { color: '#991B1B', background: '#FEE2E2' } : {}}>
                      {e.fullName} ({e.designation} • {e.department}) {!avail.available ? `⚠️ [${avail.reason}]` : '✓ Available'}
                    </option>
                  );
                })}
              </select>
              {(() => {
                if (!allocEmpId) return null;
                const avail = getEmployeeAvailability(allocEmpId, allocDate);
                if (!avail.available) {
                  return (
                    <div style={{
                      marginTop: '0.45rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#991B1B',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      ⚠️ {avail.detail} Cannot be assigned to this event.
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Allocation Date */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Allocation Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={allocDate} 
                onChange={(e) => setAllocDate(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Role / Operational Scope */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Assigned Role / Purpose / Scope</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Lead Sound Technician, Stage Coordinator, Catering Captain..." 
              value={allocRole} 
              onChange={(e) => setAllocRole(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E8E2D8', paddingTop: '1rem' }}>
            <button type="button" onClick={() => setIsAllocModalOpen(false)} className="btn btn-outline" style={{ color: '#141414', borderColor: '#D0C9BE' }}>
              Cancel
            </button>
            <button type="submit" disabled={submittingAlloc} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
              {submittingAlloc ? 'Saving Allocation...' : editingAllocId ? 'Change Allocation' : 'Assign Resource to Event'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default HRManagerDashboard;
