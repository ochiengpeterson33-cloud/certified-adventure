import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { OurExperiences } from './components/OurExperiences';
import { AdventuresSection } from './components/AdventuresSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FeatureBar } from './components/FeatureBar';
import { UpcomingEvents } from './components/UpcomingEvents';
import { GalleryMasonry } from './components/GalleryMasonry';
import { MerchStore } from './components/MerchStore';
import { TestimonialsCarousel } from './components/TestimonialsCarousel';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ExperienceItem } from './types';

const ExperienceModal = lazy(() =>
  import('./components/ExperienceModal').then((m) => ({ default: m.ExperienceModal }))
);
const BookingModal = lazy(() =>
  import('./components/BookingModal').then((m) => ({ default: m.BookingModal }))
);
const CustomTripBuilder = lazy(() =>
  import('./components/CustomTripBuilder').then((m) => ({ default: m.CustomTripBuilder }))
);

export function PublicSite() {
  const location = useLocation();
  const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);

  const [hasOpenedExperience, setHasOpenedExperience] = useState(false);
  const [hasOpenedBooking, setHasOpenedBooking] = useState(false);
  const [hasOpenedAiPlanner, setHasOpenedAiPlanner] = useState(false);

  const [bookingDestination, setBookingDestination] = useState<string>('Maasai Mara');
  const [bookingPackageTitle, setBookingPackageTitle] = useState<string>('');

  const [filterDestination, setFilterDestination] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    if (selectedExperience) setHasOpenedExperience(true);
  }, [selectedExperience]);

  useEffect(() => {
    if (isBookingModalOpen) setHasOpenedBooking(true);
  }, [isBookingModalOpen]);

  useEffect(() => {
    if (isAiPlannerOpen) setHasOpenedAiPlanner(true);
  }, [isAiPlannerOpen]);

  // Handle section scrolling on page mount or refresh
  useEffect(() => {
    const rawPath = location.pathname.replace(/^\//, '');
    const rawHash = location.hash.replace(/^#/, '');
    const sectionMap: Record<string, string> = {
      experiences: 'experiences',
      adventures: 'packages',
      packages: 'packages',
      destinations: 'destinations',
      gallery: 'gallery',
      events: 'events',
      merch: 'merch',
      about: 'about',
      contact: 'contact',
      home: 'home',
    };

    const target = sectionMap[rawHash] || sectionMap[rawPath];
    if (target) {
      const timer = setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const handleOpenBookingModal = (destination?: string, packageTitle?: string) => {
    if (destination) setBookingDestination(destination);
    if (packageTitle) setBookingPackageTitle(packageTitle);
    setHasOpenedBooking(true);
    setIsBookingModalOpen(true);
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterExperience = (destination: string, type: string) => {
    setFilterDestination(destination);
    setFilterType(type);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 dark:bg-[#070707] dark:text-white font-['Inter',sans-serif] selection:bg-[#FF6A00] selection:text-white relative transition-colors duration-300">
      {/* Sophisticated Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none bg-ambient-glow opacity-20 dark:opacity-40 z-0" />

      {/* Navigation Header */}
      <Navbar
        onOpenBookingModal={handleOpenBookingModal}
        onNavigateSection={handleNavigateSection}
      />

      {/* Hero Section */}
      <Hero
        onOpenBookingModal={handleOpenBookingModal}
        onNavigateSection={handleNavigateSection}
        onFilterExperience={handleFilterExperience}
        onOpenAiPlanner={() => {
          setHasOpenedAiPlanner(true);
          setIsAiPlannerOpen(true);
        }}
      />

      {/* Feature Bar / Community Voting */}
      <FeatureBar />

      {/* Our Experiences Section */}
      <OurExperiences onOpenBookingModal={handleOpenBookingModal} />

      {/* Adventures Section */}
      <AdventuresSection onOpenBookingModal={handleOpenBookingModal} />

      {/* Why Choose Us / About */}
      <WhyChooseUs />

      {/* Special Events */}
      <UpcomingEvents onOpenBookingModal={handleOpenBookingModal} />

      {/* Merch Store */}
      <MerchStore />

      {/* Photo Gallery Masonry & Lightbox */}
      <GalleryMasonry />

      {/* Verified Guest Testimonials */}
      <TestimonialsCarousel />

      {/* Contact & Newsletter Section */}
      <ContactSection />

      {/* Brand Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenBookingModal={() => handleOpenBookingModal()}
      />

      {/* Lazy-Loaded Interactive Modals (only downloaded & mounted when opened) */}
      {hasOpenedExperience && (
        <Suspense fallback={null}>
          <ExperienceModal
            experience={selectedExperience}
            onClose={() => setSelectedExperience(null)}
            onOpenBookingModal={handleOpenBookingModal}
          />
        </Suspense>
      )}

      {hasOpenedBooking && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            destination={bookingDestination}
            packageTitle={bookingPackageTitle}
          />
        </Suspense>
      )}

      {hasOpenedAiPlanner && (
        <Suspense fallback={null}>
          <CustomTripBuilder
            isOpen={isAiPlannerOpen}
            onClose={() => setIsAiPlannerOpen(false)}
            onOpenBookingModal={handleOpenBookingModal}
          />
        </Suspense>
      )}
    </div>
  );
}
