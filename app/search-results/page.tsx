"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FlightSearchResults } from "@/components/flight-search-results"
import { SearchSummary } from "@/components/search-summary"
import { FilterSidebar } from "@/components/filter-sidebar"
import { searchFlightsAction } from "@/app/actions/flight-actions"
import { AlertCircle, RepeatIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MultiCityFlight {
  originCode: string;
  destinationCode: string;
  date: string;
}

export default function SearchResultsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchResults, setSearchResults] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const [searchCompleted, setSearchCompleted] = useState(false)
  const [searchType, setSearchType] = useState<string>("one_way")
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchResults() {
      try {
        console.log("[RESULTS-DEBUG] Starting to fetch flight search results");
        setIsLoading(true)
        setSearchCompleted(false)
        setError(null)

        // First try to get results from sessionStorage
        const storedParams = sessionStorage.getItem("flightSearchParams")

        if (storedParams) {
          const params = JSON.parse(storedParams)
          setSearchType(params.tripType || "one_way")
          console.log("[RESULTS-DEBUG] Retrieved search params from session storage:", params)

          // Create FormData from stored parameters
          const formData = new FormData()

          if (params.tripType === "multi_city") {
            formData.append("tripType", "multi_city")
            formData.append("adults", params.adults.toString())
            formData.append("children", (params.children || 0).toString())
            formData.append("infants", (params.infants || 0).toString())
            formData.append("cabinClass", params.cabinClass)

            console.log("[RESULTS-DEBUG] Processing multi-city flight data:", params.multiCityFlights);
            
            if (!params.multiCityFlights || params.multiCityFlights.length === 0) {
              console.error("[RESULTS-DEBUG] Missing multi-city flight data");
              setError("Missing multi-city flight information. Please go back and try searching again.");
              setSearchCompleted(true);
              setIsLoading(false);
              return;
            }

            params.multiCityFlights.forEach((flight: MultiCityFlight, index: number) => {
              formData.append(`origin_${index}`, flight.originCode)
              formData.append(`destination_${index}`, flight.destinationCode)
              formData.append(`date_${index}`, flight.date)
            })

            formData.append("segments", params.multiCityFlights.length.toString())
          } else {
            // Validate required fields
            if (!params.origin || !params.destination || !params.departureDate) {
              console.error("[RESULTS-DEBUG] Missing required search parameters:", {
                origin: params.origin,
                destination: params.destination,
                departureDate: params.departureDate
              });
              setError("Missing required search parameters. Please go back and ensure all required fields are filled.");
              setSearchCompleted(true);
              setIsLoading(false);
              return;
            }
            
            formData.append("origin", params.origin)
            formData.append("destination", params.destination)
            formData.append("departureDate", params.departureDate)

            if (params.returnDate) {
              formData.append("returnDate", params.returnDate)
            }

            formData.append("adults", params.adults.toString())
            formData.append("children", (params.children || 0).toString())
            formData.append("infants", (params.infants || 0).toString())
            formData.append("cabinClass", params.cabinClass)
            formData.append("tripType", params.tripType)
          }

          // Fetch results directly
          console.log("[RESULTS-DEBUG] Prepared form data for search:", Object.fromEntries(formData.entries()));
          console.log("[RESULTS-DEBUG] Calling searchFlightsAction...");
          const response = await searchFlightsAction(formData)

          console.log("[RESULTS-DEBUG] Search response received:", {
            hasData: !!response.data,
            hasError: !!response.error,
            error: response.error
          });

          if (response.data) {
            console.log("[RESULTS-DEBUG] Search successful, offers count:", response.data.offers?.length || 0);
            
            if (!response.data.offers || response.data.offers.length === 0) {
              console.warn("[RESULTS-DEBUG] No flight offers found in the response");
              setError("No flights found for your search criteria. Please try different dates or airports.");
            } else {
              setSearchResults(response.data)
              // Make results available to the FlightSearchResults component
              window._flightSearchResultsData = response.data
            }
          } else {
            const errorMessage = response.error || "Failed to fetch flight results. Please try searching again.";
            console.error("[RESULTS-DEBUG] Search failed:", errorMessage);
            setError(errorMessage);
            
            // Parse and enhance Duffel API errors for better debugging
            if (errorMessage.includes("Duffel API error:")) {
              try {
                const errorJson = errorMessage.substring(errorMessage.indexOf('{'));
                const parsedError = JSON.parse(errorJson);
                console.error("[RESULTS-DEBUG] Duffel API error details:", parsedError);
                
                if (parsedError.errors && parsedError.errors.length > 0) {
                  const enhancedMessage = parsedError.errors.map((err: any) => 
                    `${err.title}: ${err.message}`
                  ).join(", ");
                  setError(`API Error: ${enhancedMessage}`);
                }
              } catch (parseError) {
                console.error("[RESULTS-DEBUG] Error parsing Duffel error:", parseError);
              }
            }
          }
        } else {
          console.error("[RESULTS-DEBUG] No search parameters found in session storage");
          setError("No search parameters found. Please go back to the homepage and start a new search.");
        }
      } catch (err) {
        console.error("[RESULTS-DEBUG] Unexpected error fetching search results:", err);
        console.error("[RESULTS-DEBUG] Error details:", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        
        setError("An unexpected error occurred. Please try searching again.");
      } finally {
        // Mark search as completed regardless of outcome
        setSearchCompleted(true)
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 pt-20 md:pt-24">
        {/* Search summary bar */}
        <SearchSummary />

        {/* Main content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters - desktop only */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar />
            </div>

            {/* Results */}
            <div className="flex-1">
              {error && searchCompleted ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-5 rounded-lg shadow-sm">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                      <div>
                        <h3 className="font-medium text-red-800">Error</h3>
                        <p className="mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                    <Button
                      onClick={() => window.location.href = "/"}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      Back to Search
                    </Button>
                    
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="ml-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      <RepeatIcon className="h-4 w-4 mr-1" />
                      Retry Search
                    </Button>
                  </div>
                </div>
              ) : (
                <FlightSearchResults
                  isLoading={isLoading}
                  searchResults={searchResults}
                  searchCompleted={searchCompleted}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
