import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OtpVerification from './pages/OtpVerification';
import ForgotPassword from './pages/ForgotPassword';
import PasswordOtp from './pages/PasswordOtp';
import PasswordResetSuccess from './pages/PasswordResetSuccess';
import Categories from './pages/Categories';
import Category from './pages/Category';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import ListingsPage from './pages/ListingsPage';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import EditPassword from './pages/EditPassword';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageListings from './pages/ManageListings';
import Reports from './pages/Reports';
import Forbidden from './pages/Forbidden';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import { api } from './api/client';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="about-bidbazaar" element={<About />} />

        {/* Auth */}
        <Route path="account/login" element={<Login />} />
        <Route path="account/register" element={<Register />} />
        <Route path="account/verify-otp" element={<OtpVerification />} />
        <Route path="account/forgot-password" element={<ForgotPassword />} />
        <Route path="account/forgot-password/verify-otp" element={<PasswordOtp />} />
        <Route path="account/password-reset-successful" element={<PasswordResetSuccess />} />
        <Route path="access/forbidden" element={<Forbidden />} />

        {/* Auctions */}
        <Route path="auctions/browse-categories" element={<Categories />} />
        <Route path="auctions/browse-categories/:category" element={<Category />} />
        <Route path="auctions/listing-detail/:id" element={<ListingDetail />} />

        {/* User */}
        <Route path="auctions/create-new-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path="dashboard/my-active-listings" element={<ProtectedRoute><ListingsPage title="Your Listings" fetchFn={api.yourListings} /></ProtectedRoute>} />
        <Route path="dashboard/my-won-auctions" element={<ProtectedRoute><ListingsPage title="Won Auctions" fetchFn={api.wonListings} /></ProtectedRoute>} />
        <Route path="dashboard/my-watchlist" element={<ProtectedRoute><ListingsPage title="Watch List" fetchFn={api.watchList} /></ProtectedRoute>} />
        <Route path="account/my-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="account/my-profile/edit-details" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="account/my-profile/change-password" element={<ProtectedRoute><EditPassword /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="admin/control-panel/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="admin/control-panel/manage-users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
        <Route path="admin/control-panel/manage-listings" element={<AdminRoute><ManageListings /></AdminRoute>} />
        <Route path="admin/control-panel/reports-analytics" element={<AdminRoute><Reports /></AdminRoute>} />

        {/* Legacy redirects */}
        <Route path="login" element={<Navigate to="/account/login" replace />} />
        <Route path="register" element={<Navigate to="/account/register" replace />} />
        <Route path="categories" element={<Navigate to="/auctions/browse-categories" replace />} />
        <Route path="listing/:id" element={<Navigate to="/auctions/listing-detail/:id" replace />} />
        <Route path="profile" element={<Navigate to="/account/my-profile" replace />} />
        <Route path="admin-dashboard" element={<Navigate to="/admin/control-panel/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
