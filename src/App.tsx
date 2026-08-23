import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicSite } from './PublicSite';
import { AdminLayout } from './admin/AdminLayout';
import { Dashboard } from './admin/Dashboard';
import { HeroManager } from './admin/HeroManager';
import { MediaLibrary } from './admin/MediaLibrary';
import { GalleryManager } from './admin/GalleryManager';
import { MerchManager } from './admin/MerchManager';
import { EventsManager } from './admin/EventsManager';
import { BookingsManager } from './admin/BookingsManager';
import { DestinationsManager } from './admin/DestinationsManager';
import { PackagesManager } from './admin/PackagesManager';
import { RoadTripsManager } from './admin/RoadTripsManager';
import { TestimonialsManager } from './admin/TestimonialsManager';
import { MessagesManager } from './admin/MessagesManager';
import { BlogManager } from './admin/BlogManager';
import { UsersManager } from './admin/UsersManager';
import { SettingsManager } from './admin/SettingsManager';
import { HomepageManager } from './admin/HomepageManager';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout />
        </ProtectedRoute>
      }>
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
        <Route path="homepage" element={<HomepageManager />} />
      </Route>
    </Routes>
  );
}
