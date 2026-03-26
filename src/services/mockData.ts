import {
  ChargingSpot,
  Review,
  User,
  ChargingRequest,
  LeaderboardEntry,
  SpotCategory,
  OutletType,
  ChargingSpeed,
  SpotStatus,
  RequestStatus
} from '@/types';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+91 98765 43210',
    role: 'user',
    isVerified: true,
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date(),
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
        newSpots: true,
        requestUpdates: true,
        promotions: false,
      },
      location: {
        enabled: true,
        coordinates: { lat: 19.0760, lng: 72.8777 },
        city: 'Mumbai',
        state: 'Maharashtra',
      },
    },
    stats: {
      watts: 1250,
      level: 5,
      requestsCompleted: 23,
      reviewsGiven: 18,
      favoritesCount: 12,
      referralCount: 3,
      joinDate: new Date('2024-01-15'),
    },
  },
  {
    id: '2',
    email: 'sarah.smith@example.com',
    displayName: 'Sarah Smith',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '+91 98765 43211',
    role: 'host',
    isVerified: true,
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date(),
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        sms: true,
        newSpots: false,
        requestUpdates: true,
        promotions: true,
      },
      location: {
        enabled: true,
        coordinates: { lat: 19.0760, lng: 72.8777 },
        city: 'Mumbai',
        state: 'Maharashtra',
      },
    },
    stats: {
      watts: 3450,
      level: 8,
      requestsCompleted: 67,
      reviewsGiven: 45,
      favoritesCount: 8,
      referralCount: 7,
      joinDate: new Date('2024-02-01'),
    },
  },
  {
    id: '3',
    email: 'admin@chargenest.com',
    displayName: 'Admin User',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+91 98765 43212',
    role: 'admin',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
    preferences: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        sms: true,
        newSpots: true,
        requestUpdates: true,
        promotions: true,
      },
      location: {
        enabled: false,
      },
    },
    stats: {
      watts: 10000,
      level: 15,
      requestsCompleted: 150,
      reviewsGiven: 100,
      favoritesCount: 25,
      referralCount: 20,
      joinDate: new Date('2024-01-01'),
    },
  },
];

// Mock charging spots
export const mockSpots: ChargingSpot[] = [
  {
    id: '1',
    hostId: '2',
    hostName: 'Sarah Smith',
    hostEmail: 'sarah.smith@example.com',
    hostPhone: '+91 98765 43211',
    name: 'Cafe Coffee Day - Bandra',
    description: 'Comfortable cafe with reliable charging. Perfect for working while your device charges. Free WiFi available.',
    address: 'Linking Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    coordinates: { lat: 19.0596, lng: 72.8295 },
    category: 'cafe',
    outletType: 'standard_3pin',
    chargingSpeed: 'slow',
    availableHours: '8:00 AM - 11:00 PM',
    pricePerHour: 50,
    pricePerMinute: 2,
    amenities: [
      { id: '1', name: 'WiFi', icon: 'wifi', available: true },
      { id: '2', name: 'Coffee', icon: 'coffee', available: true },
      { id: '3', name: 'Air Conditioning', icon: 'wind', available: true },
      { id: '4', name: 'Seating', icon: 'chair', available: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511920183311-fdbd3450c104?w=800&h=600&fit=crop',
    ],
    rating: 4.8,
    reviews: [
      {
        id: '1',
        userId: '1',
        userName: 'John Doe',
        userPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        rating: 5,
        comment: 'Great spot! Fast charging and excellent coffee. The staff is very helpful.',
        photos: [],
        createdAt: new Date('2024-03-20'),
        helpful: 12,
        response: {
          text: 'Thank you John! We\'re glad you enjoyed your experience.',
          createdAt: new Date('2024-03-21'),
          respondedBy: 'Sarah Smith',
        },
      },
      {
        id: '2',
        userId: '1',
        userName: 'Jane Wilson',
        rating: 4,
        comment: 'Good location, convenient charging. Can get busy during peak hours.',
        photos: [],
        createdAt: new Date('2024-03-18'),
        helpful: 8,
      },
    ],
    totalCharges: 156,
    status: 'active',
    isVerified: true,
    isFeatured: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-25'),
  },
  {
    id: '2',
    hostId: '2',
    hostName: 'Sarah Smith',
    hostEmail: 'sarah.smith@example.com',
    hostPhone: '+91 98765 43211',
    name: 'Home Charging - Andheri',
    description: 'Residential charging spot in quiet neighborhood. Safe and reliable with covered parking.',
    address: 'Gulmohar Society, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    coordinates: { lat: 19.1196, lng: 72.8650 },
    category: 'home',
    outletType: '16_amp',
    chargingSpeed: 'fast',
    availableHours: '6:00 PM - 10:00 PM',
    pricePerHour: 80,
    amenities: [
      { id: '1', name: 'Covered Parking', icon: 'car', available: true },
      { id: '2', name: 'Security', icon: 'shield', available: true },
      { id: '3', name: 'Waiting Area', icon: 'sofa', available: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    ],
    rating: 4.9,
    reviews: [
      {
        id: '3',
        userId: '1',
        userName: 'Mike Johnson',
        rating: 5,
        comment: 'Excellent host! Very accommodating and the charging speed is great.',
        photos: [],
        createdAt: new Date('2024-03-22'),
        helpful: 15,
      },
    ],
    totalCharges: 89,
    status: 'active',
    isVerified: true,
    isFeatured: false,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-24'),
  },
  {
    id: '3',
    hostId: '2',
    hostName: 'Sarah Smith',
    hostEmail: 'sarah.smith@example.com',
    hostPhone: '+91 98765 43211',
    name: 'WeWork - BKC',
    description: 'Modern coworking space with multiple charging points. High-speed internet and great amenities.',
    address: 'Plot No. C-56, G Block, BKC',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    coordinates: { lat: 19.0669, lng: 72.8693 },
    category: 'coworking',
    outletType: 'type2_ev',
    chargingSpeed: 'fast',
    availableHours: '24/7',
    pricePerHour: 120,
    amenities: [
      { id: '1', name: 'High-Speed WiFi', icon: 'wifi', available: true },
      { id: '2', name: 'Meeting Rooms', icon: 'users', available: true },
      { id: '3', name: 'Coffee Machine', icon: 'coffee', available: true },
      { id: '4', name: 'Printer', icon: 'printer', available: true },
      { id: '5', name: 'Kitchen', icon: 'utensils', available: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1497366214047-5125e2adffe3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
    ],
    rating: 4.7,
    reviews: [
      {
        id: '4',
        userId: '1',
        userName: 'Alex Chen',
        rating: 4,
        comment: 'Professional environment, great for working while charging. A bit pricey but worth it.',
        photos: [],
        createdAt: new Date('2024-03-19'),
        helpful: 10,
      },
    ],
    totalCharges: 234,
    status: 'active',
    isVerified: true,
    isFeatured: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-23'),
  },
  {
    id: '4',
    hostId: '2',
    hostName: 'Sarah Smith',
    hostEmail: 'sarah.smith@example.com',
    hostPhone: '+91 98765 43211',
    name: 'Phoenix Mall - Lower Parel',
    description: 'Shopping mall with convenient charging locations near food court. Multiple outlets available.',
    address: 'Phoenix Mills, Lower Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400013',
    coordinates: { lat: 19.0060, lng: 72.8319 },
    category: 'mall',
    outletType: '5_amp',
    chargingSpeed: 'slow',
    availableHours: '10:00 AM - 10:00 PM',
    pricePerHour: 60,
    amenities: [
      { id: '1', name: 'Food Court', icon: 'utensils', available: true },
      { id: '2', name: 'Restrooms', icon: 'restroom', available: true },
      { id: '3', name: 'Security', icon: 'shield', available: true },
      { id: '4', name: 'Parking', icon: 'car', available: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1519420091068-e1e60b81f6ec?w=800&h=600&fit=crop',
    ],
    rating: 4.3,
    reviews: [
      {
        id: '5',
        userId: '1',
        userName: 'Priya Patel',
        rating: 4,
        comment: 'Convenient location while shopping. Can be crowded on weekends.',
        photos: [],
        createdAt: new Date('2024-03-17'),
        helpful: 6,
      },
    ],
    totalCharges: 178,
    status: 'active',
    isVerified: true,
    isFeatured: false,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-22'),
  },
  {
    id: '5',
    hostId: '2',
    hostName: 'Sarah Smith',
    hostEmail: 'sarah.smith@example.com',
    hostPhone: '+91 98765 43211',
    name: 'Taj Mahal Palace Hotel',
    description: 'Luxury hotel with premium charging facilities. Valet parking and concierge service available.',
    address: 'Apollo Bandar, Colaba',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    coordinates: { lat: 18.9218, lng: 72.8347 },
    category: 'hotel',
    outletType: 'ccs',
    chargingSpeed: 'rapid',
    availableHours: '24/7',
    pricePerHour: 200,
    amenities: [
      { id: '1', name: 'Valet Parking', icon: 'car', available: true },
      { id: '2', name: 'Concierge', icon: 'bell', available: true },
      { id: '3', name: 'Restaurant', icon: 'utensils', available: true },
      { id: '4', name: 'Lounge', icon: 'sofa', available: true },
      { id: '5', name: 'Room Service', icon: 'room-service', available: true },
    ],
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6aafc609cb6e?w=800&h=600&fit=crop',
    ],
    rating: 4.9,
    reviews: [
      {
        id: '6',
        userId: '1',
        userName: 'Robert Williams',
        rating: 5,
        comment: 'Premium experience! Fast charging and excellent service. Perfect for business travelers.',
        photos: [],
        createdAt: new Date('2024-03-21'),
        helpful: 18,
      },
    ],
    totalCharges: 92,
    status: 'active',
    isVerified: true,
    isFeatured: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-25'),
  },
];

// Mock reviews
export const mockReviews: Review[] = [
  ...mockSpots.flatMap(spot => spot.reviews),
];

// Mock charging requests
export const mockRequests: ChargingRequest[] = [
  {
    id: '1',
    spotId: '1',
    userId: '1',
    userName: 'John Doe',
    userPhone: '+91 98765 43210',
    userEmail: 'john.doe@example.com',
    requestedAt: new Date('2024-03-25T10:30:00'),
    requestedTime: new Date('2024-03-26T14:00:00'),
    duration: 60,
    status: 'approved',
    message: 'Need to charge my laptop for an important meeting.',
    response: {
      text: 'Approved! See you tomorrow at 2 PM.',
      respondedAt: new Date('2024-03-25T11:15:00'),
      respondedBy: 'Sarah Smith',
    },
  },
  {
    id: '2',
    spotId: '2',
    userId: '1',
    userName: 'John Doe',
    userPhone: '+91 98765 43210',
    userEmail: 'john.doe@example.com',
    requestedAt: new Date('2024-03-24T16:45:00'),
    requestedTime: new Date('2024-03-24T19:00:00'),
    duration: 45,
    status: 'completed',
    message: 'Quick charge needed before heading out.',
    feedback: {
      rating: 5,
      comment: 'Great experience! Fast charging and friendly host.',
      wattsEarned: 25,
    },
    completedAt: new Date('2024-03-24T19:45:00'),
  },
  {
    id: '3',
    spotId: '3',
    userId: '1',
    userName: 'John Doe',
    userPhone: '+91 98765 43210',
    userEmail: 'john.doe@example.com',
    requestedAt: new Date('2024-03-23T09:20:00'),
    requestedTime: new Date('2024-03-27T10:00:00'),
    duration: 120,
    status: 'pending',
    message: 'Need a quiet place to work while charging for a couple of hours.',
  },
];

// Mock leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    userId: '3',
    userName: 'Admin User',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    watts: 10000,
    level: 15,
    rank: 1,
    change: 0,
  },
  {
    userId: '2',
    userName: 'Sarah Smith',
    userPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    watts: 3450,
    level: 8,
    rank: 2,
    change: 1,
  },
  {
    userId: '1',
    userName: 'John Doe',
    userPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    watts: 1250,
    level: 5,
    rank: 3,
    change: -1,
  },
  {
    userId: '4',
    userName: 'Emma Wilson',
    userPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    watts: 980,
    level: 4,
    rank: 4,
    change: 2,
  },
  {
    userId: '5',
    userName: 'David Lee',
    userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    watts: 850,
    level: 4,
    rank: 5,
    change: -2,
  },
];

// Helper functions for mock data
export const getMockSpotById = (id: string): ChargingSpot | undefined => {
  return mockSpots.find(spot => spot.id === id);
};

export const getMockSpotsByCategory = (category: SpotCategory): ChargingSpot[] => {
  return mockSpots.filter(spot => spot.category === category);
};

export const getMockSpotsByHost = (hostId: string): ChargingSpot[] => {
  return mockSpots.filter(spot => spot.hostId === hostId);
};

export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getMockRequestsByUser = (userId: string): ChargingRequest[] => {
  return mockRequests.filter(request => request.userId === userId);
};

export const getMockRequestsBySpot = (spotId: string): ChargingRequest[] => {
  return mockRequests.filter(request => request.spotId === spotId);
};

// Simulate API delays
export const mockApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Simulate random failures (5% chance)
export const mockRandomFailure = (): boolean => {
  return Math.random() < 0.05;
};
