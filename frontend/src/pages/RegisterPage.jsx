import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ToastAlert from '../components/ToastAlert';
import { Lock } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [passportOrNic, setPassportOrNic] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [specialPreferences, setSpecialPreferences] = useState('');

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        passportOrNic: passportOrNic.trim(),
        emergencyContact: emergencyContact.trim(),
        specialPreferences: specialPreferences.trim(),
        role: 'ROLE_CUSTOMER'
      });

      const redirectTarget = location.state?.from 
        ? (typeof location.state.from === 'string' 
            ? location.state.from 
            : (location.state.from.pathname + (location.state.from.search || '')))
        : null;

      if (redirectTarget && redirectTarget !== '/' && redirectTarget !== '/login' && redirectTarget !== '/register') {
        navigate(redirectTarget, { replace: true });
      } else {
        navigate('/customer-dashboard', { replace: true });
      }
    } catch (err) {
      console.error("Registration submit error:", err);
      let msg = 'Registration failed.';
      if (err.response?.data) {
        if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.validationErrors) {
          msg = Object.values(err.response.data.validationErrors).join(', ');
        } else if (err.response.data.error) {
          msg = err.response.data.error;
        }
      } else if (err.code === 'ERR_NETWORK') {
        msg = 'Connection refused: Backend server is unreachable on port 8080.';
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
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
      <div style={{ maxWidth: '700px', width: '100%', margin: '0 auto' }}>
        <div className="rosewood-card" style={{
          padding: '3.5rem 3rem',
          background: '#FFFFFF',
          border: '1px solid #E8E2D8',
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
              Create Resident Account
            </h1>
            <p style={{ color: '#555555', fontSize: '0.92rem', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
              Register for bespoke reservations, dedicated concierge access, and estate privileges
            </p>
          </div>

          {location.state?.message && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '0.9rem 1.1rem',
              borderRadius: '4px',
              background: '#FBF9F5',
              border: '1px solid #E8E2D8',
              borderLeft: '3px solid #0B3B2C',
              color: '#141414',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <Lock size={18} color="#0B3B2C" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{location.state.message}</span>
            </div>
          )}

          <ToastAlert type="error" message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Username *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. johndoe" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. john@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Legal Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password * (Min 6 chars)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Phone Number *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="+94 77 123 4567" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Passport No. / NIC *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. N1234567 / 981234567V" 
                  value={passportOrNic} 
                  onChange={(e) => setPassportOrNic(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Residential Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="123 Palm Grove Ave, Colombo" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emergency Contact Name & Phone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Eleanor Sinclair (+94 77 123 4567)" 
                  value={emergencyContact} 
                  onChange={(e) => setEmergencyContact(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ color: '#141414', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hospitality & Dietary Preferences (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. High floor preferred, extra pillows, vegetarian catering..." 
                value={specialPreferences} 
                onChange={(e) => setSpecialPreferences(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="btn" 
              style={{
                width: '100%',
                height: '48px',
                background: '#0B3B2C',
                color: '#FFFFFF',
                border: '1px solid #0B3B2C',
                borderRadius: '0px',
                fontSize: '0.84rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              {submitting ? 'Registering Guest Profile...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#555555' }}>
            Already have a Grand Luxe account?{' '}
            <Link to="/login" state={location.state} style={{ color: '#0B3B2C', fontWeight: 600, textDecoration: 'underline' }}>
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
