'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { createBookingAction } from '@/app/actions/booking-actions';
import PassengerForm from '@/components/passenger-form';
import PaymentForm from '@/components/payment-form';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, ChevronRight, Loader2, PlaneTakeoff, PlaneLanding, Calendar, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getOffers } from '@/lib/duffel';
import { format } from 'date-fns';
import appStorage from '@/lib/session-storage';

// Type for passenger information
type PassengerData = {
  type: 'adult' | 'child' | 'infant_without_seat';
  title: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr';
  givenName: string;
  familyName: string;
  email: string | undefined;
  phone: string | undefined;
  birthDate: Date;
};

// Type for pricing information
type PricingInfo = {
  adult?: string;
  child?: string;
  infant?: string;
  total?: string;
  currency?: string;
};

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  console.log("======= CRITICAL DEBUG: BOOKING PAGE INIT =======");
  console.log("URL Search Params:", Object.fromEntries([...searchParams.entries()]));
  
  // State variables
  const [offerId, setOfferId] = useState<string | null>(null);
  const [returnOfferId, setReturnOfferId] = useState<string | null>(null);
  const [offerDetails, setOfferDetails] = useState<any>(null);
  const [returnOfferDetails, setReturnOfferDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [passengerDetails, setPassengerDetails] = useState<PassengerData[]>([]);
  const [completedPassengers, setCompletedPassengers] = useState<Set<number>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'passengers' | 'payment'>('passengers');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Get the passenger counts from URL parameters
  const adults = parseInt(searchParams.get('adults') || '1', 10);
  const children = parseInt(searchParams.get('children') || '0', 10);
  const infants = parseInt(searchParams.get('infants') || '0', 10);
  const totalPassengers = adults + children + infants;
  
  // Combined state to avoid excessive re-renders
  const [passengerCounts] = useState({
    adults,
    children,
    infants
  });
  
  console.log("CRITICAL DEBUG: Passenger Counts:", { adults, children, infants, totalPassengers });
  
  // Format currency for display
  const formatCurrency = (amount: string | undefined, currencyCode: string | undefined): string => {
    if (!amount) return '$0.00';
    const currency = currencyCode || 'USD';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(parseFloat(amount));
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `$${amount}`;
    }
  };
  
  // Calculate price per passenger with fallback
  const calculatePricePerPassenger = (offer: any): PricingInfo => {
    if (!offer) return {};
    
    try {
      const { total_amount, total_currency } = offer;
      const totalAmount = parseFloat(total_amount);
      
      // Use the passenger counts from URL parameters for consistent pricing
      const adultCount = adults || 1;
      const childCount = children || 0;
      const infantCount = infants || 0;
      
      // Simple per-person calculation
      const totalPassengers = adultCount + childCount + (infantCount > 0 ? infantCount : 0);
      const perPersonAmount = (totalAmount / totalPassengers).toFixed(2);
      
      return {
        adult: perPersonAmount,
        child: perPersonAmount,
        infant: infantCount > 0 ? (totalAmount * 0.1 / infantCount).toFixed(2) : '0',
        total: total_amount,
        currency: total_currency
      };
    } catch (err) {
      console.error('Error calculating passenger pricing:', err);
      return {};
    }
  };
  
  // Check for stored passenger information on initial load
  useEffect(() => {
    console.log("Loading session storage content...");
    
    const flightInfo = appStorage.getFlightInfo();
    const passengerCounts = appStorage.getPassengerCounts();
    
    console.log("Flight Info from storage:", flightInfo ? {
      outboundId: flightInfo.outboundOfferId,
      returnId: flightInfo.returnOfferId,
      passengerCounts: flightInfo.passengers
    } : 'Not found');
    
    console.log("Passenger counts from storage:", passengerCounts);
  }, []);
  
  // Initialize passenger details array - independent of offer details loading
  useEffect(() => {
    console.log("CRITICAL DEBUG: Initializing passenger forms with counts:", { adults, children, infants });
    
    // Create initial passenger forms
    const initialPassengers: PassengerData[] = [];
    
    // Add adult passengers
    for (let i = 0; i < adults; i++) {
      initialPassengers.push({
        type: 'adult',
        title: 'mr',
        givenName: '',
        familyName: '',
        email: i === 0 ? '' : '', // Only primary passenger needs contact details
        phone: i === 0 ? '' : '', // Only primary passenger needs contact details
        birthDate: new Date(Date.now() - (20 * 365 * 24 * 60 * 60 * 1000)), // Default adult: 20 years old
      });
    }
    
    // Add child passengers
    for (let i = 0; i < children; i++) {
      initialPassengers.push({
        type: 'child',
        title: 'mr',
        givenName: '',
        familyName: '',
        email: '',
        phone: '',
        birthDate: new Date(Date.now() - (8 * 365 * 24 * 60 * 60 * 1000)), // Default child: 8 years old
      });
    }
    
    // Add infant passengers
    for (let i = 0; i < infants; i++) {
      initialPassengers.push({
        type: 'infant_without_seat',
        title: 'mr',
        givenName: '',
        familyName: '',
        email: '',
        phone: '',
        birthDate: new Date(Date.now() - (1 * 365 * 24 * 60 * 60 * 1000)), // Default infant: 1 year old
      });
    }
    
    console.log(`CRITICAL DEBUG: Created ${initialPassengers.length} passenger forms`);
    setPassengerDetails(initialPassengers);
    
  }, [adults, children, infants]); // Only depend on passenger counts
  
  // CRITICAL DEBUG: Log passenger details just before rendering
  console.log("CRITICAL DEBUG: Before Rendering", { 
    passengerDetailsLength: passengerDetails.length,
    totalPassengers,
    currentStep
  });
  
  // Get calculated pricing
  const pricingInfo: PricingInfo = {
    adult: offerDetails?.total_amount ? offerDetails.total_amount : '0',
    child: offerDetails?.total_amount ? offerDetails.total_amount : '0',
    infant: offerDetails?.total_amount ? offerDetails.total_amount : '0',
    total: offerDetails?.total_amount,
    currency: offerDetails?.total_currency
  };
  
  // Handle passenger form completion
  const handlePassengerComplete = (data: PassengerData, index: number) => {
    const updatedPassengers = [...passengerDetails];
    updatedPassengers[index] = data;
    setPassengerDetails(updatedPassengers);
    
    // Track completed passengers
    setCompletedPassengers(prev => {
      const updated = new Set(prev);
      updated.add(index);
      return updated;
    });
  };
  
  // Check if all passengers have been completed
  const areAllPassengersComplete = () => {
    return completedPassengers.size === totalPassengers;
  };
  
  // Move to payment step
  const proceedToPayment = () => {
    if (areAllPassengersComplete()) {
      setCurrentStep('payment');
    } else {
      toast({
        title: "Incomplete passenger details",
        description: `Please complete information for all ${totalPassengers} passengers before proceeding to payment.`,
        variant: "destructive",
      });
    }
  };
  
  // Handle data retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  // Handle payment completion
  const handlePaymentComplete = async (data: { paymentType: string }) => {
    setPaymentMethod(data.paymentType);
    setIsSubmitting(true);
    
    try {
      // Prepare form data for the server action
      const formData = new FormData();
      formData.append('offerId', offerId || '');
      formData.append('passengerCount', passengerDetails.length.toString());
      formData.append('paymentType', data.paymentType);
      formData.append('returnUrl', `${window.location.origin}/booking-confirmation`);
      
      // Add passenger details with type safety
      passengerDetails.forEach((passenger, index) => {
        formData.append(`passengers[${index}].type`, passenger.type);
        formData.append(`passengers[${index}].title`, passenger.title);
        formData.append(`passengers[${index}].givenName`, passenger.givenName);
        formData.append(`passengers[${index}].familyName`, passenger.familyName);
        formData.append(`passengers[${index}].email`, passenger.email || '');
        formData.append(`passengers[${index}].phone`, passenger.phone || '');
        formData.append(`passengers[${index}].birthDate`, passenger.birthDate.toISOString().split('T')[0]);
      });
      
      console.log('[BOOKING-DEBUG] Submitting booking with offer ID:', offerId);
      
      // Call the server action
      const response = await createBookingAction(formData);
      
      if (response.success && response.data) {
        console.log('[BOOKING-DEBUG] Booking created successfully:', {
          bookingId: response.data.booking.id,
          reference: response.data.booking.booking_reference
        });
        
        // Store the booking reference and other details using the new utility
        appStorage.setOrderId(response.data.booking.id);
        appStorage.setBookingData({
          passengers: passengerDetails.map(p => ({
            name: `${p.givenName} ${p.familyName}`,
            type: p.type
          })),
          flight: offerDetails,
          returnFlight: returnOfferDetails,
          totalAmount: pricingInfo.total || '',
          currency: pricingInfo.currency || ''
        });
        
        // Redirect to confirmation page
        router.push('/booking-confirmation');
      } else {
        console.error('[BOOKING-DEBUG] Booking creation failed:', response.error);
        throw new Error(response.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('[BOOKING-DEBUG] Exception during booking creation:', error);
      toast({
        title: "Booking failed",
        description: error instanceof Error 
          ? error.message 
          : "Something went wrong with your booking. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  // Calculate booking progress
  const bookingProgress = () => {
    if (currentStep === 'passengers') {
      return (completedPassengers.size / totalPassengers) * 50;
    } else if (currentStep === 'payment') {
      return paymentMethod ? 100 : 75;
    }
    return 0;
  };
  
  // Add back the data loading useEffect
  useEffect(() => {
    const loadBookingData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get stored flight info using the new utility
        const flightInfoFromSession = appStorage.getFlightInfo();
        
        // Get offer ID from URL or session storage
        let id = searchParams.get('offerId');
        let returnId = searchParams.get('returnOfferId');
        
        // Fallback to session storage if URL params are missing
        if (!id && flightInfoFromSession?.outboundOfferId) {
          id = flightInfoFromSession.outboundOfferId;
        }
        
        if (!returnId && flightInfoFromSession?.returnOfferId) {
          returnId = flightInfoFromSession.returnOfferId;
        }
        
        if (!id) {
          setError('No offer ID provided. Please go back to search results and select a flight.');
          setIsLoading(false);
          return;
        }
        
        setOfferId(id);
        if (returnId) setReturnOfferId(returnId);
        
        // If we have cached flight data in session storage, use it
        if (flightInfoFromSession?.outboundFlight) {
          setOfferDetails(flightInfoFromSession.outboundFlight);
          
          if (flightInfoFromSession.returnFlight) {
            setReturnOfferDetails(flightInfoFromSession.returnFlight);
          }
          
          setIsLoading(false);
          return;
        }
        
        // Otherwise, fetch data from API
        const fetchOfferDetails = async (offerId: string) => {
          try {
            const response = await getOffers(offerId);
            return response.data || null;
          } catch (error) {
            console.error(`Error fetching offer details for ID ${offerId}:`, error);
            return null;
          }
        };
        
        // Fetch outbound flight
        const outboundData = await fetchOfferDetails(id);
        if (outboundData) {
          setOfferDetails(outboundData);
          console.log('[DEBUG] Loaded offer details for', id);
        }
        
        // Fetch return flight if applicable
        if (returnId) {
          const returnData = await fetchOfferDetails(returnId);
          if (returnData) {
            setReturnOfferDetails(returnData);
            console.log('[DEBUG] Loaded return offer details for', returnId);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('[DEBUG] Error loading booking data:', error);
        setError('An unexpected error occurred. Please try again.');
        setIsLoading(false);
      }
    };
    
    loadBookingData();
  }, [searchParams, retryCount]);
  
  // Loading state
  if (isLoading || isRetrying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gradient-to-b from-gray-900 to-black text-white pt-20 md:pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <h2 className="text-2xl font-bold">Loading Booking Details...</h2>
              <p className="text-gray-400">Retrieving the most up-to-date information about your flight</p>
              {isRetrying && (
                <p className="text-blue-400 mt-2">Retrying request...</p>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gradient-to-b from-gray-900 to-black text-white pt-20 md:pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Booking Details Unavailable</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    
                    {errorDetails && (
                      <div className="bg-black/20 p-4 rounded-md border border-gray-600 mb-4">
                        <h3 className="text-sm font-semibold text-gray-300 mb-1">Error Details</h3>
                        <p className="text-xs text-gray-400">{errorDetails}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-2"
                        onClick={handleRetry}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry Loading Booking Details
                      </Button>
                      
                      <Button 
                        className="w-full mt-2"
                        variant="outline"
                        onClick={() => offerId ? router.push('/flight-details/' + offerId) : router.push('/')}
                      >
                        {offerId ? 'Return to Flight Details' : 'Return to Flight Search'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Main content when data is loaded
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gradient-to-b from-gray-900 to-black text-white pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
              <p className="text-gray-400">
                Please fill in the required information to secure your flight.
              </p>
              
              {/* Progress indicator */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Booking Progress</span>
                  <span className="text-sm">{Math.round(bookingProgress())}%</span>
                </div>
                <Progress value={bookingProgress()} className="h-2" />
                
                <div className="flex justify-between mt-2">
                  <span className={`text-sm ${currentStep === 'passengers' ? 'font-bold text-blue-400' : ''}`}>
                    Passenger Details
                  </span>
                  <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                  <span className={`text-sm ${currentStep === 'payment' ? 'font-bold text-blue-400' : ''}`}>
                    Payment
                  </span>
                  <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                  <span className="text-sm text-gray-400">Confirmation</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1 md:col-span-2">
                {currentStep === 'passengers' && (
                  <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-white/10">
                      <h2 className="text-2xl font-bold mb-4">Passenger Information</h2>
                      <p className="text-gray-400">
                        Enter details for each passenger exactly as they appear on their ID/passport.
                      </p>
                      <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30">
                        <p className="text-white font-medium">
                          Total Passengers: {totalPassengers} ({adults} Adults, {children} Children, {infants} Infants)
                        </p>
                      </div>
                    </div>
                    
                    {/* CRITICAL FIX: Debug info for passenger form rendering */}
                    {passengerDetails.length === 0 && (
                      <div className="p-4 mb-4 bg-yellow-900/50 border border-yellow-500/30 rounded-lg">
                        <p className="font-bold">Debug Info: No passenger details found</p>
                        <p>URL Parameters: adults={adults}, children={children}, infants={infants}</p>
                        <p>Total Passengers: {totalPassengers}</p>
                      </div>
                    )}
                    
                    {/* CRITICAL FIX: Passenger forms with key visual indicators */}
                    <div className="space-y-8">
                      {passengerDetails.map((passenger, index) => (
                        <div key={index} className="relative">
                          {/* Add visual divider between passengers except for the first one */}
                          {index > 0 && (
                            <div className="absolute -top-4 left-0 w-full h-1 bg-blue-500/30 rounded-full"></div>
                          )}
                          
                          {/* Add passenger type label for clarity */}
                          <div className="bg-blue-900/50 mb-3 px-3 py-1 rounded-t-md inline-block">
                            Passenger #{index + 1}: {passenger.type === 'adult' ? 'Adult' : passenger.type === 'child' ? 'Child' : 'Infant'}
                          </div>
                          
                          <PassengerForm
                            passengerIndex={index}
                            passengerType={passenger.type}
                            onComplete={handlePassengerComplete}
                            initialData={completedPassengers.has(index) ? passenger : undefined}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12"
                      size="lg"
                      onClick={proceedToPayment}
                      disabled={!areAllPassengersComplete()}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                )}
                
                {currentStep === 'payment' && (
                  <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-white/10">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Payment</h2>
                        <Button 
                          variant="outline" 
                          onClick={() => setCurrentStep('passengers')}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Back to Passengers
                        </Button>
                      </div>
                    </div>
                    
                    <PaymentForm 
                      onComplete={handlePaymentComplete}
                      amount={pricingInfo.total}
                      currency={pricingInfo.currency}
                    />
                  </div>
                )}
              </div>
              
              <div className="col-span-1">
                <Card className="sticky top-6 bg-white/5 backdrop-blur-md border-white/10">
                  <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-t-lg">
                    <CardTitle>Booking Summary</CardTitle>
                    <CardDescription className="text-gray-300">Review your flight details</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-6">
                    {offerDetails && (
                      <>
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center">
                            <PlaneTakeoff className="w-4 h-4 mr-2 text-blue-400" />
                            Flight Details
                          </h3>
                          
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium">{offerDetails.owner?.name || 'Airline'}</p>
                                <p className="text-gray-400 text-xs">
                                  {offerDetails.slices?.[0]?.segments?.[0]?.operating_carrier_flight_number || 'Flight'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {offerDetails.slices?.[0]?.segments?.[0]?.departing_at && 
                                    format(new Date(offerDetails.slices[0].segments[0].departing_at), 'MMM d, yyyy')}
                                </p>
                                <p className="text-gray-400 text-xs">Departure Date</p>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                              <div>
                                <p className="font-bold">{offerDetails.slices?.[0]?.segments?.[0]?.origin?.iata_code || '---'}</p>
                                <p className="text-xs text-gray-400">{offerDetails.slices?.[0]?.segments?.[0]?.origin?.city_name || 'Origin'}</p>
                              </div>
                              <div className="flex-1 mx-2">
                                <div className="h-0.5 w-full bg-gray-700 relative">
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {offerDetails.slices?.[0]?.segments?.[offerDetails.slices[0].segments.length - 1]?.destination?.iata_code || '---'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {offerDetails.slices?.[0]?.segments?.[offerDetails.slices[0].segments.length - 1]?.destination?.city_name || 'Destination'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="bg-white/10" />
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                            Passengers
                          </h3>
                          
                          <ul className="space-y-1 text-sm">
                            {adults > 0 && (
                              <li className="flex justify-between bg-white/5 p-2 rounded">
                                <span>{adults} × Adult</span>
                                <span>{formatCurrency(pricingInfo.adult, pricingInfo.currency)} each</span>
                              </li>
                            )}
                            {children > 0 && (
                              <li className="flex justify-between bg-white/5 p-2 rounded">
                                <span>{children} × Child</span>
                                <span>{formatCurrency(pricingInfo.child, pricingInfo.currency)} each</span>
                              </li>
                            )}
                            {infants > 0 && (
                              <li className="flex justify-between bg-white/5 p-2 rounded">
                                <span>{infants} × Infant</span>
                                <span>{formatCurrency(pricingInfo.infant, pricingInfo.currency)} each</span>
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        <Separator className="bg-white/10" />
                        
                        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-3 rounded-lg">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total Price</span>
                            <span>{formatCurrency(pricingInfo.total, pricingInfo.currency)}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Includes all taxes and fees</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <Button 
                              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                              disabled={currentStep !== 'payment' || isSubmitting}
                              onClick={() => {
                                if (paymentMethod) {
                                  handlePaymentComplete({ paymentType: paymentMethod });
                                } else {
                                  toast({
                                    title: "Select payment method",
                                    description: "Please select a payment method to proceed",
                                  });
                                }
                              }}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Complete Booking'
                              )}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {currentStep !== 'payment' 
                            ? 'Complete passenger details first' 
                            : 'Select payment method to complete booking'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <p className="text-xs text-center text-gray-400">
                      By completing this booking, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Helper function to check if a flight is international
const checkInternationalFlight = (offerData: any) => {
  if (!offerData?.slices?.length) return false;
  
  try {
    const firstSlice = offerData.slices[0];
    if (!firstSlice.segments?.length) return false;
    
    const originCountry = firstSlice.segments[0]?.origin?.country_code || '';
    const destinationCountry = firstSlice.segments[firstSlice.segments.length - 1]?.destination?.country_code || '';
    
    // If we don't have country codes, try to make a guess based on IATA codes
    if (!originCountry || !destinationCountry) {
      const originIATA = firstSlice.segments[0]?.origin?.iata_code || '';
      const destinationIATA = firstSlice.segments[firstSlice.segments.length - 1]?.destination?.iata_code || '';
      
      // Some domestic IATA code detection (very simplified, just to have something)
      // For a real app, we would use a proper geo database
      if (originIATA && destinationIATA) {
        // Both in US
        if (originIATA.startsWith('K') && destinationIATA.startsWith('K')) return false;
        // Both in Canada
        if (originIATA.startsWith('C') && destinationIATA.startsWith('C')) return false;
        // Both in Europe with same first letter (simplified)
        if (originIATA[0] === destinationIATA[0] && 
            ['E', 'L'].includes(originIATA[0])) return false;
      }
      return true; // Default to international if we can't determine
    }
    
    // Check if origin and destination are in different countries
    return originCountry !== destinationCountry;
  } catch (error) {
    console.error('[DEBUG] Error determining if flight is international:', error);
    return false;
  }
}; 