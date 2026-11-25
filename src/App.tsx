import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicSite } from './PublicSite';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useCart } from './contexts/CartContext';

const lazyNamed = <T extends React.ComponentType<any>>(
  loader: () => Promise<Record<string, any>>,
  name: string
) => lazy(() => loader().then((m) => ({ default: m[name] as T })));

const CartDrawer = lazyNamed(() => import('./components/CartDrawer'), 'CartDrawer');
const Login = lazyNamed(() => import('./pages/Login'), 'Login');
const Register = lazyNamed(() => import('./pages/Register'), 'Register');
const Profile = lazyNamed(() => import('./pages/Profile'), 'Profile');

// Admin bundle is code-split so public voters never download admin code
const AdminLayout = lazyNamed(() => import('./admin/AdminLayout'), 'AdminLayout');
const Dashboard = lazyNamed(() => import('./admin/Dashboard'), 'Dashboard');
const HeroManager = lazyNamed(() => import('./admin/HeroManager'), 'HeroManager');
const MediaLibrary = lazyNamed(() => import('./admin/MediaLibrary'), 'MediaLibrary');
const GalleryManager = lazyNamed(() => import('./admin/GalleryManager'), 'GalleryManager');
const MerchManager = lazyNamed(() => import('./admin/MerchManager'), 'MerchManager');
const EventsManager = lazyNamed(() => import('./admin/EventsManager'), 'EventsManager');
const BookingsManager = lazyNamed(() => import('./admin/BookingsManager'), 'BookingsManager');
const DestinationsManager = lazyNamed(() => import('./admin/DestinationsManager'), 'DestinationsManager');
const PackagesManager = lazyNamed(() => import('./admin/PackagesManager'), 'PackagesManager');
const RoadTripsManager = lazyNamed(() => import('./admin/RoadTripsManager'), 'RoadTripsManager');
const TestimonialsManager = lazyNamed(() => import('./admin/TestimonialsManager'), 'TestimonialsManager');
const MessagesManager = lazyNamed(() => import('./admin/MessagesManager'), 'MessagesManager');
const BlogManager = lazyNamed(() => import('./admin/BlogManager'), 'BlogManager');
const UsersManager = lazyNamed(() => import('./admin/UsersManager'), 'UsersManager');
const SettingsManager = lazyNamed(() => import('./admin/SettingsManager'), 'SettingsManager');
const HomepageManager = lazyNamed(() => import('./admin/HomepageManager'), 'HomepageManager');

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-[#070707]">
      <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function LazyCartDrawer() {
  const { isCartOpen } = useCart();
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (isCartOpen) setHasOpened(true);
  }, [isCartOpen]);

  if (!hasOpened) return null;

  return (
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
  );
}

export default function App() {
  return (
    <>
      <LazyCartDrawer />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<PublicSite />} />
          {/* Direct section routes pointing to PublicSite */}
          <Route path="/home" element={<PublicSite />} />
          <Route path="/experiences" element={<PublicSite />} />
          <Route path="/packages" element={<PublicSite />} />
          <Route path="/adventures" element={<PublicSite />} />
          <Route path="/destinations" element={<PublicSite />} />
          <Route path="/gallery" element={<PublicSite />} />
          <Route path="/events" element={<PublicSite />} />
          <Route path="/merch" element={<PublicSite />} />
          <Route path="/about" element={<PublicSite />} />
          <Route path="/contact" element={<PublicSite />} />

          {/* Auth & User Account Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="hero" element={<HeroManager />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="merch" element={<MerchManager />} />
            <Route path="events" element={<EventsManager />} />
            <Route path="bookings" element={<BookingsManager />} />
            <Route path="destinations" element={<DestinationsManager />} />
            <Route path="packages" element={<PackagesManager />} />
            <Route path="road-trips" element={<RoadTripsManager />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="messages" element={<MessagesManager />} />
            <Route path="blog" element={<BlogManager />} />
            <Route path="users" element={<UsersManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="polls" element={<HomepageManager initialTab="features" />} />
            <Route path="homepage" element={<HomepageManager />} />
          </Route>

          {/* Catch-all fallback: redirect any unknown URL to home instead of showing 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
