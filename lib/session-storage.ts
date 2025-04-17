/**
 * Session Storage utility to standardize data storage and retrieval
 * across the application, preventing issues with key inconsistencies.
 */

// Key constants to avoid typos and inconsistencies
const KEYS = {
  FLIGHT_INFO: 'selectedFlightInfo',
  PASSENGER_COUNTS: 'passengerCounts',
  FLIGHT_SEARCH_PARAMS: 'flightSearchParams',
  ORDER_ID: 'orderId',
  BOOKING_DATA: 'bookingData',
  BOOKING_REFERENCE: 'bookingReference',
  PASSENGER_DETAILS: 'passengerDetails',
  SEAT_SELECTIONS: 'seatSelections'
};

// Type definitions for stored data
export interface PassengerCounts {
  adults: number;
  children: number; 
  infants: number;
}

export interface FlightInfo {
  outboundOfferId: string;
  outboundFlight: any;
  returnOfferId: string | null;
  returnFlight: any | null;
  passengers: PassengerCounts;
  cabinClass: string;
}

export interface BookingData {
  passengers: Array<{
    name: string;
    type: string;
  }>;
  flight: any;
  returnFlight?: any;
  totalAmount: string;
  currency: string;
  paymentMethod?: string;
}

// Helper to safely interact with session storage
const safeStorage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error retrieving ${key} from session storage:`, error);
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in session storage:`, error);
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from session storage:`, error);
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  }
};

// Specialized functions for specific data types
export const appStorage = {
  // Flight information
  setFlightInfo: (flightInfo: FlightInfo) => {
    safeStorage.set(KEYS.FLIGHT_INFO, flightInfo);
  },
  
  getFlightInfo: (): FlightInfo | null => {
    return safeStorage.get(KEYS.FLIGHT_INFO);
  },
  
  // Passenger counts
  setPassengerCounts: (counts: PassengerCounts) => {
    safeStorage.set(KEYS.PASSENGER_COUNTS, counts);
  },
  
  getPassengerCounts: (): PassengerCounts => {
    const counts = safeStorage.get(KEYS.PASSENGER_COUNTS);
    return counts || { adults: 1, children: 0, infants: 0 };
  },
  
  // Search parameters
  setSearchParams: (params: any) => {
    safeStorage.set(KEYS.FLIGHT_SEARCH_PARAMS, params);
  },
  
  getSearchParams: () => {
    return safeStorage.get(KEYS.FLIGHT_SEARCH_PARAMS);
  },
  
  // Booking data
  setBookingData: (data: BookingData) => {
    safeStorage.set(KEYS.BOOKING_DATA, data);
  },
  
  getBookingData: (): BookingData | null => {
    return safeStorage.get(KEYS.BOOKING_DATA);
  },
  
  // Order ID
  setOrderId: (id: string) => {
    safeStorage.set(KEYS.ORDER_ID, id);
  },
  
  getOrderId: (): string | null => {
    return safeStorage.get(KEYS.ORDER_ID);
  },
  
  // Booking reference
  setBookingReference: (reference: string) => {
    safeStorage.set(KEYS.BOOKING_REFERENCE, reference);
  },
  
  getBookingReference: (): string | null => {
    return safeStorage.get(KEYS.BOOKING_REFERENCE);
  },
  
  // Passenger details
  setPassengerDetails: (details: any[]) => {
    safeStorage.set(KEYS.PASSENGER_DETAILS, details);
  },
  
  getPassengerDetails: (): any[] | null => {
    return safeStorage.get(KEYS.PASSENGER_DETAILS);
  },
  
  // Utility functions
  clearBookingData: () => {
    safeStorage.remove(KEYS.BOOKING_DATA);
    safeStorage.remove(KEYS.ORDER_ID);
    safeStorage.remove(KEYS.BOOKING_REFERENCE);
    safeStorage.remove(KEYS.PASSENGER_DETAILS);
  },
  
  clearFlightSelections: () => {
    safeStorage.remove(KEYS.FLIGHT_INFO);
  },
  
  clearAll: () => {
    safeStorage.clear();
  }
};

export default appStorage; 