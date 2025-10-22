'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';

// Types
interface LocationData {
  states: string[];
  districts: string[];
  markets: string[];
  commodities: string[];
  selectedState: string;
  selectedDistrict: string;
  selectedMarket: string;
  isLoading: boolean;
}

export interface SoilData {
  latitude: number | null;
  longitude: number | null;
  phh2o: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  soc: number | null;
  sand: number | null;
  silt: number | null;
  clay: number | null;
  cec: number | null;
  ocd: number | null;
  wv0033: number | null;
  wv1500: number | null;
  isLoading: boolean;
  lastUpdated: Date | null;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  locationData: LocationData;
  soilData: SoilData;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOCATION_DATA'; payload: Partial<LocationData> }
  | { type: 'SET_SOIL_DATA'; payload: Partial<SoilData> }
  | { type: 'CLEAR_SOIL_DATA' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  locationData: {
    states: [],
    districts: [],
    markets: [],
    commodities: [],
    selectedState: '',
    selectedDistrict: '',
    selectedMarket: '',
    isLoading: false,
  },
  soilData: {
    latitude: null,
    longitude: null,
    phh2o: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    soc: null,
    sand: null,
    silt: null,
    clay: null,
    cec: null,
    ocd: null,
    wv0033: null,
    wv1500: null,
    isLoading: false,
    lastUpdated: null,
  },
  theme: 'system',
  notifications: [],
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_LOCATION_DATA':
      return {
        ...state,
        locationData: {
          ...state.locationData,
          ...action.payload,
        },
      };
    case 'SET_SOIL_DATA':
      return {
        ...state,
        soilData: {
          ...state.soilData,
          ...action.payload,
        },
      };
    case 'CLEAR_SOIL_DATA':
      return {
        ...state,
        soilData: {
          latitude: null,
          longitude: null,
          phh2o: null,
          nitrogen: null,
          phosphorus: null,
          potassium: null,
          soc: null,
          sand: null,
          silt: null,
          clay: null,
          cec: null,
          ocd: null,
          wv0033: null,
          wv1500: null,
          isLoading: false,
          lastUpdated: null,
        },
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      return {
        ...state,
        notifications: [...state.notifications, newNotification],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setSoilData: (data: Partial<SoilData>) => void;
  clearSoilData: () => void;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const setSoilData = (data: Partial<SoilData>) => {
    dispatch({ type: 'SET_SOIL_DATA', payload: data });
  };

  const clearSoilData = () => {
    dispatch({ type: 'CLEAR_SOIL_DATA' });
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, []);

  // Theme effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    
    if (state.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    }
  }, [state.theme]);

  const value = {
    state,
    dispatch,
    addNotification,
    removeNotification,
    clearNotifications,
    setSoilData,
    clearSoilData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}