export interface Destination {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  district: string;
  province: string;
  description: string;
  longDescription: string;
  category: 'beach' | 'hill-country' | 'cultural' | 'wildlife' | 'adventure';
  image: string;
  attractions: string[];
  activities: string[];
  emergencyContacts: EmergencyContact[];
  hospitals: string[];
  bestTimeToVisit: string;
  elevation?: number;
}

export interface EmergencyContact {
  name: string;
  number: string;
  type: 'police' | 'ambulance' | 'fire' | 'hospital' | 'disaster';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  weatherCode: number;
  apparentTemperature: number;
  isDay: boolean;
}

export interface ForecastDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  weatherCode: number;
}

export interface RiskScore {
  score: number;
  level: 'safe' | 'low' | 'moderate' | 'high' | 'critical';
  label: string;
  color: string;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
  description: string;
}

export interface CommunityReport {
  id: string;
  type: 'flood' | 'road-closure' | 'heavy-rain' | 'accident' | 'landslide' | 'other';
  location: string;
  district: string;
  lat: number;
  lng: number;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  timestamp: string;
  upvotes: number;
  verified: boolean;
  reporterName: string;
}

export interface Itinerary {
  id: string;
  duration: number;
  interests: string[];
  days: ItineraryDay[];
  totalDistance: number;
  createdAt: string;
}

export interface ItineraryDay {
  day: number;
  destination: Destination;
  activities: string[];
  weather?: WeatherData;
  riskScore?: RiskScore;
  travelTimeFromPrevious?: string;
  distanceFromPrevious?: number;
}

export interface Alert {
  id: string;
  type: 'weather' | 'flood' | 'landslide' | 'tsunami' | 'general';
  severity: 'info' | 'warning' | 'danger' | 'critical';
  title: string;
  description: string;
  district: string;
  timestamp: string;
  active: boolean;
}

export interface District {
  name: string;
  province: string;
  lat: number;
  lng: number;
  population: number;
  area: number;
  riskScore?: RiskScore;
  weather?: WeatherData;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  video: string;
  bio: string;
}
