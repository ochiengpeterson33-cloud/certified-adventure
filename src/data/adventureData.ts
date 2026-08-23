import { ExperienceItem, Destination, RoadTripTimeline, Testimonial, FAQ, GalleryImage } from '../types';

export const EXPERIENCES_DATA: ExperienceItem[] = [
  {
    id: 'maasai-mara-luxury-overland',
    title: '3-Day Great Maasai Mara Safari & Luxury Camp',
    category: 'Tours',
    tagline: 'Experience the world-renowned Big Five in ultimate comfort',
    location: 'Maasai Mara National Reserve',
    region: 'Rift Valley',
    duration: '3 Days / 2 Nights',
    price: 450,
    originalPrice: 520,
    rating: 4.9,
    reviewsCount: 184,
    seatsRemaining: 4,
    totalSeats: 12,
    nextDeparture: 'Aug 15, 2026',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519060205001-37034401ac04?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Immerse yourself in Kenya\'s undisputed jewel of wildlife safaris. Travel in our premium 4x4 Land Cruisers with pop-up roofs, stay at certified eco-luxury tented camps with hot showers and gourmet dinners under starry skies.',
    highlights: [
      'Full day game drive across Mara River & Savannah',
      'Certified Senior KPSGA Wildlife Guides',
      'Luxury Tented Accommodation with En-suite Facilities',
      'Optional Sunrise Hot Air Balloon Safari',
      'Authentic Cultural Visit to a Maasai Village'
    ],
    difficulty: 'Easy',
    included: [
      'Transport in 4x4 Luxury Safari Cruiser',
      '2 Nights Accommodation at Luxury Tented Camp',
      'All meals (Breakfast, Lunch, Dinner)',
      'Game drives with certified guides',
      'Bottled drinking water throughout',
      'Park Entrance Fees & Taxes'
    ],
    notIncluded: [
      'Hot Air Balloon Ride ($450 optional)',
      'Alcoholic & Premium Soft Drinks',
      'Personal travel insurance',
      'Tips & Gratuities'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Nairobi to Maasai Mara & Evening Game Drive',
        description: 'Depart Nairobi early morning, drive through the scenic Great Rift Valley viewpoint. Arrive at camp in time for lunch. Afternoon game drive in search of lions, cheetahs, and elephants.',
        activities: ['Rift Valley Viewpoint Stop', 'Check-in & Gourmet Lunch', 'Sunset Game Drive'],
        mealsIncluded: 'Lunch, Dinner'
      },
      {
        day: 2,
        title: 'Full Day Game Drive & Mara River Expedition',
        description: 'Spend the full day tracking the Big Five across vast golden plains. Enjoy a bush picnic lunch overlooking the crocodile and hippo-filled Mara River.',
        activities: ['Dawn Sunrise Game Drive', 'Mara River Picnic Lunch', 'Big Five Tracking Expedition'],
        mealsIncluded: 'Breakfast, Bush Lunch, Dinner'
      },
      {
        day: 3,
        title: 'Morning Bush Walk & Return to Nairobi',
        description: 'Early morning nature walk or Maasai Village cultural encounter. Enjoy a hearty breakfast before starting the comfortable return journey to Nairobi.',
        activities: ['Maasai Cultural Village Visit', 'Farewell Breakfast', 'Scenic Return Drive'],
        mealsIncluded: 'Breakfast'
      }
    ],
    featured: true
  },
  {
    id: 'diani-coastal-road-trip',
    title: '4-Day Diani Beach Luxury Coast Road Trip',
    category: 'Road Trips',
    tagline: 'Sun, white sand beaches, and scenic coastal road trip thrills',
    location: 'Diani Beach & Wasini Island',
    region: 'Coast',
    duration: '4 Days / 3 Nights',
    price: 380,
    originalPrice: 440,
    rating: 4.95,
    reviewsCount: 142,
    seatsRemaining: 6,
    totalSeats: 16,
    nextDeparture: 'Aug 22, 2026',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Voted Africa\'s leading beach destination multiple times! Take a comfortable overland road trip down to Diani Beach, featuring luxury beachfront resort stay, dhow boat cruising with wild dolphins, and Wasini Island seafood feasting.',
    highlights: [
      'Luxury Overland Transport with Wi-Fi & Reclining Comfort Seats',
      '4-Star Beachfront Resort Stay with Pool & Ocean Access',
      'Dolphin Spotting Dhow Boat Cruise at Kisite-Mpunguti',
      'Wasini Coral Island Seafood & Snorkeling Experience',
      'Sunset Beach Bonfire & Live Acoustic Music Night'
    ],
    difficulty: 'Easy',
    included: [
      'Return VIP Comfort Road Trip Overland Transport',
      '3 Nights Resort Accommodation',
      'Daily Breakfast & Dinner',
      'Kisite Mpunguti Marine Park Boat Cruise & Snorkeling',
      'Beach BBQ Dinner Event'
    ],
    notIncluded: [
      'Personal Jet-ski / Skydiving extras',
      'Lunches outside specified events',
      'Personal items'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Overland Road Trip to Diani Beach',
        description: 'Depart Nairobi early morning, enjoy scenic highway views, cross via Likoni ferry or new Diani bypass, check into beachfront resort.',
        activities: ['Scenic Road Trip', 'Welcome Tropical Cocktail', 'Sunset Dip in Indian Ocean'],
        mealsIncluded: 'Dinner'
      },
      {
        day: 2,
        title: 'Wasini Island Dolphin Cruise & Snorkeling',
        description: 'Board a traditional Arabian dhow, sail alongside wild dolphins, snorkel in crystal clear marine park waters, enjoy fresh seafood lunch.',
        activities: ['Dolphin Spotting', 'Snorkeling Coral Reefs', 'Fresh Seafood Feast on Wasini Island'],
        mealsIncluded: 'Breakfast, Seafood Lunch, Dinner'
      },
      {
        day: 3,
        title: 'Water Sports & Beach Bonfire Party',
        description: 'Relaxed beach morning, option for jet-skiing or glass-bottom boat tours, followed by a romantic campfire evening on white sand.',
        activities: ['Beach Relaxation & Water Sports', 'Sunset Cocktail Hour', 'Campfire & Swahili BBQ'],
        mealsIncluded: 'Breakfast, Dinner'
      },
      {
        day: 4,
        title: 'Souvenir Shopping & Return Trip',
        description: 'Morning beach stroll, craft shopping, and comfortable return road trip with scenic photo stops along the highway.',
        activities: ['Morning Ocean Swim', 'Craft Market Tour', 'Return Overland Journey'],
        mealsIncluded: 'Breakfast'
      }
    ],
    featured: true
  },
  {
    id: 'mt-kenya-chogoria-summit-trek',
    title: '4-Day Mount Kenya Chogoria Route Trekking Expedition',
    category: 'Hiking',
    tagline: 'Scale Africa’s second highest peak along its most breathtaking route',
    location: 'Mount Kenya National Park',
    region: 'Central',
    duration: '4 Days / 3 Nights',
    price: 490,
    originalPrice: 560,
    rating: 4.88,
    reviewsCount: 96,
    seatsRemaining: 5,
    totalSeats: 10,
    nextDeparture: 'Sep 02, 2026',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Ascend Point Lenana (4,985m) via the stunning Chogoria route. Hike past Lake Michaelson, Gorges Valley, and dramatic vertical cliffs with certified high-altitude guides, porters, and mountain chefs.',
    highlights: [
      'Summit Point Lenana at 4,985m for sunrise views',
      'Walk past Lake Michaelson & Temple Cliff waterfall',
      'Full mountain team (Guides, Porters, Private Chef)',
      'High alpine flora & endemic Giant Lobelia species',
      'High quality mountain camping gear provided'
    ],
    difficulty: 'Challenging',
    included: [
      'Roundtrip transport from Nairobi to Mount Kenya Gate',
      'All Mount Kenya National Park entry fees & camping permits',
      'Certified Mountain Guides, Porters (up to 12kg per hiker)',
      '3 meals a day prepared by mountain chef',
      '4-Season Camping Tents & Sleeping Pads'
    ],
    notIncluded: [
      'Personal high altitude clothing (warm jacket, boots)',
      'Sleeping bag (rental available at $20)',
      'Guide & Porter tips'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Nairobi to Chogoria Gate & Meru Bandas (3,000m)',
        description: 'Drive from Nairobi to Chogoria town, transfer to 4x4 mountain vehicles to reach Chogoria Gate. Warm up hike to Meru Bandas.',
        activities: ['Scenic mountain road trip', 'Acclimatization hike', 'Hot mountain dinner'],
        mealsIncluded: 'Lunch, Dinner'
      },
      {
        day: 2,
        title: 'Trek through Gorges Valley to Lake Michaelson (4,000m)',
        description: 'Spectacular trek past Vivian Falls and high cliffs into Gorges Valley. Camp next to the pristine alpine Lake Michaelson.',
        activities: ['High alpine hiking', 'Lake Michaelson photography', 'Stargazing at camp'],
        mealsIncluded: 'Breakfast, Picnic Lunch, Dinner'
      },
      {
        day: 3,
        title: 'Summit Point Lenana (4,985m) & Descend to Shipton Camp',
        description: 'Midnight summit attempt. Reach Point Lenana at dawn as the sun rises over Mount Kilimanjaro in the distance. Descend to Shipton Camp.',
        activities: ['Summit Sunrise Push', '360 Summit Views', 'Descend to Shipton Camp'],
        mealsIncluded: 'Breakfast, Lunch, Dinner'
      },
      {
        day: 4,
        title: 'Descend Sirimon Gate & Transfer to Nairobi',
        description: 'Gentle final descent through bamboo forest down Sirimon route. Meet our luxury vehicle and return to Nairobi comfortably.',
        activities: ['Descent through Bamboo Forest', 'Celebratory Summit Certificate', 'Return to Nairobi'],
        mealsIncluded: 'Breakfast, Celebration Lunch'
      }
    ],
    featured: true
  },
  {
    id: 'amboseli-kilimanjaro-view-overland',
    title: '3-Day Amboseli Kilimanjaro Safari & Big Tuskers',
    category: 'Travel Packages',
    tagline: 'Witness giant elephant herds framed by snow-capped Kilimanjaro',
    location: 'Amboseli National Park',
    region: 'Rift Valley',
    duration: '3 Days / 2 Nights',
    price: 390,
    originalPrice: 450,
    rating: 4.92,
    reviewsCount: 110,
    seatsRemaining: 8,
    totalSeats: 14,
    nextDeparture: 'Aug 28, 2026',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Get postcard-perfect photos of massive African elephant herds against the iconic backdrop of Mount Kilimanjaro. Enjoy luxury lodge accommodation, observation hill panoramas, and swamp wildlife watching.',
    highlights: [
      'Panoramic views of Mount Kilimanjaro summit',
      'Up-close encounters with legendary Super Tuskers',
      'Observation Hill 360-degree swamp & marshland lookout',
      'Luxury Safari Lodge with infinity pool',
      'Sundowner drinks overlooking the savannah'
    ],
    difficulty: 'Easy',
    included: [
      'Transport in Executive Safari Land Cruiser',
      '2 Nights Accommodation at Safari Lodge',
      'All meals on full board basis',
      'Park Entrance Fees',
      'Complimentary Sundowner Cocktail'
    ],
    notIncluded: [
      'Personal expenses',
      'Gratuities'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Nairobi to Amboseli & Afternoon Safari',
        description: 'Drive south through Namanga route, check in to lodge with Kilimanjaro views. Enjoy afternoon game drive searching for big tuskers.',
        activities: ['Overland Safari Drive', 'Lodge check-in & Lunch', 'Sunset Game Drive'],
        mealsIncluded: 'Lunch, Dinner'
      },
      {
        day: 2,
        title: 'Full Day Amboseli Wildlife Expedition',
        description: 'Dawn game drive while Kilimanjaro snow peak is clear. Climb Observation Hill for scenic brunch picnic, explore Enkongo Narok swamps.',
        activities: ['Clear Peak Sunrise Game Drive', 'Observation Hill Brunch', 'Swamp Birding & Hippo Watching'],
        mealsIncluded: 'Breakfast, Lunch, Dinner'
      },
      {
        day: 3,
        title: 'Morning Bush Drive & Departure',
        description: 'Final morning game drive, breakfast at lodge, and leisurely return journey back to Nairobi.',
        activities: ['Dawn Game Drive', 'Lodge Breakfast', 'Scenic Return Drive'],
        mealsIncluded: 'Breakfast'
      }
    ],
    featured: true
  },
  {
    id: 'naivasha-hellsgate-cycling-camp',
    title: 'Weekend Naivasha Lake Boat & Hell’s Gate Bike Safari',
    category: 'Weekend Escapes',
    tagline: 'Cycle alongside zebras & giraffes, hike dramatic gorges, and cruise with hippos',
    location: 'Lake Naivasha & Hell’s Gate',
    region: 'Rift Valley',
    duration: '2 Days / 1 Night',
    price: 180,
    originalPrice: 220,
    rating: 4.87,
    reviewsCount: 230,
    seatsRemaining: 7,
    totalSeats: 20,
    nextDeparture: 'Aug 16, 2026',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'The ultimate weekend getaway! Rent mountain bikes inside Hell\'s Gate National Park to cycle next to grazing wildlife, hike Ol Njorowa gorge, and take a sunset boat ride on Lake Naivasha to Crescent Island.',
    highlights: [
      'Guided mountain biking inside Hell’s Gate National Park',
      'Ol Njorowa Gorge natural hot springs hike',
      'Sunset Speedboat Safari on Lake Naivasha',
      'Crescent Island Walking Safari with wild giraffes',
      'Lakeside luxury camp with campfire dinner'
    ],
    difficulty: 'Moderate',
    included: [
      'Roundtrip overland transport',
      '1 Night Accommodation (Glamping / Resort)',
      'All Meals (Sat Lunch to Sun Lunch)',
      'Bike Rental & Helmet',
      'Boat Ride Ticket & Park Entry Fees'
    ],
    notIncluded: [
      'Personal drinks',
      'Optional Crescent Island walk fee ($30)'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hell’s Gate Bike Safari & Gorge Exploration',
        description: 'Depart Nairobi 7:00 AM, arrive Naivasha gate, pick up bikes and cycle 8km through Fischer’s Tower to the gorge. Guided trek through geothermal springs.',
        activities: ['Mountain Bike Safari', 'Gorge Trekking', 'Campfire BBQ Dinner'],
        mealsIncluded: 'Lunch, Dinner'
      },
      {
        day: 2,
        title: 'Lake Naivasha Boat Ride & Crescent Island',
        description: 'Breakfast by the lake, 1-hour boat tour spotting fish eagles and hippos. Walk amongst roaming herbivores on Crescent Island before returning to Nairobi.',
        activities: ['Hippos & Fish Eagle Boat Safari', 'Crescent Island Walk', 'Return to Nairobi'],
        mealsIncluded: 'Breakfast, Lunch'
      }
    ],
    featured: false
  },
  {
    id: 'aberdare-waterfalls-glamping',
    title: '2-Day Aberdare Waterfall Hike & Wilderness Glamping',
    category: 'Camping',
    tagline: 'Cool mountain air, thunderous waterfalls, and luxury glamping tents',
    location: 'Aberdare National Park',
    region: 'Central',
    duration: '2 Days / 1 Night',
    price: 210,
    originalPrice: 250,
    rating: 4.91,
    reviewsCount: 88,
    seatsRemaining: 5,
    totalSeats: 12,
    nextDeparture: 'Aug 29, 2026',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Hike through misty moorlands to Kenya\'s highest waterfall (Karuru Falls - 273m). Spend an enchanting night in canvas glamping tents equipped with real mattresses, warm duvets, and gourmet campfire cooking.',
    highlights: [
      'Karuru & Chania Waterfalls scenic hike',
      'High-altitude moorlands & trout fishing streams',
      'Luxury Glamping setup with bonfire & wine tasting',
      'Armed ranger guided wilderness walk',
      'Bongo antelope & black rhino tracking'
    ],
    difficulty: 'Moderate',
    included: [
      '4x4 Land Cruiser Mountain Transport',
      '1 Night Glamping Stay (Mattress, Duvet, Solar Light)',
      'Chef prepared meals & Campfire Barbecue',
      'Park fees & Ranger fees'
    ],
    notIncluded: ['Personal warm winter gear', 'Tips'],
    itinerary: [
      {
        day: 1,
        title: 'Nairobi to Aberdare Moorlands & Karuru Falls Hike',
        description: 'Ascend into the cool misty cloud forest. Hike to Karuru Falls lookout and Chania Falls. Camp setup under giant heather trees with bonfire roast.',
        activities: ['Moorland Trek', 'Waterfall Viewpoint Photography', 'Campfire Roast & Acoustic Music'],
        mealsIncluded: 'Lunch, Dinner'
      },
      {
        day: 2,
        title: 'Morning Forest Walk & Return',
        description: 'Wake up to crisp mountain air and hot brewed Kenyan coffee. Guided nature walk looking for rare mountain wildlife before departing.',
        activities: ['Guided Forest Walk', 'Hearty Camp Breakfast', 'Return Road Trip'],
        mealsIncluded: 'Breakfast, Lunch'
      }
    ],
    featured: false
  },
  {
    id: 'samburu-special-five-expedition',
    title: '3-Day Samburu Wild Reserve & Special Five Safari',
    category: 'Adventures',
    tagline: 'Discover the northern frontier, reticulated giraffes, and Ewaso Nyiro River',
    location: 'Samburu National Reserve',
    region: 'Northern Kenya',
    duration: '3 Days / 2 Nights',
    price: 460,
    originalPrice: 530,
    rating: 4.94,
    reviewsCount: 76,
    seatsRemaining: 6,
    totalSeats: 12,
    nextDeparture: 'Sep 10, 2026',
    image: 'https://images.unsplash.com/photo-1519060205001-37034401ac04?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519060205001-37034401ac04?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Venture beyond Mount Kenya into the dry dramatic landscapes of Samburu. Home to the unique "Samburu Special Five": Grevy\'s Zebra, Somal Ostrich, Reticulated Giraffe, Gerenuk, and Beisa Oryx.',
    highlights: [
      'Track the Samburu Special Five species',
      'Ewaso Nyiro River elephant bathing sightings',
      'Luxury Riverside Lodge accommodation',
      'Samburu Cultural Singing & Dancing encounter'
    ],
    difficulty: 'Easy',
    included: ['4x4 Land Cruiser Transport', '2 Nights Luxury River Lodge', 'All Meals', 'Park Entrance Fees'],
    notIncluded: ['Alcoholic drinks', 'Personal tips'],
    itinerary: [
      {
        day: 1,
        title: 'Nairobi to Samburu via Mount Kenya',
        description: 'Drive past pineapple plantations and northern plains. Check into riverside lodge, afternoon game drive along Ewaso Nyiro.',
        activities: ['North Highway Road Trip', 'Lodge Check-in', 'Ewaso Nyiro Game Drive'],
        mealsIncluded: 'Lunch, Dinner'
      },
      {
        day: 2,
        title: 'Full Day Samburu Special Five Safari',
        description: 'Track Gerenuk standing on hind legs to eat acacia leaves, observe reticulated giraffes and leopards along the riverbanks.',
        activities: ['Full Day Safari', 'Bush Lunch', 'Samburu Cultural Evening'],
        mealsIncluded: 'Breakfast, Lunch, Dinner'
      },
      {
        day: 3,
        title: 'Morning Safari & Journey South',
        description: 'Dawn game drive for predators, breakfast overlooking the river, return road trip to Nairobi.',
        activities: ['Dawn Game Drive', 'Breakfast', 'Return Trip'],
        mealsIncluded: 'Breakfast'
      }
    ],
    featured: false
  },
  {
    id: 'corporate-team-building-naivasha',
    title: 'Certified Executive Corporate Team Building & Safari Retreat',
    category: 'Corporate Travel',
    tagline: 'High-impact team building, luxury lodge hosting, leadership workshops & road trip',
    location: 'Great Rift Valley Lodge, Naivasha',
    region: 'Rift Valley',
    duration: '3 Days / 2 Nights',
    price: 520,
    originalPrice: 600,
    rating: 4.98,
    reviewsCount: 64,
    seatsRemaining: 30,
    totalSeats: 50,
    nextDeparture: 'On Request (Flexible)',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Transform team dynamics with customized executive retreats. Combining professional team building facilitators, golf resort lodging, campfire networking, and safari game drives.',
    highlights: [
      'Certified Professional Team Facilitators',
      'Tailored Leadership & Trust Games',
      'Luxury Resort Lodging with Conference Facilities',
      'Sundowner Gala Dinner & Awards Night'
    ],
    difficulty: 'Easy',
    included: ['Executive Bus Transport', '2 Nights 5-Star Resort Lodging', 'Full Board Gourmet Catering', 'Facilitation & Equipment'],
    notIncluded: ['Custom customized merchandise (optional add-on)'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival, Keynote & Icebreaker Challenges',
        description: 'Executive transport arrival, lunch, welcome orientation, and initial high-energy team bonding games.',
        activities: ['VIP Transfer', 'Welcome Lunch', 'Icebreaker Games', 'Campfire Dinner'],
        mealsIncluded: 'Lunch, Dinner'
      },
      {
        day: 2,
        title: 'Obstacle Course, Strategy Challenge & Gala Dinner',
        description: 'Full day of outdoor strategy exercises, low-ropes challenges, and evening black-tie gala dinner with team awards.',
        activities: ['Strategy Challenges', 'Resort Pool Relaxation', 'Awards Gala Dinner'],
        mealsIncluded: 'Breakfast, Lunch, Dinner'
      },
      {
        day: 3,
        title: 'Boat Safari & Farewell',
        description: 'Morning Lake Naivasha boat trip, debrief session, and return trip to headquarters.',
        activities: ['Team Debrief', 'Lake Boat Safari', 'Return Transfer'],
        mealsIncluded: 'Breakfast, Lunch'
      }
    ],
    featured: false
  }
];

export const DESTINATIONS_DATA: Destination[] = [
  {
    id: 'maasai-mara',
    name: 'Maasai Mara',
    tagline: 'The Seventh Wonder of the Natural World',
    region: 'South West Kenya',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    packageCount: 14,
    bestTime: 'July - October (Migration) & All Year',
    highlight: 'Big Five & Great Wildebeest Migration',
    rating: 4.98,
    popularFor: ['Safaris', 'Hot Air Balloons', 'Luxury Tented Camps', 'Maasai Culture']
  },
  {
    id: 'diani-beach',
    name: 'Diani Beach',
    tagline: 'Africa\'s Award-Winning White Sand Paradise',
    region: 'South Coast Kenya',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    packageCount: 18,
    bestTime: 'All Year Round (Best Dec - Mar)',
    highlight: 'Dolphin Cruises, Skydiving & Turquoise Waters',
    rating: 4.95,
    popularFor: ['Coastal Road Trips', 'Water Sports', 'Seafood Dining', 'Resort Stays']
  },
  {
    id: 'mt-kenya',
    name: 'Mount Kenya',
    tagline: 'Africa\'s Second Highest Majestic Peak',
    region: 'Central Kenya Highlands',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    packageCount: 8,
    bestTime: 'Jan - Feb & July - October',
    highlight: 'Point Lenana Summit & Lake Michaelson',
    rating: 4.92,
    popularFor: ['Mountain Trekking', 'High Alpine Lakes', 'Camping', 'Photography']
  },
  {
    id: 'amboseli',
    name: 'Amboseli Park',
    tagline: 'Land of Giants Under Mount Kilimanjaro',
    region: 'Southern Kenya',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    packageCount: 10,
    bestTime: 'June - October & Dec - March',
    highlight: 'Large Elephant Herds & Kilimanjaro Backdrop',
    rating: 4.94,
    popularFor: ['Big Tuskers', 'Photography', 'Observation Hill', 'Luxury Lodges']
  },
  {
    id: 'naivasha',
    name: 'Lake Naivasha',
    tagline: 'Freshwater Haven & Bike Safaris',
    region: 'Rift Valley',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    packageCount: 16,
    bestTime: 'All Year Round',
    highlight: 'Hell’s Gate Bike Safari & Crescent Island Walking',
    rating: 4.88,
    popularFor: ['Weekend Escapes', 'Cycling', 'Boat Rides', 'Gorge Hiking']
  },
  {
    id: 'nakuru',
    name: 'Lake Nakuru',
    tagline: 'Pink Flamingo & Rhino Conservation Sanctuary',
    region: 'Rift Valley',
    image: 'https://images.unsplash.com/photo-1519060205001-37034401ac04?auto=format&fit=crop&w=800&q=80',
    packageCount: 9,
    bestTime: 'All Year Round',
    highlight: 'White & Black Rhino Sanctuary & Baboon Cliff',
    rating: 4.90,
    popularFor: ['Rhino Safaris', 'Bird Watching', 'Waterfall Cliff Views']
  },
  {
    id: 'tsavo',
    name: 'Tsavo West & East',
    tagline: 'Kenya\'s Largest Untamed Wilderness',
    region: 'South East Kenya',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    packageCount: 7,
    bestTime: 'June - October & Dec - March',
    highlight: 'Red Elephants, Mzima Springs & Lava Fields',
    rating: 4.89,
    popularFor: ['Overland Road Trips', 'Wilderness Camping', 'Natural Springs']
  },
  {
    id: 'watamu',
    name: 'Watamu Marine Park',
    tagline: 'Coral Gardens & Bioluminescent Beaches',
    region: 'North Coast Kenya',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
    packageCount: 11,
    bestTime: 'October - April',
    highlight: 'Marine Turtle Sanctuary & Coral Reef Snorkeling',
    rating: 4.96,
    popularFor: ['Deep Sea Fishing', 'Paddle Boarding', 'Kite Surfing', 'Luxury Villas']
  }
];

export const UPCOMING_ROAD_TRIPS: RoadTripTimeline[] = [
  {
    id: 'trip-mara-aug15',
    title: 'Grand Mara Wildebeest Road Expedition',
    date: 'August 15 - 17, 2026',
    location: 'Maasai Mara National Reserve',
    seatsRemaining: 4,
    totalSeats: 12,
    price: 450,
    route: 'Nairobi ➔ Narok ➔ Sekenani Gate ➔ Mara River',
    vehicleType: 'Executive 4x4 Land Cruiser',
    status: 'Few Seats Left',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'trip-diani-aug22',
    title: 'Coast Express Diani Beach Caravan',
    date: 'August 22 - 25, 2026',
    location: 'Diani Beach & Wasini',
    seatsRemaining: 6,
    totalSeats: 16,
    price: 380,
    route: 'Nairobi ➔ Mtito Andei ➔ Likoni ➔ Diani Beach',
    vehicleType: 'Luxury VIP Overland Cruiser',
    status: 'Booking Open',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'trip-naivasha-aug29',
    title: 'Naivasha Bike & Camp Weekend Escapade',
    date: 'August 29 - 30, 2026',
    location: 'Lake Naivasha & Hell\'s Gate',
    seatsRemaining: 3,
    totalSeats: 20,
    price: 180,
    route: 'Nairobi ➔ Mai Mahiu ➔ Hell’s Gate ➔ Lake Naivasha',
    vehicleType: 'Luxury Tour Bus',
    status: 'Few Seats Left',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'trip-mtkenya-sep02',
    title: 'Mount Kenya Summit Conqueror Road Trek',
    date: 'September 02 - 05, 2026',
    location: 'Mount Kenya Chogoria Gate',
    seatsRemaining: 5,
    totalSeats: 10,
    price: 490,
    route: 'Nairobi ➔ Thika ➔ Embu ➔ Chogoria ➔ Point Lenana',
    vehicleType: 'Heavy-Duty Mountain 4x4',
    status: 'Booking Open',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't-1',
    name: 'David & Sarah Jenkins',
    location: 'London, United Kingdom',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    trip: 'Maasai Mara Luxury Safari',
    rating: 5,
    reviewText: 'Certified Adventures exceeded every possible expectation! Traveling in their customized 4x4 Land Cruiser was incredibly smooth and comfortable. Our guide knew exactly where the lion pride was moving. True luxury travel in Kenya!',
    date: 'July 2026',
    verified: true
  },
  {
    id: 't-2',
    name: 'Engineer Mwangi Wachira',
    location: 'Nairobi, Kenya',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    trip: '4-Day Diani Beach Road Trip',
    rating: 5,
    reviewText: 'We booked our corporate executive retreat with Certified Adventures for 28 staff members. The coordination, food, luxury resort booking, and vehicle comfort were flawless. 10/10 recommend for any corporate or group road trip!',
    date: 'June 2026',
    verified: true
  },
  {
    id: 't-3',
    name: 'Elena Rostova',
    location: 'Munich, Germany',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    trip: 'Mount Kenya Chogoria Summit Trek',
    rating: 5,
    reviewText: 'The Chogoria route to Point Lenana was breathtaking! The mountain team prepared hot delicious meals at 4,000 meters altitude. Tents were warm and sturdy. Certified Adventures makes high-altitude hiking safe, comfortable, and magical.',
    date: 'May 2026',
    verified: true
  },
  {
    id: 't-4',
    name: 'Brian & Joy Omondi',
    location: 'Kisumu, Kenya',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    trip: 'Weekend Naivasha & Hell’s Gate',
    rating: 5,
    reviewText: 'The best weekend getaway we’ve taken as a family! Cycling in Hell’s Gate right next to zebras and taking the sunset boat ride on Lake Naivasha was unforgettable. Very professional driver and guide.',
    date: 'July 2026',
    verified: true
  }
];

export const FAQS_DATA: FAQ[] = [
  {
    id: 'faq-1',
    category: 'Booking & Payments',
    question: 'How do I book a trip with Certified Adventures?',
    answer: 'You can easily reserve your trip directly through our website booking form, via WhatsApp click-to-chat, or by calling our 24/7 hotline (+254 700 000 000). A 30% deposit secures your reservation, and full balance can be settled 3 days prior to departure.'
  },
  {
    id: 'faq-2',
    category: 'Booking & Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept M-PESA Buy Goods / Paybill, Bank Wire Transfers (USD, KES, EUR), Visa, Mastercard, and American Express payments with instant digital invoicing.'
  },
  {
    id: 'faq-3',
    category: 'Road Trips & Vehicles',
    question: 'What types of vehicles are used for your road trips & safaris?',
    answer: 'We operate custom high-roof 4x4 Toyota Land Cruisers with pop-up roofs for optimal game viewing, charging sockets, onboard coolers, and Wi-Fi. For large group road trips, we use VIP overland luxury buses with reclining captain seats.'
  },
  {
    id: 'faq-4',
    category: 'Safety & Guides',
    question: 'Are your tour guides certified?',
    answer: 'Yes! All Certified Adventures drivers and guides are certified by the Kenya Professional Safari Guides Association (KPSGA), trained in wilderness first aid, defensive driving, and deep ecological flora/fauna knowledge.'
  },
  {
    id: 'faq-5',
    category: 'Custom Trips',
    question: 'Can you customize private road trips or honeymoon packages?',
    answer: 'Absolutely! Custom tours and tailored luxury itineraries are our specialty. Whether you need a private family road trip, romantic beach honeymoon, or corporate team retreat, our travel concierges build bespoke packages.'
  },
  {
    id: 'faq-6',
    category: 'Packing & Preparation',
    question: 'What should I pack for a Kenya safari or mountain hike?',
    answer: 'For safaris: neutral colored clothing (khaki/green), sunglasses, sun hat, camera/binoculars, and evening light jacket. For mountain treks: layered thermal clothing, sturdy waterproof hiking boots, rain shell, and headlamp. Detailed checklist provided upon booking!'
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'g-1',
    title: 'Lion Pride Sunset Silhouette',
    location: 'Maasai Mara',
    category: 'Wildlife',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'g-2',
    title: '4x4 Land Cruiser Overland Highway',
    location: 'Rift Valley Highway',
    category: 'Road Trips',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'g-3',
    title: 'Diani Beach Turquoise Waters & Palm Trees',
    location: 'Diani Beach',
    category: 'Landscapes',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'g-4',
    title: 'Mount Kenya Lake Michaelson Camp',
    location: 'Mount Kenya',
    category: 'Camping',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'g-5',
    title: 'Elephants with Mount Kilimanjaro Peak',
    location: 'Amboseli National Park',
    category: 'Wildlife',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'g-6',
    title: 'Luxury Eco-Tented Camp Interior',
    location: 'Mara Wilderness Camp',
    category: 'Luxury Stay',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'g-7',
    title: 'Cycling Next to Zebras in Hell’s Gate',
    location: 'Naivasha',
    category: 'Road Trips',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'g-8',
    title: 'Wild Dolphins Dhow Boat Cruise',
    location: 'Wasini Marine Park',
    category: 'Wildlife',
    image: 'https://images.unsplash.com/photo-1519060205001-37034401ac04?auto=format&fit=crop&w=1000&q=80'
  }
];

export const SERVICES_LIST = [
  { name: 'Road Trips', desc: 'Scenic overland group & private highway road trips across Kenya in luxury vehicles.', icon: 'Compass' },
  { name: 'Adventures', desc: 'Thrill-seeking expeditions: mountain biking, gorge hiking, rock climbing & kayaking.', icon: 'Zap' },
  { name: 'Tours', desc: 'Guided wildlife game drives with certified safari naturalists & Big Five trackers.', icon: 'Binoculars' },
  { name: 'Travel Packages', desc: 'All-inclusive multi-day vacations combining wildlife, mountain, & beach.', icon: 'PackageCheck' },
  { name: 'Group Trips', desc: 'Fun weekend escapes & shared group overland trips with fellow travelers.', icon: 'Users' },
  { name: 'Hiking', desc: 'High altitude mountain ascents up Mount Kenya, Aberdares, & Mount Longonot.', icon: 'Mountain' },
  { name: 'Camping', desc: 'Luxury glamping setups under star-filled savannah skies with campfire BBQs.', icon: 'Tent' },
  { name: 'Team Building', desc: 'High-energy executive retreats, games, & workshops for corporate teams.', icon: 'Award' },
  { name: 'Weekend Getaways', desc: 'Quick 2-day relaxing escapes to Lake Naivasha, Aberdares, & Elementaita.', icon: 'CalendarDays' },
  { name: 'Holiday Vacations', desc: 'Festive season & school holiday luxury resort packages with full transport.', icon: 'Palmtree' },
  { name: 'Airport Transfers', desc: 'VIP Executive airport transfers between JKIA, Wilson Airport, & hotels.', icon: 'Car' },
  { name: 'Corporate Travel', desc: 'Delegation transport, conference logistics, and diplomat travel solutions.', icon: 'Briefcase' },
  { name: 'Custom Tours', desc: 'Bespoke tailormade itineraries generated for your exact budget & style.', icon: 'Sparkles' }
];
