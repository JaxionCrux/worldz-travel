"use client"

import React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
// Create inline component since the import is failing
const FlightOfferDetails = ({ flightOffer }: { flightOffer: any }) => {
  if (!flightOffer || !flightOffer.slices) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
        <p>Flight details are not available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {flightOffer.slices.map((slice: any, sliceIndex: number) => (
        <div key={sliceIndex} className="bg-white/5 backdrop-blur-md rounded-lg overflow-hidden border border-white/10">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{flightOffer.owner?.name || "Airline"}</h3>
                <p className="text-xs text-gray-300">
                  {slice.segments.length > 1 
                    ? `${slice.segments.length} segments • ${slice.duration} total`
                    : `Direct flight • ${slice.duration} total`
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-300">
                  {`${slice.segments[0].origin.iata_code} → ${slice.segments[slice.segments.length - 1].destination.iata_code}`}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {slice.segments.map((segment: any, segmentIndex: number) => (
              <div key={segmentIndex} className="mb-4 last:mb-0">
                <div className="flex justify-between">
                  <div>
                    <div className="font-bold">{new Date(segment.departing_at).toLocaleTimeString()}</div>
                    <div className="text-sm text-gray-400">{segment.origin.iata_code}</div>
                    <div className="text-xs">{segment.origin.name}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Duration</div>
                    <div className="text-sm">{segment.duration}</div>
                    <div className="h-0.5 w-16 bg-gray-600 my-1"></div>
                    <div className="text-xs">Flight {segment.operating_carrier_flight_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{new Date(segment.arriving_at).toLocaleTimeString()}</div>
                    <div className="text-sm text-gray-400">{segment.destination.iata_code}</div>
                    <div className="text-xs">{segment.destination.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
import { SeatMap } from "@/components/seat-map"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { PlaneTakeoff, PlaneLanding, Wallet, Luggage, ShieldCheck, Info, AlertCircle, ArrowRight, RepeatIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOfferDetails } from "@/app/actions/flight-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"
import appStorage from "@/lib/session-storage"

// Helper function to determine if airports are in the same city
const areAirportsInSameCity = (airport1: any, airport2: any): boolean => {
  if (!airport1 || !airport2) return false;
  
  // Check for exact IATA code match
  if (airport1.iata_code === airport2.iata_code) return true;
  
  // Check if city names match (some airports in same city have different codes)
  if (airport1.city_name && airport2.city_name && 
      airport1.city_name.toLowerCase() === airport2.city_name.toLowerCase()) {
    return true;
  }
  
  // Check if this is a common multi-airport city
  const commonMultiAirportCities: Record<string, string[]> = {
    'NYC': ['JFK', 'LGA', 'EWR'], // New York
    'LON': ['LHR', 'LGW', 'STN', 'LCY', 'LTN'], // London
    'PAR': ['CDG', 'ORY', 'BVA'], // Paris
    'CHI': ['ORD', 'MDW'], // Chicago
    'MIL': ['MXP', 'LIN', 'BGY'], // Milan
    'WAS': ['IAD', 'DCA', 'BWI'], // Washington
    'TYO': ['NRT', 'HND'], // Tokyo
    'OSA': ['KIX', 'ITM'], // Osaka
    'SFO': ['SFO', 'OAK', 'SJC'], // San Francisco
    'MIA': ['MIA', 'FLL'], // Miami
    'DFW': ['DFW', 'DAL'], // Dallas
    'HOU': ['IAH', 'HOU'], // Houston
  };
  
  // Check if both airports are in the same multi-airport city
  for (const cityCode in commonMultiAirportCities) {
    const airports = commonMultiAirportCities[cityCode];
    if (airports.includes(airport1.iata_code) && airports.includes(airport2.iata_code)) {
      console.log(`Matching airports in same city group: ${airport1.iata_code} and ${airport2.iata_code} in ${cityCode}`);
      return true;
    }
  }
  
  // No matches found
  console.log(`Airports not in same city: ${airport1.iata_code} (${airport1.city_name || "unknown"}) and ${airport2.iata_code} (${airport2.city_name || "unknown"})`);
  return false;
}

export default function FlightDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true)
  const [outboundFlight, setOutboundFlight] = React.useState<any>(null)
  const [returnFlight, setReturnFlight] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const [returnFlightId, setReturnFlightId] = React.useState<string | null>(null)
  const [selectedFlightsInfo, setSelectedFlightsInfo] = React.useState<any>(null)
  const [showMismatchGuidance, setShowMismatchGuidance] = React.useState(false);
  
  const searchParams = useSearchParams()

  React.useEffect(() => {
    // First, try to get the selected flights from session storage
    const getSelectedFlightsFromSession = () => {
      if (typeof window !== 'undefined') {
        const storedSelectedFlights = sessionStorage.getItem("selectedFlights")
        if (storedSelectedFlights) {
          try {
            return JSON.parse(storedSelectedFlights)
          } catch (e) {
            console.error("Error parsing selected flights from session storage:", e)
          }
        }
      }
      return null
    }

    const selectedFlightsData = getSelectedFlightsFromSession()
    setSelectedFlightsInfo(selectedFlightsData)
    
    const fetchOfferDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        setValidationError(null)
        
        // Get return flight ID from URL parameters
        const returnId = searchParams.get('returnFlight')
        if (returnId) {
          setReturnFlightId(returnId)
        }
        
        // Validate if we're loading the correct flights that the user selected
        if (selectedFlightsData) {
          const outboundId = selectedFlightsData.outbound
          const returnId = selectedFlightsData.return
          
          // Make sure the URL ID matches what's in session storage
          if (outboundId !== params.id && returnId !== params.id) {
            setValidationError("The flight details being viewed don't match your selected flights. Redirecting to the correct flights.")
            // If we have outbound ID in session, redirect to it with the return flight
            if (outboundId) {
              setTimeout(() => {
                window.location.href = returnId 
                  ? `/flight-details/${outboundId}?returnFlight=${returnId}` 
                  : `/flight-details/${outboundId}`
              }, 3000)
              return
            }
          }
        }
        
        // Fetch outbound flight
        console.log("Fetching outbound flight details for:", params.id)
        const outboundResponse = await getOfferDetails(params.id)
        if (outboundResponse.data) {
          console.log("[FLIGHT-DEBUG] Outbound flight details received:", {
            hasData: !!outboundResponse.data,
            offerId: outboundResponse.data?.id,
            totalAmount: outboundResponse.data?.total_amount,
            hasSlices: !!(outboundResponse.data?.slices && outboundResponse.data.slices.length > 0)
          });
          setOutboundFlight(outboundResponse.data)
        } else {
          console.error("[FLIGHT-DEBUG] Failed to fetch outbound flight:", {
            error: outboundResponse.error,
            offerId: params.id
          });
          setError(outboundResponse.error || "Failed to fetch outbound flight details")
          return
        }
        
        // If this is a round trip, fetch the return flight
        if (returnId) {
          console.log("[FLIGHT-DEBUG] Fetching return flight details for:", returnId)
          const returnResponse = await getOfferDetails(returnId)
          if (returnResponse.data) {
            console.log("[FLIGHT-DEBUG] Return flight details received:", {
              hasData: !!returnResponse.data,
              offerId: returnResponse.data?.id,
              totalAmount: returnResponse.data?.total_amount,
              hasSlices: !!(returnResponse.data?.slices && returnResponse.data.slices.length > 0)
            });
            setReturnFlight(returnResponse.data)
            
            // Improved validation for round trip flights
            // Get the last segment of outbound flight (final destination)
            const outboundSlice = outboundResponse.data.slices?.[0];
            const returnSlice = returnResponse.data.slices?.[0];
            
            if (outboundSlice && returnSlice) {
              const outboundSegments = outboundSlice.segments || [];
              const returnSegments = returnSlice.segments || [];
              
              if (outboundSegments.length > 0 && returnSegments.length > 0) {
                // Get the final destination of outbound flight
                const finalDestination = outboundSegments[outboundSegments.length - 1].destination;
                // Get the origin of return flight
                const returnOrigin = returnSegments[0].origin;
                
                console.log("Round-trip validation", {
                  outboundDestination: finalDestination,
                  returnOrigin: returnOrigin
                });
                
                // Check if they match or are in the same city
                if (!areAirportsInSameCity(finalDestination, returnOrigin)) {
                  setShowMismatchGuidance(true);
                  const errorMessage = 
                    `The return flight origin (${returnOrigin.iata_code} - ${returnOrigin.name}) ` +
                    `doesn't match the outbound flight destination (${finalDestination.iata_code} - ${finalDestination.name}). ` +
                    `This may not be a valid round trip.`;
                  
                  setValidationError(errorMessage);
                }
              }
            }
          } else {
            setError(returnResponse.error || "Failed to fetch return flight details")
          }
        }
      } catch (error) {
        console.error("Error fetching flight details:", error)
        setError("An unexpected error occurred while loading flight details")
      } finally {
        setLoading(false)
      }
    }

    fetchOfferDetails()
  }, [params.id, searchParams])

  // Calculate total price from both flights
  const totalPrice = React.useMemo(() => {
    if (!outboundFlight) return null
    
    let total = parseFloat(outboundFlight.total_amount || 0)
    let currency = outboundFlight.total_currency || "USD"
    
    if (returnFlight && returnFlight.total_amount) {
      total += parseFloat(returnFlight.total_amount)
    }
    
    return {
      amount: total.toFixed(2),
      currency
    }
  }, [outboundFlight, returnFlight])

  const handleNewSearch = () => {
    // Clear any existing selections from session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("selectedFlights");
    }
    router.push("/");
  };

  const handleBookFlight = async () => {
    if (!outboundFlight) return;
    
    console.log('[DEBUG] Starting booking process for offer:', outboundFlight.id);
    
    // Get passenger counts from search parameters or use defaults
    const adults = parseInt(searchParams.get('adults') || '1', 10);
    const children = parseInt(searchParams.get('children') || '0', 10);
    const infants = parseInt(searchParams.get('infants') || '0', 10);
    const cabinClass = searchParams.get('cabinClass') || 'economy';
    
    try {
      // Store selected flight information in session storage for the booking page
      const flightInfo = {
        outboundOfferId: outboundFlight.id,
        outboundFlight: outboundFlight,
        returnOfferId: returnFlight?.id || null,
        returnFlight: returnFlight || null,
        passengers: {
          adults,
          children,
          infants
        },
        cabinClass
      };
      
      console.log('[DEBUG] Storing flight info in session storage:', {
        outboundId: flightInfo.outboundOfferId,
        returnId: flightInfo.returnOfferId,
        passengerCounts: flightInfo.passengers
      });
      
      // Use the new storage utility instead of directly accessing sessionStorage
      appStorage.setFlightInfo(flightInfo);
      appStorage.setPassengerCounts(flightInfo.passengers);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('offerId', outboundFlight.id);
      params.append('adults', adults.toString());
      params.append('children', children.toString());
      params.append('infants', infants.toString());
      params.append('cabinClass', cabinClass);
      
      // Add return flight ID if applicable
      if (returnFlight && returnFlight.id) {
        params.append('returnOfferId', returnFlight.id);
      }
      
      // Navigate to booking page with query parameters
      router.push(`/booking?${params.toString()}`);
    } catch (error) {
      console.error('[DEBUG] Error starting booking process:', error);
      toast({
        title: "Error",
        description: "Failed to start booking process. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-gray-900 to-black text-white pt-20 md:pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <h2 className="text-2xl font-bold">Loading Flight Details...</h2>
              <p className="text-gray-400">Retrieving the most up-to-date information about your flight</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !outboundFlight) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-gray-900 to-black text-white pt-20 md:pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Flight Details Unavailable</h2>
                    <p className="text-gray-300 mb-4">{error || "Could not load flight details"}</p>
                    
                    <div className="bg-black/20 p-4 rounded mb-6 border border-gray-800">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Technical Details</h3>
                      <p className="text-xs text-gray-400 mb-2">Flight ID: {params.id}</p>
                      <p className="text-xs text-gray-400">Time: {new Date().toISOString()}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full"
                      >
                        <RepeatIcon className="w-4 h-4 mr-2" /> Retry Loading Flight Details
                      </Button>
                      
                      <Button 
                        onClick={() => window.history.back()}
                        variant="outline"
                        className="border-gray-700 hover:bg-gray-800 w-full"
                      >
                        Go Back to Search Results
                      </Button>
                      
                      <Button 
                        onClick={() => router.push("/")}
                        variant="link"
                        className="text-blue-400 hover:text-blue-300 w-full"
                      >
                        Start a New Search
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
    )
  }

  // Extract the actual outbound and return flight details
  const outboundDestination = outboundFlight.slices?.[0]?.segments?.[outboundFlight.slices[0].segments.length - 1]?.destination;
  const returnOrigin = returnFlight?.slices?.[0]?.segments?.[0]?.origin;

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-gray-900 to-black text-white pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Validation Error Alert */}
            {validationError && (
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Data Inconsistency Detected</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            {/* Mismatch Guidance Alert */}
            {showMismatchGuidance && (
              <Alert className="mb-8 bg-blue-900/50 border-blue-500">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 mt-0.5 mr-2" />
                    <div>
                      <AlertTitle className="text-blue-300">How to Fix This Issue</AlertTitle>
                      <AlertDescription>
                        For a valid round trip booking, your return flight should depart from the same city where your outbound flight arrives.
                      </AlertDescription>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/50 p-3 rounded-md">
                    <p className="text-sm mb-2 font-medium">We recommend:</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-blue-600/20 border-blue-500 hover:bg-blue-600/40 text-white mb-2 w-full"
                      onClick={handleNewSearch}
                    >
                      Start a New Search with Correct Airports
                    </Button>
                    <p className="text-xs text-blue-300">
                      Your current selection: Outbound to {outboundDestination?.iata_code}, Return from {returnOrigin?.iata_code}
                    </p>
                  </div>
                </div>
              </Alert>
            )}
          
            {/* Breadcrumbs */}
            <div className="text-sm text-gray-400 mb-6">
              <a href="/" className="hover:text-white">Home</a> {" / "}
              <a href="/search" className="hover:text-white">Flight Search</a> {" / "}
              <span className="text-gray-300">Flight Details</span>
            </div>

            {/* Title section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {returnFlight ? 'Round Trip Flight Details' : 'Flight Details'}
              </h1>
              <p className="text-gray-300">
                {returnFlight 
                  ? `From ${outboundFlight.slices?.[0]?.segments?.[0]?.origin?.iata_code || 'Origin'} to ${outboundFlight.slices?.[0]?.segments?.[outboundFlight.slices[0].segments.length - 1]?.destination?.iata_code || 'Destination'} and back`
                  : `From ${outboundFlight.slices?.[0]?.segments?.[0]?.origin?.iata_code || 'Origin'} to ${outboundFlight.slices?.[0]?.segments?.[outboundFlight.slices[0].segments.length - 1]?.destination?.iata_code || 'Destination'}`
                }
              </p>
            </div>

            {/* Flight summary at top */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-xl shadow-lg backdrop-blur-md mb-8 border border-blue-500/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="font-bold text-xl mb-2">
                    {outboundFlight.owner?.name || 'Airline'}
                    {returnFlight && returnFlight.owner?.name !== outboundFlight.owner?.name && 
                      ` / ${returnFlight.owner?.name}`}
                  </h2>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="flex items-center">
                      <PlaneTakeoff className="w-4 h-4 mr-1" /> 
                      {outboundFlight.slices?.[0]?.segments?.[0]?.origin?.iata_code || 'Origin'}
                    </div>
                    {returnFlight && (
                      <>
                        <span>↔</span>
                        <div className="flex items-center">
                          <PlaneLanding className="w-4 h-4 mr-1" /> 
                          {outboundFlight.slices?.[0]?.segments?.[outboundFlight.slices[0].segments.length - 1]?.destination?.iata_code || 'Destination'}
                        </div>
                      </>
                    )}
                    {!returnFlight && (
                      <>
                        <span>→</span>
                        <div className="flex items-center">
                          <PlaneLanding className="w-4 h-4 mr-1" /> 
                          {outboundFlight.slices?.[0]?.segments?.[outboundFlight.slices[0].segments.length - 1]?.destination?.iata_code || 'Destination'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {totalPrice?.amount} {totalPrice?.currency}
                  </div>
                  <div className="text-sm text-gray-300">
                    {returnFlight ? 'Round trip total' : 'Total price'}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight trip overview */}
            <div className="mb-8 bg-white/5 rounded-lg border border-white/10 p-4">
              <h2 className="text-lg font-medium mb-4">Trip Overview</h2>
              
              {/* Outbound Flight */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-indigo-500/20 p-1 rounded-full">
                    <PlaneTakeoff className="h-4 w-4 text-indigo-400" />
                  </div>
                  <h3 className="font-medium">Outbound Flight</h3>
                </div>
                
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {outboundFlight.slices?.[0]?.segments?.[0]?.origin?.iata_code}
                    </div>
                    <div className="text-sm text-gray-400">
                      {outboundFlight.slices?.[0]?.segments?.[0]?.origin?.name}
                    </div>
                    <div className="text-xs">
                      {new Date(outboundFlight.slices?.[0]?.segments?.[0]?.departing_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="text-center px-4 flex-1">
                    <div className="text-xs text-gray-400 mb-1">
                      {outboundFlight.slices?.[0]?.duration}
                    </div>
                    <div className="flex items-center">
                      <div className="h-0.5 bg-gray-700 flex-grow"></div>
                      <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                    </div>
                    <div className="text-xs mt-1">
                      {outboundFlight.slices?.[0]?.segments?.length > 1 
                        ? `${outboundFlight.slices?.[0]?.segments?.length} stops` 
                        : 'Direct'}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {outboundFlight.slices?.[0]?.segments?.[outboundFlight.slices[0].segments.length - 1]?.destination?.iata_code}
                    </div>
                    <div className="text-sm text-gray-400">
                      {outboundFlight.slices?.[0]?.segments?.[outboundFlight.slices[0].segments.length - 1]?.destination?.name}
                    </div>
                    <div className="text-xs">
                      {new Date(outboundFlight.slices?.[0]?.segments?.[outboundFlight.slices[0].segments.length - 1]?.arriving_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Return Flight */}
              {returnFlight && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-500/20 p-1 rounded-full">
                      <PlaneLanding className="h-4 w-4 text-purple-400" />
                    </div>
                    <h3 className="font-medium">Return Flight</h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {returnFlight.slices?.[0]?.segments?.[0]?.origin?.iata_code}
                      </div>
                      <div className="text-sm text-gray-400">
                        {returnFlight.slices?.[0]?.segments?.[0]?.origin?.name}
                      </div>
                      <div className="text-xs">
                        {new Date(returnFlight.slices?.[0]?.segments?.[0]?.departing_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="text-center px-4 flex-1">
                      <div className="text-xs text-gray-400 mb-1">
                        {returnFlight.slices?.[0]?.duration}
                      </div>
                      <div className="flex items-center">
                        <div className="h-0.5 bg-gray-700 flex-grow"></div>
                        <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                      </div>
                      <div className="text-xs mt-1">
                        {returnFlight.slices?.[0]?.segments?.length > 1 
                          ? `${returnFlight.slices?.[0]?.segments?.length} stops` 
                          : 'Direct'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {returnFlight.slices?.[0]?.segments?.[returnFlight.slices[0].segments.length - 1]?.destination?.iata_code}
                      </div>
                      <div className="text-sm text-gray-400">
                        {returnFlight.slices?.[0]?.segments?.[returnFlight.slices[0].segments.length - 1]?.destination?.name}
                      </div>
                      <div className="text-xs">
                        {new Date(returnFlight.slices?.[0]?.segments?.[returnFlight.slices[0].segments.length - 1]?.arriving_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs for flight details */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4">Flight Details</h2>
              {returnFlight ? (
                <Tabs defaultValue="outbound" className="mb-8">
                  <TabsList className="w-full">
                    <TabsTrigger value="outbound" className="flex-1">
                      <span className="flex items-center gap-2">
                        <PlaneTakeoff className="w-4 h-4" />
                        Outbound Flight
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="return" className="flex-1">
                      <span className="flex items-center gap-2">
                        <PlaneLanding className="w-4 h-4" />
                        Return Flight
                      </span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="outbound">
                    <FlightOfferDetails flightOffer={outboundFlight} />
                  </TabsContent>
                  <TabsContent value="return">
                    <FlightOfferDetails flightOffer={returnFlight} />
                  </TabsContent>
                </Tabs>
              ) : (
                <FlightOfferDetails flightOffer={outboundFlight} />
              )}
            </div>

            {/* Accordion sections */}
            <Accordion type="single" collapsible className="mb-8">
              <AccordionItem value="baggage">
                <AccordionTrigger className="text-lg">
                  <div className="flex items-center gap-2">
                    <Luggage className="w-5 h-5" />
                    Baggage Information
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Checked Baggage</h3>
                      <p>
                        {outboundFlight.passenger_identity_documents_required ? 
                          "This fare includes checked baggage allowance. Please check with the airline for specific weight limits." :
                          "No checked baggage is included with this fare. Additional baggage can be purchased during booking."}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Carry-on Baggage</h3>
                      <p>Standard carry-on baggage is allowed (typically 7-10kg). Size and weight restrictions may vary by airline.</p>
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-2">
                      Note: Baggage allowances and fees may vary. Please check with the airline for the most up-to-date information.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="fare-rules">
                <AccordionTrigger className="text-lg">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Fare Rules
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Cancellation Policy</h3>
                      <p>
                        {outboundFlight.conditions?.refund_before_departure?.allowed ? 
                          "This fare allows cancellations with a fee. Refunds may be subject to penalty charges." :
                          "This fare doesn't allow cancellations with refund. You may be able to change your flight for a fee."}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Change Policy</h3>
                      <p>
                        {outboundFlight.conditions?.change_before_departure?.allowed ? 
                          "Changes to this booking are permitted subject to availability and may incur a change fee plus fare difference." :
                          "Changes are not permitted for this fare type."}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-2">
                      Note: Fare rules are subject to the airline's terms and conditions. Additional restrictions may apply.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="price-breakdown">
                <AccordionTrigger className="text-lg">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Price Breakdown
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {outboundFlight && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <h3 className="font-medium mb-3">Outbound Flight</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Base fare</span>
                            <span>
                              {outboundFlight.base_amount ? Number.parseFloat(outboundFlight.base_amount).toFixed(2) : "0.00"}{" "}
                              {outboundFlight.base_currency || ""}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxes and fees</span>
                            <span>
                              {outboundFlight.tax_amount ? Number.parseFloat(outboundFlight.tax_amount).toFixed(2) : "0.00"}{" "}
                              {outboundFlight.tax_currency || ""}
                            </span>
                          </div>
                          <div className="border-t border-white/10 pt-2 flex justify-between font-medium">
                            <span>Subtotal</span>
                            <span>
                              {outboundFlight.total_amount ? Number.parseFloat(outboundFlight.total_amount).toFixed(2) : "0.00"}{" "}
                              {outboundFlight.total_currency || ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {returnFlight && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <h3 className="font-medium mb-3">Return Flight</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Base fare</span>
                            <span>
                              {returnFlight.base_amount ? Number.parseFloat(returnFlight.base_amount).toFixed(2) : "0.00"}{" "}
                              {returnFlight.base_currency || ""}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxes and fees</span>
                            <span>
                              {returnFlight.tax_amount ? Number.parseFloat(returnFlight.tax_amount).toFixed(2) : "0.00"}{" "}
                              {returnFlight.tax_currency || ""}
                            </span>
                          </div>
                          <div className="border-t border-white/10 pt-2 flex justify-between font-medium">
                            <span>Subtotal</span>
                            <span>
                              {returnFlight.total_amount ? Number.parseFloat(returnFlight.total_amount).toFixed(2) : "0.00"}{" "}
                              {returnFlight.total_currency || ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 rounded-lg border border-blue-500/20">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Price</span>
                        <span>{totalPrice?.amount} {totalPrice?.currency}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400">
                      Note: Price is guaranteed once the booking is confirmed. Additional services or upgrades may incur extra charges.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="seat-map">
                <AccordionTrigger className="text-lg">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Seat Selection
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {outboundFlight && outboundFlight.slices && outboundFlight.slices.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Outbound Flight Seat Map</h3>
                      {outboundFlight.slices[0].segments.map((segment: any, index: number) => (
                        <div key={segment.id} className="mb-6">
                          <h4 className="text-sm mb-2">
                            Segment {index + 1}: {segment.origin.iata_code} to {segment.destination.iata_code}
                          </h4>
                          <SeatMap offerId={params.id} segmentId={segment.id} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {returnFlightId && returnFlight && returnFlight.slices && returnFlight.slices.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Return Flight Seat Map</h3>
                      {returnFlight.slices[0].segments.map((segment: any, index: number) => (
                        <div key={segment.id} className="mb-6">
                          <h4 className="text-sm mb-2">
                            Segment {index + 1}: {segment.origin.iata_code} to {segment.destination.iata_code}
                          </h4>
                          <SeatMap offerId={returnFlightId} segmentId={segment.id} />
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Booking button */}
            <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-md p-4 -mx-4 mt-8 border-t border-white/10">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {totalPrice?.amount} {totalPrice?.currency}
                    </div>
                    <div className="text-sm text-gray-300">
                      {returnFlight ? 'Round trip total' : 'Total price'}
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    {validationError && (
                      <Button
                        onClick={handleNewSearch}
                        size="lg"
                        className="flex-1 md:flex-auto bg-blue-700 hover:bg-blue-800"
                      >
                        New Search
                      </Button>
                    )}
                    <Button 
                      onClick={handleBookFlight}
                      size="lg"
                      className={`flex-1 md:flex-auto px-8 ${
                        validationError 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      }`}
                      disabled={!!validationError}
                    >
                      {validationError ? 'Fix Error to Continue' : 'Continue to Booking'}
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
  )
}
