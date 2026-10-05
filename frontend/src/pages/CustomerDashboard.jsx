import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ToastAlert from '../components/ToastAlert';
import Modal from '../components/Modal';
import { 
  User, 
  Users, 
  Calendar, 
  Bell, 
  MessageSquare, 
  CreditCard, 
  Edit3, 
  XCircle, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Printer, 
  Plus, 
  Megaphone,
  Star,
  AlertCircle
} from 'lucide-react';

const CustomerDashboard = ({ initialTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTab = () => {
    if (initialTab) return initialTab;
    if (location.pathname === '/profile') return 'profile';
    if (location.pathname === '/reservations') return 'bookings';
    return 'bookings';
  };

  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [packages, setPackages] = useState([]);
  const [customerFeedbacks, setCustomerFeedbacks] = useState([]);
  const [savedGuests, setSavedGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (location.pathname === '/profile') {
      setActiveTab('profile');
    } else if (location.pathname === '/reservations') {
      setActiveTab('bookings');
    }
  }, [initialTab, location.pathname]);
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [alert, setAlert] = useState(null);

  // Customer Profile Edit State
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [passportOrNic, setPassportOrNic] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [preferences, setPreferences] = useState('');

  // Customer Account Deletion State
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState(null);

  // Saved Guest Directory CRUD State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [guestFullName, setGuestFullName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestIdentification, setGuestIdentification] = useState('');
  const [guestRelationship, setGuestRelationship] = useState('SPOUSE');
  const [guestDietaryPreferences, setGuestDietaryPreferences] = useState('');
  const [guestAgeGroup, setGuestAgeGroup] = useState('ADULT');
  const [submittingGuest, setSubmittingGuest] = useState(false);
  const [guestModalError, setGuestModalError] = useState(null);

  // Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Payment Modal State
  const [selectedResForPay, setSelectedResForPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [simulateFail, setSimulateFail] = useState(false);
  const [processingPay, setProcessingPay] = useState(false);
  const [payError, setPayError] = useState(null);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  // Change / Reschedule Modal State
  const [selectedResForEdit, setSelectedResForEdit] = useState(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editGuestCount, setEditGuestCount] = useState(1);
  const [editSpecialNotes, setEditSpecialNotes] = useState('');
  const [editPackageId, setEditPackageId] = useState('');
  const [editPrimaryGuestName, setEditPrimaryGuestName] = useState('');
  const [editPrimaryGuestEmail, setEditPrimaryGuestEmail] = useState('');
  const [editPrimaryGuestPhone, setEditPrimaryGuestPhone] = useState('');
  const [editPrimaryGuestId, setEditPrimaryGuestId] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editGuestCountError, setEditGuestCountError] = useState(null);

  // Cancel Modal State
  const [selectedResForCancel, setSelectedResForCancel] = useState(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Feedback State (Submit)
  const [feedbackType, setFeedbackType] = useState('FEEDBACK');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [rating, setRating] = useState(5);

  // Feedback State (Edit Modal)
  const [isEditFeedbackModalOpen, setIsEditFeedbackModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editFbType, setEditFbType] = useState('FEEDBACK');
  const [editFbSubject, setEditFbSubject] = useState('');
  const [editFbMessage, setEditFbMessage] = useState('');
  const [editFbRating, setEditFbRating] = useState(5);
  const [submittingFbEdit, setSubmittingFbEdit] = useState(false);
  const [editFbError, setEditFbError] = useState(null);

  const loadData = async () => {
    try {
      const [profRes, resRes, notifRes, pkgRes, fbRes, guestRes, annRes] = await Promise.all([
        api.get('/customer/profile').catch(() => ({ data: null })),
        api.get('/customer/reservations').catch(() => ({ data: [] })),
        api.get('/customer/notifications').catch(() => ({ data: [] })),
        api.get('/public/packages').catch(() => ({ data: [] })),
        api.get('/customer/feedback').catch(() => ({ data: [] })),
        api.get('/customer/guests').catch(() => ({ data: [] })),
        api.get('/customer/announcements').catch(() => api.get('/public/announcements?audience=CUSTOMERS')).catch(() => ({ data: [] }))
      ]);

      if (profRes.data) {
        setProfile(profRes.data);
        setPhone(profRes.data.user?.phone || '');
        setAddress(profRes.data.address || '');
        setPassportOrNic(profRes.data.passportOrNic || '');
        setEmergencyContact(profRes.data.emergencyContact || '');
        setPreferences(profRes.data.specialPreferences || '');
      }

      const resList = Array.isArray(resRes.data) ? resRes.data : [];
      setReservations(resList);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
      setAnnouncements(Array.isArray(annRes?.data) ? annRes.data : []);
      setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
      setCustomerFeedbacks(Array.isArray(fbRes.data) ? fbRes.data : []);
      setSavedGuests(Array.isArray(guestRes.data) ? guestRes.data : []);
    } catch (err) {
      console.error('Customer data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canModifyOrCancel = (res) => {
    if (!res || !res.startDate) return false;
    if (res.status === 'CANCELLED' || res.status === 'REJECTED' || res.status === 'CANCEL_REQUESTED') return false;
    return true;
  };

  // Dynamic estimate calculation for reschedule modal
  const calculateEstimatedTotal = () => {
    if (!selectedResForEdit) return 0;
    let nights = 1;
    if (editStartDate && editEndDate) {
      const start = new Date(editStartDate);
      const end = new Date(editEndDate);
      const calculatedNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      nights = calculatedNights > 0 ? calculatedNights : 1;
    }

    const roomRate = parseFloat(selectedResForEdit.venueRoom?.pricePerNight || 0);
    let pkgCost = 0;
    if (editPackageId) {
      const selectedPkg = packages.find(p => p.id === parseInt(editPackageId, 10));
      if (selectedPkg) pkgCost = parseFloat(selectedPkg.price || 0);
    }
    return (nights * roomRate) + pkgCost;
  };

  const handleOpenEditModal = (res) => {
    setSelectedResForEdit(res);
    setEditError(null);
    setEditStartDate(res.startDate || '');
    setEditEndDate(res.endDate || '');
    setEditGuestCount(res.guestCount || 1);
    setEditSpecialNotes(res.specialNotes || '');
    setEditPackageId(res.eventPackage ? res.eventPackage.id : '');
    setEditPrimaryGuestName(res.primaryGuestName || res.customer?.user?.fullName || user?.fullName || '');
    setEditPrimaryGuestPhone(res.primaryGuestPhone || res.customer?.user?.phone || user?.phone || '');
    setEditPrimaryGuestEmail(res.primaryGuestEmail || res.customer?.user?.email || user?.email || '');
    setEditPrimaryGuestId(res.primaryGuestId || res.customer?.passportOrNic || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedResForEdit) return;
    setEditError(null);

    if (!editStartDate || !editEndDate) {
      setEditError('Both start date and end date are required.');
      return;
    }
    if (new Date(editEndDate) <= new Date(editStartDate)) {
      setEditError('Check-out date must be after check-in date.');
      return;
    }

    const parsedEditGuestCount = parseInt(editGuestCount, 10);
    if (isNaN(parsedEditGuestCount) || parsedEditGuestCount < 2) {
      setEditGuestCountError('Guest count must be greater than 1 person.');
      return;
    }

    setSubmittingEdit(true);
    try {
      const payload = {
        venueRoomId: selectedResForEdit.venueRoom?.id,
        startDate: editStartDate,
        endDate: editEndDate,
        guestCount: parsedEditGuestCount,
        specialNotes: editSpecialNotes,
        eventPackageId: editPackageId ? parseInt(editPackageId, 10) : null,
        primaryGuestName: editPrimaryGuestName,
        primaryGuestEmail: editPrimaryGuestEmail,
        primaryGuestPhone: editPrimaryGuestPhone,
        primaryGuestId: editPrimaryGuestId
      };

      await api.put(`/customer/reservations/${selectedResForEdit.id}`, payload);
      setAlert({ type: 'success', message: `Reservation #${selectedResForEdit.id} successfully updated!` });
      setSelectedResForEdit(null);
      setEditError(null);
      setEditGuestCountError(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update reservation.';
      if (msg.toLowerCase().includes('guest count')) {
        setEditGuestCountError(msg);
      } else {
        setEditError(msg);
      }
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedResForCancel) return;
    setSubmittingCancel(true);
    setCancelError(null);
    try {
      await api.patch(`/customer/reservations/${selectedResForCancel.id}/cancel`);
      setAlert({
        type: 'info',
        message: `Cancellation request for Booking #${selectedResForCancel.id} submitted for supervisor approval.`
      });
      setSelectedResForCancel(null);
      setCancelError(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit cancellation request.';
      setCancelError(msg);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(?:0\d{9}|\+94\d{9}|\+\d{10,14})$/;
    if (!phoneRegex.test(cleanPhone)) {
      setAlert({ type: 'error', message: 'Please enter a valid phone number: 10 digits for local numbers (e.g. 0771234567) or international format (e.g. +94771234567).' });
      return;
    }

    const cleanId = passportOrNic.trim().toUpperCase();
    const oldNicRegex = /^[0-9]{9}[VX]$/;
    const newNicRegex = /^[0-9]{12}$/;
    const passportRegex = /^[A-Z]{1,2}[0-9]{7,8}$|^[A-Z0-9]{6,12}$/;
    if (!oldNicRegex.test(cleanId) && !newNicRegex.test(cleanId) && !passportRegex.test(cleanId)) {
      setAlert({ type: 'error', message: 'Invalid ID format. Must be a valid Sri Lankan NIC (10 characters: 9 digits + V/X, or 12 digits: e.g. 199812345678) or Passport Number (e.g. N1234567).' });
      return;
    }

    try {
      const payload = {
        user: { phone: cleanPhone },
        address,
        passportOrNic: cleanId,
        emergencyContact,
        specialPreferences: preferences
      };
      await api.put('/customer/profile', payload);
      setAlert({ type: 'success', message: 'Your guest profile and preferences have been updated.' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update profile.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDeleteAccountError('Please type "DELETE" to confirm.');
      return;
    }
    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    try {
      const url = isPermanentDelete 
        ? `/customer/account?permanent=true` 
        : `/customer/account`;
      await api.delete(url);
      setIsDeleteAccountModalOpen(false);
      logout();
      navigate('/login', { 
        state: { 
          message: isPermanentDelete 
            ? 'Your customer account and profile have been permanently deleted.' 
            : 'Your customer account has been deactivated successfully.' 
        } 
      });
    } catch (err) {
      console.error('Delete account error:', err);
      setDeleteAccountError(err.response?.data?.message || err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleOpenAddGuest = () => {
    setEditingGuestId(null);
    setGuestFullName('');
    setGuestEmail('');
    setGuestPhone('');
    setGuestIdentification('');
    setGuestRelationship('SPOUSE');
    setGuestDietaryPreferences('');
    setGuestAgeGroup('ADULT');
    setGuestModalError(null);
    setIsGuestModalOpen(true);
  };

  const handleOpenEditGuest = (g) => {
    setEditingGuestId(g.id);
    setGuestFullName(g.fullName || '');
    setGuestEmail(g.email || '');
    setGuestPhone(g.phone || '');
    setGuestIdentification(g.nicOrPassport || g.identificationNumber || '');
    setGuestRelationship(g.relationship || 'OTHER');
    setGuestDietaryPreferences(g.specialNeeds || g.dietaryPreferences || '');
    setGuestAgeGroup(g.ageGroup || 'ADULT');
    setGuestModalError(null);
    setIsGuestModalOpen(true);
  };

  const handleSaveSavedGuest = async (e) => {
    e.preventDefault();
    setGuestModalError(null);

    if (!guestFullName.trim()) {
      setGuestModalError('Full Name is required.');
      return;
    }

    const cleanPhone = guestPhone.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      setGuestModalError('Phone number is required.');
      return;
    }

    // Phone format limitation: 10 digits for local (07XXXXXXXX / 0XXXXXXXXX) or international with + (10-15 digits)
    const phoneRegex = /^(?:0\d{9}|\+94\d{9}|\+\d{10,14})$/;
    if (!phoneRegex.test(cleanPhone)) {
      setGuestModalError('Invalid phone number. Must be exactly 10 digits for local numbers (e.g. 0771234567) or 10–15 digits with country code (e.g. +94771234567).');
      return;
    }

    // ID / Identification format limitation (NIC / Passport)
    const cleanId = guestIdentification.trim().toUpperCase();
    if (cleanId) {
      // Old Sri Lankan NIC: exactly 9 digits followed by 'V' or 'X' (10 characters)
      const oldNicRegex = /^[0-9]{9}[VX]$/;
      // New Sri Lankan NIC: exactly 12 numeric digits
      const newNicRegex = /^[0-9]{12}$/;
      // Passport: 1-2 letters followed by 7-8 digits or standard 6-12 alphanumeric characters
      const passportRegex = /^[A-Z]{1,2}[0-9]{7,8}$|^[A-Z0-9]{6,12}$/;

      if (!oldNicRegex.test(cleanId) && !newNicRegex.test(cleanId) && !passportRegex.test(cleanId)) {
        setGuestModalError('Invalid ID format. Must be a valid Sri Lankan NIC (10 characters: 9 digits + V/X, or 12 digits: e.g. 199812345678) or Passport Number (6–12 characters, e.g. N1234567).');
        return;
      }
    }

    setSubmittingGuest(true);
    try {
      const payload = {
        fullName: guestFullName.trim(),
        email: guestEmail.trim(),
        phone: cleanPhone,
        nicOrPassport: cleanId,
        identificationNumber: cleanId,
        relationship: guestRelationship,
        specialNeeds: guestDietaryPreferences.trim(),
        dietaryPreferences: guestDietaryPreferences.trim(),
        ageGroup: guestAgeGroup
      };

      if (editingGuestId) {
        await api.put(`/customer/guests/${editingGuestId}`, payload);
        setAlert({ type: 'success', message: 'Companion guest profile updated.' });
      } else {
        await api.post('/customer/guests', payload);
        setAlert({ type: 'success', message: 'Companion guest added to directory.' });
      }
      setIsGuestModalOpen(false);
      setGuestModalError(null);
      loadData();
    } catch (err) {
      const errorMsg = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        (typeof err.response?.data === 'string' ? err.response?.data : null) || 
        err.message || 
        'Failed to save companion guest.';
      // Show error strictly inside this modal, not anywhere else
      setGuestModalError(errorMsg);
    } finally {
      setSubmittingGuest(false);
    }
  };

  const handleDeleteSavedGuest = async (id) => {
    if (!window.confirm('Remove this companion guest from your directory?')) return;
    try {
      await api.delete(`/customer/guests/${id}`);
      setAlert({ type: 'success', message: 'Companion guest deleted.' });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete guest.' });
    }
  };

  const handleViewInvoice = async (reservationId) => {
    setLoadingInvoice(true);
    setInvoiceModalOpen(true);
    setCurrentInvoice(null);
    try {
      let res;
      try {
        res = await api.get(`/customer/invoices/reservation/${reservationId}`);
      } catch (getErr) {
        res = await api.post(`/customer/invoices/generate/${reservationId}`);
      }
      if (res && res.data) {
        setCurrentInvoice(res.data);
      }
    } catch (err) {
      setAlert({ type: 'warning', message: 'Invoice could not be retrieved. Ensure booking is confirmed.' });
      setInvoiceModalOpen(false);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleOpenPayModal = (res) => {
    setSelectedResForPay(res);
    setPayError(null);
    setCardErrors({});
    setPaymentMethod('CREDIT_CARD');
    setSimulateFail(false);
    setCardHolder(res.primaryGuestName || user?.fullName || '');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedResForPay) return;
    setPayError(null);
    setCardErrors({});

    // Client-side validations for card payment methods
    if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'AMEX') {
      const errors = {};
      const cleanCard = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
      const cleanExpiry = cardExpiry.trim();
      const cleanCvv = cardCvv.trim();

      if (!cardHolder.trim()) {
        errors.cardHolder = 'Cardholder name is required.';
      }

      if (!/^\d{15,16}$/.test(cleanCard)) {
        errors.cardNumber = 'Please enter a valid 15 or 16-digit card number.';
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cleanExpiry)) {
        errors.cardExpiry = 'Expiry must be MM/YY (e.g. 12/28).';
      } else {
        const [expMonth, expYear] = cleanExpiry.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          errors.cardExpiry = 'Card has expired. Please use a valid card.';
        }
      }

      if (!/^\d{3,4}$/.test(cleanCvv)) {
        errors.cardCvv = 'CVV must be 3 or 4 digits.';
      }

      if (Object.keys(errors).length > 0) {
        setCardErrors(errors);
        setPayError('Please resolve the payment validation issues highlighted below.');
        return;
      }
    }

    setProcessingPay(true);
    try {
      const payload = {
        reservationId: selectedResForPay.id,
        amount: selectedResForPay.totalAmount,
        paymentMethod,
        cardNumber: cardNumber.replace(/\s+/g, ''),
        expiryDate: cardExpiry.trim(),
        cvv: cardCvv.trim(),
        simulateFailure: simulateFail
      };

      await api.post('/customer/payments/process', payload);
      setAlert({ type: 'success', message: `Payment for Reservation #${selectedResForPay.id} processed successfully! Status: CONFIRMED.` });
      setSelectedResForPay(null);
      setPayError(null);
      setCardErrors({});
      loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Payment processing failed. Please verify your details.';
      // Display the validation/gateway error in the same place with red notice!
      setPayError(errorMsg);
    } finally {
      setProcessingPay(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customer/feedback', {
        type: feedbackType,
        subject: feedbackSubject,
        message: feedbackMessage,
        rating: parseInt(rating, 10)
      });
      setAlert({ type: 'success', message: 'Thank you! Your feedback has been forwarded to Grand Luxe management.' });
      setFeedbackSubject('');
      setFeedbackMessage('');
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to submit feedback.' });
    }
  };

  const handleDeleteCustomerFeedback = async (id) => {
    if (!window.confirm(`Delete feedback #${id}?`)) return;
    try {
      await api.delete(`/customer/feedback/${id}`);
      setAlert({ type: 'success', message: `Feedback record deleted.` });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete feedback.' });
    }
  };

  const handleOpenEditFeedback = (fb) => {
    setEditingFeedback(fb);
    setEditFbType(fb.type || 'FEEDBACK');
    setEditFbSubject(fb.subject || '');
    setEditFbMessage(fb.message || '');
    setEditFbRating(fb.rating || 5);
    setEditFbError(null);
    setIsEditFeedbackModalOpen(true);
  };

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    if (!editingFeedback) return;
    setEditFbError(null);

    if (!editFbSubject.trim()) {
      setEditFbError('Subject cannot be blank.');
      return;
    }
    if (!editFbMessage.trim()) {
      setEditFbError('Message details cannot be blank.');
      return;
    }

    setSubmittingFbEdit(true);
    try {
      await api.put(`/customer/feedback/${editingFeedback.id}`, {
        type: editFbType,
        subject: editFbSubject.trim(),
        message: editFbMessage.trim(),
        rating: parseInt(editFbRating, 10)
      });
      setAlert({ type: 'success', message: `Inquiry #${editingFeedback.id} successfully updated.` });
      setIsEditFeedbackModalOpen(false);
      setEditingFeedback(null);
      setEditFbError(null);
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update feedback record.';
      setEditFbError(errMsg);
    } finally {
      setSubmittingFbEdit(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': 
        return <span className="badge badge-pending">PENDING SUPERVISOR</span>;
      case 'APPROVED': 
        return <span className="badge badge-approved">APPROVED (PAYMENT REQUIRED)</span>;
      case 'CONFIRMED': 
        return <span className="badge badge-confirmed">CONFIRMED & PAID</span>;
      case 'CANCEL_REQUESTED': 
        return <span className="badge" style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>CANCELLATION PENDING SUPERVISOR</span>;
      case 'REJECTED': 
        return <span className="badge badge-rejected">REJECTED</span>;
      case 'CANCELLED': 
        return <span className="badge badge-cancelled">CANCELLED</span>;
      default: 
        return <span className="badge">{status}</span>;
    }
  };

  // Filtered reservations
  const filteredReservations = reservations.filter(r => {
    if (bookingFilter === 'ALL') return true;
    if (bookingFilter === 'PENDING') return r.status === 'PENDING';
    if (bookingFilter === 'APPROVED') return r.status === 'APPROVED';
    if (bookingFilter === 'CONFIRMED') return r.status === 'CONFIRMED';
    if (bookingFilter === 'CANCELLED') return r.status === 'CANCELLED' || r.status === 'CANCEL_REQUESTED';
    return true;
  });

  const pendingCount = reservations.filter(r => r.status === 'PENDING').length;
  const confirmedCount = reservations.filter(r => r.status === 'CONFIRMED').length;
  const approvedCount = reservations.filter(r => r.status === 'APPROVED').length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gold-primary)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>
          Loading Your Guest Portal...
        </h2>
      </div>
    );
  }

  return (
    <div className="rosewood-page" style={{ minHeight: '85vh', padding: '3.5rem 1.5rem 7rem 1.5rem' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
      
      {/* 1. Executive Guest Welcome Banner */}
      <div className="rosewood-card" style={{
        padding: '2.5rem',
        marginBottom: '2.5rem',
        background: '#FFFFFF',
        border: '1px solid #E8E2D8',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#0B3B2C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1.6rem',
              boxShadow: '0 4px 16px rgba(11, 59, 44, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.4)'
            }}>
              {(user?.fullName || user?.username || 'G').charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                <h1 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '2.1rem',
                  color: '#141414',
                  fontWeight: 500,
                  margin: 0
                }}>
                  Welcome back, {user?.fullName || user?.username}
                </h1>
                <span className="badge badge-gold">
                  VIP Gold Resident
                </span>
              </div>
              <p style={{ color: '#555555', fontSize: '0.92rem' }}>
                Grand Luxe Guest Portal • Priority Concierge Access • <span style={{ color: '#0B3B2C', fontWeight: 700 }}>{profile?.loyaltyPoints || 150} Loyalty Points</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/search-book" className="rosewood-btn-green" style={{ padding: '0.65rem 1.25rem', fontSize: '0.74rem' }}>
              <Plus size={14} /> Book New Space
            </Link>
            <button onClick={() => setActiveTab('feedback')} className="rosewood-btn-outline" style={{ padding: '0.65rem 1.15rem', fontSize: '0.74rem' }}>
              <MessageSquare size={14} /> Concierge Inquiries
            </button>
          </div>
        </div>
      </div>

      <ToastAlert 
        type={alert?.type} 
        message={alert?.message} 
        onClose={() => setAlert(null)} 
      />

      {/* 2. KPI Summary Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F5F2EB', color: '#0B3B2C', border: '1px solid #E2DCD2' }}>
            <Calendar size={22} color="#0B3B2C" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Total Reservations
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#141414' }}>
              {reservations.length}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F5E9', color: '#0B3B2C', border: '1px solid #A5D6A7' }}>
            <CheckCircle2 size={22} color="#0B3B2C" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Confirmed & Paid Stays
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0B3B2C' }}>
              {confirmedCount}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}>
            <CreditCard size={22} color="#0369A1" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Awaiting Payment
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0369A1' }}>
              {approvedCount}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
            <Clock size={22} color="#92400E" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Pending Supervisor Review
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400E' }}>
              {pendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Luxury Tab Navigation Bar */}
      <div className="tabs-container">
        {[
          { id: 'bookings', label: 'My Reservations', icon: <Calendar size={17} /> },
          { id: 'guests', label: 'Companion Guest Directory', icon: <Users size={17} /> },
          { id: 'profile', label: 'Guest Profile & Preferences', icon: <User size={17} /> },
          { id: 'feedback', label: 'Concierge & Feedback', icon: <MessageSquare size={17} /> },
          { id: 'announcements', label: `Announcements (${announcements.length})`, icon: <Megaphone size={17} /> },
          { id: 'notifications', label: `Notifications (${notifications.length})`, icon: <Bell size={17} /> }
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

      {/* 4. Tab Contents */}

      {/* TAB 1: RESERVATIONS */}
      {activeTab === 'bookings' && (
        <div className="animate-fade-in">
          {/* Sub-filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All Stays (${reservations.length})` },
              { id: 'CONFIRMED', label: `Confirmed (${confirmedCount})` },
              { id: 'APPROVED', label: `Approved / Pay (${approvedCount})` },
              { id: 'PENDING', label: `Pending Review (${pendingCount})` },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setBookingFilter(f.id)}
                className={bookingFilter === f.id ? 'rosewood-btn-green' : 'rosewood-btn-outline'}
                style={{ padding: '0.45rem 1rem', fontSize: '0.74rem' }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredReservations.length === 0 ? (
            <div className="rosewood-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
              <Calendar size={48} color="#0B3B2C" style={{ opacity: 0.4, marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: '#141414', marginBottom: '0.5rem', fontWeight: 500 }}>
                No Reservations Found
              </h3>
              <p style={{ color: '#666666', marginBottom: '1.75rem', maxWidth: '500px', margin: '0 auto 1.75rem auto', fontSize: '0.94rem' }}>
                You currently have no reservation records under this filter. Explore our luxury suites, ballrooms, and packages to book your next stay.
              </p>
              <Link to="/search-book" className="rosewood-btn-green">
                Explore & Reserve Space
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredReservations.map((res) => (
                <div key={res.id} className="rosewood-card" style={{ padding: '2rem', background: '#FFFFFF', border: '1px solid #E8E2D8', borderRadius: '2px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)' }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                    borderBottom: '1px solid #ECE7DF',
                    paddingBottom: '1.25rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0B3B2C', letterSpacing: '0.02em' }}>
                          Booking #{res.id}
                        </span>
                        {getStatusBadge(res.status)}
                      </div>
                      <h2 style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '1.65rem',
                        color: '#141414',
                        fontWeight: 500,
                        margin: 0
                      }}>
                        {res.venueRoom?.name || 'Exclusive Luxury Space'}
                      </h2>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: '#7E7A73', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                        Total Amount
                      </span>
                      <div style={{
                        fontSize: '1.65rem',
                        fontWeight: 700,
                        color: '#0B3B2C',
                        fontFamily: "'Cormorant Garamond', serif"
                      }}>
                        LKR {parseFloat(res.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <div style={{ color: '#7E7A73', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem' }}>
                        DATES & DURATION
                      </div>
                      <div style={{ color: '#141414', fontWeight: 600, fontSize: '0.94rem' }}>
                        {res.startDate} to {res.endDate}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#7E7A73', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem' }}>
                        GUESTS
                      </div>
                      <div style={{ color: '#141414', fontWeight: 600, fontSize: '0.94rem' }}>
                        {res.guestCount} Guests
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#7E7A73', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem' }}>
                        ATTACHED PACKAGE
                      </div>
                      <div style={{ color: res.eventPackage ? '#0B3B2C' : '#666666', fontWeight: 600, fontSize: '0.94rem' }}>
                        {res.eventPackage ? res.eventPackage.name : 'None (Room/Venue Only)'}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#7E7A73', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.25rem' }}>
                        PRIMARY GUEST
                      </div>
                      <div style={{ color: '#141414', fontWeight: 600, fontSize: '0.94rem' }}>
                        {res.primaryGuestName || user?.fullName || 'Registered Guest'}
                      </div>
                    </div>
                  </div>

                  {res.specialNotes && (
                    <div style={{
                      padding: '0.85rem 1.1rem',
                      background: '#FAF9F5',
                      border: '1px solid #E8E2D8',
                      borderRadius: '2px',
                      fontSize: '0.88rem',
                      color: '#444444',
                      marginBottom: '1.5rem',
                      lineHeight: 1.5
                    }}>
                      <strong style={{ color: '#0B3B2C', fontWeight: 700, marginRight: '0.35rem' }}>
                        Special Requests:
                      </strong>
                      {res.specialNotes}
                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid #ECE7DF',
                    paddingTop: '1.25rem'
                  }}>
                    {/* Pay Online Action for Approved Bookings */}
                    {res.status === 'APPROVED' && (
                      <button 
                        onClick={() => handleOpenPayModal(res)}
                        className="rosewood-btn-green"
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.74rem' }}
                      >
                        <CreditCard size={14} /> Pay Online Now
                      </button>
                    )}

                    {/* View Invoice Action for Confirmed Bookings */}
                    {(res.status === 'CONFIRMED' || res.status === 'APPROVED') && (
                      <button 
                        onClick={() => handleViewInvoice(res.id)}
                        className="rosewood-btn-outline"
                        style={{ padding: '0.6rem 1.15rem', fontSize: '0.74rem' }}
                      >
                        <FileText size={14} /> View Invoice
                      </button>
                    )}

                    {/* Reschedule / Edit Dates */}
                    {canModifyOrCancel(res) && (
                      <button 
                        onClick={() => handleOpenEditModal(res)}
                        className="rosewood-btn-outline"
                        style={{ padding: '0.6rem 1.15rem', fontSize: '0.74rem' }}
                      >
                        <Edit3 size={14} /> Reschedule / Modify
                      </button>
                    )}

                    {/* Cancel Action */}
                    {canModifyOrCancel(res) && (
                      <button 
                        onClick={() => setSelectedResForCancel(res)}
                        className="rosewood-btn-outline"
                        style={{ padding: '0.6rem 1.15rem', fontSize: '0.74rem', borderColor: '#E2DCD2', color: '#B91C1C' }}
                      >
                        <XCircle size={14} /> Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPANION GUEST DIRECTORY */}
      {activeTab === 'guests' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#141414', fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontWeight: 500, marginBottom: '0.25rem' }}>
                Companion Guest & Family Directory
              </h2>
              <p style={{ color: '#555555', fontSize: '0.92rem' }}>
                Manage saved companion profiles, dietary preferences, and identification to easily attach them to active reservations.
              </p>
            </div>

            <button onClick={handleOpenAddGuest} className="btn btn-sm" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
              <Plus size={15} /> Add Companion Guest
            </button>
          </div>

          {savedGuests.length === 0 ? (
            <div className="rosewood-card" style={{ padding: '3rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
              <Users size={44} color="#0B3B2C" style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '0.5rem' }}>No Companion Guests Saved</h3>
              <p style={{ color: '#555555', marginBottom: '1.5rem', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
                Add your spouse, children, family members, or executive travel companions for rapid check-in and custom catering.
              </p>
              <button onClick={handleOpenAddGuest} className="btn btn-sm" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
                Add First Companion
              </button>
            </div>
          ) : (
            <div className="table-responsive rosewood-card" style={{ background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Companion Name</th>
                    <th>Relationship</th>
                    <th>Age Group</th>
                    <th>Contact Phone</th>
                    <th>Dietary & Preferences</th>
                    <th>ID / Passport</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedGuests.map((g) => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 600, color: '#141414' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0ECE1', color: '#0B3B2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                            {g.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: '#141414' }}>{g.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#666666' }}>{g.email || 'No email provided'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                          {g.relationship || 'COMPANION'}
                        </span>
                      </td>
                      <td style={{ color: '#333333' }}>{g.ageGroup || 'ADULT'}</td>
                      <td style={{ color: '#333333' }}>{g.phone || 'N/A'}</td>
                      <td>
                        {g.specialNeeds || g.dietaryPreferences ? (
                          <span style={{ color: '#0B3B2C', fontWeight: 600, fontSize: '0.82rem' }}>
                            {g.specialNeeds || g.dietaryPreferences}
                          </span>
                        ) : (
                          <span style={{ color: '#666666', fontSize: '0.82rem' }}>Standard</span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#333333' }}>
                        {g.nicOrPassport || g.identificationNumber || 'On file'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenEditGuest(g)} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem', borderColor: '#E8E2D8', color: '#141414' }}>
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDeleteSavedGuest(g.id)} className="btn btn-danger btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                            <Trash2 size={14} />
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
      )}

      {/* TAB 3: CUSTOMER PROFILE */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="rosewood-card" style={{ padding: '2.5rem', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, marginBottom: '0.5rem' }}>
              Customer Profile & Concierge Preferences
            </h2>
            <p style={{ color: '#555555', fontSize: '0.92rem', marginBottom: '2rem' }}>
              Maintain your official personal records, passport details, and special stay preferences for white-glove hospitality.
            </p>

            <form onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Full Name (Read-Only)</label>
                  <input type="text" className="form-input" value={user?.fullName || ''} disabled style={{ opacity: 0.7, background: '#F8F7F4' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Email Address (Read-Only)</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.7, background: '#F8F7F4' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Direct Contact Phone *</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="e.g. 077 123 4567 or +94 77 123 4567"
                    maxLength={16}
                    value={phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d+\s-]/g, '');
                      if (val.length <= 16) setPhone(val);
                    }} 
                    required 
                  />
                  <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                    10 digits (e.g. 0771234567) or int'l format (+94...)
                  </small>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Passport No. / National ID (NIC) *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 981234567V / 199812345678 / N1234567"
                    maxLength={12}
                    value={passportOrNic} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                      if (val.length <= 12) setPassportOrNic(val);
                    }} 
                    required 
                  />
                  <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                    NIC (10 chars / 12 digits) or Passport
                  </small>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Residential / Billing Address</label>
                <input type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Emergency Contact Name & Phone</label>
                <input type="text" className="form-input" placeholder="e.g. Eleanor Sinclair (+94 77 123 4567)" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Special Hospitality & Dining Preferences</label>
                <textarea rows={3} className="form-textarea" placeholder="e.g. High floor preferred, extra pillows, vegetarian banquet catering, non-alcoholic cocktail options..." value={preferences} onChange={(e) => setPreferences(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  id="delete-customer-account-btn"
                  onClick={() => {
                    setDeleteConfirmationText('');
                    setIsPermanentDelete(false);
                    setDeleteAccountError(null);
                    setIsDeleteAccountModalOpen(true);
                  }}
                  className="btn"
                  style={{
                    background: '#FFF5F5',
                    color: '#B91C1C',
                    border: '1px solid #FCA5A5',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#DC2626';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#DC2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFF5F5';
                    e.currentTarget.style.color = '#B91C1C';
                    e.currentTarget.style.borderColor = '#FCA5A5';
                  }}
                >
                  <Trash2 size={16} /> Delete Customer Profile
                </button>

                <button type="submit" className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: CONCIERGE FEEDBACK & INQUIRIES */}
      {activeTab === 'feedback' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          {/* Submit Feedback Form */}
          <div className="rosewood-card" style={{ padding: '2.5rem', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, marginBottom: '0.5rem' }}>
              Submit Review or Inquiry
            </h2>
            <p style={{ color: '#555555', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Your feedback is audited by General Management to uphold 5-star service excellence.
            </p>

            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Inquiry Category</label>
                <select className="form-select" value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)}>
                  <option value="FEEDBACK">Commendation / Service Review</option>
                  <option value="COMPLAINT">Service Complaint / Issue</option>
                  <option value="INQUIRY">Special Event Coordination Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Experience Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Star 
                        size={24} 
                        fill={star <= rating ? '#B45309' : 'transparent'} 
                        color="#B45309" 
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.9rem', color: '#0B3B2C', marginLeft: '0.5rem', fontWeight: 700 }}>
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Flawless banquet service at our wedding reception" 
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Message Details</label>
                <textarea 
                  rows={4} 
                  className="form-textarea" 
                  placeholder="Describe your dining, room stay, or event coordination experience..." 
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn" style={{ width: '100%', background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
                Transmit to Management
              </button>
            </form>
          </div>

          {/* Feedback History List */}
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, marginBottom: '1.25rem' }}>
              Submitted Inquiries & Responses
            </h2>

            {customerFeedbacks.length === 0 ? (
              <div className="rosewood-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#666666', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
                No feedback or complaints submitted yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {customerFeedbacks.map((fb) => (
                  <div key={fb.id} className="rosewood-card" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className={`badge ${fb.status === 'RESOLVED' ? 'badge-confirmed' : 'badge-pending'}`}>
                            {fb.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#0B3B2C', fontWeight: 700 }}>
                            {fb.type}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.15rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}>{fb.subject}</h4>
                      </div>

                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {[...Array(fb.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="#B45309" color="#B45309" />
                        ))}
                      </div>
                    </div>

                    <p style={{ color: '#333333', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                      "{fb.message}"
                    </p>

                    {fb.adminResponse && (
                      <div style={{ padding: '1rem', background: '#FBF9F5', borderRadius: '4px', border: '1px solid #E8E2D8', borderLeft: '3px solid #0B3B2C', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#0B3B2C', marginBottom: '0.25rem' }}>
                          Executive Response from Management:
                        </div>
                        <div style={{ color: '#141414' }}>{fb.adminResponse}</div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.65rem', marginTop: '1rem' }}>
                      <button 
                        type="button"
                        onClick={() => handleOpenEditFeedback(fb)} 
                        className="btn btn-outline btn-sm" 
                        style={{ color: '#0B3B2C', borderColor: '#0B3B2C', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                      >
                        <Edit3 size={13} /> Edit Record
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteCustomerFeedback(fb.id)} 
                        className="btn btn-outline btn-sm" 
                        style={{ color: '#DC2626', borderColor: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Trash2 size={13} /> Delete Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, marginBottom: '1.5rem' }}>
            Hotel Notices & Seasonal Announcements
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {announcements.map((a) => (
              <div key={a.id} className="rosewood-card" style={{ padding: '2rem', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Megaphone size={18} color="#0B3B2C" />
                  <span className="badge badge-gold">OFFICIAL ANNOUNCEMENT</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, marginBottom: '0.5rem' }}>{a.title}</h3>
                <p style={{ color: '#4A4A4A', fontSize: '0.92rem', lineHeight: 1.6 }}>{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, marginBottom: '1.5rem' }}>
            Your Notifications Feed
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.length === 0 ? (
              <div className="rosewood-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#666666', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
                No active notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="rosewood-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', background: '#FFFFFF', border: '1px solid #E8E2D8' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0ECE1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={20} color="#0B3B2C" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#141414', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, marginBottom: '0.25rem' }}>{n.title}</h4>
                    <p style={{ color: '#4A4A4A', fontSize: '0.88rem', lineHeight: 1.5 }}>{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT COMPANION GUEST */}
      <Modal 
        isOpen={isGuestModalOpen} 
        onClose={() => {
          setIsGuestModalOpen(false);
          setGuestModalError(null);
        }} 
        title={editingGuestId ? 'Edit Companion Guest' : 'Add Companion Guest to Directory'}
      >
        <form onSubmit={handleSaveSavedGuest}>
          {guestModalError && (
            <ToastAlert 
              type="error" 
              message={guestModalError} 
              onClose={() => setGuestModalError(null)} 
            />
          )}

          <div className="form-group">
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Full Name *</label>
            <input 
              type="text" 
              className="form-input" 
              value={guestFullName} 
              onChange={(e) => {
                setGuestFullName(e.target.value);
                if (guestModalError) setGuestModalError(null);
              }} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Relationship *</label>
              <select 
                className="form-select" 
                value={guestRelationship} 
                onChange={(e) => {
                  setGuestRelationship(e.target.value);
                  if (guestModalError) setGuestModalError(null);
                }}
              >
                <option value="SPOUSE">Spouse / Partner</option>
                <option value="CHILD">Child / Dependent</option>
                <option value="PARENT">Parent</option>
                <option value="FRIEND">Friend</option>
                <option value="COLLEAGUE">Executive Colleague</option>
                <option value="OTHER">Other Companion</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Age Group</label>
              <select 
                className="form-select" 
                value={guestAgeGroup} 
                onChange={(e) => {
                  setGuestAgeGroup(e.target.value);
                  if (guestModalError) setGuestModalError(null);
                }}
              >
                <option value="ADULT">Adult</option>
                <option value="CHILD">Child</option>
                <option value="INFANT">Infant</option>
                <option value="SENIOR">Senior</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={guestEmail} 
                onChange={(e) => {
                  setGuestEmail(e.target.value);
                  if (guestModalError) setGuestModalError(null);
                }} 
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Phone *</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. 077 123 4567 or +94 77 123 4567"
                maxLength={16}
                value={guestPhone} 
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d+\s-]/g, '');
                  if (val.length <= 16) setGuestPhone(val);
                  if (guestModalError) setGuestModalError(null);
                }} 
                required
              />
              <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
                10 digits (e.g. 0771234567) or int'l format (+94...)
              </small>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Passport No. / Identification</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 981234567V / 199812345678 / N1234567"
              maxLength={12}
              value={guestIdentification} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                if (val.length <= 12) setGuestIdentification(val);
                if (guestModalError) setGuestModalError(null);
              }} 
            />
            <small style={{ color: '#7E7A73', fontSize: '0.74rem', marginTop: '0.25rem', display: 'block' }}>
              NIC: 10 chars (9 digits + V/X) or 12 digits, or Passport (6–12 alphanumeric chars)
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Dietary & Accessibility Needs</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Gluten-free, wheelchair accessibility..." 
              value={guestDietaryPreferences} 
              onChange={(e) => {
                setGuestDietaryPreferences(e.target.value);
                if (guestModalError) setGuestModalError(null);
              }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => {
                setIsGuestModalOpen(false);
                setGuestModalError(null);
              }} 
              className="btn btn-outline" 
              style={{ borderColor: '#E8E2D8', color: '#141414' }}
            >
              Cancel
            </button>
            <button type="submit" disabled={submittingGuest} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
              {submittingGuest ? 'Saving...' : 'Save Companion'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: LUXURY PRINTABLE INVOICE */}
      <Modal 
        isOpen={invoiceModalOpen} 
        onClose={() => setInvoiceModalOpen(false)} 
        title="Grand Luxe Official Statement of Account"
        maxWidth="750px"
      >
        {loadingInvoice ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#0B3B2C' }}>Loading invoice details...</div>
        ) : currentInvoice ? (
          <div>
            <div style={{ background: '#FFFFFF', color: '#141414', padding: '2.5rem', borderRadius: '4px', border: '1px solid #E8E2D8', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)' }}>
              {/* Hotel Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0B3B2C', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#141414', fontWeight: 700 }}>GRAND LUXE HOTEL</h2>
                  <div style={{ fontSize: '0.8rem', color: '#555555' }}>100 Grand Esplanade, Galle Face, Colombo 03, Sri Lanka</div>
                  <div style={{ fontSize: '0.8rem', color: '#555555' }}>concierge@grandluxehotel.com | +94 11 244-8800</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B3B2C' }}>INVOICE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414' }}>Invoice #{currentInvoice.invoiceNumber || currentInvoice.id}</div>
                  <div style={{ fontSize: '0.8rem', color: '#555555' }}>Status: {currentInvoice.status || 'PAID'}</div>
                </div>
              </div>

              {/* Guest & Reservation Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: '#141414' }}>Billed To:</strong>
                  <div style={{ color: '#141414', fontWeight: 600 }}>{user?.fullName || user?.username}</div>
                  <div style={{ color: '#555555' }}>{user?.email}</div>
                  <div style={{ color: '#555555' }}>{profile?.passportOrNic ? `ID/Passport: ${profile.passportOrNic}` : ''}</div>
                </div>
                <div>
                  <strong style={{ color: '#141414' }}>Reservation Reference:</strong>
                  <div style={{ color: '#141414' }}>Booking ID: #{currentInvoice.reservation?.id || currentInvoice.reservationId}</div>
                  <div style={{ color: '#141414' }}>Space: {currentInvoice.reservation?.venueRoom?.name}</div>
                  <div style={{ color: '#555555' }}>Dates: {currentInvoice.reservation?.startDate} to {currentInvoice.reservation?.endDate}</div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: '1rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 700, fontSize: '1.1rem', borderTop: '2px solid #141414' }}>
                  <span style={{ color: '#141414' }}>Total Settled:</span>
                  <span style={{ color: '#0B3B2C' }}>LKR {parseFloat(currentInvoice.totalAmount || currentInvoice.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => window.print()} className="btn btn-outline" style={{ borderColor: '#E8E2D8', color: '#141414' }}>
                <Printer size={16} /> Print Official Copy
              </button>
              <button onClick={() => setInvoiceModalOpen(false)} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
                Close Invoice
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#555555' }}>No invoice found.</div>
        )}
      </Modal>

      {/* MODAL 3: PAYMENT SIMULATION */}
      {selectedResForPay && (
        <Modal 
          isOpen={Boolean(selectedResForPay)} 
          onClose={() => setSelectedResForPay(null)} 
          title={`Settle Payment for Booking #${selectedResForPay.id}`}
        >
          <form onSubmit={handleProcessPayment}>
            {/* Booking Summary Box */}
            <div style={{ padding: '1.25rem 1.5rem', background: '#FBF9F5', borderRadius: '4px', marginBottom: '1.25rem', border: '1px solid #E8E2D8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#666666' }}>Space:</span>
                <strong style={{ color: '#141414' }}>{selectedResForPay.venueRoom?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#666666' }}>Stay Period:</span>
                <strong style={{ color: '#141414' }}>{selectedResForPay.startDate} to {selectedResForPay.endDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E8E2D8', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ color: '#666666' }}>Total Payable:</span>
                <strong style={{ fontSize: '1.35rem', color: '#0B3B2C', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  LKR {parseFloat(selectedResForPay.totalAmount).toFixed(2)}
                </strong>
              </div>
            </div>

            {/* IN-PLACE RED NOTICE VALIDATION ERROR BANNER */}
            {payError && (
              <div className="animate-fade-in" style={{
                padding: '0.9rem 1.15rem',
                borderRadius: '4px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.88rem'
              }}>
                <XCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#991B1B', display: 'block', fontSize: '0.88rem', marginBottom: '0.15rem' }}>
                    Payment Validation Notice
                  </strong>
                  <span>{payError}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Payment Gateway Method</label>
              <select 
                className="form-select" 
                value={paymentMethod} 
                onChange={(e) => { 
                  setPaymentMethod(e.target.value); 
                  setPayError(null); 
                  setCardErrors({}); 
                }}
              >
                <option value="CREDIT_CARD">Mastercard / Visa Credit Card</option>
                <option value="AMEX">American Express Centurion</option>
                <option value="BANK_TRANSFER">Direct Electronic Wire Transfer</option>
              </select>
            </div>

            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'AMEX') && (
              <div className="animate-fade-in">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Cardholder Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    className="form-input"
                    value={cardHolder}
                    onChange={(e) => {
                      setCardHolder(e.target.value);
                      if (cardErrors.cardHolder) setCardErrors(prev => ({ ...prev, cardHolder: null }));
                    }}
                    style={cardErrors.cardHolder ? { borderColor: '#DC2626', background: '#FEF2F2' } : {}}
                    required
                  />
                  {cardErrors.cardHolder && (
                    <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={13} /> {cardErrors.cardHolder}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Card Number (16 Digits) *</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4532 1234 5678 9012"
                    className="form-input"
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(val);
                      if (cardErrors.cardNumber) setCardErrors(prev => ({ ...prev, cardNumber: null }));
                    }}
                    style={cardErrors.cardNumber ? { borderColor: '#DC2626', background: '#FEF2F2' } : {}}
                    required
                  />
                  {cardErrors.cardNumber && (
                    <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={13} /> {cardErrors.cardNumber}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Expiry Date *</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      className="form-input"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d]/g, '');
                        if (val.length >= 3) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setCardExpiry(val);
                        if (cardErrors.cardExpiry) setCardErrors(prev => ({ ...prev, cardExpiry: null }));
                      }}
                      style={cardErrors.cardExpiry ? { borderColor: '#DC2626', background: '#FEF2F2' } : {}}
                      required
                    />
                    {cardErrors.cardExpiry && (
                      <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={13} /> {cardErrors.cardExpiry}
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>CVV / CVC *</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="123"
                      className="form-input"
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value.replace(/[^\d]/g, ''));
                        if (cardErrors.cardCvv) setCardErrors(prev => ({ ...prev, cardCvv: null }));
                      }}
                      style={cardErrors.cardCvv ? { borderColor: '#DC2626', background: '#FEF2F2' } : {}}
                      required
                    />
                    {cardErrors.cardCvv && (
                      <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={13} /> {cardErrors.cardCvv}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'BANK_TRANSFER' && (
              <div style={{ padding: '1rem', background: '#FBF9F5', border: '1px solid #E8E2D8', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#4A4A4A' }}>
                <strong style={{ color: '#0B3B2C' }}>Grand Luxe Bank Wire Details:</strong>
                <div>Bank: Commercial Bank of Ceylon PLC</div>
                <div>Account: 1000-2458-9921-001 (Grand Luxe Hospitality)</div>
                <div>Branch: Colombo Head Office</div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.75rem', padding: '0.75rem', background: '#F7F5F0', border: '1px solid #E8E2D8', borderRadius: '4px' }}>
              <input 
                type="checkbox" 
                id="simFail" 
                checked={simulateFail} 
                onChange={(e) => { setSimulateFail(e.target.checked); setPayError(null); }} 
              />
              <label htmlFor="simFail" style={{ fontSize: '0.85rem', color: '#4A4A4A', cursor: 'pointer' }}>
                Simulate Payment Decline / Insufficient Funds (Testing Failure Path)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedResForPay(null)} className="btn btn-outline" style={{ borderColor: '#E8E2D8', color: '#141414' }}>Cancel</button>
              <button type="submit" disabled={processingPay} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
                {processingPay ? 'Processing Authorization...' : `Authorize Payment LKR ${parseFloat(selectedResForPay.totalAmount).toFixed(2)}`}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: RESCHEDULE / MODIFY RESERVATION */}
      {selectedResForEdit && (
        <Modal 
          isOpen={Boolean(selectedResForEdit)} 
          onClose={() => setSelectedResForEdit(null)} 
          title={`Reschedule Dates for Booking #${selectedResForEdit.id}`}
        >
          <form onSubmit={handleSaveEdit}>
            {/* IN-PLACE RED NOTICE VALIDATION ERROR BANNER */}
            {editError && !editError.toLowerCase().includes('guest count') && (
              <div className="animate-fade-in" style={{
                padding: '0.85rem 1.15rem',
                borderRadius: '4px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.88rem'
              }}>
                <XCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                <span>{editError}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>New Check-In Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={editStartDate} 
                  onChange={(e) => { setEditStartDate(e.target.value); setEditError(null); }} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>New Check-Out Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={editEndDate} 
                  onChange={(e) => { setEditEndDate(e.target.value); setEditError(null); }} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Guest Count *</label>
              <input 
                type="number" 
                min="2" 
                className="form-input" 
                value={editGuestCount} 
                onChange={(e) => { 
                  setEditGuestCount(e.target.value); 
                  if (editGuestCountError) setEditGuestCountError(null);
                  if (editError) setEditError(null); 
                }} 
                style={{ border: editGuestCountError ? '1px solid #DC2626' : undefined }}
                required 
              />
              {editGuestCountError && (
                <div className="animate-fade-in" style={{
                  marginTop: '0.4rem',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '4px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderLeft: '4px solid #DC2626',
                  color: '#991B1B',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 500
                }}>
                  <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span>{editGuestCountError}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Event Package Attachment</label>
              <select 
                className="form-select" 
                value={editPackageId} 
                onChange={(e) => { setEditPackageId(e.target.value); setEditError(null); }}
              >
                <option value="">No Event Package (Space Only)</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (LKR {p.price})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Updated Special Requests</label>
              <textarea 
                rows={2} 
                className="form-textarea" 
                value={editSpecialNotes} 
                onChange={(e) => setEditSpecialNotes(e.target.value)} 
              />
            </div>

            <div style={{ padding: '1rem', background: '#FBF9F5', border: '1px solid #E8E2D8', borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666666' }}>Revised Estimated Total:</span>
              <strong style={{ fontSize: '1.25rem', color: '#0B3B2C', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                LKR {calculateEstimatedTotal().toFixed(2)}
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedResForEdit(null)} className="btn btn-outline" style={{ borderColor: '#E8E2D8', color: '#141414' }}>Cancel</button>
              <button type="submit" disabled={submittingEdit} className="btn" style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}>
                {submittingEdit ? 'Saving...' : 'Save Revisions'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 5: CANCEL CONFIRMATION */}
      {selectedResForCancel && (
        <Modal 
          isOpen={Boolean(selectedResForCancel)} 
          onClose={() => setSelectedResForCancel(null)} 
          title="Confirm Reservation Cancellation"
        >
          <div style={{ padding: '1rem 0' }}>
            {/* IN-PLACE RED NOTICE VALIDATION ERROR BANNER */}
            {cancelError && (
              <div className="animate-fade-in" style={{
                padding: '0.85rem 1.15rem',
                borderRadius: '4px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.88rem'
              }}>
                <XCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                <span>{cancelError}</span>
              </div>
            )}

            <p style={{ color: '#4A4A4A', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Are you sure you wish to cancel <strong style={{ color: '#141414' }}>Booking #{selectedResForCancel.id}</strong> for <strong style={{ color: '#141414' }}>{selectedResForCancel.venueRoom?.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedResForCancel(null)} className="btn btn-outline" style={{ borderColor: '#E8E2D8', color: '#141414' }}>Keep Booking</button>
              <button type="button" onClick={handleConfirmCancel} disabled={submittingCancel} className="btn btn-danger">
                {submittingCancel ? 'Submitting Cancellation...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 6: EDIT SUBMITTED INQUIRY / FEEDBACK */}
      {isEditFeedbackModalOpen && editingFeedback && (
        <Modal
          isOpen={isEditFeedbackModalOpen}
          onClose={() => {
            setIsEditFeedbackModalOpen(false);
            setEditingFeedback(null);
            setEditFbError(null);
          }}
          title={`Edit Submitted Inquiry #${editingFeedback.id}`}
        >
          <form onSubmit={handleUpdateFeedback}>
            {editFbError && (
              <ToastAlert
                type="error"
                message={editFbError}
                onClose={() => setEditFbError(null)}
              />
            )}

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Inquiry Category</label>
              <select 
                className="form-select" 
                value={editFbType} 
                onChange={(e) => {
                  setEditFbType(e.target.value);
                  if (editFbError) setEditFbError(null);
                }}
              >
                <option value="FEEDBACK">Commendation / Service Review</option>
                <option value="COMPLAINT">Service Complaint / Issue</option>
                <option value="INQUIRY">Special Event Coordination Inquiry</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Experience Rating</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => {
                      setEditFbRating(star);
                      if (editFbError) setEditFbError(null);
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                  >
                    <Star 
                      size={22} 
                      fill={star <= editFbRating ? '#B45309' : 'transparent'} 
                      color="#B45309" 
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.9rem', color: '#0B3B2C', marginLeft: '0.5rem', fontWeight: 700 }}>
                  {editFbRating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Subject *</label>
              <input 
                type="text" 
                className="form-input" 
                value={editFbSubject}
                onChange={(e) => {
                  setEditFbSubject(e.target.value);
                  if (editFbError) setEditFbError(null);
                }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>Message Details *</label>
              <textarea 
                rows={4} 
                className="form-textarea" 
                value={editFbMessage}
                onChange={(e) => {
                  setEditFbMessage(e.target.value);
                  if (editFbError) setEditFbError(null);
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditFeedbackModalOpen(false);
                  setEditingFeedback(null);
                  setEditFbError(null);
                }} 
                className="btn btn-outline" 
                style={{ borderColor: '#E8E2D8', color: '#141414' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submittingFbEdit} 
                className="btn" 
                style={{ background: '#0B3B2C', color: '#FFFFFF', border: '1px solid #0B3B2C', fontWeight: 600 }}
              >
                {submittingFbEdit ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: DELETE CUSTOMER ACCOUNT */}
      {isDeleteAccountModalOpen && (
        <Modal
          isOpen={isDeleteAccountModalOpen}
          onClose={() => {
            if (!isDeletingAccount) {
              setIsDeleteAccountModalOpen(false);
              setDeleteConfirmationText('');
              setDeleteAccountError(null);
            }
          }}
          title="Delete Customer Profile & Account"
          maxWidth="560px"
        >
          <div>
            {deleteAccountError && (
              <ToastAlert
                type="error"
                message={deleteAccountError}
                onClose={() => setDeleteAccountError(null)}
              />
            )}

            <div style={{
              background: '#FEF2F2',
              border: '1px solid #F87171',
              borderRadius: '4px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: '#991B1B', margin: '0 0 0.35rem 0', fontSize: '1rem', fontWeight: 700 }}>
                  Warning: Irreversible Account Action
                </h4>
                <p style={{ color: '#7F1D1D', margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Deleting your customer account will revoke your concierge access, invalidate your active login session, and remove your profile privileges. You will be logged out immediately.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.88rem', color: '#374151', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={isPermanentDelete}
                  onChange={(e) => setIsPermanentDelete(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#DC2626', cursor: 'pointer' }}
                />
                <span>
                  <strong>Permanently purge all records</strong> (including past reservation history, invoices, and companion guest profiles)
                </span>
              </label>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ color: '#141414', fontWeight: 600 }}>
                To proceed, type <span style={{ color: '#DC2626', fontWeight: 700 }}>DELETE</span> below:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmationText}
                onChange={(e) => {
                  setDeleteConfirmationText(e.target.value);
                  if (deleteAccountError) setDeleteAccountError(null);
                }}
                disabled={isDeletingAccount}
                autoFocus
                style={{ borderColor: deleteConfirmationText.trim().toUpperCase() === 'DELETE' ? '#DC2626' : undefined }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteAccountModalOpen(false);
                  setDeleteConfirmationText('');
                  setDeleteAccountError(null);
                }}
                disabled={isDeletingAccount}
                className="btn btn-outline"
                style={{ borderColor: '#E8E2D8', color: '#141414' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE' || isDeletingAccount}
                className="btn"
                style={{
                  background: deleteConfirmationText.trim().toUpperCase() === 'DELETE' ? '#DC2626' : '#9CA3AF',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: deleteConfirmationText.trim().toUpperCase() === 'DELETE' && !isDeletingAccount ? 'pointer' : 'not-allowed'
                }}
              >
                <Trash2 size={16} />
                {isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      </div>
    </div>
  );
};

export default CustomerDashboard;
