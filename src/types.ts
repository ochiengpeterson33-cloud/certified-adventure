export type ExperienceCategory = 
  | 'All'
  | 'Road Trips'
  | 'Adventures'
  | 'Tours'
  | 'Travel Packages'
  | 'Weekend Escapes'
  | 'Camping'
  | 'Hiking'
  | 'Corporate Travel';

export interface DayItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  mealsIncluded: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  category: ExperienceCategory;
  tagline: string;
  location: string;
  region: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  seatsRemaining: number;
  totalSeats: number;
  nextDeparture: string;
  image: string;
  gallery: string[];
  description: string;
  highlights: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  included: string[];
  notIncluded: string[];
  itinerary: DayItinerary[];
  featured?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  tagline: string;
  region: string;
  image: string;
  packageCount: number;
  bestTime: string;
  highlight: string;
  rating: number;
  popularFor: string[];
}

export interface RoadTripTimeline {
  id: string;
  title: string;
  date: string;
  location: string;
  seatsRemaining: number;
  totalSeats: number;
  price: number;
  route: string;
  vehicleType: string;
  status: 'Booking Open' | 'Few Seats Left' | 'Sold Out';
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  trip: string;
  rating: number;
  reviewText: string;
  date: string;
  verified: boolean;
}

export interface FAQ {
  id: string;
  category: 'Booking & Payments' | 'Safety & Guides' | 'Road Trips & Vehicles' | 'Packing & Preparation' | 'Custom Trips';
  question: string;
  answer: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  location: string;
  category: 'Wildlife' | 'Road Trips' | 'Landscapes' | 'Camping' | 'Luxury Stay';
  image: string;
  photographer?: string;
}

export interface BookingFormState {
  fullName: string;
  email: string;
  phone: string;
  destination: string;
  travelDate: string;
  guests: number;
  travelType: ExperienceCategory;
  budgetPerPerson: number;
  specialRequests: string;
}
