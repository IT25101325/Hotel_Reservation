import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected Customer Pages
import RoomsPage from './pages/RoomsPage';
import EventsPage from './pages/EventsPage';
import PackagesPage from './pages/PackagesPage';
import VenuesPage from './pages/VenuesPage';
import SearchBookPage from './pages/SearchBookPage';
import CustomerDashboard from './pages/CustomerDashboard';

// Role Dashboards
import ReservationSupervisorDashboard from './pages/ReservationSupervisorDashboard';
import EventCoordinatorDashboard from './pages/EventCoordinatorDashboard';
import VenueManagerDashboard from './pages/VenueManagerDashboard';
import HRManagerDashboard from './pages/HRManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <main style={{ flexGrow: 1 }}>
            <Routes>
              {/* Public Routes (UC-01 Public Access: Home, Login, Register only) */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Customer Pages & Features */}
              <Route 
                path="/rooms" 
                element={
                  <ProtectedRoute>
                    <RoomsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/events" 
                element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/packages" 
                element={
                  <ProtectedRoute>
                    <PackagesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/venues" 
                element={
                  <ProtectedRoute>
                    <VenuesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reservations" 
                element={
                  <ProtectedRoute>
                    <CustomerDashboard initialTab="bookings" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/booking" 
                element={
                  <ProtectedRoute>
                    <SearchBookPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/search-book" 
                element={
                  <ProtectedRoute>
                    <SearchBookPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <CustomerDashboard initialTab="profile" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Module 1: Customer & Guest Dashboard */}
              <Route 
                path="/customer-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Module 4: Reservation Supervisor Dashboard */}
              <Route 
                path="/supervisor-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_RESERVATION_SUPERVISOR']}>
                    <ReservationSupervisorDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Module 3: Event Coordinator Dashboard */}
              <Route 
                path="/event-coordinator-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_EVENT_COORDINATOR']}>
                    <EventCoordinatorDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Module 2: Venue Operations Manager Dashboard */}
              <Route 
                path="/venue-manager-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_VENUE_MANAGER']}>
                    <VenueManagerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Module 5: HR & Resource Manager Dashboard */}
              <Route 
                path="/hr-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_HR_MANAGER']}>
                    <HRManagerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Module 6: Admin & General Manager Suite */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
