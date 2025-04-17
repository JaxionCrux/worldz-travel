"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingForm } from "@/components/booking-form"
import { getOfferDetails } from "@/app/actions/flight-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [flightDetails, setFlightDetails] = useState<any>(null)
  const [returnFlightDetails, setReturnFlightDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const returnFlightId = searchParams.get('returnFlight')
  const isBooking = searchParams.get('isBooking') === 'true'

  useEffect(() => {
    if (!isBooking) {
      // If not in booking mode, redirect back to flight details
      const returnParam = returnFlightId ? `?returnFlight=${returnFlightId}` : '';
      router.push(`/flight-details/${params.id}${returnParam}`);
      return;
    }

    const fetchFlightDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[BOOKING-DEBUG] Fetching flight details for ID: ${params.id}`);
        const response = await getOfferDetails(params.id);
        
        if (response.data) {
          console.log(`[BOOKING-DEBUG] Received outbound flight details:`, {
            id: response.data.id,
            slices: response.data.slices?.length || 0,
            passengers: response.data.passengers?.length || 0
          });
          setFlightDetails(response.data);
          
          // If this is a round trip, also fetch return flight details
          if (returnFlightId) {
            console.log(`[BOOKING-DEBUG] Fetching return flight details for ID: ${returnFlightId}`);
            const returnResponse = await getOfferDetails(returnFlightId);
            
            if (returnResponse.data) {
              console.log(`[BOOKING-DEBUG] Received return flight details`);
              setReturnFlightDetails(returnResponse.data);
            } else {
              console.error(`[BOOKING-DEBUG] Failed to get return flight details:`, returnResponse.error);
              setError(returnResponse.error || "Failed to load return flight details");
            }
          }
        } else {
          console.error(`[BOOKING-DEBUG] Failed to get flight details:`, response.error);
          setError(response.error || "Failed to load flight details");
        }
      } catch (error) {
        console.error("[BOOKING-DEBUG] Error fetching flight details:", error);
        setError("An unexpected error occurred while loading flight details");
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [params.id, returnFlightId, router, isBooking]);

  // Calculate passengers count from session storage or default to 1 adult
  const getPassengerCount = () => {
    try {
      const storedParams = sessionStorage.getItem("flightSearchParams");
      if (storedParams) {
        const params = JSON.parse(storedParams);
        return {
          adults: params.adults || 1,
          children: params.children || 0,
          infants: params.infants || 0
        };
      }
    } catch (error) {
      console.error("[BOOKING-DEBUG] Error getting passenger count:", error);
    }
    
    return { adults: 1, children: 0, infants: 0 };
  };

  const passengerCount = getPassengerCount();
  const totalPassengers = passengerCount.adults + passengerCount.children + passengerCount.infants;

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-gray-900 to-black text-white pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => {
                const returnParam = returnFlightId ? `?returnFlight=${returnFlightId}` : '';
                router.push(`/flight-details/${params.id}${returnParam}`);
              }}
              className="text-white/70 hover:text-white flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Flight Details
            </Button>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
            <p className="text-gray-400 mb-8">
              {returnFlightId 
                ? "You're booking a round-trip flight" 
                : "You're booking a one-way flight"}
              {totalPassengers > 1 ? ` for ${totalPassengers} travelers` : ""}
            </p>

            {error && (
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Flight Details</AlertTitle>
                <AlertDescription>
                  {error}
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="mr-2"
                    >
                      Try Again
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push('/')}
                    >
                      Return Home
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="space-y-8 animate-pulse">
                <div className="h-12 bg-gray-800/50 rounded-lg w-48"></div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="h-40 bg-gray-800/50 rounded-lg"></div>
                    <div className="h-60 bg-gray-800/50 rounded-lg"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-40 bg-gray-800/50 rounded-lg"></div>
                    <div className="h-60 bg-gray-800/50 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ) : (
              flightDetails && 
              <BookingForm 
                offerId={params.id} 
                flightDetails={flightDetails} 
                returnFlightId={returnFlightId}
                returnFlightDetails={returnFlightDetails}
                passengerCounts={passengerCount}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
