export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    condition: string;
    code: number;
    isDay: boolean;
    windSpeed: number;
    humidity: number;
  };
  forecast: {
    id: string;
    day: string;
    maxTemp: number;
    minTemp: number;
    code: number;
  }[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
  isError?: boolean;
}

export interface RouteStep {
  id: string;
  instruction: string;
  distance?: string;
  duration?: string;
  lat?: number;
  lng?: number;
}

export interface RouteStop {
  id: string;
  name: string;
  address?: string;
  estimatedArrival?: string;
}

export interface RouteInfo {
  destination: string;
  destinationCoords?: { lat: number; lng: number };
  stops?: RouteStop[];
  estimatedTime: string;
  distance: string;
  steps: RouteStep[];
}

export interface POI {
  id: string;
  name: string;
  address: string;
  rating?: string;
  type?: string;
  phone?: string;
  hours?: string;
  reviews?: string[];
  photoUrl?: string;
  x: number; // 0-100 for mock map
  y: number; // 0-100 for mock map
}

export interface RouteAlert {
  id: string;
  type: 'turn' | 'delay';
  subType?: 'traffic' | 'weather' | 'safety' | 'turn';
  message: string;
  distance?: string;
  delayTime?: string;
}

export type AppMode = 'explore' | 'route' | 'discovery';
export type MapLayer = 'traffic' | 'transport' | 'cycling';
