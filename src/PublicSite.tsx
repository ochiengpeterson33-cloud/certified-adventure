import React, { useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
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
import { ExperienceModal } from './components/ExperienceModal';
import { BookingModal } from './components/BookingModal';
import { CustomTripBuilder } from './components/CustomTripBuilder';
import { AudioAmbienceToggle } from './components/AudioAmbienceToggle';
import { ExperienceItem } from './types';

export function PublicSite() {
  const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  
  const [bookingDestination, setBookingDestination] = useState<string>('Maasai Mara');
  const [bookingPackageTitle, setBookingPackageTitle] = useState<string>('');

  const [filterDestination, setFilterDestination] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const handleOpenBookingModal = (destination?: string, packageTitle?: string) => {
    if (destination) setBookingDestination(destination);
    if (packageTitle) setBookingPackageTitle(packageTitle);
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

  const handleSelectDestinationFromGrid = (destName: string) => {
    setFilterDestination(destName);
    handleNavigateSection('packages');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white font-['Inter',sans-serif] selection:bg-[#FF6A00] selection:text-white relative">
      {/* Sophisticated Dark Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none bg-ambient-glow opacity-40 z-0" />

      {/* Brand Intro Loading Screen */}
      <LoadingScreen />

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
        onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
      />

      {/* Feature Bar */}
      <FeatureBar />

      {/* Our Experiences Section */}
      <OurExperiences />

      {/* Adventures Section */}
      <AdventuresSection onOpenBookingModal={handleOpenBookingModal} />

      {/* Why Choose Us / About */}
      <WhyChooseUs />

      {/* Special Events */}
      <UpcomingEvents />

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

      {/* Modals */}
      <ExperienceModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
        onOpenBookingModal={handleOpenBookingModal}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        destination={bookingDestination}
        packageTitle={bookingPackageTitle}
      />

      <CustomTripBuilder
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        onOpenBookingModal={handleOpenBookingModal}
      />

      {/* Optional Ambient Nature Sound Synth Toggle */}
      <AudioAmbienceToggle />
    </div>
  );
}
