"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOfferDetails, createBookingAction } from '@/app/actions/flight-actions';
import PaymentForm from '@/components/payment-form';
import NewBookingSummary from '@/components/new-booking-summary';
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { toast } from 'sonner';

export default function NewPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get offer ID and passenger counts from URL params
  const offerId = searchParams.get('offerId');
  const adults = parseInt(searchParams.get('adults') || '1', 10);
  const children = parseInt(searchParams.get('children') || '0', 10);
  const infants = parseInt(searchParams.get('infants') || '0', 10);
  
  // State management
  const [offerData, setOfferData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch offer details and passenger info on load
  useEffect(() => {
    const fetchData = async () => {
      if (!offerId) {
        setError('No offer ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        // Get passenger data from session storage
        const storedPassengers = sessionStorage.getItem('passengerDetails');
        if (!storedPassengers) {
          // Redirect back to booking page if passenger details don't exist
          router.push(`/new-booking?offerId=${offerId}&adults=${adults}&children=${children}&infants=${infants}`);
          return;
        }
        
        // Get offer details
        const offerDetails = await getOfferDetails(offerId);
        
        // Update offer data with passenger counts from URL
        setOfferData({
          ...offerDetails,
          passenger_count: {
            adults,
            children,
            infants
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load flight details. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [offerId, adults, children, infants, router]);
  
  // Handle payment form submission
  const handlePaymentSubmit = async (paymentData: any) => {
    if (!offerId) {
      setError('Missing offer information');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get passenger data from session storage
      const storedPassengers = sessionStorage.getItem('passengerDetails');
      if (!storedPassengers) {
        throw new Error('No passenger details found');
      }
      
      const passengers = JSON.parse(storedPassengers);
      
      // Create booking
      const bookingResult = await createBookingAction({
        offerId,
        passengers,
        paymentDetails: paymentData
      });
      
      if (bookingResult.error) {
        throw new Error(bookingResult.error);
      }
      
      // Store order ID in session storage for booking confirmation
      sessionStorage.setItem('orderId', bookingResult.data.id);
      
      // Show success toast
      toast.success('Payment successful!', {
        description: 'Redirecting to confirmation page...'
      });
      
      // Redirect to booking confirmation
      router.push('/booking-confirmation');
    } catch (error: any) {
      console.error('Payment/booking error:', error);
      setError(error.message || 'Payment processing failed. Please try again.');
      setIsSubmitting(false);
      
      toast.error('Payment failed', {
        description: error.message || 'There was an error processing your payment'
      });
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
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mt-24 mb-24 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your booking is almost complete
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md border border-white/10">
            <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-t-lg">
              <CardTitle>Payment Details</CardTitle>
              <CardDescription className="text-white/90">
                Please provide your payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PaymentForm 
                onSubmit={handlePaymentSubmit} 
                isSubmitting={isSubmitting}
                totalAmount={offerData?.total_amount || 0}
                currency={offerData?.total_currency || 'USD'}
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