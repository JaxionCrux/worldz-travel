"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOfferDetails } from '@/app/actions/flight-actions';
import NewPassengerForm from '@/components/new-passenger-form';
import NewBookingSummary from '@/components/new-booking-summary';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface PassengerType {
  id: number;
  type: 'adult' | 'child' | 'infant_without_seat';
  title: string;
  givenName: string;
  familyName: string;
  email: string;
  phone: string;
  birthDate: Date;
  hasPassport: boolean;
  passportNumber?: string;
  passportCountry?: string;
  passportExpiry?: Date;
  isComplete: boolean;
}

function generatePassengerPlaceholders(
  adults: number,
  children: number,
  infants: number
): PassengerType[] {
  const passengers: PassengerType[] = [];
  
  // Add adult passengers
  for (let i = 0; i < adults; i++) {
    passengers.push({
      id: i + 1,
      type: 'adult',
      title: '',
      givenName: '',
      familyName: '',
      email: '',
      phone: '',
      birthDate: new Date(),
      hasPassport: false,
      isComplete: false
    });
  }
  
  // Add child passengers
  for (let i = 0; i < children; i++) {
    passengers.push({
      id: adults + i + 1,
      type: 'child',
      title: '',
      givenName: '',
      familyName: '',
      email: '',
      phone: '',
      birthDate: new Date(),
      hasPassport: false,
      isComplete: false
    });
  }
  
  // Add infant passengers
  for (let i = 0; i < infants; i++) {
    passengers.push({
      id: adults + children + i + 1,
      type: 'infant_without_seat',
      title: '',
      givenName: '',
      familyName: '',
      email: '',
      phone: '',
      birthDate: new Date(),
      hasPassport: false,
      isComplete: false
    });
  }
  
  return passengers;
}

export default function NewBookingPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const router = useRouter();
  
  // Extract offerId and passenger counts from URL
  const offerId = searchParams.offerId as string;
  // Parse passenger counts with fallbacks
  const adults = parseInt(searchParams.adults as string) || 1;
  const children = parseInt(searchParams.children as string) || 0;
  const infants = parseInt(searchParams.infants as string) || 0;
  
  const [offerData, setOfferData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<PassengerType[]>([]);
  
  // Fetch offer details
  useEffect(() => {
    if (!offerId) {
      setError('No offer ID provided');
      setIsLoading(false);
      return;
    }
    
    const fetchOffer = async () => {
      try {
        const data = await getOfferDetails(offerId);
        setOfferData(data);
        
        // Generate passenger placeholders based on URL parameters
        const passengersPlaceholders = generatePassengerPlaceholders(
          adults,
          children,
          infants
        );
        
        setPassengers(passengersPlaceholders);
      } catch (err) {
        console.error('Error fetching offer details:', err);
        setError('Failed to load flight details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffer();
  }, [offerId, adults, children, infants]);
  
  // Handle passenger form completion
  const handlePassengerComplete = (updatedPassenger: PassengerType) => {
    setPassengers(prevPassengers => 
      prevPassengers.map(p => 
        p.id === updatedPassenger.id ? updatedPassenger : p
      )
    );
  };
  
  // Check if all required passengers have completed their information
  const allPassengersComplete = passengers.every(p => p.isComplete);
  
  // Handle submission - store passenger data and proceed to payment
  const handleContinueToPayment = () => {
    if (!allPassengersComplete) return;
    
    // Store passenger data in session storage
    sessionStorage.setItem('passengers', JSON.stringify(passengers));
    sessionStorage.setItem('offerId', offerId);
    
    // Redirect to payment page
    window.location.href = `/payment?offerId=${offerId}`;
  };
  
  // Error display
  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">Passenger Information</h1>
          <p className="text-gray-400">
            Please provide details for all passengers. All fields are required.
          </p>
          
          {/* Passenger forms */}
          {passengers.map(passenger => (
            <NewPassengerForm
              key={passenger.id}
              passenger={passenger}
              onComplete={handlePassengerComplete}
              isInternational={false} // Set based on flight data
            />
          ))}
          
          {/* Continue button */}
          <Button
            onClick={handleContinueToPayment}
            disabled={!allPassengersComplete}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 mt-6"
          >
            Continue to Payment
          </Button>
          
          {!allPassengersComplete && (
            <p className="text-amber-400 text-sm mt-2">
              Please complete all passenger information to continue
            </p>
          )}
        </div>
        
        {/* Booking summary */}
        <div className="lg:col-span-1">
          <NewBookingSummary 
            offerData={offerData} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
} 