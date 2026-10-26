export type WilayaCode = string;

export interface AlgerianWilaya {
  code: string;
  nameAr: string;
  nameFr: string;
}

export interface MarketProduct {
  id: string;
  title: string;
  priceDzd: number;
  category: 'electronics' | 'fashion' | 'home' | 'auto';
  wilaya: string;
  commune: string;
  image: string;
  seller: {
    name: string;
    phone: string;
    verified: boolean;
    rating: number;
  };
  inStock: boolean;
  description: string;
}

export interface RealEstateListing {
  id: string;
  title: string;
  listingType: 'rent' | 'sale' | 'holiday';
  propertyType: 'apartment' | 'villa' | 'studio' | 'commercial';
  priceDzd: number;
  period?: 'month' | 'year' | 'day';
  surfaceM2: number;
  rooms: number;
  wilaya: string;
  commune: string;
  images: string[];
  agent: {
    name: string;
    phone: string;
    verified: boolean;
  };
  features: string[];
}

export interface TaxiRideEstimate {
  id: string;
  pickup: string;
  destination: string;
  wilaya: string;
  rideType: 'eco' | 'comfort' | 'collective';
  estimatedFareDzd: number;
  distanceKm: number;
  durationMins: number;
  status: 'idle' | 'searching' | 'driver_assigned' | 'in_progress' | 'completed';
  driver?: {
    name: string;
    carModel: string;
    plateNumber: string;
    rating: number;
    phone: string;
  };
}

export interface FoodMenuItem {
  id: string;
  name: string;
  priceDzd: number;
  description: string;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  wilaya: string;
  deliveryTimeMins: number;
  rating: number;
  minOrderDzd: number;
  deliveryFeeDzd: number;
  image: string;
  menu: FoodMenuItem[];
}

export interface BookingService {
  id: string;
  title: string;
  category: 'medical' | 'hotel' | 'artisan' | 'car_rental';
  providerName: string;
  wilaya: string;
  priceDzd: number;
  rating: number;
  availableSlots: string[];
  image: string;
  description: string;
}

export interface AcademicCitation {
  title: string;
  authorOrPublisher: string;
  year?: string;
  url?: string;
}

export interface AcademicTopic {
  id: string;
  title: string;
  subject: 'physics' | 'math' | 'biology' | 'philosophy' | 'history' | 'computer_science';
  level: 'primary' | 'middle' | 'secondary' | 'university';
  summary: string;
  fullExplanation: string;
  keyFormulas?: string[];
  citations: AcademicCitation[];
  verifiedFacts: string[];
  practiceQuestions?: {
    question: string;
    solution: string;
  }[];
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extralarge';
  highContrast: boolean;
  screenReaderAnnounce: boolean;
  speechRate: number;
  speechPitch: number;
  reducedMotion: boolean;
  blindAssistanceMode: boolean;
}

export interface AssistantInteraction {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  speechText?: string;
  timestamp: string;
  intent?: 'commerce' | 'real_estate' | 'taxi' | 'food' | 'booking' | 'academic' | 'search' | 'chat';
  isLiveAi?: boolean;
  actionData?: {
    wilaya?: string;
    targetTab?: string;
    items?: any[];
    academicTopic?: AcademicTopic;
    citations?: AcademicCitation[];
  };
}
