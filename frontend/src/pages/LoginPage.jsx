import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ToastAlert from '../components/ToastAlert';
import { 
  Building2, 
  KeyRound, 
  UserCheck, 
  ShieldCheck, 
  Users, 
  Sparkles,
  Lock,
  User,
  ArrowRight
} from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(username, password);
      
      const redirectTarget = location.state?.from 
        ? (typeof location.state.from === 'string' 
            ? location.state.from 
            : (location.state.from.pathname + (location.state.from.search || '')))
        : null;

      // If user had an intended destination, return them there!
      if (redirectTarget && redirectTarget !== '/' && redirectTarget !== '/login') {
        navigate(redirectTarget, { replace: true });
      } else {
        // Role-based redirection fallback
        if (user.role === 'ROLE_CUSTOMER') navigate('/customer-dashboard', { replace: true });
        else if (user.role === 'ROLE_RESERVATION_SUPERVISOR') navigate('/supervisor-dashboard', { replace: true });
        else if (user.role === 'ROLE_EVENT_COORDINATOR') navigate('/event-coordinator-dashboard', { replace: true });
        else if (user.role === 'ROLE_VENUE_MANAGER') navigate('/venue-manager-dashboard', { replace: true });
        else if (user.role === 'ROLE_HR_MANAGER') navigate('/hr-dashboard', { replace: true });
        else if (user.role === 'ROLE_ADMIN') navigate('/admin-dashboard', { replace: true });
        else navigate('/', { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      let msg = 'Login failed.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        msg = 'Connection Refused: Please ensure Spring Boot backend is active on port 8080.';
      } else {
        msg = err.message || 'Invalid credentials. Please verify username and password.';
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = (demoUsername) => {
    setUsername(demoUsername);
    setPassword('password123');
  };

  return (
    <div className="rosewood-page" style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: '#FAF9F5'
    }}>
      <div style={{ maxWidth: '1120px', width: '100%', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Rosewood Luxury Login Form Card */}
          <div className="rosewood-card" style={{
            padding: '3.5rem 2.75rem',
            background: '#FFFFFF',
            border: '1px solid #E8E2D8',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FAF9F5',
                border: '1px solid #E8E2D8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
              }}>
                <img 
                  src="/grand-luxe-emblem-dark.png" 
                  alt="Grand Luxe Logo" 
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
                />
              </div>

              <div style={{
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#8B7B61',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}>
                GRAND LUXE HOTELS
              </div>

              <h1 style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontSize: '2.2rem',
                color: '#141414',
                fontWeight: 500,
                marginBottom: '0.5rem',
                lineHeight: 1.15
              }}>
                Resident & Staff Sign In
              </h1>

              <p style={{
                color: '#555555',
                fontSize: '0.92rem',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic'
              }}>
                Access your guest bookings or executive management dashboards
              </p>
            </div>

            {location.state?.message && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.9rem 1.1rem',
                borderRadius: '2px',
                background: '#F5F2EB',
                border: '1px solid #E2DCD2',
                color: '#141414',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <Lock size={17} color="#0B3B2C" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{location.state.message}</span>
              </div>
            )}

            <ToastAlert type="error" message={error} onClose={() => setError(null)} />

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1A1A1A',
                  marginBottom: '0.5rem'
                }}>
                  <User size={14} color="#0B3B2C" /> Username or Registered Email
                </label>
                <input 
                  type="text" 
                  className="rosewood-input" 
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ height: '44px' }}
                />
              </div>

              <div style={{ marginBottom: '1.85rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1A1A1A',
                  marginBottom: '0.5rem'
                }}>
                  <Lock size={14} color="#0B3B2C" /> Account Password
                </label>
                <input 
                  type="password" 
                  className="rosewood-input" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ height: '44px' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="rosewood-btn-green" 
                style={{
                  width: '100%',
                  height: '46px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  marginBottom: '1.5rem'
                }}
              >
                {submitting ? 'Verifying Credentials...' : 'Sign In to Grand Luxe'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#666666' }}>
              Don't have a guest account?{' '}
              <Link to="/register" state={location.state} style={{ color: '#0B3B2C', fontWeight: 700, textDecoration: 'none' }}>
                Register for Free <ArrowRight size={13} style={{ verticalAlign: 'middle' }} />
              </Link>
            </div>
          </div>

          {/* Right Column: 1-Click Role Switcher Demo Cards */}
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                background: '#F5F2EB',
                border: '1px solid #E2DCD2',
                borderRadius: '2px',
                color: '#0B3B2C',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}>
                <KeyRound size={13} color="#0B3B2C" /> Evaluation & Demonstration Access
              </div>

              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '2rem',
                color: '#141414',
                fontWeight: 500,
                marginBottom: '0.5rem',
                lineHeight: 1.2
              }}>
                Demo Accounts (All 6 Roles)
              </h2>

              <p style={{
                color: '#555555',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic'
              }}>
                Click any role card below to auto-fill credentials (default password: <strong style={{ color: '#141414', fontStyle: 'normal' }}>password123</strong>) and explore each module's full interface.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {[
                { role: 'Customer / Guest', user: 'customer1', desc: 'Browse spaces, book inline packages, pay, track invoices', icon: <UserCheck size={18} color="#0B3B2C" /> },
                { role: 'Reservation Supervisor', user: 'supervisor', desc: 'Approve/reject requests, prevent double-bookings', icon: <ShieldCheck size={18} color="#0B3B2C" /> },
                { role: 'Event Coordinator', user: 'eventmgr', desc: 'Package publisher, service checklist configuration', icon: <Sparkles size={18} color="#0B3B2C" /> },
                { role: 'Venue Operations', user: 'venuemgr', desc: 'Room & banquet hall inventory, toggle availability', icon: <Building2 size={18} color="#0B3B2C" /> },
                { role: 'HR & Resources', user: 'hrmgr', desc: 'Employee shifts, leaves, conflict-free staff allocations', icon: <Users size={18} color="#0B3B2C" /> },
                { role: 'General Manager / Admin', user: 'admin', desc: 'Executive revenue reports, user accounts, audit trail', icon: <KeyRound size={18} color="#0B3B2C" /> }
              ].map((account, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleDemoLogin(account.user)}
                  style={{
                    padding: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.9rem',
                    border: username === account.user ? '1.5px solid #0B3B2C' : '1px solid #E8E2D8',
                    background: username === account.user ? '#F5F2EB' : '#FFFFFF',
                    borderRadius: '2px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#0B3B2C'; }}
                  onMouseOut={(e) => { if (username !== account.user) e.currentTarget.style.borderColor = '#E8E2D8'; }}
                >
                  <div style={{ marginTop: '2px' }}>{account.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#141414', fontWeight: 600 }}>{account.role}</strong>
                      <span style={{
                        fontSize: '0.72rem',
                        color: '#0B3B2C',
                        fontFamily: 'monospace',
                        background: '#ECE7DF',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '2px',
                        fontWeight: 600
                      }}>
                        {account.user}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#666666', lineHeight: 1.45 }}>
                      {account.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
