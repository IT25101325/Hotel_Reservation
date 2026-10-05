import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--gold-primary)', fontSize: '1.2rem', fontWeight: '600' }}>
          Loading session...
        </div>
      </div>
    );
  }

  // Precondition: profile/booking/staff actions require login (UC-01 extension 2a)
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location, 
          message: "Please sign in or create an account to access Grand Luxe Hotel's rooms, packages, events and reservations." 
        }} 
        replace 
      />
    );
  }

  // Permission Check: ensure user role matches allowed roles (UC-06 extension 5a)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(user.role);
    if (!hasPermission) {
      return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
            <h2 style={{ color: 'var(--rose-primary)', marginBottom: '1rem' }}>Access Denied (403)</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your account role (<strong>{user.role}</strong>) does not have authorization to view this module dashboard.
            </p>
            <Navigate to="/" replace />
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
