"use client"

import type React from "react"

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
import { AirportSearch } from './airport-search'
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { PassengersSelector } from "@/components/passengers-selector"
import { DateRange } from "react-day-picker"

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
  const isUltraSmallMobile = useMediaQuery("(max-width: 240px)") // Add this new breakpoint
  const [tripType, setTripType] = useState("return")
  const [originCity, setOriginCity] = useState("Orlando")
  const [originCode, setOriginCode] = useState("MCO")
  const [destinationCity, setDestinationCity] = useState("San Francisco")
  const [destinationCode, setDestinationCode] = useState("SFO")
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 3, 28)) // April 28, 2025
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 3, 29)) // April 29, 2025
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [cabinClass, setCabinClass] = useState("economy")
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Airport search states - Initialize all states to avoid conditional hook calls
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

  // Passengers state
  const [passengersOpen, setPassengersOpen] = useState(false)

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
  ]);

  // Add passenger selection state
  const [passengerMenuOpen, setPassengerMenuOpen] = useState(false)

  // Format the passengers text to ensure it fits on small screens
  const formatPassengersText = () => {
    const totalPassengers = adults + children + infants;
    
    // For extremely small screens, show minimal info
    if (isExtremelySmallMobile) {
      return `${totalPassengers}P`
    }
    // For the smallest screens, show minimal info
    else if (isTinyMobile) {
      return `${totalPassengers}P, ${
        cabinClass === "economy" ? "E" : cabinClass === "premium_economy" ? "PE" : cabinClass === "business" ? "B" : "F"
      }`
    }
    // For small screens, use short abbreviations
    else if (isSmallMobile) {
      const cabinShort =
        cabinClass === "economy"
          ? "Eco"
          : cabinClass === "premium_economy"
            ? "P.Eco"
            : cabinClass === "business"
              ? "Bus"
              : "First"
      return `${totalPassengers} ${totalPassengers > 1 ? "Travelers" : "Traveler"}, ${cabinShort}`
    }
    // For regular mobile screens
    else {
      return `${totalPassengers} ${totalPassengers > 1 ? "Travelers" : "Traveler"}, ${
        cabinClass === "economy"
          ? "Economy"
          : cabinClass === "premium_economy"
            ? "Premium Economy"
            : cabinClass === "business"
              ? "Business"
              : "First Class"
      }`
    }
  }

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

  const handleMultiCityAirportSearch = async (query: string, flightId: number, type: "origin" | "destination") => {
    const key = `${flightId}-${type}`
    setMultiCityAirportQuery((prev) => ({ ...prev, [key]: query }))

    if (query.length >= 2) {
      const results = await searchAirports(query)
      setMultiCityAirportResults((prev) => ({ ...prev, [key]: results }))
    }
  }

  const handleOriginSelect = (city: string, code: string) => {
    setOriginCity(city)
    setOriginCode(code)
    setOriginOpen(false)
  }

  const handleDestSelect = (city: string, code: string) => {
    setDestinationCity(city)
    setDestinationCode(code)
    setDestOpen(false)
  }

  const handleMultiCityAirportSelect = (
    flightId: number,
    type: "origin" | "destination",
    city: string,
    code: string,
  ) => {
    setMultiCityFlights((prev) =>
      prev.map((flight) =>
        flight.id === flightId
          ? {
              ...flight,
              [`${type}City`]: city,
              [`${type}Code`]: code,
            }
          : flight,
      ),
    )

    const key = `${flightId}-${type}`
    setMultiCityAirportOpen((prev) => ({ ...prev, [key]: false }))
  }

  const handleSwapLocations = () => {
    const tempCity = originCity
    const tempCode = originCode
    setOriginCity(destinationCity)
    setOriginCode(destinationCode)
    setDestinationCity(tempCity)
    setDestinationCode(tempCode)
  }

  const handleMultiCitySwapLocations = (flightId: number) => {
    setMultiCityFlights((prev) =>
      prev.map((flight) =>
        flight.id === flightId
          ? {
              ...flight,
              originCity: flight.destinationCity,
              originCode: flight.destinationCode,
              destinationCity: flight.originCity,
              destinationCode: flight.originCode,
            }
          : flight,
      ),
    )
  }

  const handleDateSelect = (dateRange: DateRange | undefined) => {
    if (!dateRange) return;
    
    if (dateRange.from) {
      setStartDate(dateRange.from)
    }
    
    if (dateRange.to) {
      setEndDate(dateRange.to)
      setDatePickerOpen(false)
    }
  }

  // Single date select handler for one-way trips
  const handleSingleDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(date)
      setDatePickerOpen(false)
    }
  }

  const handleMultiCityDateSelect = (flightId: number, date: Date | undefined) => {
    if (date) {
      setMultiCityFlights((prev) =>
        prev.map((flightItem) => (flightItem.id === flightId ? { ...flightItem, date } : flightItem)),
      )
      setMultiCityDatePickerOpen((prev) => ({ ...prev, [flightId]: false }))
    }
  }

  const formatDateRange = () => {
    if (tripType === "one_way") {
      if (isExtremelySmallMobile) {
        return format(startDate, "d/M")
      }
      return format(startDate, isTinyMobile ? "d MMM" : "EEE, d MMM")
    }

    // Make sure endDate is defined before formatting it
    if (!endDate) {
      // If endDate is undefined, just show the start date
      if (isExtremelySmallMobile) {
        return format(startDate, "d/M")
      }
      return format(startDate, isTinyMobile ? "d MMM" : "EEE, d MMM")
    }

    if (isExtremelySmallMobile) {
      return `${format(startDate, "d/M")}-${format(endDate, "d/M")}`
    }

    if (isTinyMobile) {
      return `${format(startDate, "d MMM")}-${format(endDate, "d MMM")}`
    }

    if (isMobile) {
      return `${format(startDate, "d MMM")} - ${format(endDate, "d MMM")}`
    }

    return `${format(startDate, "d MMM")} - ${format(endDate, "d MMM")}`
  }

  const formatMultiCityDate = (date: Date) => {
    if (isExtremelySmallMobile) {
      return format(date, "d/M")
    }
    return format(date, isTinyMobile ? "d MMM" : "EEE, d MMM")
  }

  // Truncate city names for very small screens
  const truncateCity = (city: string, maxLength: number) => {
    if (!city) return ""

    // For extremely small screens, be very aggressive with truncation
    if (isExtremelySmallMobile && city.length > maxLength - 4) {
      return city.substring(0, maxLength - 4) + "..."
    }
    // For tiny screens, be more aggressive with truncation
    else if (isTinyMobile && city.length > maxLength - 2) {
      // Try to find a space to break at
      const spaceIndex = city.indexOf(" ", Math.floor(maxLength / 2))
      if (spaceIndex > 0 && spaceIndex <= maxLength - 2) {
        return city.substring(0, spaceIndex) + "..."
      }
      return city.substring(0, maxLength - 2) + "..."
    } else if (isSmallMobile && city.length > maxLength) {
      return city.substring(0, maxLength) + "..."
    }
    return city
  }

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const addMultiCityFlight = () => {
    // Get the last flight's destination as the new flight's origin
    const lastFlight = multiCityFlights[multiCityFlights.length - 1]
    const newFlightDate = new Date(lastFlight.date)
    newFlightDate.setDate(newFlightDate.getDate() + 3) // Set date 3 days after the last flight

    const newFlight = {
      id: Date.now(), // Use timestamp as unique ID
      originCity: lastFlight.destinationCity,
      originCode: lastFlight.destinationCode,
      destinationCity: "",
      destinationCode: "",
      date: newFlightDate,
    }

    setMultiCityFlights([...multiCityFlights, newFlight])
  }

  const removeMultiCityFlight = (flightId: number) => {
    if (multiCityFlights.length <= 2) {
      // Don't allow removing if only 2 flights remain
      return
    }

    setMultiCityFlights(multiCityFlights.filter((flight) => flight.id !== flightId))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()

      if (tripType === "multi_city") {
        // Handle multi-city search
        formData.append("tripType", "multi_city")
        formData.append("adults", adults.toString())
        formData.append("children", children.toString())
        formData.append("infants", infants.toString())
        formData.append("cabinClass", cabinClass)

        // Add each flight segment
        multiCityFlights.forEach((flight, index) => {
          formData.append(`origin_${index}`, flight.originCode)
          formData.append(`destination_${index}`, flight.destinationCode)
          formData.append(`date_${index}`, format(flight.date, "yyyy-MM-dd"))
        })

        formData.append("segments", multiCityFlights.length.toString())
      } else {
        // Handle return or one-way search
        formData.append("origin", originCode)
        formData.append("destination", destinationCode)
        formData.append("departureDate", format(startDate, "yyyy-MM-dd"))

        if (tripType === "return") {
          // Ensure return date is set for round-trip searches
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
      }

      // Store search parameters in sessionStorage (not the results)
      const searchParams = {
        origin: originCode,
        destination: destinationCode,
        departureDate: format(startDate, "yyyy-MM-dd"),
        returnDate: tripType === "return" ? (endDate ? format(endDate, "yyyy-MM-dd") : undefined) : undefined,
        adults,
        children,
        infants,
        cabinClass,
        tripType,
        multiCityFlights:
          tripType === "multi_city"
            ? multiCityFlights.map((flight) => ({
                originCode: flight.originCode,
                destinationCode: flight.destinationCode,
                date: format(flight.date, "yyyy-MM-dd"),
              }))
            : [],
      }

      // Store the search parameters, not the results
      sessionStorage.setItem("flightSearchParams", JSON.stringify(searchParams))

      console.log("Submitting search with parameters:", searchParams)
      const response = await searchFlightsAction(formData)

      if (response.data) {
        // Debug the API response
        console.log("API Response:", response.data)
        
        // Store only the search ID or a reference to the results
        if (response.data.searchId) {
          sessionStorage.setItem("flightSearchId", response.data.searchId)
        }

        // Make the data available to the search results component
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
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      {/* Trip Type Selector - Improved Responsive Design */}
      <div className="flex justify-center mb-4 sm:mb-6 overflow-hidden">
        <div className="trip-type-selector">
          <button
            type="button"
            className={`trip-type-button ${tripType === "return" ? "active" : ""}`}
            onClick={() => setTripType("return")}
            aria-pressed={tripType === "return"}
          >
            {isExtremelySmallMobile ? "Return" : "Return"}
          </button>
          <button
            type="button"
            className={`trip-type-button ${tripType === "one_way" ? "active" : ""}`}
            onClick={() => setTripType("one_way")}
            aria-pressed={tripType === "one_way"}
          >
            {isExtremelySmallMobile ? "1-Way" : isTinyMobile ? "One way" : "One way"}
          </button>
          <button
            type="button"
            className={`trip-type-button ${tripType === "multi_city" ? "active" : ""}`}
            onClick={() => setTripType("multi_city")}
            aria-pressed={tripType === "multi_city"}
          >
            {isExtremelySmallMobile ? "Multi" : isTinyMobile ? "Multi" : "Multi-city"}
          </button>
        </div>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Mobile Search Form */}
      {isMobile && (
        <form onSubmit={handleSubmit} className="relative">
          {tripType !== "multi_city" ? (
            // Return and One-way form for mobile
            <div className="search-form-mobile">
              {/* Origin Field */}
              <div className="mobile-form-field">
                <div className="form-field-label">Where from?</div>
                <Popover open={originOpen} onOpenChange={setOriginOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="form-field-input">
                      <MapPin className="form-field-icon w-5 h-5" />
                      <div className="form-field-text">
                        {truncateCity(originCity, 10) || <span className="form-field-placeholder">Where from?</span>}
                      </div>
                      {originCode && <div className="form-field-code">{originCode}</div>}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 w-[300px] popover-content"
                    align="start"
                    side="bottom"
                    sideOffset={5}
                    alignOffset={-10}
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search airports..."
                        value={originQuery}
                        onValueChange={handleOriginSearch}
                        className="command-input"
                      />
                      <CommandList className="airport-command-list">
                        <CommandEmpty>No airports found</CommandEmpty>
                        <CommandGroup>
                          {originResults.map((airport) => (
                            <CommandItem
                              key={airport.id}
                              onSelect={() => handleOriginSelect(airport.city_name || airport.city, airport.iata_code)}
                              className="airport-command-item"
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              <span className="airport-name">{airport.name}</span>
                              <span className="ml-auto text-xs text-blue-600">{airport.iata_code}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Swap Button - standard design between origin and destination */}
              <div className="standard-swap-button-container">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="standard-swap-button"
                  aria-label="Swap origin and destination"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
              </div>

              {/* Destination Field */}
              <div className="mobile-form-field">
                <div className="form-field-label">Where to?</div>
                <Popover open={destOpen} onOpenChange={setDestOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="form-field-input">
                      <MapPin className="form-field-icon w-5 h-5" />
                      <div className="form-field-text">
                        {truncateCity(destinationCity, isTinyMobile ? 8 : 10) || (
                          <span className="form-field-placeholder">Where to?</span>
                        )}
                      </div>
                      {destinationCode && <div className="form-field-code">{destinationCode}</div>}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 w-[300px] popover-content"
                    align="start"
                    side="bottom"
                    sideOffset={5}
                    alignOffset={-10}
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search airports..."
                        value={destQuery}
                        onValueChange={handleDestSearch}
                        className="command-input"
                      />
                      <CommandList className="airport-command-list">
                        <CommandEmpty>No airports found</CommandEmpty>
                        <CommandGroup>
                          {destResults.map((airport) => (
                            <CommandItem
                              key={airport.id}
                              onSelect={() => handleDestSelect(airport.city_name || airport.city, airport.iata_code)}
                              className="airport-command-item"
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              <span className="airport-name">{airport.name}</span>
                              <span className="ml-auto text-xs text-blue-600">{airport.iata_code}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date and Passengers Fields in a grid */}
              <div className="mobile-form-grid">
                {/* Date Field */}
                <div className="mobile-form-field">
                  <div className="form-field-label">Dates</div>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className="form-field-input">
                        <Calendar className="form-field-icon w-5 h-5" />
                        <div className="form-field-text date-field-text">{formatDateRange()}</div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-auto popover-content date-popover"
                      align="start"
                      side="bottom"
                      sideOffset={5}
                      alignOffset={-10}
                    >
                      <div className="calendar-wrapper">
                        <div className="calendar-header">
                          <button
                            type="button"
                            onClick={handlePreviousMonth}
                            className="calendar-nav-button"
                            aria-label="Previous month"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <div className="calendar-month-title">{format(currentMonth, "MMMM yyyy")}</div>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="calendar-nav-button"
                            aria-label="Next month"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                        {tripType === "one_way" ? (
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={handleSingleDateSelect}
                            numberOfMonths={1}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            disabled={(date) => date < new Date()}
                            className="calendar-component"
                            classNames={{
                              day: "calendar-day",
                              day_selected: "calendar-day selected",
                              head_cell: "calendar-head-cell",
                              cell: "calendar-cell",
                              month: "calendar-month",
                              caption: "calendar-caption",
                              nav_button: "hidden", // Hide default nav buttons
                            }}
                          />
                        ) : (
                          <CalendarComponent
                            mode="range"
                            selected={{ from: startDate, to: endDate }}
                            onSelect={handleDateSelect}
                            numberOfMonths={1}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            disabled={(date) => date < new Date()}
                            className="calendar-component"
                            classNames={{
                              day: "calendar-day",
                              day_selected: "calendar-day selected",
                              day_range_middle: "calendar-day range",
                              head_cell: "calendar-head-cell",
                              cell: "calendar-cell",
                              month: "calendar-month",
                              caption: "calendar-caption",
                              nav_button: "hidden", // Hide default nav buttons
                            }}
                          />
                        )}
                        <div className="calendar-footer">
                          <Button
                            type="button"
                            className="calendar-done-button"
                            onClick={() => setDatePickerOpen(false)}
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Passengers and Cabin dropdown button */}
                <div className="col-span-12 lg:col-span-2">
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
              </div>

              {/* Search Button */}
              <div className="mobile-search-button-container">
                <button type="submit" disabled={isLoading} className="search-button-mobile">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <span>Search flights</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Multi-city form for mobile
            <div className="search-form-mobile multi-city-form">
              {/* Multi-city flights */}
              {multiCityFlights.map((flight, index) => (
                <div key={flight.id} className="multi-city-flight-segment">
                  <div className="multi-city-segment-header">
                    <div className="multi-city-segment-title">Flight {index + 1}</div>
                    {multiCityFlights.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeMultiCityFlight(flight.id)}
                        className="multi-city-remove-button"
                        aria-label="Remove flight segment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Origin Field */}
                  <div className="mobile-form-field">
                    <div className="form-field-label">Where from?</div>
                    <Popover
                      open={multiCityAirportOpen[`${flight.id}-origin`]}
                      onOpenChange={(open) =>
                        setMultiCityAirportOpen((prev) => ({ ...prev, [`${flight.id}-origin`]: open }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <button type="button" className="form-field-input">
                          <MapPin className="form-field-icon w-5 h-5" />
                          <div className="form-field-text">
                            {truncateCity(flight.originCity, 10) || (
                              <span className="form-field-placeholder">Where from?</span>
                            )}
                          </div>
                          {flight.originCode && <div className="form-field-code">{flight.originCode}</div>}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 w-[300px] popover-content"
                        align="start"
                        side="bottom"
                        sideOffset={5}
                        alignOffset={-10}
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search airports..."
                            value={multiCityAirportQuery[`${flight.id}-origin`] || ""}
                            onValueChange={(query) => handleMultiCityAirportSearch(query, flight.id, "origin")}
                            className="command-input"
                          />
                          <CommandList className="airport-command-list">
                            <CommandEmpty>No airports found</CommandEmpty>
                            <CommandGroup>
                              {(multiCityAirportResults[`${flight.id}-origin`] || []).map((airport) => (
                                <CommandItem
                                  key={airport.id}
                                  onSelect={() =>
                                    handleMultiCityAirportSelect(
                                      flight.id,
                                      "origin",
                                      airport.city_name || airport.city,
                                      airport.iata_code,
                                    )
                                  }
                                  className="airport-command-item"
                                >
                                  <MapPin className="mr-2 h-4 w-4" />
                                  <span className="airport-name">{airport.name}</span>
                                  <span className="ml-auto text-xs text-blue-600">{airport.iata_code}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Swap Button */}
                  <div className="standard-swap-button-container">
                    <button
                      type="button"
                      onClick={() => handleMultiCitySwapLocations(flight.id)}
                      className="standard-swap-button"
                      aria-label="Swap origin and destination"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Destination Field */}
                  <div className="mobile-form-field">
                    <div className="form-field-label">Where to?</div>
                    <Popover
                      open={multiCityAirportOpen[`${flight.id}-destination`]}
                      onOpenChange={(open) =>
                        setMultiCityAirportOpen((prev) => ({ ...prev, [`${flight.id}-destination`]: open }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <button type="button" className="form-field-input">
                          <MapPin className="form-field-icon w-5 h-5" />
                          <div className="form-field-text">
                            {truncateCity(flight.destinationCity, isTinyMobile ? 8 : 10) || (
                              <span className="form-field-placeholder">Where to?</span>
                            )}
                          </div>
                          {flight.destinationCode && <div className="form-field-code">{flight.destinationCode}</div>}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 w-[300px] popover-content"
                        align="start"
                        side="bottom"
                        sideOffset={5}
                        alignOffset={-10}
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search airports..."
                            value={multiCityAirportQuery[`${flight.id}-destination`] || ""}
                            onValueChange={(query) => handleMultiCityAirportSearch(query, flight.id, "destination")}
                            className="command-input"
                          />
                          <CommandList className="airport-command-list">
                            <CommandEmpty>No airports found</CommandEmpty>
                            <CommandGroup>
                              {(multiCityAirportResults[`${flight.id}-destination`] || []).map((airport) => (
                                <CommandItem
                                  key={airport.id}
                                  onSelect={() =>
                                    handleMultiCityAirportSelect(
                                      flight.id,
                                      "destination",
                                      airport.city_name || airport.city,
                                      airport.iata_code,
                                    )
                                  }
                                  className="airport-command-item"
                                >
                                  <MapPin className="mr-2 h-4 w-4" />
                                  <span className="airport-name">{airport.name}</span>
                                  <span className="ml-auto text-xs text-blue-600">{airport.iata_code}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Date Field */}
                  <div className="mobile-form-field">
                    <div className="form-field-label">Date</div>
                    <Popover
                      open={multiCityDatePickerOpen[flight.id]}
                      onOpenChange={(open) => setMultiCityDatePickerOpen((prev) => ({ ...prev, [flight.id]: open }))}
                    >
                      <PopoverTrigger asChild>
                        <button type="button" className="form-field-input">
                          <Calendar className="form-field-icon w-5 h-5" />
                          <div className="form-field-text date-field-text">{formatMultiCityDate(flight.date)}</div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 w-auto popover-content date-popover"
                        align="start"
                        side="bottom"
                        sideOffset={5}
                        alignOffset={-10}
                      >
                        <div className="calendar-wrapper">
                          <div className="calendar-header">
                            <button
                              type="button"
                              onClick={handlePreviousMonth}
                              className="calendar-nav-button"
                              aria-label="Previous month"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="calendar-month-title">{format(currentMonth, "MMMM yyyy")}</div>
                            <button
                              type="button"
                              onClick={handleNextMonth}
                              className="calendar-nav-button"
                              aria-label="Next month"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          <CalendarComponent
                            mode="single"
                            selected={flight.date}
                            onSelect={(date) => handleMultiCityDateSelect(flight.id, date)}
                            numberOfMonths={1}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            disabled={(date) => date < new Date()}
                            className="calendar-component"
                            classNames={{
                              day: "calendar-day",
                              day_selected: "calendar-day selected",
                              head_cell: "calendar-head-cell",
                              cell: "calendar-cell",
                              month: "calendar-month",
                              caption: "calendar-caption",
                              nav_button: "hidden", // Hide default nav buttons
                            }}
                          />
                          <div className="calendar-footer">
                            <Button
                              type="button"
                              className="calendar-done-button"
                              onClick={() => setMultiCityDatePickerOpen((prev) => ({ ...prev, [flight.id]: false }))}
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {index < multiCityFlights.length - 1 && <div className="multi-city-segment-divider"></div>}
                </div>
              ))}

              {/* Add Flight Button */}
              <div className="multi-city-add-flight-container">
                <button
                  type="button"
                  onClick={addMultiCityFlight}
                  className="multi-city-add-flight-button"
                  disabled={multiCityFlights.length >= 6}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another flight
                </button>
              </div>

              {/* Passengers and Search */}
              <div className="multi-city-footer-mobile">
                {/* Passengers Field */}
                <div className="multi-city-passengers-mobile">
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
                <button type="submit" disabled={isLoading} className="multi-city-search-button-mobile">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <span>Search flights</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Desktop Search Form */}
      {!isMobile && (
        <form onSubmit={handleSubmit} className="relative">
          {tripType !== "multi_city" ? (
            // Return and One-way form for desktop
            <div className="search-form-desktop">
              {/* Origin Field */}
              <div className="desktop-field flex-1">
                <div className="desktop-field-label">Where from?</div>
                <Popover open={originOpen} onOpenChange={setOriginOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="desktop-field-content w-full text-left">
                      <MapPin className="desktop-field-icon" />
                      <span>{originCity}</span>
                      <span className="desktop-field-code ml-auto">{originCode}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[300px] popover-content" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search airports..."
                        value={originQuery}
                        onValueChange={handleOriginSearch}
                        className="command-input"
                      />
                      <CommandList>
                        <CommandEmpty>No airports found</CommandEmpty>
                        <CommandGroup>
                          {originResults.map((airport) => (
                            <CommandItem
                              key={airport.id}
                              onSelect={() => handleOriginSelect(airport.city_name || airport.city, airport.iata_code)}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>{airport.name}</span>
                              <span className="ml-auto text-xs text-blue-600">{airport.iata_code}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Swap Button - standard design */}
              <div className="desktop-standard-swap-container">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="standard-swap-button"
                  aria-label="Swap origin and destination"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                </button>
              </div>

              {/* Destination Field */}
              <div className="desktop-field flex-1">
                <div className="desktop-field-label">Where to?</div>
                <Popover open={destOpen} onOpenChange={setDestOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="desktop-field-content w-full text-left">
                      <MapPin className="desktop-field-icon" />
                      <span>{destinationCity}</span>
                      <span className="desktop-field-code ml-auto">{destinationCode}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[300px] popover-content" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search airports..."
                        value={destQuery}
                        onValueChange={handleDestSearch}
                        className="command-input"
                      />
                      <CommandList>
                        <CommandEmpty>No airports found</CommandEmpty>
                        <CommandGroup>
                          {destResults.map((airport) => (
                            <CommandItem
                              key={airport.id}
                              onSelect={() => handleDestSelect(airport.city_name || airport.city, airport.iata_code)}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>{airport.name}</span>
                              <span className="ml-auto text-xs text-blue-600">{airport.iata_code}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date Field */}
              <div className="desktop-field flex-1">
                <div className="desktop-field-label">Dates</div>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className="desktop-field-content w-full text-left">
                      <Calendar className="desktop-field-icon" />
                      <span className="date-field-text">{formatDateRange()}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto popover-content" align="start">
                    <div className="calendar-wrapper">
                      {tripType === "one_way" ? (
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={handleSingleDateSelect}
                          numberOfMonths={2}
                          disabled={(date) => date < new Date()}
                          className="calendar-component"
                          classNames={{
                            day: "calendar-day",
                            day_selected: "calendar-day selected",
                          }}
                        />
                      ) : (
                        <CalendarComponent
                          mode="range"
                          selected={{ from: startDate, to: endDate }}
                          onSelect={handleDateSelect}
                          numberOfMonths={2}
                          disabled={(date) => date < new Date()}
                          className="calendar-component"
                          classNames={{
                            day: "calendar-day",
                            day_selected: "calendar-day selected",
                            day_range_middle: "calendar-day range",
                          }}
                        />
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Passengers and Cabin dropdown button */}
              <div className="col-span-12 lg:col-span-2">
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
              <button type="submit" disabled={isLoading} className="search-button-desktop" aria-label="Search flights">
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </div>
          ) : (
            // Multi-city form for desktop
            <div className="search-form-desktop-multi-city">
              {/* Multi-city flights */}
              {multiCityFlights.map((flight, index) => (
                <div key={flight.id} className="multi-city-flight-segment-desktop">
                  <div className="multi-city-segment-header-desktop">
                    <div className="multi-city-segment-title-desktop">Flight {index + 1}</div>
                    {multiCityFlights.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeMultiCityFlight(flight.id)}
                        className="multi-city-remove-button-desktop"
                        aria-label="Remove flight segment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="multi-city-segment-content-desktop">
                    {/* Origin Field */}
                    <div className="multi-city-field-desktop">
                      <div className="desktop-field-label">Where from?</div>
                      <Popover
                        open={multiCityAirportOpen[`${flight.id}-origin`]}
                        onOpenChange={(open) =>
                          setMultiCityAirportOpen((prev) => ({ ...prev, [`${flight.id}-origin`]: open }))
                        }
                      >
                        <PopoverTrigger asChild>
                          <button type="button" className="desktop-field-content w-full text-left">
                            <MapPin className="desktop-field-icon" />
                            <span>{flight.originCity}</span>
                            <span className="desktop-field-code ml-auto">{flight.originCode}</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[300px] popover-content" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search airports..."
                              value={multiCityAirportQuery[`${flight.id}-origin`] || ""}
                              onValueChange={(query) => handleMultiCityAirportSearch(query, flight.id, "origin")}
                              className="command-input"
                            />
                            <CommandList>
                              <CommandEmpty>No airports found</CommandEmpty>
                              <CommandGroup>
                                {(multiCityAirportResults[`${flight.id}-origin`] || []).map((airport) => (
                                  <CommandItem
                                    key={airport.id}
                                    onSelect={() =>
                                      handleMultiCityAirportSelect(
                                        flight.id,
                                        "origin",
                                        airport.city_name || airport.city,
                                        airport.iata_code,
                                      )
                                    }
                                  >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{airport.name}</span>
                                    <span className="ml-auto text-xs text-blue-600">{airport.iata_code}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Swap Button */}
                    <div className="multi-city-swap-desktop">
                      <button
                        type="button"
                        onClick={() => handleMultiCitySwapLocations(flight.id)}
                        className="standard-swap-button"
                        aria-label="Swap origin and destination"
                      >
                        <ArrowLeftRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Destination Field */}
                    <div className="multi-city-field-desktop">
                      <div className="desktop-field-label">Where to?</div>
                      <Popover
                        open={multiCityAirportOpen[`${flight.id}-destination`]}
                        onOpenChange={(open) =>
                          setMultiCityAirportOpen((prev) => ({ ...prev, [`${flight.id}-destination`]: open }))
                        }
                      >
                        <PopoverTrigger asChild>
                          <button type="button" className="desktop-field-content w-full text-left">
                            <MapPin className="desktop-field-icon" />
                            <span>{flight.destinationCity}</span>
                            <span className="desktop-field-code ml-auto">{flight.destinationCode}</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[300px] popover-content" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search airports..."
                              value={multiCityAirportQuery[`${flight.id}-destination`] || ""}
                              onValueChange={(query) => handleMultiCityAirportSearch(query, flight.id, "destination")}
                              className="command-input"
                            />
                            <CommandList>
                              <CommandEmpty>No airports found</CommandEmpty>
                              <CommandGroup>
                                {(multiCityAirportResults[`${flight.id}-destination`] || []).map((airport) => (
                                  <CommandItem
                                    key={airport.id}
                                    onSelect={() =>
                                      handleMultiCityAirportSelect(
                                        flight.id,
                                        "destination",
                                        airport.city_name || airport.city,
                                        airport.iata_code,
                                      )
                                    }
                                  >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{airport.name}</span>
                                    <span className="ml-auto text-xs text-blue-600">{airport.iata_code}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date Field */}
                    <div className="multi-city-field-desktop">
                      <div className="desktop-field-label">Date</div>
                      <Popover
                        open={multiCityDatePickerOpen[flight.id]}
                        onOpenChange={(open) => setMultiCityDatePickerOpen((prev) => ({ ...prev, [flight.id]: open }))}
                      >
                        <PopoverTrigger asChild>
                          <button type="button" className="desktop-field-content w-full text-left">
                            <Calendar className="desktop-field-icon" />
                            <span className="date-field-text">{formatMultiCityDate(flight.date)}</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto popover-content" align="start">
                          <div className="calendar-wrapper">
                            <CalendarComponent
                              mode="single"
                              selected={flight.date}
                              onSelect={(date) => handleMultiCityDateSelect(flight.id, date)}
                              numberOfMonths={2}
                              disabled={(date) => date < new Date()}
                              className="calendar-component"
                              classNames={{
                                day: "calendar-day",
                                day_selected: "calendar-day selected",
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Flight Button */}
              <div className="multi-city-add-flight-container-desktop">
                <button
                  type="button"
                  onClick={addMultiCityFlight}
                  className="multi-city-add-flight-button-desktop"
                  disabled={multiCityFlights.length >= 6}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another flight
                </button>
              </div>

              {/* Passengers and Search */}
              <div className="multi-city-footer-desktop">
                {/* Passengers Field */}
                <div className="multi-city-passengers-desktop">
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
                <button type="submit" disabled={isLoading} className="multi-city-search-button-desktop">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <span>Search flights</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
