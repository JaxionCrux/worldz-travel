"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeftRight, MapPin, Calendar, User, ChevronLeft, ChevronRight, Plus, Trash2, Users2, Minus, ChevronDown } from 'lucide-react'
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { searchAirports } from "@/app/actions/airport-actions"
import { searchFlightsAction } from "@/app/actions/flight-actions"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SimpleAirportSearch } from '@/components/SimpleAirportSearch'
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { PassengersSelector } from "@/components/passengers-selector"
import { DateRange } from "react-day-picker"
import { AirportSearchWrapper } from '@/components/AirportSearchWrapper'

declare global {
  interface Window {
    _flightSearchResultsData: any;
  }
}

export function FlightSearchForm() {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isSmallMobile = useMediaQuery("(max-width: 375px)")
  const isTinyMobile = useMediaQuery("(max-width: 320px)")
  const isExtremelySmallMobile = useMediaQuery("(max-width: 280px)")
  const [tripType, setTripType] = useState("return")
  const [originCity, setOriginCity] = useState("Orlando")
  const [originCode, setOriginCode] = useState("MCO")
  const [destinationCity, setDestinationCity] = useState("San Francisco")
  const [destinationCode, setDestinationCode] = useState("SFO")
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 3, 28))
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 3, 29))
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [cabinClass, setCabinClass] = useState("economy")
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Airport search states
  const [originOpen, setOriginOpen] = useState(false)
  const [destOpen, setDestOpen] = useState(false)
  const [originQuery, setOriginQuery] = useState("")
  const [destQuery, setDestQuery] = useState("")
  const [originResults, setOriginResults] = useState<any[]>([])
  const [destResults, setDestResults] = useState<any[]>([])

  // Multi-city airport search states
  const [multiCityAirportOpen, setMultiCityAirportOpen] = useState<{ [key: string]: boolean }>({})
  const [multiCityAirportQuery, setMultiCityAirportQuery] = useState<{ [key: string]: string }>({})
  const [multiCityAirportResults, setMultiCityAirportResults] = useState<{ [key: string]: any[] }>({})

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [multiCityDatePickerOpen, setMultiCityDatePickerOpen] = useState<{ [key: string]: boolean }>({})

  // Multi-city state
  const [multiCityFlights, setMultiCityFlights] = useState([
    {
      id: 1,
      originCity: "Orlando",
      originCode: "MCO",
      destinationCity: "San Francisco",
      destinationCode: "SFO",
      date: new Date(2025, 3, 28),
    },
    {
      id: 2,
      originCity: "San Francisco",
      originCode: "SFO",
      destinationCity: "New York",
      destinationCode: "JFK",
      date: new Date(2025, 4, 5),
    },
  ])

  const handleOriginSearch = async (query: string) => {
    setOriginQuery(query)
    if (query.length >= 2) {
      const results = await searchAirports(query)
      setOriginResults(results)
    }
  }

  const handleDestSearch = async (query: string) => {
    setDestQuery(query)
    if (query.length >= 2) {
      const results = await searchAirports(query)
      setDestResults(results)
    }
  }

  const handleOriginSelect = (airport: any) => {
    setOriginCity(airport.city)
    setOriginCode(airport.iata)
  }

  const handleDestSelect = (airport: any) => {
    setDestinationCity(airport.city)
    setDestinationCode(airport.iata)
  }

  const handleSwapLocations = () => {
    const tempCity = originCity
    const tempCode = originCode
    setOriginCity(destinationCity)
    setOriginCode(destinationCode)
    setDestinationCity(tempCity)
    setDestinationCode(tempCode)
  }

  const handleDateSelect = (dateRange: DateRange | undefined) => {
    if (!dateRange) return
    
    if (dateRange.from) {
      setStartDate(dateRange.from)
    }
    
    if (dateRange.to) {
      setEndDate(dateRange.to)
      setDatePickerOpen(false)
    }
  }

  const handleSingleDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(date)
      setDatePickerOpen(false)
    }
  }

  const formatDateRange = () => {
    if (tripType === "one_way") {
      return format(startDate, "d MMM")
    }

    if (!endDate) {
      return format(startDate, "d MMM")
    }

    return `${format(startDate, "d MMM")} - ${format(endDate, "d MMM")}`
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()

      formData.append("origin", originCode)
      formData.append("destination", destinationCode)
      formData.append("departureDate", format(startDate, "yyyy-MM-dd"))

      if (tripType === "return") {
        if (!endDate) {
          setErrorMessage("Please select a return date for your round-trip flight.")
          setIsLoading(false)
          return
        }
        formData.append("returnDate", format(endDate, "yyyy-MM-dd"))
      }

      formData.append("adults", adults.toString())
      formData.append("children", children.toString())
      formData.append("infants", infants.toString())
      formData.append("cabinClass", cabinClass)
      formData.append("tripType", tripType)

      // Store search parameters in sessionStorage
      const searchParams = {
        origin: originCode,
        destination: destinationCode,
        departureDate: format(startDate, "yyyy-MM-dd"),
        returnDate: tripType === "return" ? (endDate ? format(endDate, "yyyy-MM-dd") : undefined) : undefined,
        adults,
        children,
        infants,
        cabinClass,
        tripType
      }

      sessionStorage.setItem("flightSearchParams", JSON.stringify(searchParams))

      const response = await searchFlightsAction(formData)

      if (response.data) {
        if (response.data.searchId) {
          sessionStorage.setItem("flightSearchId", response.data.searchId)
        }

        window._flightSearchResultsData = response.data
        
        router.push("/search-results")
      } else {
        setErrorMessage(response.error || "An error occurred while searching for flights. Please try again.")
      }
    } catch (error) {
      console.error("Error searching flights:", error)
      setErrorMessage("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-sm">
      {/* Trip Type Selector */}
      <div className="flex justify-center mb-4 sm:mb-6 overflow-hidden">
        <div className="bg-indigo-100 rounded-full p-1 flex">
          <button
            type="button"
            className={`px-4 sm:px-6 py-2 text-sm font-medium rounded-full transition-all ${tripType === "return" ? "bg-white text-indigo-700 shadow-sm" : "text-indigo-600 hover:bg-indigo-50"}`}
            onClick={() => setTripType("return")}
          >
            Return
          </button>
          <button
            type="button"
            className={`px-4 sm:px-6 py-2 text-sm font-medium rounded-full transition-all ${tripType === "one_way" ? "bg-white text-indigo-700 shadow-sm" : "text-indigo-600 hover:bg-indigo-50"}`}
            onClick={() => setTripType("one_way")}
          >
            One way
          </button>
          <button
            type="button"
            className={`px-4 sm:px-6 py-2 text-sm font-medium rounded-full transition-all ${tripType === "multi_city" ? "bg-white text-indigo-700 shadow-sm" : "text-indigo-600 hover:bg-indigo-50"}`}
            onClick={() => setTripType("multi_city")}
          >
            Multi-city
          </button>
        </div>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Search Form - Responsive for both mobile and desktop */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "bg-white rounded-2xl p-2 shadow-md", 
          isMobile ? "flex flex-col space-y-2" : "flex items-center gap-2"
        )}>
          {/* Origin Field */}
          <div className={cn("desktop-field", isMobile ? "w-full" : "flex-1 min-w-[150px]")}>
            <div className="desktop-field-label text-xs text-gray-500 font-medium px-3 pt-1">Where from?</div>
            <AirportSearchWrapper
              id="origin-search"
              name="origin"
              label=""
              placeholder="Search airports..."
              initialValue={originCity ? `${originCity} (${originCode})` : ""}
              onSelect={handleOriginSelect}
              className="w-full"
            />
          </div>

          {/* Swap Button */}
          <div className={cn(
            isMobile ? "self-center -my-1" : "flex items-center self-center py-2"
          )}>
            <button
              type="button"
              onClick={handleSwapLocations}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
              aria-label="Swap origin and destination"
            >
              <ArrowLeftRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Destination Field */}
          <div className={cn("desktop-field", isMobile ? "w-full" : "flex-1 min-w-[150px]")}>
            <div className="desktop-field-label text-xs text-gray-500 font-medium px-3 pt-1">Where to?</div>
            <AirportSearchWrapper
              id="destination-search"
              name="destination"
              label=""
              placeholder="Search airports..."
              initialValue={destinationCity ? `${destinationCity} (${destinationCode})` : ""}
              onSelect={handleDestSelect}
              className="w-full"
            />
          </div>

          {/* Date Field */}
          <div className={cn("desktop-field", isMobile ? "w-full" : "flex-1 min-w-[150px]")}>
            <div className="desktop-field-label text-xs text-gray-500 font-medium px-3 pt-1">Dates</div>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="w-full text-left flex items-center h-10 px-3 rounded-md">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{formatDateRange()}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto" align="start">
                <div className="calendar-wrapper">
                  {tripType === "one_way" ? (
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={handleSingleDateSelect}
                      numberOfMonths={isMobile ? 1 : 2}
                      disabled={(date) => date < new Date()}
                      className="calendar-component"
                    />
                  ) : (
                    <CalendarComponent
                      mode="range"
                      selected={{ from: startDate, to: endDate }}
                      onSelect={handleDateSelect}
                      numberOfMonths={isMobile ? 1 : 2}
                      disabled={(date) => date < new Date()}
                      className="calendar-component"
                    />
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Passengers and Cabin */}
          <div className={cn("desktop-field", isMobile ? "w-full" : "flex-1 min-w-[150px]")}>
            <div className="desktop-field-label text-xs text-gray-500 font-medium px-3 pt-1">Travelers & Class</div>
            <PassengersSelector
              adults={adults}
              onAdultsChange={setAdults}
              children={children}
              onChildrenChange={setChildren}
              infants={infants}
              onInfantsChange={setInfants}
              cabinClass={cabinClass}
              onCabinClassChange={setCabinClass}
              className="w-full"
            />
          </div>

          {/* Search Button */}
          <button 
            type="submit" 
            disabled={isLoading} 
            className={cn(
              "bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center",
              isMobile ? "h-12 w-full mt-2" : "h-12 w-12 ml-2 self-end mb-1"
            )}
            aria-label="Search flights"
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Search className="h-5 w-5" />
                {isMobile && <span className="ml-2">Search</span>}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 