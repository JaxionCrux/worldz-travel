"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOfferDetails, createBookingAction } from '@/app/actions/flight-actions';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewBookingSummary from '@/components/new-booking-summary';
import { toast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PaymentForm } from '@/components/payment-form';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get offer ID and passenger counts from URL params
  const offerId = searchParams.get('offerId');
  const adults = parseInt(searchParams.get('adults') || '1', 10);
  const children = parseInt(searchParams.get('children') || '0', 10);
  const infants = parseInt(searchParams.get('infants') || '0', 10);
  
  // State
  const [offerData, setOfferData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get passenger details from session storage
  const [passengerDetails, setPassengerDetails] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchOffer = async () => {
      if (!offerId) {
        setError('No offer ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        // Get passenger details from session storage
        const passengerData = sessionStorage.getItem('passengerDetails');
        if (!passengerData) {
          setError('No passenger details found. Please complete passenger information first.');
          setIsLoading(false);
          return;
        }
        setPassengerDetails(JSON.parse(passengerData));
        
        // Fetch offer details
        setIsLoading(true);
        const offerData = await getOfferDetails(offerId);
        
        // Update offer data with passenger counts from URL
        setOfferData({
          ...offerData,
          passenger_count: {
            adults,
            children,
            infants
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching offer details:', error);
        setError('Failed to load flight details. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchOffer();
  }, [offerId, adults, children, infants]);
  
  const handlePaymentComplete = async (paymentData: any) => {
    if (!offerId || !passengerDetails.length) {
      setError('Missing booking information');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format passenger data for the booking
      const passengers = passengerDetails.map((passenger) => ({
        type: passenger.type,
        given_name: passenger.givenName,
        family_name: passenger.familyName,
        email: passenger.email,
        phone: passenger.phone,
        born_on: new Date(passenger.birthDate).toISOString().split('T')[0]
      }));
      
      // Get contact information from the first adult passenger
      const contactPassenger = passengerDetails.find(p => p.type === 'adult') || passengerDetails[0];
      
      // Create the booking
      const result = await createBookingAction({
        offerId,
        passengers,
        contactDetails: {
          email: contactPassenger.email,
          phone: contactPassenger.phone,
          givenName: contactPassenger.givenName,
          familyName: contactPassenger.familyName
        },
        paymentDetails: {
          type: paymentData.paymentMethod,
          amount: offerData.total_amount,
          currency: offerData.total_currency
        }
      });
      
      if (result.success) {
        // Store booking reference for confirmation page
        sessionStorage.setItem('bookingReference', result.bookingReference);
        sessionStorage.setItem('orderId', result.orderId);
        
        // Clean up session storage
        sessionStorage.removeItem('passengerDetails');
        sessionStorage.removeItem('selectedFlightInfo');
        
        // Redirect to confirmation page
        router.push('/booking-confirmation');
      } else {
        setError(result.error || 'Failed to create booking');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl mt-24 mb-24 px-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-7xl mt-24 mb-24 px-8">
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <Button onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mt-24 mb-24 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Secure payment for your booking
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md border border-white/10">
            <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-t-lg">
              <CardTitle>Payment Information</CardTitle>
              <CardDescription className="text-white/90">
                Enter your payment details to complete your booking
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PaymentForm 
                onComplete={handlePaymentComplete} 
                isSubmitting={isSubmitting}
                totalAmount={offerData?.total_amount}
                totalCurrency={offerData?.total_currency}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Booking Summary */}
        <div>
          <NewBookingSummary offerData={offerData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 