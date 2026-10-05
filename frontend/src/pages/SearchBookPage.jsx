import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ToastAlert from '../components/ToastAlert';
import Modal from '../components/Modal';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  X
} from 'lucide-react';

const defaultPackageImages = {
  WEDDING: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
  CONFERENCE: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80",
  BIRTHDAY: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
  BANQUET: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
  DEFAULT: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
};

const getPackageImage = (pkg) => {
  if (pkg?.imageUrl && pkg.imageUrl.trim()) {
    return pkg.imageUrl.trim();
  }
  const type = (pkg?.eventType || '').toUpperCase();
  return defaultPackageImages[type] || defaultPackageImages.DEFAULT;
};

const SearchBookPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [venues, setVenues] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Wizard Step: 1 = Space, 2 = Package, 3 = Dates & Availability, 4 = Review & Submit
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [specialNotes, setSpecialNotes] = useState('');

  // Primary Guest Details (synced with database reservations record)
  const [primaryGuestName, setPrimaryGuestName] = useState('');
  const [primaryGuestPhone, setPrimaryGuestPhone] = useState('');
  const [primaryGuestEmail, setPrimaryGuestEmail] = useState('');
  const [primaryGuestId, setPrimaryGuestId] = useState('');

  // Filtering & Search
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [packageTypeFilter, setPackageTypeFilter] = useState('ALL');

  // Status & Feedback
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(null); // null, 'checking', 'available', 'conflict'
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [stepError, setStepError] = useState(null);
  const [guestCountError, setGuestCountError] = useState(null);

  // Details Modal
  const [viewDetailItem, setViewDetailItem] = useState(null);

  // Success Confirmation State
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueRes, pkgRes] = await Promise.all([
          api.get('/public/venues/all').catch(() => api.get('/public/venues')),
          api.get('/public/packages')
        ]);
        
        const venueData = Array.isArray(venueRes.data) ? venueRes.data : [];
        const packageData = Array.isArray(pkgRes.data) ? pkgRes.data : [];

        setVenues(venueData);
        setPackages(packageData);

        // Pre-select if URL params passed
        const initialVenueId = searchParams.get('venueId');
        if (initialVenueId) {
          const v = venueData.find(item => item.id.toString() === initialVenueId);
          if (v) setSelectedVenue(v);
        }

        const initialPackageId = searchParams.get('packageId');
        if (initialPackageId) {
          const p = packageData.find(item => item.id.toString() === initialPackageId);
          if (p) setSelectedPackage(p);
        }

        // Pre-fill dates or guests if passed from hero search
        const paramStart = searchParams.get('startDate');
        const paramEnd = searchParams.get('endDate');
        const paramGuests = searchParams.get('guests');
        const paramCategory = searchParams.get('category');
        const paramEventType = searchParams.get('eventType');

        if (paramStart) setStartDate(paramStart);
        if (paramEnd) setEndDate(paramEnd);
        if (paramGuests) setGuestCount(parseInt(paramGuests, 10) || 2);
        if (paramCategory && paramCategory !== 'ALL') setFilterType(paramCategory);
        if (paramEventType && paramEventType !== 'ALL') setPackageTypeFilter(paramEventType);

        // If both venue & dates are provided from hero, jump to step 3
        if (initialVenueId && paramStart && paramEnd) {
          setCurrentStep(3);
        }
      } catch (err) {
        console.error('Failed to load reservation inventory:', err);
        setVenues([]);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Autofill Primary Guest Information from logged-in user and profile
  useEffect(() => {
    if (user) {
      if (user.fullName) setPrimaryGuestName(prev => prev || user.fullName);
      if (user.email) setPrimaryGuestEmail(prev => prev || user.email);
      if (user.phone) setPrimaryGuestPhone(prev => prev || user.phone);
    }
    if (isAuthenticated) {
      api.get('/customer/profile')
        .then(res => {
          if (res.data) {
            if (res.data.user?.fullName) setPrimaryGuestName(prev => prev || res.data.user.fullName);
            if (res.data.user?.email) setPrimaryGuestEmail(prev => prev || res.data.user.email);
            if (res.data.user?.phone) setPrimaryGuestPhone(prev => prev || res.data.user.phone);
            if (res.data.passportOrNic) setPrimaryGuestId(prev => prev || res.data.passportOrNic);
          }
        })
        .catch(() => {});
    }
  }, [user, isAuthenticated]);

  // Step completion validation rules
  const isStep1Finished = Boolean(selectedVenue);
  const isStep2Finished = isStep1Finished; // Package is optional once space is selected
  const isStep3Finished = Boolean(
    selectedVenue && 
    startDate && 
    endDate && 
    new Date(endDate) > new Date(startDate) && 
    parseInt(guestCount, 10) >= 2 &&
    (!selectedVenue.capacity || parseInt(guestCount, 10) <= selectedVenue.capacity) &&
    availabilityChecked !== 'conflict'
  );

  const canAccessStep = (step) => {
    if (step === 1) return true;
    if (step === 2) return isStep1Finished;
    if (step === 3) return isStep1Finished;
    if (step === 4) return isStep1Finished && isStep3Finished;
    return false;
  };

  const goToStep = (step) => {
    setStepError(null);
    if (step === currentStep) return;

    // Always allow navigating back to an earlier completed or visited step
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }

    // Must finish Step 1 before proceeding to Step 2, 3, or 4
    if (!isStep1Finished) {
      setStepError('Please complete Step 1 by selecting an Accommodation Room or Event Venue first.');
      return;
    }

    // Must finish Step 3 before proceeding to Step 4 (Review & Confirm)
    if (step === 4) {
      if (!startDate || !endDate) {
        setStepError('Please complete Step 3 by specifying your Check-In and Check-Out dates before proceeding to review.');
        setCurrentStep(3);
        return;
      }
      if (new Date(endDate) <= new Date(startDate)) {
        setStepError('Check-out date must be strictly after check-in date in Step 3.');
        setCurrentStep(3);
        return;
      }
      const parsedCount = parseInt(guestCount, 10);
      if (isNaN(parsedCount) || parsedCount < 2) {
        setGuestCountError('Guest count must be greater than 1 person.');
        setCurrentStep(3);
        return;
      }
      if (selectedVenue.capacity && parsedCount > selectedVenue.capacity) {
        setGuestCountError(`Guest count (${parsedCount}) exceeds venue capacity (${selectedVenue.capacity} guests). Please adjust.`);
        setCurrentStep(3);
        return;
      }
      if (availabilityChecked === 'conflict') {
        setStepError('The selected dates have a booking conflict. Please pick alternate dates in Step 3.');
        setCurrentStep(3);
        return;
      }
    }

    setCurrentStep(step);
  };

  // Real-time Availability Verification Handler
  const verifyAvailability = async () => {
    setStepError(null);
    if (!selectedVenue) {
      setStepError('Please select a Room or Event Venue first.');
      return;
    }
    if (!startDate || !endDate) {
      setStepError('Please specify both Start Date and End Date.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setStepError('Check-out date must be strictly after check-in date.');
      return;
    }

    setAvailabilityChecked('checking');
    try {
      const res = await api.get('/public/venues/check-availability', {
        params: {
          venueRoomId: selectedVenue.id,
          startDate,
          endDate
        }
      });

      if (res.data.available) {
        setAvailabilityChecked('available');
        setAvailabilityMessage(`CONFIRMED AVAILABLE: "${selectedVenue.name}" is completely free for your dates!`);
        setStepError(null);
      } else {
        setAvailabilityChecked('conflict');
        setAvailabilityMessage(`DATE CONFLICT: ${res.data.message}`);
        setStepError(`DOUBLE BOOKING CONFLICT: ${res.data.message}`);
      }
    } catch (err) {
      setAvailabilityChecked(null);
      setStepError('Error checking date availability. Verify backend connection.');
    }
  };

  // Handle Step 3 -> Step 4 navigation with in-place validation
  const handleProceedToReview = () => {
    setStepError(null);
    if (!selectedVenue) {
      setStepError('Please select a room or venue to proceed.');
      setCurrentStep(1);
      return;
    }
    if (!startDate || !endDate) {
      setStepError('Please select valid start and end dates.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setStepError('Check-out date must be after check-in date.');
      return;
    }

    const parsedCount = parseInt(guestCount, 10);
    if (isNaN(parsedCount) || parsedCount < 2) {
      setGuestCountError('Guest count must be greater than 1 person.');
      return;
    }

    if (selectedVenue.capacity && parsedCount > selectedVenue.capacity) {
      setGuestCountError(`Guest count (${parsedCount}) exceeds maximum capacity of ${selectedVenue.name} (${selectedVenue.capacity} guests). Please reduce guest count or choose a larger venue.`);
      return;
    }

    if (selectedPackage?.maxCapacity && parsedCount > selectedPackage.maxCapacity) {
      setGuestCountError(`Guest count (${parsedCount}) exceeds maximum capacity of selected package "${selectedPackage.name}" (${selectedPackage.maxCapacity} guests).`);
      return;
    }

    if (availabilityChecked === 'conflict') {
      setStepError('The selected dates are unavailable due to a scheduling conflict. Please pick alternate dates.');
      return;
    }

    setCurrentStep(4);
  };

  // Submit Reservation Flow
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setStepError(null);
    setAlert(null);

    // Unauthenticated redirect to login
    if (!isAuthenticated) {
      setStepError('Authentication required. Redirecting to login before placing reservation...');
      setTimeout(() => {
        navigate('/login', { state: { from: '/search-book' } });
      }, 1500);
      return;
    }

    if (!selectedVenue) {
      setStepError('Please select a room or venue to proceed.');
      setCurrentStep(1);
      return;
    }
    if (!startDate || !endDate) {
      setStepError('Please select valid start and end dates.');
      setCurrentStep(3);
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setStepError('Check-out date must be after check-in date.');
      setCurrentStep(3);
      return;
    }

    const parsedCount = parseInt(guestCount, 10);
    if (isNaN(parsedCount) || parsedCount < 2) {
      setGuestCountError('Guest count must be greater than 1 person.');
      setCurrentStep(3);
      return;
    }

    if (selectedVenue.capacity && parsedCount > selectedVenue.capacity) {
      setGuestCountError(`Guest count (${parsedCount}) exceeds maximum capacity of ${selectedVenue.name} (${selectedVenue.capacity} guests). Please choose a larger venue or reduce guest count.`);
      setCurrentStep(3);
      return;
    }

    if (selectedPackage?.maxCapacity && parsedCount > selectedPackage.maxCapacity) {
      setGuestCountError(`Guest count (${parsedCount}) exceeds maximum capacity of selected package "${selectedPackage.name}" (${selectedPackage.maxCapacity} guests).`);
      setCurrentStep(3);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        venueRoomId: selectedVenue.id,
        eventPackageId: selectedPackage ? selectedPackage.id : null,
        startDate,
        endDate,
        guestCount: parsedCount,
        specialNotes,
        primaryGuestName: primaryGuestName.trim() || undefined,
        primaryGuestEmail: primaryGuestEmail.trim() || undefined,
        primaryGuestPhone: primaryGuestPhone.trim() || undefined,
        primaryGuestId: primaryGuestId.trim() || undefined
      };

      const response = await api.post('/customer/reservations', payload);
      setBookingSuccess(response.data);
      setAlert({ 
        type: 'success', 
        message: `RESERVATION APPROVED! Booking #${response.data.id} created and confirmed. You can now pay online directly.` 
      });

      // Automatically redirect after 3.5 seconds
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 3500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to complete reservation. Please verify dates and availability.';
      if (errorMsg.toLowerCase().includes('guest count')) {
        setGuestCountError(errorMsg);
        setCurrentStep(3);
      } else {
        setStepError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered venues based on category and search query
  const filteredVenues = venues.filter((v) => {
    const matchesCat = filterType === 'ALL' || v.type === filterType;
    const matchesSearch = searchQuery === '' || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.facilities && v.facilities.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    return packageTypeFilter === 'ALL' || pkg.eventType === packageTypeFilter;
  });

  // Calculate pricing breakdown
  const calculateEstimate = () => {
    if (!selectedVenue) return { nights: 1, roomTotal: 0, packageTotal: 0, grandTotal: 0 };
    
    let nights = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const calculatedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nights = calculatedNights > 0 ? calculatedNights : 1;
    }
    
    const roomRate = parseFloat(selectedVenue.pricePerNight || 0);
    const roomTotal = roomRate * nights;
    const packageTotal = selectedPackage ? parseFloat(selectedPackage.price || 0) : 0;
    const grandTotal = roomTotal + packageTotal;

    return { nights, roomTotal, packageTotal, grandTotal };
  };

  const { nights, roomTotal, packageTotal, grandTotal } = calculateEstimate();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--gold-primary)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem' }}>
          Loading Grand Luxe Inventory...
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving live rooms, banquet halls, and published packages.</p>
      </div>
    );
  }

  // Success Screen
  if (bookingSuccess) {
    return (
      <div style={{ maxWidth: '780px', margin: '5rem auto', padding: '0 1.5rem' }}>
        <div className="glass-card animate-fade-in" style={{
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          border: '1px solid var(--border-accent)',
          background: 'linear-gradient(180deg, #0e162b 0%, #080d19 100%)'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid var(--emerald-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle2 size={40} color="var(--emerald-primary)" />
          </div>

          <span className="badge badge-confirmed" style={{ marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            Reservation #{bookingSuccess.id} • RESERVATION APPROVED & CONFIRMED
          </span>

          <h1 style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '1rem' }}>
            Reservation Approved!
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thank you for choosing Grand Luxe Hotel. Your reservation for <strong style={{ color: '#fff' }}>{selectedVenue?.name}</strong> has been instantly approved! You can now proceed to pay online from your dashboard or download your booking confirmation.
          </p>

          <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2.5rem auto', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Stay Dates:</span>
              <strong style={{ color: '#fff' }}>{startDate} to {endDate} ({nights} {nights === 1 ? 'Night' : 'Nights'})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Guests:</span>
              <strong style={{ color: '#fff' }}>{guestCount} Guests</strong>
            </div>
            {selectedPackage && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Event Package:</span>
                <strong style={{ color: 'var(--gold-light)' }}>{selectedPackage.name}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Total:</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--gold-primary)' }}>LKR {grandTotal.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/customer-dashboard')} className="btn btn-gold">
              Pay Online & View Reservation
            </button>
            <button onClick={() => { setBookingSuccess(null); goToStep(1); }} className="btn btn-outline">
              Make Another Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rosewood-page" style={{ minHeight: '85vh', padding: '3.5rem 1.5rem 7rem 1.5rem' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img 
              src="/grand-luxe-emblem-dark.png" 
              alt="Grand Luxe Emblem" 
              style={{ height: '54px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>
          <div style={{
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#8B7B61',
            fontWeight: 700,
            marginBottom: '0.85rem'
          }}>
            EXCLUSIVE DIRECT RESERVATION
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.6rem, 5vw, 4rem)',
            color: '#141414',
            marginBottom: '0.75rem',
            fontWeight: 400
          }}>
            Reserve Room or Special Event Space
          </h1>
          <p style={{
            color: '#4A4A4A',
            fontSize: '1.1rem',
            maxWidth: '780px',
            margin: '0 auto',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            lineHeight: 1.65
          }}>
            Follow our 4-step booking journey to select your accommodation or venue, attach an event package, verify conflict-free date availability, and confirm your reservation.
          </p>
        </div>

      <ToastAlert 
        type={alert?.type} 
        message={alert?.message} 
        onClose={() => setAlert(null)} 
      />

      {/* Progress Stepper Bar */}
      <div className="rosewood-card" style={{
        background: '#FFFFFF',
        border: '1px solid #E8E2D8',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        padding: '1.25rem 2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {[
          { step: 1, label: '1. Choose Space', icon: <Building2 size={16} />, isFinished: isStep1Finished },
          { step: 2, label: '2. Event Package (Optional)', icon: <Sparkles size={16} />, isFinished: isStep2Finished },
          { step: 3, label: '3. Dates & Availability', icon: <Calendar size={16} />, isFinished: isStep3Finished },
          { step: 4, label: '4. Review & Confirm', icon: <ShieldCheck size={16} />, isFinished: Boolean(bookingSuccess) }
        ].map((s) => {
          const isCurrent = currentStep === s.step;
          const isAccessible = canAccessStep(s.step);
          const isCompleted = s.isFinished && currentStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => goToStep(s.step)}
              disabled={!isAccessible && s.step > currentStep}
              title={!isAccessible ? 'Please finish previous required steps first' : ''}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: isAccessible || s.step <= currentStep ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: isCurrent 
                  ? '#0B3B2C' 
                  : isCompleted 
                    ? '#15803D' 
                    : isAccessible 
                      ? '#141414' 
                      : '#9E9E9E',
                opacity: (!isAccessible && s.step > currentStep) ? 0.45 : 1,
                fontWeight: isCurrent ? 700 : isAccessible ? 600 : 500,
                fontSize: '0.92rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isCurrent 
                  ? '#0B3B2C' 
                  : isCompleted 
                    ? '#DCFCE7' 
                    : isAccessible 
                      ? '#F0ECE1' 
                      : '#EFEFEF',
                color: isCurrent 
                  ? '#FFFFFF' 
                  : isCompleted 
                    ? '#166534' 
                    : isAccessible 
                      ? '#141414' 
                      : '#9E9E9E',
                fontWeight: 700,
                fontSize: '0.8rem',
                border: isCurrent ? '1px solid #0B3B2C' : isCompleted ? '1px solid #86EFAC' : '1px solid #E0DBD1'
              }}>
                {isCompleted ? <Check size={15} strokeWidth={2.6} /> : s.step}
              </div>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global In-Place Step Error Banner */}
      {stepError && !stepError.toLowerCase().includes('guest count') && (
        <div className="animate-fade-in" style={{
          marginBottom: '2rem',
          padding: '0.95rem 1.35rem',
          borderRadius: '4px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderLeft: '4px solid #DC2626',
          color: '#991B1B',
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{stepError}</span>
          </div>
          <button 
            onClick={() => setStepError(null)}
            aria-label="Dismiss message"
            style={{ background: 'transparent', border: 'none', color: '#991B1B', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Reservation Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Dynamic Step Views */}
        <div>
          
          {/* STEP 1: SELECT VENUE OR ROOM */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              {/* Filter & Search Bar */}
              <div className="rosewood-card" style={{
                background: '#FFFFFF',
                border: '1px solid #E8E2D8',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['ALL', 'ROOM', 'BANQUET_HALL', 'GARDEN_VENUE', 'CONFERENCE_HALL'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterType(cat)}
                      className={`btn btn-sm ${filterType === cat ? 'btn-gold' : 'btn-outline'}`}
                      style={{ 
                        fontSize: '0.78rem',
                        background: filterType === cat ? '#0B3B2C' : 'transparent',
                        color: filterType === cat ? '#FFFFFF' : '#141414',
                        borderColor: filterType === cat ? '#0B3B2C' : '#D0C9BE'
                      }}
                    >
                      {cat === 'ROOM' ? 'Suites & Rooms' : cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div style={{ minWidth: '220px', flex: 1, maxWidth: '320px' }}>
                  <input 
                    type="text" 
                    placeholder="Search by name or facility..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', background: '#FFFFFF', color: '#141414', border: '1px solid #D0C9BE' }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
                marginBottom: '2.5rem'
              }}>
                {filteredVenues.map((venue) => {
                  const isSelected = selectedVenue?.id === venue.id;
                  return (
                    <div 
                      key={venue.id}
                      onClick={() => setSelectedVenue(venue)}
                      className="rosewood-card"
                      style={{
                        cursor: 'pointer',
                        background: '#FFFFFF',
                        border: isSelected ? '2px solid #0B3B2C' : '1px solid #E8E2D8',
                        boxShadow: isSelected ? '0 8px 30px rgba(11, 59, 44, 0.12)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: '#0B3B2C',
                          color: '#FFFFFF',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          zIndex: 5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}>
                          <Check size={13} strokeWidth={2.8} /> SELECTED
                        </div>
                      )}

                      <div style={{ height: '170px', position: 'relative' }}>
                        <img 
                          src={venue.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"} 
                          alt={venue.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span className="badge" style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          right: '12px',
                          background: 'rgba(255, 255, 255, 0.92)',
                          color: '#0B3B2C',
                          border: '1px solid #0B3B2C',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {venue.type ? venue.type.replace('_', ' ') : 'SPACE'}
                        </span>
                      </div>

                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h3 style={{ 
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: '1.3rem', 
                          color: '#141414', 
                          fontWeight: 600,
                          marginBottom: '0.4rem' 
                        }}>
                          {venue.name}
                        </h3>
                        <p style={{ color: '#555555', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1rem', flexGrow: 1 }}>
                          {venue.description ? venue.description.substring(0, 95) + '...' : ''}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E8E2D8', paddingTop: '0.85rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#666666' }}>Capacity: {venue.capacity} guests</span>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B3B2C', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                              LKR {venue.pricePerNight} <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: 400, fontFamily: 'inherit' }}>/ night</span>
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setViewDetailItem(venue); }}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#141414', borderColor: '#D0C9BE' }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Step Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  disabled={!selectedVenue}
                  onClick={() => goToStep(2)}
                  className="btn btn-gold btn-lg"
                  style={{ opacity: selectedVenue ? 1 : 0.5, cursor: selectedVenue ? 'pointer' : 'not-allowed' }}
                >
                  Proceed to Package Selection <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT EVENT PACKAGE (OPTIONAL) */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ 
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.9rem', 
                    color: '#141414', 
                    fontWeight: 600,
                    marginBottom: '0.35rem' 
                  }}>
                    Attach an Event Package (Optional)
                  </h2>
                  <p style={{ color: '#555555', fontSize: '0.95rem' }}>
                    Enhance your stay or celebration with all-inclusive catering, floral decor, sound systems, or conference kits.
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedPackage(null)} 
                  className="btn btn-sm"
                  style={{
                    background: !selectedPackage ? '#0B3B2C' : 'transparent',
                    color: !selectedPackage ? '#FFFFFF' : '#141414',
                    border: !selectedPackage ? '1px solid #0B3B2C' : '1px solid #D0C9BE',
                    fontWeight: 600,
                    padding: '0.5rem 1rem'
                  }}
                >
                  Skip Package (Room Only: LKR {roomTotal.toFixed(2)})
                </button>
              </div>

              {/* Active Selection & Total Summary in Step 2 */}
              <div style={{
                padding: '1.35rem 1.75rem',
                background: '#F4EFE6',
                borderRadius: '8px',
                border: '1px solid #D9D2C5',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#8B7B61', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                    Live Pricing Preview
                  </span>
                  <div style={{ 
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.3rem', 
                    color: '#141414', 
                    fontWeight: 600 
                  }}>
                    {selectedVenue ? selectedVenue.name : 'Space Not Selected'} 
                    {selectedPackage ? ` + ${selectedPackage.name}` : ' (No Package Attached)'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#555555', marginTop: '0.25rem' }}>
                    Space: LKR {roomTotal.toFixed(2)} ({nights} {nights === 1 ? 'Night' : 'Nights'}) 
                    {selectedPackage ? ` • Package: LKR ${packageTotal.toFixed(2)}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#666666', textTransform: 'uppercase', display: 'block', fontWeight: 600, letterSpacing: '0.04em' }}>
                    Combined Total Price
                  </span>
                  <div style={{ 
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: '#0B3B2C' 
                  }}>
                    LKR {grandTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.75rem',
                marginBottom: '2.5rem'
              }}>
                {filteredPackages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const combinedTotalWithVenue = (parseFloat(selectedVenue?.pricePerNight || 0) * nights + parseFloat(pkg.price || 0)).toFixed(2);
                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className="rosewood-card"
                      style={{
                        cursor: 'pointer',
                        background: '#FFFFFF',
                        border: isSelected ? '2px solid #0B3B2C' : '1px solid #E8E2D8',
                        boxShadow: isSelected ? '0 8px 30px rgba(11, 59, 44, 0.12)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {/* Attached Selected Badge */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: '#0B3B2C',
                          color: '#FFFFFF',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          zIndex: 5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}>
                          <Check size={13} strokeWidth={2.8} /> ATTACHED
                        </div>
                      )}

                      {/* Package Photo Image */}
                      <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                        <img 
                          src={getPackageImage(pkg)} 
                          alt={pkg.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            const type = (pkg?.eventType || '').toUpperCase();
                            e.currentTarget.src = defaultPackageImages[type] || defaultPackageImages.DEFAULT;
                          }}
                        />
                        <span className="badge" style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          right: '12px', 
                          zIndex: 4,
                          background: 'rgba(255, 255, 255, 0.92)',
                          color: '#0B3B2C',
                          border: '1px solid #0B3B2C',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {pkg.eventType}
                        </span>
                      </div>

                      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h3 style={{ 
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: '1.3rem', 
                          color: '#141414', 
                          fontWeight: 600,
                          marginBottom: '0.4rem' 
                        }}>
                          {pkg.name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: '0.75rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          background: '#F9F7F2',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #E8E2D8'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#666666', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Package Fee</span>
                            <span style={{ 
                              fontSize: '1.25rem', 
                              fontWeight: 800, 
                              color: '#0B3B2C',
                              fontFamily: "'Cormorant Garamond', Georgia, serif" 
                            }}>
                              LKR {parseFloat(pkg.price || 0).toLocaleString()}
                            </span>
                          </div>
                          {selectedVenue && (
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.72rem', color: '#666666', display: 'block', fontWeight: 600 }}>Total with Space</span>
                              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#141414' }}>
                                LKR {combinedTotalWithVenue}
                              </span>
                            </div>
                          )}
                        </div>

                        <p style={{ color: '#555555', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                          {pkg.description}
                        </p>

                        <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: '0.85rem', marginTop: 'auto' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0B3B2C', letterSpacing: '0.04em' }}>
                              INCLUDED SERVICES:
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setViewDetailItem(pkg); }}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: '#141414', borderColor: '#D0C9BE' }}
                            >
                              Details
                            </button>
                          </div>
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: 0 }}>
                            {pkg.includedServices && pkg.includedServices.slice(0, 3).map((svc, idx) => (
                              <li key={idx} style={{ fontSize: '0.82rem', color: '#333333', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Check size={13} color="#0B3B2C" /> {svc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => goToStep(1)} className="btn btn-outline">
                  <ArrowLeft size={16} /> Back to Space Selection
                </button>
                <button onClick={() => goToStep(3)} className="btn btn-gold">
                  Proceed to Dates & Guests <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DATES & AVAILABILITY CHECK */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="rosewood-card" style={{
                background: '#FFFFFF',
                border: '1px solid #E8E2D8',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                padding: '2.5rem',
                marginBottom: '2rem'
              }}>
                <h2 style={{ 
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.9rem', 
                  color: '#141414', 
                  fontWeight: 600,
                  marginBottom: '0.5rem' 
                }}>
                  Select Reservation Dates & Guest Count
                </h2>
                <p style={{ color: '#555555', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  Specify your arrival and departure dates, confirm guest count, and execute a live double-booking check.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#141414', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                      Check-in Date *
                    </label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={startDate} 
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => { setStartDate(e.target.value); setAvailabilityChecked(null); }}
                      style={{ background: '#FFFFFF', color: '#141414', border: '1px solid #D0C9BE' }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#141414', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                      Check-out Date *
                    </label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={endDate} 
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => { setEndDate(e.target.value); setAvailabilityChecked(null); }}
                      style={{ background: '#FFFFFF', color: '#141414', border: '1px solid #D0C9BE' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ color: '#141414', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    Number of Attending Guests *
                  </label>
                  <input 
                    type="number" 
                    min="2"
                    max={selectedVenue?.capacity || 1000}
                    className="form-input" 
                    value={guestCount} 
                    onChange={(e) => {
                      setGuestCount(e.target.value);
                      if (guestCountError) setGuestCountError(null);
                    }}
                    style={{ 
                      background: '#FFFFFF', 
                      color: '#141414', 
                      border: guestCountError ? '1px solid #DC2626' : '1px solid #D0C9BE' 
                    }}
                    required
                  />
                  {/* INLINE GUEST COUNT ERROR NOTICE DISPLAYED DIRECTLY NEAR GUEST COUNT */}
                  {guestCountError && (
                    <div className="animate-fade-in" style={{
                      marginTop: '0.5rem',
                      padding: '0.65rem 0.95rem',
                      borderRadius: '4px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderLeft: '4px solid #DC2626',
                      color: '#991B1B',
                      fontSize: '0.86rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 500
                    }}>
                      <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                      <span>{guestCountError}</span>
                    </div>
                  )}
                  {selectedVenue && (
                    <span style={{ fontSize: '0.8rem', color: '#666666', marginTop: '0.4rem', display: 'block' }}>
                      Maximum capacity for {selectedVenue.name}: <strong style={{ color: '#141414' }}>{selectedVenue.capacity} guests</strong> (Minimum 2 guests required)
                    </span>
                  )}
                </div>

                {/* Live Availability Verification Action */}
                <div style={{
                  padding: '1.35rem 1.5rem',
                  borderRadius: '8px',
                  background: '#F9F7F2',
                  border: '1px solid #E0DBD1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#141414', fontSize: '0.98rem' }}>
                      Verify Double-Booking Protection
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#555555', marginTop: '0.2rem' }}>
                      Queries real-time reservation schedules to ensure zero date conflicts.
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={verifyAvailability}
                    className="btn btn-sm"
                    style={{
                      background: '#0B3B2C',
                      color: '#FFFFFF',
                      border: '1px solid #0B3B2C',
                      fontWeight: 600,
                      padding: '0.5rem 1rem'
                    }}
                  >
                    <ShieldCheck size={16} /> Check Availability Now
                  </button>
                </div>

                {availabilityChecked === 'available' && (
                  <div style={{ marginTop: '1.25rem', padding: '0.9rem 1.25rem', borderRadius: '6px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CheckCircle2 size={18} color="#059669" /> <span style={{ fontWeight: 600 }}>{availabilityMessage}</span>
                  </div>
                )}

                {availabilityChecked === 'conflict' && (
                  <div style={{ marginTop: '1.25rem', padding: '0.9rem 1.25rem', borderRadius: '6px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <AlertCircle size={18} color="#DC2626" /> <span style={{ fontWeight: 600 }}>{availabilityMessage}</span>
                  </div>
                )}
              </div>

              {/* IN-PLACE RED NOTICE VALIDATION BANNER FOR STEP 3 */}
              {stepError && !stepError.toLowerCase().includes('guest count') && (
                <div className="animate-fade-in" style={{
                  marginBottom: '1.25rem',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '6px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderLeft: '4px solid #DC2626',
                  color: '#991B1B',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{stepError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => goToStep(2)} className="btn btn-outline" style={{ color: '#141414', borderColor: '#D0C9BE' }}>
                  <ArrowLeft size={16} /> Back to Package
                </button>
                <button 
                  onClick={handleProceedToReview} 
                  className="btn"
                  style={{
                    background: '#0B3B2C',
                    color: '#FFFFFF',
                    border: '1px solid #0B3B2C',
                    fontWeight: 600,
                    padding: '0.75rem 1.75rem'
                  }}
                >
                  Review Booking Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div className="rosewood-card" style={{
                background: '#FFFFFF',
                border: '1px solid #E8E2D8',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                padding: '2.5rem',
                marginBottom: '2rem'
              }}>
                <h2 style={{ 
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.9rem', 
                  color: '#141414', 
                  fontWeight: 600,
                  marginBottom: '0.5rem' 
                }}>
                  Review & Finalize Reservation
                </h2>
                <p style={{ color: '#555555', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  Review your accommodation, attached event package, dates, and special concierge requests before submitting.
                </p>

                {/* Selected Space Overview */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  padding: '1.35rem 1.5rem', 
                  background: '#F9F7F2', 
                  borderRadius: '8px', 
                  border: '1px solid #E8E2D8', 
                  marginBottom: '1.5rem' 
                }}>
                  <img 
                    src={selectedVenue?.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80"} 
                    alt={selectedVenue?.name}
                    style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div>
                    <span className="badge" style={{ 
                      marginBottom: '0.35rem', 
                      background: '#0B3B2C', 
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem'
                    }}>
                      {selectedVenue?.type?.replace('_', ' ')}
                    </span>
                    <h3 style={{ 
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '1.3rem', 
                      color: '#141414',
                      fontWeight: 600,
                      marginTop: '0.2rem'
                    }}>
                      {selectedVenue?.name}
                    </h3>
                    <div style={{ fontSize: '0.88rem', color: '#555555', marginTop: '0.2rem' }}>
                      Capacity: {selectedVenue?.capacity} guests • Rate: <strong style={{ color: '#0B3B2C' }}>LKR {selectedVenue?.pricePerNight}</strong> / night
                    </div>
                  </div>
                </div>

                {/* Attached Package Overview (if any) */}
                {selectedPackage && (
                  <div style={{ 
                    padding: '1.35rem 1.5rem', 
                    background: '#F4EFE6', 
                    borderRadius: '8px', 
                    border: '1px solid #D9D2C5', 
                    marginBottom: '1.5rem' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="badge" style={{ 
                          marginBottom: '0.3rem',
                          background: '#0B3B2C',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem'
                        }}>
                          ATTACHED PACKAGE
                        </span>
                        <h4 style={{ 
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: '1.25rem', 
                          color: '#141414',
                          fontWeight: 600,
                          marginTop: '0.2rem'
                        }}>
                          {selectedPackage.name}
                        </h4>
                      </div>
                      <div style={{ 
                        fontSize: '1.35rem', 
                        fontWeight: 800, 
                        color: '#0B3B2C',
                        fontFamily: "'Cormorant Garamond', Georgia, serif"
                      }}>
                        LKR {selectedPackage.price}
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Guest Contact Information */}
                <div style={{
                  padding: '1.25rem',
                  background: '#F9F8F5',
                  borderRadius: '8px',
                  border: '1px solid #E2DCD2',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <ShieldCheck size={18} color="#0B3B2C" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0B3B2C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Primary Guest & Contact Information
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                        Primary Guest Full Name *
                      </label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="e.g. Eleanor Vance"
                        value={primaryGuestName}
                        onChange={(e) => setPrimaryGuestName(e.target.value)}
                        style={{ background: '#FFFFFF', color: '#141414', border: '1px solid #D0C9BE', width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                        Mobile Phone / Contact Number *
                      </label>
                      <input 
                        type="tel"
                        className="form-input"
                        placeholder="+94 77 123 4567"
                        value={primaryGuestPhone}
                        onChange={(e) => setPrimaryGuestPhone(e.target.value)}
                        style={{ background: '#FFFFFF', color: '#141414', border: '1px solid #D0C9BE', width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                        Confirmation Email Address
                      </label>
                      <input 
                        type="email"
                        className="form-input"
                        placeholder="guest@example.com"
                        value={primaryGuestEmail}
                        onChange={(e) => setPrimaryGuestEmail(e.target.value)}
                        style={{ background: '#FFFFFF', color: '#141414', border: '1px solid #D0C9BE', width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                        National ID / Passport Number
                      </label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="e.g. 199512345678 or N1234567"
                        value={primaryGuestId}
                        onChange={(e) => setPrimaryGuestId(e.target.value)}
                        style={{ background: '#FFFFFF', color: '#141414', border: '1px solid #D0C9BE', width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Special Concierge Requests */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ color: '#141414', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    Special Requests & Dietary Requirements
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Enter special seating preferences, dietary restrictions, airport transfer, or bridal dressing room requests..."
                    className="form-textarea"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    style={{ background: '#FFFFFF', color: '#141414', border: '1px solid #D0C9BE', width: '100%', padding: '0.75rem', borderRadius: '6px' }}
                  />
                </div>

                {/* Final Total Pricing Breakdown */}
                <div style={{
                  padding: '1.5rem',
                  background: '#F9F7F2',
                  borderRadius: '8px',
                  border: '1px solid #E8E2D8',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#8B7B61', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.85rem' }}>
                    Final Pricing Calculation
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#555555', fontSize: '0.92rem' }}>
                    <span>{selectedVenue?.name} ({nights} {nights === 1 ? 'Night' : 'Nights'} × LKR {selectedVenue?.pricePerNight}):</span>
                    <strong style={{ color: '#141414' }}>LKR {roomTotal.toFixed(2)}</strong>
                  </div>
                  {selectedPackage && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#555555', fontSize: '0.92rem' }}>
                      <span>Event Package ({selectedPackage.name}):</span>
                      <strong style={{ color: '#141414' }}>LKR {packageTotal.toFixed(2)}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E0DBD1', paddingTop: '0.85rem', marginTop: '0.85rem' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#141414' }}>Total Reservation Payable:</span>
                    <span style={{ 
                      fontSize: '1.85rem', 
                      fontWeight: 800, 
                      color: '#0B3B2C',
                      fontFamily: "'Cormorant Garamond', Georgia, serif"
                    }}>
                      LKR {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Terms Acceptance Note */}
                <div style={{ fontSize: '0.85rem', color: '#555555', lineHeight: 1.6, padding: '1rem', background: '#F0ECE1', borderRadius: '6px', border: '1px solid #E0DBD1' }}>
                  By clicking Confirm & Submit Reservation, your booking is automatically confirmed and scheduled. You can proceed directly to secure card payment in your dashboard.
                </div>
              </div>

              {/* IN-PLACE RED NOTICE VALIDATION BANNER FOR STEP 4 */}
              {stepError && !stepError.toLowerCase().includes('guest count') && (
                <div className="animate-fade-in" style={{
                  marginBottom: '1.25rem',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '6px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderLeft: '4px solid #DC2626',
                  color: '#991B1B',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{stepError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => goToStep(3)} className="btn btn-outline" style={{ color: '#141414', borderColor: '#D0C9BE' }}>
                  <ArrowLeft size={16} /> Back to Dates
                </button>
                <button 
                  onClick={handleBookingSubmit} 
                  disabled={submitting}
                  className="btn btn-lg"
                  style={{
                    background: '#0B3B2C',
                    color: '#FFFFFF',
                    border: '1px solid #0B3B2C',
                    fontWeight: 600,
                    padding: '0.75rem 2rem'
                  }}
                >
                  {submitting ? 'Submitting Reservation...' : 'Confirm & Submit Reservation'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Booking Summary Card */}
        <div>
          <div className="rosewood-card" style={{
            padding: '2rem',
            position: 'sticky',
            top: '90px',
            background: '#FFFFFF',
            border: '1px solid #E8E2D8',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            borderRadius: '8px'
          }}>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.45rem',
              color: '#141414',
              fontWeight: 600,
              marginBottom: '1.25rem',
              borderBottom: '1px solid #E8E2D8',
              paddingBottom: '0.75rem'
            }}>
              Reservation Summary
            </h3>

            {selectedVenue ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8B7B61', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Selected Space</div>
                  <div style={{ 
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.2rem', 
                    fontWeight: 600, 
                    color: '#141414',
                    marginTop: '0.15rem' 
                  }}>
                    {selectedVenue.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#0B3B2C', fontWeight: 700, marginTop: '0.1rem' }}>
                    LKR {selectedVenue.pricePerNight} / night
                  </div>
                </div>

                {selectedPackage ? (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#8B7B61', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Event Package</div>
                    <div style={{ 
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '1.15rem', 
                      fontWeight: 600, 
                      color: '#0B3B2C',
                      marginTop: '0.15rem'
                    }}>
                      {selectedPackage.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#555555', marginTop: '0.1rem', fontWeight: 500 }}>
                      LKR {selectedPackage.price} flat
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#8B7B61', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Event Package</div>
                    <div style={{ fontSize: '0.88rem', color: '#777777', marginTop: '0.15rem' }}>None (Space Only)</div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555555', marginBottom: '0.45rem' }}>
                    <span>Check-In:</span>
                    <span style={{ color: '#141414', fontWeight: 600 }}>{startDate || 'Not selected'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555555', marginBottom: '0.45rem' }}>
                    <span>Check-Out:</span>
                    <span style={{ color: '#141414', fontWeight: 600 }}>{endDate || 'Not selected'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555555', marginBottom: '0.45rem' }}>
                    <span>Duration:</span>
                    <span style={{ color: '#141414', fontWeight: 600 }}>
                      {startDate && endDate ? `${nights} ${nights === 1 ? 'Night' : 'Nights'}` : '1 Night (Estimate)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555555' }}>
                    <span>Guests:</span>
                    <span style={{ color: '#141414', fontWeight: 600 }}>{guestCount} Persons</span>
                  </div>
                </div>

                {/* Price Breakdown Calculation */}
                <div style={{
                  borderTop: '1px solid #E8E2D8',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555555' }}>
                    <span>Room / Space ({nights} × {selectedVenue.pricePerNight}):</span>
                    <span style={{ color: '#141414', fontWeight: 600 }}>LKR {roomTotal.toFixed(2)}</span>
                  </div>

                  {selectedPackage && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#555555' }}>
                      <span>Event Package:</span>
                      <span style={{ color: '#141414', fontWeight: 600 }}>LKR {packageTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #E0DBD1',
                    paddingTop: '0.85rem',
                    marginTop: '0.5rem'
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#141414', fontSize: '1rem', display: 'block' }}>Estimated Total:</span>
                      {(!startDate || !endDate) && (
                        <span style={{ fontSize: '0.75rem', color: '#777777' }}>
                          (1-night base stay)
                        </span>
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '1.65rem', 
                      fontWeight: 800, 
                      color: '#0B3B2C',
                      fontFamily: "'Cormorant Garamond', Georgia, serif"
                    }}>
                      LKR {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#777777' }}>
                <Building2 size={36} color="#8B7B61" style={{ opacity: 0.7, marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.9rem' }}>Please choose an accommodation or venue to review pricing and details.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Details Modal */}
      {viewDetailItem && (
        <Modal 
          isOpen={Boolean(viewDetailItem)} 
          onClose={() => setViewDetailItem(null)} 
          title={viewDetailItem.name}
        >
          <div>
            <div style={{ height: '260px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <img 
                src={viewDetailItem.eventType ? getPackageImage(viewDetailItem) : (viewDetailItem.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80")} 
                alt={viewDetailItem.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = viewDetailItem.eventType ? defaultPackageImages.DEFAULT : "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>
            <p style={{ color: '#4A4A4A', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {viewDetailItem.description}
            </p>

            {/* Space Facilities */}
            {viewDetailItem.facilities && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.15rem', 
                  fontWeight: 600, 
                  color: '#141414', 
                  marginBottom: '0.5rem' 
                }}>
                  Facilities:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {viewDetailItem.facilities.split(',').map((f, i) => (
                    <span key={i} className="badge" style={{ 
                      background: '#F0ECE1', 
                      color: '#0B3B2C', 
                      border: '1px solid #D9D2C5',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      {f.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Package Included Services */}
            {viewDetailItem.includedServices && viewDetailItem.includedServices.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.15rem', 
                  fontWeight: 600, 
                  color: '#141414', 
                  marginBottom: '0.5rem' 
                }}>
                  Included Services:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {viewDetailItem.includedServices.map((s, i) => (
                    <span key={i} className="badge" style={{ 
                      background: '#F0ECE1', 
                      color: '#0B3B2C', 
                      border: '1px solid #D9D2C5',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.35rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      <Check size={12} color="#0B3B2C" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                if (viewDetailItem.eventType) {
                  setSelectedPackage(viewDetailItem);
                  setViewDetailItem(null);
                  goToStep(3);
                } else {
                  setSelectedVenue(viewDetailItem);
                  setViewDetailItem(null);
                  goToStep(2);
                }
              }} 
              className="btn btn-gold" 
              style={{ 
                width: '100%',
                background: '#0B3B2C',
                color: '#FFFFFF',
                border: '1px solid #0B3B2C',
                fontWeight: 600,
                padding: '0.75rem'
              }}
            >
              {viewDetailItem.eventType ? 'Attach This Package & Proceed' : 'Select This Space'}
            </button>
          </div>
        </Modal>
      )}
      </div>
    </div>
  );
};

export default SearchBookPage;
