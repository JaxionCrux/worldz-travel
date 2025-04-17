"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Loader2 } from "lucide-react"
import { getSeatMapDetails } from "@/app/actions/flight-actions"
import { useSeats, type SelectedSeat } from "@/app/providers/seat-context"

// Types based on actual Duffel API response
type SeatFee = {
  amount: string
  currency: string
}

type Seat = {
  id: string
  name: string
  designator: string
  available_for_selection: boolean
  disclosures?: {
    type: string
    title: string
    text: string
  }[]
  cabin_class?: {
    name: string
    amenities?: { name: string; description: string }[]
  }
  coordinates?: {
    x: number
    y: number
  }
  elements?: {
    type: string
    name?: string
  }[]
  fees?: SeatFee[]
  is_exit_row?: boolean
  is_bulkhead?: boolean
  extra_legroom?: boolean
} | null

type CabinRow = {
  row_number: string
  elements: {
    type: string
    name?: string
  }[]
  sections: {
    elements: Seat[]
  }[]
}

type CabinSection = {
  name: string
  cabin_class_name?: string
  rows: CabinRow[]
}

type SeatMap = {
  id: string
  slices: {
    segments: {
      id: string
      cabin_sections: CabinSection[]
    }[]
  }[]
}

type SeatMapProps = {
  offerId: string
  segmentId?: string // Optional segment ID for multi-segment flights
  onSeatSelect?: (seat: SelectedSeat) => void
}

export function SeatMap({ offerId, segmentId, onSeatSelect }: SeatMapProps) {
  const { addSeat, getSeat, removeSeat } = useSeats()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seatMaps, setSeatMaps] = useState<SeatMap[]>([])
  const [selectedCabin, setSelectedCabin] = useState<string>("")
  const [activeTab, setActiveTab] = useState("map")
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)

  // Fetch real seat map data
  useEffect(() => {
    async function fetchSeatMap() {
      setLoading(true)
      setError(null)
      
      try {
        const response = await getSeatMapDetails(offerId)
        
        if (response.success && response.data && response.data.data) {
          setSeatMaps(response.data.data)
          
          // Set initial selected cabin based on first available cabin section
          if (response.data.data[0]?.slices[0]?.segments[0]?.cabin_sections?.length > 0) {
            setSelectedCabin(response.data.data[0].slices[0].segments[0].cabin_sections[0].name)
          }
        } else {
          setError(response.error || "Failed to fetch seat map data")
        }
      } catch (error) {
        console.error("Error fetching seat map:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (offerId) {
      fetchSeatMap()
    }
  }, [offerId])

  // Get current segment
  const currentSegment = seatMaps[0]?.slices[0]?.segments[currentSegmentIndex]
  const currentSegmentId = segmentId || currentSegment?.id || "";
  
  // Use previously selected seat from context if available
  const prevSelectedSeat = getSeat(currentSegmentId);
  
  // Get cabin sections for the current segment
  const cabinSections = currentSegment?.cabin_sections || []
  
  // Filter cabin sections based on selected cabin
  const filteredCabins = cabinSections.filter(
    section => section.name === selectedCabin
  )

  // Extract available cabins for the dropdown
  const availableCabins = cabinSections.map(section => ({
    name: section.name,
    class: section.cabin_class_name
  }))

  const getSeatPrice = (seat: Seat): number => {
    if (!seat || !seat.fees || seat.fees.length === 0) return 0
    
    // Find the first fee and convert to number
    const feeAmount = parseFloat(seat.fees[0].amount) || 0
    return feeAmount
  }

  const handleSeatClick = (seat: Seat) => {
    if (!seat || !seat.available_for_selection) return
    
    const seatWithPrice: SelectedSeat = {
      id: seat.id,
      designator: seat.designator || seat.name,
      segment_id: currentSegmentId,
      price: getSeatPrice(seat),
      is_exit_row: seat.is_exit_row,
      extra_legroom: seat.extra_legroom,
      cabin_class: seat.cabin_class
    }
    
    // If this seat is already selected, deselect it
    if (prevSelectedSeat && prevSelectedSeat.id === seat.id) {
      removeSeat(currentSegmentId)
      if (onSeatSelect) {
        onSeatSelect(null as any)
      }
      return
    }
    
    // Otherwise, select the new seat
    addSeat(currentSegmentId, seatWithPrice)
    
    if (onSeatSelect) {
      onSeatSelect(seatWithPrice)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400">Loading seat map...</p>
      </div>
    )
  }

  if (error || !seatMaps.length) {
    return (
      <Alert className="bg-red-500/10 border-red-500/30 text-white">
        <div className="flex items-start">
          <InfoIcon className="h-4 w-4 mt-0.5 mr-2 text-red-500" />
          <AlertDescription className="text-sm">
            {error || "Seat map data is not available for this flight. You can select your seat later during check-in."}
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  // If no cabins available
  if (cabinSections.length === 0) {
    return (
      <Alert className="bg-yellow-500/10 border-yellow-500/30">
        <div className="flex items-start">
          <InfoIcon className="h-4 w-4 mt-0.5 mr-2 text-yellow-500" />
          <AlertDescription className="text-sm">
            Seat selection is not available for this flight. You can select your seat later during check-in.
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h3 className="text-lg font-medium">Select Your Seat</h3>
        <Select
          value={selectedCabin}
          onValueChange={setSelectedCabin}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Cabin" />
          </SelectTrigger>
          <SelectContent>
            {availableCabins.map((section, index) => (
              <SelectItem key={index} value={section.name}>
                {section.name} {section.class ? `(${section.class})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Multiple segments */}
      {seatMaps[0]?.slices[0]?.segments.length > 1 && !segmentId && (
        <div className="mb-4">
          <div className="text-sm mb-2">Flight Segments:</div>
          <div className="flex flex-wrap gap-2">
            {seatMaps[0]?.slices[0]?.segments.map((segment, index) => (
              <Button 
                key={segment.id} 
                variant={currentSegmentIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSegmentIndex(index)}
              >
                Segment {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Seat Map</TabsTrigger>
          <TabsTrigger value="list">Seat List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="p-0">
          <div className="w-full overflow-auto">
            <div className="min-w-[500px] p-4 bg-white/5 backdrop-blur-sm rounded-lg">
              {/* Airplane nose */}
              <div className="w-full flex justify-center mb-4">
                <div className="h-10 w-20 bg-gray-700 rounded-t-full"></div>
              </div>
              
              {filteredCabins.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <div className="bg-white/10 p-2 mb-2 rounded">
                    <h4 className="font-medium text-sm text-center">
                      {section.name} {section.cabin_class_name ? `(${section.cabin_class_name})` : ''}
                    </h4>
                  </div>
                  
                  <div className="space-y-1">
                    {section.rows.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex items-center">
                        <div className="mr-2 min-w-[24px] text-center text-xs text-gray-400">
                          {row.row_number}
                        </div>
                        <div className="flex-1 flex items-center justify-center space-x-1">
                          {row.sections.flatMap((rowSection, sectionIdx) => 
                            rowSection.elements.map((seat, seatIndex) => {
                              if (!seat) {
                                // Aisle
                                return <div key={`aisle-${sectionIdx}-${seatIndex}`} className="w-6 h-6 mx-1"></div>
                              }

                              const isExitRow = seat.is_exit_row || false
                              const isExtraLegroom = seat.extra_legroom || false
                              const isPremium = seat.cabin_class?.name?.toLowerCase().includes('premium') || false
                              const isSelected = prevSelectedSeat?.id === seat.id
                              
                              return (
                                <button
                                  key={seat.id || `${sectionIdx}-${seatIndex}`}
                                  disabled={!seat.available_for_selection}
                                  onClick={() => handleSeatClick(seat)}
                                  className={`
                                    w-8 h-8 rounded-md text-xs flex items-center justify-center relative
                                    transition-all duration-200
                                    ${!seat.available_for_selection ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 
                                      isSelected ? 'bg-blue-600 text-white' : 
                                      isPremium ? 'bg-purple-900/50 hover:bg-purple-700 text-white' :
                                      isExtraLegroom ? 'bg-cyan-900/50 hover:bg-cyan-700 text-white' : 
                                      'bg-white/10 hover:bg-white/20 text-white'}
                                    ${isExitRow ? 'border-t-2 border-yellow-500' : ''}
                                  `}
                                >
                                  {seat.designator?.replace(/^[0-9]+/, '') || seat.name}
                                  {isExtraLegroom && (
                                    <span className="absolute -top-1 -right-1 bg-cyan-500 w-2 h-2 rounded-full"></span>
                                  )}
                                </button>
                              )
                            })
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Airplane tail */}
              <div className="w-full flex justify-center mt-4">
                <div className="h-10 w-20 bg-gray-700 rounded-b-full"></div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white/10 rounded mr-2"></div>
              <span>Standard</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-cyan-900/50 rounded mr-2"></div>
              <span>Extra Legroom</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-900/50 rounded mr-2"></div>
              <span>Premium</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-700 rounded mr-2"></div>
              <span>Unavailable</span>
            </div>
          </div>

          <Alert className="mt-4 bg-yellow-500/10 border-yellow-500/30">
            <div className="flex items-start">
              <InfoIcon className="h-4 w-4 mt-0.5 mr-2 text-yellow-500" />
              <AlertDescription className="text-sm">
                Extra legroom seats and premium seats are available for an additional fee. Exit row seats require you to assist in case of emergency.
              </AlertDescription>
            </div>
          </Alert>
        </TabsContent>
        
        <TabsContent value="list" className="p-0">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
            <div className="space-y-3">
              {filteredCabins.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h4 className="font-medium mb-2">{section.name}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {section.rows.flatMap(row => 
                      row.sections.flatMap(rowSection => 
                        rowSection.elements.filter(Boolean).map(seat => {
                          if (!seat) return null
                          
                          const seatPrice = getSeatPrice(seat);
                          const isExitRow = seat.is_exit_row || false;
                          const isExtraLegroom = seat.extra_legroom || false;
                          const isPremium = seat.cabin_class?.name?.toLowerCase().includes('premium') || false;
                          const isSelected = prevSelectedSeat?.id === seat.id;
                          
                          return (
                            <button
                              key={seat.id}
                              disabled={!seat.available_for_selection}
                              onClick={() => handleSeatClick(seat)}
                              className={`
                                p-2 rounded text-sm border border-white/10
                                ${!seat.available_for_selection ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 
                                  isSelected ? 'bg-blue-600 text-white' : 
                                  'bg-white/5 hover:bg-white/10 text-white'}
                              `}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{seat.designator || seat.name}</span>
                                <span className="text-xs font-medium">
                                  {seat.available_for_selection ? (seatPrice > 0 ? `$${seatPrice}` : "Free") : "Taken"}
                                </span>
                              </div>
                              <div className="flex mt-1 text-xs">
                                {isExtraLegroom && (
                                  <span className="bg-cyan-900/50 px-1 rounded text-[10px] mr-1">Legroom</span>
                                )}
                                {isExitRow && (
                                  <span className="bg-yellow-900/50 px-1 rounded text-[10px] mr-1">Exit</span>
                                )}
                                {isPremium && (
                                  <span className="bg-purple-900/50 px-1 rounded text-[10px]">Premium</span>
                                )}
                              </div>
                            </button>
                          )
                        })
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {prevSelectedSeat && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Selected: {prevSelectedSeat.designator}</span>
              <div className="text-xs text-gray-300 mt-1">
                {prevSelectedSeat.extra_legroom && "Extra legroom • "}
                {prevSelectedSeat.is_exit_row && "Exit row • "}
                {prevSelectedSeat.cabin_class?.name?.toLowerCase().includes('premium') && "Premium seat • "}
                {prevSelectedSeat.price && prevSelectedSeat.price > 0 ? `$${prevSelectedSeat.price} additional fee` : "No additional fee"}
              </div>
            </div>
            <Button variant="default" size="sm" onClick={() => removeSeat(currentSegmentId)}>
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
