"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { searchFlightsAction, searchReturnFlightsAction } from "@/app/actions/flight-actions"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, SearchIcon } from "lucide-react"

export default function TestSearchPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [returnSearchResults, setReturnSearchResults] = useState<any>(null)
  const [returnSearchError, setReturnSearchError] = useState<string | null>(null)
  const [testParameters, setTestParameters] = useState({
    origin: "MCO",
    destination: "SFO",
    departureDate: "2025-05-15",
    returnDate: "2025-05-22",
    adults: "1",
    cabinClass: "economy"
  })

  const handleParameterChange = (field: string, value: string) => {
    setTestParameters({
      ...testParameters,
      [field]: value
    })
  }

  const runOutboundTest = async () => {
    setIsSearching(true)
    setSearchResults(null)
    setSearchError(null)
    setReturnSearchResults(null)
    setReturnSearchError(null)

    try {
      // Create form data for the search
      const formData = new FormData()
      formData.append("origin", testParameters.origin)
      formData.append("destination", testParameters.destination)
      formData.append("departureDate", testParameters.departureDate)
      formData.append("returnDate", testParameters.returnDate)
      formData.append("adults", testParameters.adults)
      formData.append("cabinClass", testParameters.cabinClass)
      formData.append("tripType", "return")

      console.log("Running test search with parameters:", testParameters)
      const response = await searchFlightsAction(formData)

      if (response.success && response.data) {
        setSearchResults(response.data)
        console.log("Test search successful:", response.data.offers?.length || 0, "offers found")
      } else {
        setSearchError(response.error || "Unknown error")
        console.error("Test search failed:", response.error)
      }
    } catch (error) {
      console.error("Error during test search:", error)
      setSearchError("An unexpected error occurred")
    } finally {
      setIsSearching(false)
    }
  }

  const runReturnTest = async () => {
    if (!searchResults || !searchResults.offers || searchResults.offers.length === 0) {
      setReturnSearchError("Cannot test return flights without outbound search results")
      return
    }

    setIsSearching(true)
    setReturnSearchResults(null)
    setReturnSearchError(null)

    try {
      // Get the first offer from the outbound search
      const firstOffer = searchResults.offers[0]
      const outboundDestination = firstOffer.slices?.[0]?.segments?.[
        firstOffer.slices[0].segments.length - 1
      ]?.destination?.iata_code
      
      const outboundOrigin = firstOffer.slices?.[0]?.segments?.[0]?.origin?.iata_code

      if (!outboundDestination || !outboundOrigin) {
        setReturnSearchError("Cannot determine origin/destination from outbound flight")
        setIsSearching(false)
        return
      }

      console.log("Testing return flight search:", {
        outboundDestination,
        outboundOrigin,
        returnDate: testParameters.returnDate
      })

      const response = await searchReturnFlightsAction({
        outboundDestination,
        outboundOrigin,
        returnDate: testParameters.returnDate,
        passengers: {
          adults: parseInt(testParameters.adults)
        },
        cabinClass: testParameters.cabinClass
      })

      if (response.success && response.data) {
        setReturnSearchResults(response.data)
        console.log("Return test search successful:", response.data.offers?.length || 0, "offers found")
      } else {
        setReturnSearchError(response.error || "Unknown error")
        console.error("Return test search failed:", response.error)
      }
    } catch (error) {
      console.error("Error during return test search:", error)
      setReturnSearchError("An unexpected error occurred")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Flight Search Test Tool</h1>
            <p className="text-gray-600">Use this tool to debug round trip search issues</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Test Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input 
                  id="origin" 
                  value={testParameters.origin} 
                  onChange={(e) => handleParameterChange("origin", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input 
                  id="destination" 
                  value={testParameters.destination} 
                  onChange={(e) => handleParameterChange("destination", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input 
                  id="departureDate" 
                  type="date" 
                  value={testParameters.departureDate} 
                  onChange={(e) => handleParameterChange("departureDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="returnDate">Return Date</Label>
                <Input 
                  id="returnDate" 
                  type="date" 
                  value={testParameters.returnDate} 
                  onChange={(e) => handleParameterChange("returnDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input 
                  id="adults" 
                  type="number" 
                  min="1" 
                  max="9" 
                  value={testParameters.adults} 
                  onChange={(e) => handleParameterChange("adults", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cabinClass">Cabin Class</Label>
                <Select 
                  value={testParameters.cabinClass}
                  onValueChange={(value) => handleParameterChange("cabinClass", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cabin class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium_economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={runOutboundTest} 
                disabled={isSearching}
                className="flex-1"
              >
                <SearchIcon className="w-4 h-4 mr-2" />
                {isSearching ? "Searching..." : "Test Outbound Search"}
              </Button>
              
              <Button 
                onClick={runReturnTest} 
                disabled={isSearching || !searchResults?.offers?.length}
                variant="outline"
                className="flex-1"
              >
                <SearchIcon className="w-4 h-4 mr-2" />
                Test Return Search
              </Button>
            </div>
          </div>

          {searchError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {returnSearchError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Return Search Error</AlertTitle>
              <AlertDescription>{returnSearchError}</AlertDescription>
            </Alert>
          )}

          {searchResults && (
            <div className="p-6 bg-white rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold mb-4">Outbound Search Results</h2>
              <div className="mb-4">
                <span className="font-medium">Found:</span> {searchResults.offers?.length || 0} offers
              </div>
              
              {searchResults.offers?.length > 0 && (
                <div className="mb-4">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <h3 className="font-medium mb-2">First Offer Details:</h3>
                    <div>
                      <span className="font-medium">Origin:</span> {searchResults.offers[0].slices[0]?.segments[0]?.origin?.iata_code}
                    </div>
                    <div>
                      <span className="font-medium">Destination:</span> {searchResults.offers[0].slices[0]?.segments[searchResults.offers[0].slices[0]?.segments.length - 1]?.destination?.iata_code}
                    </div>
                    <div>
                      <span className="font-medium">Slices:</span> {searchResults.offers[0].slices?.length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {returnSearchResults && (
            <div className="p-6 bg-white rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold mb-4">Return Search Results</h2>
              <div className="mb-4">
                <span className="font-medium">Found:</span> {returnSearchResults.offers?.length || 0} offers
              </div>
              
              {returnSearchResults.offers?.length > 0 ? (
                <div className="mb-4">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <h3 className="font-medium mb-2">First Offer Details:</h3>
                    <div>
                      <span className="font-medium">Origin:</span> {returnSearchResults.offers[0].slices[0]?.segments[0]?.origin?.iata_code}
                    </div>
                    <div>
                      <span className="font-medium">Destination:</span> {returnSearchResults.offers[0].slices[0]?.segments[returnSearchResults.offers[0].slices[0]?.segments.length - 1]?.destination?.iata_code}
                    </div>
                  </div>
                </div>
              ) : (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No Return Flights Found</AlertTitle>
                  <AlertDescription>
                    No return flights were found that match the search criteria. Try different dates or airports.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
} 