import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { usePageTracker } from './hooks/usePageTracker';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Customize from './pages/Customize';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Story from './pages/Story';
import SplitPosters from './pages/SplitPosters';
import BulkInquiry from './pages/BulkInquiry';
import BulkInquiryForm from './pages/Bulkinquiryform ';
import AuthCallback from './pages/AuthCallback';
import Reviews from './pages/Reviews ';
import SetPassword from './pages/SetPassword';
import ForgotPassword from './pages/ForgotPassword';
import MetallicPosters from './pages/Metallicposters ';
import Help from './pages/Help';
import Frames from './pages/Frames';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (!user.is_admin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function AppContent() {
  usePageTracker();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/bulk-inquiry" element={<BulkInquiry/>} />
          <Route path="/bulk-inquiry/form" element={<BulkInquiryForm />} />
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Shop />} />
          <Route path="/shop" element={<Navigate to="/collection" />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/story" element={<Navigate to="/" />} />
          <Route path="/help" element={<Help />} />
          <Route path="/split-posters" element={<SplitPosters/>}/>
          <Route path="/reviews" element={<Reviews/>}/>
          <Route path="/frames" element={<Frames />} />
          <Route path="/faqs" element={<Help />} />
          <Route path="/metalic-posters" element={<MetallicPosters/>}/>
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
