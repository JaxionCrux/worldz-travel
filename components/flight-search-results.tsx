"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  ArrowRight,
  Luggage,
  Heart,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RepeatIcon,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { SearchLoadingAnimation } from "@/components/search-loading-animation"
import type { FlightOffer } from "@/lib/duffel"

// Add this at the top of the file, after the imports
declare global {
  interface Window {
    _flightSearchResultsData: any
  }
}

interface FlightSearchResultsProps {
  isLoading?: boolean
  searchResults?: any
  searchCompleted?: boolean
}

export function FlightSearchResults({
  isLoading = false,
  searchResults: initialResults = null,
  searchCompleted = false,
}: FlightSearchResultsProps) {
  const router = useRouter()
  const [searchResults, setSearchResults] = useState<any>(initialResults)
  const [loading, setLoading] = useState(isLoading)
  const [expandedFlights, setExpandedFlights] = useState<{ [key: string]: boolean }>({})
  const [sortBy, setSortBy] = useState("best")
  const [tripType, setTripType] = useState<string>("one_way")
  
  // Helper function to parse duration into minutes for sorting
  const parseDuration = (duration: string): number => {
    if (!duration) return 0;
    const hours = parseInt(duration.match(/(\d+)H/)?.[1] || "0", 10);
    const minutes = parseInt(duration.match(/(\d+)M/)?.[1] || "0", 10);
    return hours * 60 + minutes;
  };
  
  // Helper function to get total duration of all flight segments
  const getTotalDuration = (offer: FlightOffer): number => {
    let totalMinutes = 0;
    if (offer.slices) {
      offer.slices.forEach(slice => {
        if (slice.duration) {
          totalMinutes += parseDuration(slice.duration);
        }
      });
    }
    return totalMinutes;
  };
  
  // Format duration in a readable way
  const formatDuration = (duration: string) => {
    if (!duration) return "N/A"
    // Format ISO duration (PT2H30M) to readable format (2h 30m)
    const hours = duration.match(/(\d+)H/)?.[1] || "0"
    const minutes = duration.match(/(\d+)M/)?.[1] || "0"
    return `${hours}h ${minutes}m`
  }

  // Format time from date string
  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "HH:mm")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "N/A"
    }
  }

  // Format date from date string
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "EEE, MMM d")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "N/A"
    }
  }
  
  // Get airline logo URL (placeholder in this example)
  const getAirlineLogoUrl = (airlineCode: string) => {
    return `/placeholder.svg?height=40&width=40`
  }

  useEffect(() => {
    // Update loading state based on props
    setLoading(isLoading)

    // If we have initial results from props, use those
    if (initialResults) {
      setSearchResults(initialResults)
      
      // Determine trip type based on search parameters
      const searchParams = sessionStorage.getItem("flightSearchParams");
      if (searchParams) {
        const params = JSON.parse(searchParams);
        setTripType(params.tripType || "one_way");
      }
    }
    // Otherwise, try to get results from window object
    else if (window._flightSearchResultsData) {
      setSearchResults(window._flightSearchResultsData)
      
      // Determine trip type based on search parameters
      const searchParams = sessionStorage.getItem("flightSearchParams");
      if (searchParams) {
        const params = JSON.parse(searchParams);
        setTripType(params.tripType || "one_way");
      }
    }
  }, [isLoading, initialResults])

  // Handle selecting a flight
  const handleSelectFlight = (offerId: string) => {
    // Get passenger counts from session storage
    const searchParamsFromStorage = sessionStorage.getItem("flightSearchParams");
    let adults = 1;
    let children = 0;
    let infants = 0;
    let cabinClass = "economy";
    
    if (searchParamsFromStorage) {
      try {
        const params = JSON.parse(searchParamsFromStorage);
        adults = params.adults || 1;
        children = params.children || 0;
        infants = params.infants || 0;
        cabinClass = params.cabinClass || "economy";
      } catch (e) {
        console.error("[DEBUG] Error parsing flight search params:", e);
      }
    }
    
    // Construct the URL with passenger counts
    const passengerParams = new URLSearchParams();
    passengerParams.append('adults', adults.toString());
    passengerParams.append('children', children.toString());
    passengerParams.append('infants', infants.toString());
    passengerParams.append('cabinClass', cabinClass);
    
    // For one-way trips, just navigate directly to details
    if (tripType === "one_way") {
      router.push(`/flight-details/${offerId}?${passengerParams.toString()}`);
      return;
    }
    
    // For round trips, store the selected flight in session storage
    // No need for separate return flight handling anymore
    const selectedOffer = searchResults.offers.find((offer: any) => offer.id === offerId);
    
    if (selectedOffer) {
      // Store the selection in session storage
      sessionStorage.setItem("selectedFlights", JSON.stringify({
        outbound: offerId,
        price: {
          total: selectedOffer.total_amount || "0",
          currency: selectedOffer.total_currency || "USD"
        }
      }));
      
      // Navigate to flight details with passenger params
      router.push(`/flight-details/${offerId}?${passengerParams.toString()}`);
    }
  }

  // Toggle expanding/collapsing flight details
  const toggleFlightDetails = (offerId: string) => {
    setExpandedFlights((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }))
  }

  // Show loading animation while search is in progress
  if (loading || !searchCompleted) {
    return <SearchLoadingAnimation />
  }

  // Validate search results structure - add detailed logging for debugging
  if (searchCompleted && (!searchResults || !searchResults.offers)) {
    console.error("[RESULTS-DEBUG] Search results validation failed:", {
      hasResults: !!searchResults,
      resultsKeys: searchResults ? Object.keys(searchResults) : [],
      hasOffers: searchResults?.offers ? true : false,
      offersCount: searchResults?.offers?.length || 0
    });
    
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Search Results Unavailable</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We encountered an error while processing your search results. This might be due to a temporary issue or invalid search parameters.
        </p>
        <Alert className="max-w-md mx-auto mb-6 bg-blue-50 text-blue-700 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Debugging Information</AlertTitle>
          <AlertDescription className="text-xs text-left">
            Results Data: {searchResults ? 'Available' : 'Missing'}<br />
            Offers Data: {searchResults?.offers ? 'Available' : 'Missing'}<br />
            Search ID: {searchResults?.id || 'Not available'}
          </AlertDescription>
        </Alert>
        <div className="space-x-4">
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Back to Search
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <RepeatIcon className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Only show "no flights found" if search is completed and we have offers array but it's empty
  if (searchCompleted && searchResults?.offers?.length === 0) {
    console.warn("[RESULTS-DEBUG] No flight offers found in the search results");
    
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plane className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold mb-4">No flights found</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We couldn't find any flights matching your search criteria. Try adjusting your search parameters or dates.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          Back to Search
        </Button>
      </div>
    )
  }

  // Sort the offers based on the selected sort type
  const sortedOffers = [...(searchResults?.offers || [])].sort((a, b) => {
    switch (sortBy) {
      case "cheapest":
        return parseFloat(a.total_amount) - parseFloat(b.total_amount);
      case "fastest":
        return getTotalDuration(a) - getTotalDuration(b);
      case "recommended":
        // Combine price and duration for a recommendation score
        const aScore = parseFloat(a.total_amount) * 0.7 + getTotalDuration(a) * 0.3;
        const bScore = parseFloat(b.total_amount) * 0.7 + getTotalDuration(b) * 0.3;
        return aScore - bScore;
      case "best":
      default:
        // Simple combination of price and duration
        return parseFloat(a.total_amount) * 0.5 + getTotalDuration(a) * 0.5;
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{sortedOffers.length || 0} flights found</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          Modify Search
        </Button>
      </div>

      {/* Sorting tabs */}
      <Tabs 
        defaultValue="best" 
        value={sortBy}
        className="mb-6" 
        onValueChange={setSortBy}
      >
        <TabsList className="grid grid-cols-4 w-full bg-indigo-50 p-1 rounded-lg">
          <TabsTrigger
            value="best"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            Best
          </TabsTrigger>
          <TabsTrigger
            value="cheapest"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            Cheapest
          </TabsTrigger>
          <TabsTrigger
            value="fastest"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            Fastest
          </TabsTrigger>
          <TabsTrigger
            value="recommended"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            Recommended
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Flight offers */}
      {sortedOffers.map((offer: FlightOffer) => {
        // Safety check for required properties
        if (!offer || !offer.slices || offer.slices.length === 0) {
          return null; // Skip rendering if missing critical data
        }

        // Get outbound and return slices
        const outboundSlice = offer.slices[0];
        const returnSlice = offer.slices.length > 1 ? offer.slices[1] : null;
        
        // Skip if we're missing critical data
        if (!outboundSlice || !outboundSlice.segments || outboundSlice.segments.length === 0) {
          return null;
        }
        
        // Get important segments for display
        const outboundFirstSegment = outboundSlice.segments[0];
        const outboundLastSegment = outboundSlice.segments[outboundSlice.segments.length - 1];
        
        // Return flight segments (if it exists)
        const returnFirstSegment = returnSlice?.segments?.[0];
        const returnLastSegment = returnSlice?.segments?.[returnSlice.segments.length - 1];
        
        // Is this a one-way trip?
        const isOneWay = !returnSlice;

        return (
          <Card key={offer.id} className="mb-6 overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Main flight info - now shows both outbound and return together */}
              <div className="border-b border-gray-100">
                {/* Card header with airline and pricing */}
                <div className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {offer.owner && offer.owner.logo_symbol_url ? (
                      <Image
                        src={offer.owner.logo_symbol_url}
                        alt={offer.owner?.name || "Airline"}
                        width={48}
                        height={48}
                        className="rounded-full bg-white p-1 border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Plane className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{offer.owner?.name || "Airline"}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">
                          {isOneWay ? "One-way" : "Round trip"}
                        </Badge>
                        {sortBy === "cheapest" && (
                          <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
                            Best price
                          </Badge>
                        )}
                        {sortBy === "fastest" && (
                          <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">
                            Fastest
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-indigo-700">
                      {Number.parseFloat(offer.total_amount || "0").toFixed(2)} {offer.total_currency || "USD"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {isOneWay ? "One-way total" : "Round trip total"}
                    </span>
                    <Button
                      onClick={() => handleSelectFlight(offer.id)}
                      className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      Select
                    </Button>
                  </div>
                </div>
                
                {/* Outbound flight summary */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="mb-2 flex items-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mr-2">
                      Outbound
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {formatDate(outboundFirstSegment.departing_at)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{formatTime(outboundFirstSegment.departing_at)}</span>
                      <span className="text-xs text-gray-600">{outboundFirstSegment.origin?.iata_code || "N/A"}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-600">{formatDuration(outboundSlice.duration || "")}</span>
                      <div className="relative w-24 md:w-32">
                        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300" />
                        <div className="absolute top-1/2 left-0 -translate-y-1/2">
                          <PlaneTakeoff className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="absolute top-1/2 right-0 -translate-y-1/2">
                          <PlaneLanding className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {outboundSlice.segments.length > 1
                          ? `${outboundSlice.segments.length - 1} ${outboundSlice.segments.length - 1 === 1 ? "stop" : "stops"}`
                          : "Direct"}
                      </span>
                    </div>

                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{formatTime(outboundLastSegment.arriving_at)}</span>
                      <span className="text-xs text-gray-600">{outboundLastSegment.destination?.iata_code || "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                {/* Return flight summary (if round trip) */}
                {returnSlice && returnFirstSegment && returnLastSegment && (
                  <div className="p-4 bg-white border-t border-gray-100">
                    <div className="mb-2 flex items-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">
                        Return
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(returnFirstSegment.departing_at)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{formatTime(returnFirstSegment.departing_at)}</span>
                        <span className="text-xs text-gray-600">{returnFirstSegment.origin?.iata_code || "N/A"}</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-600">{formatDuration(returnSlice.duration || "")}</span>
                        <div className="relative w-24 md:w-32">
                          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300" />
                          <div className="absolute top-1/2 left-0 -translate-y-1/2">
                            <PlaneTakeoff className="w-3 h-3 text-gray-400" />
                          </div>
                          <div className="absolute top-1/2 right-0 -translate-y-1/2">
                            <PlaneLanding className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {returnSlice.segments.length > 1
                            ? `${returnSlice.segments.length - 1} ${returnSlice.segments.length - 1 === 1 ? "stop" : "stops"}`
                            : "Direct"}
                        </span>
                      </div>

                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{formatTime(returnLastSegment.arriving_at)}</span>
                        <span className="text-xs text-gray-600">{returnLastSegment.destination?.iata_code || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Flight details toggle button */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Luggage className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-600">Carry-on bag included</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 -mr-2"
                    onClick={() => toggleFlightDetails(offer.id)}
                  >
                    {expandedFlights[offer.id] ? (
                      <>
                        <span className="mr-1">Hide details</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span className="mr-1">Show details</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded flight details */}
              {expandedFlights[offer.id] && (
                <div className="bg-gray-50">
                  {/* Outbound flight details */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="mb-3">
                      <h4 className="font-medium flex items-center">
                        <PlaneTakeoff className="w-4 h-4 mr-2 text-blue-500" />
                        Outbound Flight
                      </h4>
                      <div className="text-xs text-gray-500 ml-6">
                        {formatDate(outboundFirstSegment.departing_at)}
                      </div>
                    </div>
                    
                    {outboundSlice.segments.map((segment: any, index: number) => (
                      <div key={`outbound-${index}`} className="mb-4 last:mb-0 ml-6">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                              <Image
                                src={getAirlineLogoUrl(segment.operating_carrier?.iata_code || "")}
                                alt={segment.operating_carrier?.name || "Airline"}
                                width={20}
                                height={20}
                              />
                            </div>
                            {index < outboundSlice.segments.length - 1 && (
                              <div className="h-16 border-l border-dashed border-gray-300 my-1"></div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <div>
                                <div className="font-medium">{formatTime(segment.departing_at)}</div>
                                <div className="text-sm text-gray-600">{segment.origin?.iata_code}</div>
                                <div className="text-xs text-gray-500">{segment.origin?.name}</div>
                              </div>

                              <div className="text-center">
                                <div className="text-xs text-gray-600">{formatDuration(segment.duration || "")}</div>
                                <div className="text-xs text-gray-500">
                                  {segment.operating_carrier?.iata_code}{segment.operating_carrier_flight_number}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-medium">{formatTime(segment.arriving_at)}</div>
                                <div className="text-sm text-gray-600">{segment.destination?.iata_code}</div>
                                <div className="text-xs text-gray-500">{segment.destination?.name}</div>
                              </div>
                            </div>

                            {index < outboundSlice.segments.length - 1 && (
                              <div className="bg-white p-2 rounded border border-gray-200 text-xs text-gray-600 mb-2">
                                <div className="font-medium">
                                  Connection • {formatDuration(outboundSlice.connections?.[index]?.duration || "")}
                                </div>
                                <div>
                                  {segment.destination?.name} ({segment.destination?.iata_code})
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Return flight details (if round trip) */}
                  {returnSlice && (
                    <div className="p-4">
                      <div className="mb-3">
                        <h4 className="font-medium flex items-center">
                          <PlaneLanding className="w-4 h-4 mr-2 text-green-500" />
                          Return Flight
                        </h4>
                        <div className="text-xs text-gray-500 ml-6">
                          {formatDate(returnFirstSegment.departing_at)}
                        </div>
                      </div>
                      
                      {returnSlice.segments.map((segment: any, index: number) => (
                        <div key={`return-${index}`} className="mb-4 last:mb-0 ml-6">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                <Image
                                  src={getAirlineLogoUrl(segment.operating_carrier?.iata_code || "")}
                                  alt={segment.operating_carrier?.name || "Airline"}
                                  width={20}
                                  height={20}
                                />
                              </div>
                              {index < returnSlice.segments.length - 1 && (
                                <div className="h-16 border-l border-dashed border-gray-300 my-1"></div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between mb-2">
                                <div>
                                  <div className="font-medium">{formatTime(segment.departing_at)}</div>
                                  <div className="text-sm text-gray-600">{segment.origin?.iata_code}</div>
                                  <div className="text-xs text-gray-500">{segment.origin?.name}</div>
                                </div>

                                <div className="text-center">
                                  <div className="text-xs text-gray-600">{formatDuration(segment.duration || "")}</div>
                                  <div className="text-xs text-gray-500">
                                    {segment.operating_carrier?.iata_code}{segment.operating_carrier_flight_number}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="font-medium">{formatTime(segment.arriving_at)}</div>
                                  <div className="text-sm text-gray-600">{segment.destination?.iata_code}</div>
                                  <div className="text-xs text-gray-500">{segment.destination?.name}</div>
                                </div>
                              </div>

                              {index < returnSlice.segments.length - 1 && (
                                <div className="bg-white p-2 rounded border border-gray-200 text-xs text-gray-600 mb-2">
                                  <div className="font-medium">
                                    Connection • {formatDuration(returnSlice.connections?.[index]?.duration || "")}
                                  </div>
                                  <div>
                                    {segment.destination?.name} ({segment.destination?.iata_code})
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
