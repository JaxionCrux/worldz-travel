"use client"

import React from "react"
import { 
  Card,
  CardContent
} from "@/components/ui/card"
import { 
  Clock, 
  PlaneIcon, 
  ArrowRight, 
  CalendarIcon, 
  MapPin, 
  CircleDashed, 
  Circle
} from "lucide-react"
import Image from "next/image"

// Helper to format duration from minutes to hours and minutes
function formatDuration(durationInMinutes: number) {
  const hours = Math.floor(durationInMinutes / 60)
  const minutes = durationInMinutes % 60
  
  if (hours === 0) {
    return `${minutes}m`
  }
  
  return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
}

// Format date to readable format
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  }).format(date)
}

// Format time to 12-hour format
function formatTime(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}

type FlightOfferDetailsProps = {
  flightOffer: any
}

export function FlightOfferDetails({ flightOffer }: FlightOfferDetailsProps) {
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
        <Card key={sliceIndex} className="overflow-hidden border-0 bg-white/5 backdrop-blur-md">
          <CardContent className="p-0">
            {/* Flight header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-1 rounded-full w-8 h-8 flex items-center justify-center">
                    {flightOffer.owner?.logo_symbol_url ? (
                      <Image 
                        src={flightOffer.owner.logo_symbol_url} 
                        alt={flightOffer.owner.name || "Airline"} 
                        width={24} 
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <PlaneIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{flightOffer.owner?.name || "Airline"}</h3>
                    <p className="text-xs text-gray-300">
                      {slice.segments.length > 1 
                        ? `${slice.segments.length} segments • ${formatDuration(slice.duration)}`
                        : `Direct flight • ${formatDuration(slice.duration)}`
                      }
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span className="text-sm">{formatDuration(slice.duration)}</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    {`${slice.segments[0].origin.iata_code} → ${slice.segments[slice.segments.length - 1].destination.iata_code}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Flight segments */}
            <div className="divide-y divide-white/10">
              {slice.segments.map((segment: any, segmentIndex: number) => (
                <div key={segmentIndex} className="p-4">
                  <div className="flex items-start">
                    {/* Left side - Times and locations */}
                    <div className="flex-1">
                      <div className="flex mb-6">
                        {/* Departure info */}
                        <div className="flex-1">
                          <div className="font-bold text-xl mb-1">{formatTime(segment.departing_at)}</div>
                          <div className="text-sm text-gray-300">{formatDate(segment.departing_at)}</div>
                          <div className="mt-1 font-medium">{segment.origin.iata_code}</div>
                          <div className="text-sm text-gray-300 truncate max-w-[180px]">{segment.origin.name}</div>
                        </div>

                        {/* Flight duration */}
                        <div className="px-2 flex flex-col items-center justify-center">
                          <div className="text-xs text-gray-300 mb-1">{formatDuration(segment.duration)}</div>
                          <div className="w-full flex items-center">
                            <CircleDashed className="w-3 h-3 text-gray-300" />
                            <div className="flex-1 border-t border-dashed border-gray-300 mx-1"></div>
                            <PlaneIcon className="w-3 h-3 text-gray-300 transform rotate-90" />
                            <div className="flex-1 border-t border-dashed border-gray-300 mx-1"></div>
                            <Circle className="w-3 h-3 text-gray-300" />
                          </div>
                          <div className="text-xs text-gray-300 mt-1">
                            Flight {segment.operating_carrier_flight_number}
                          </div>
                        </div>

                        {/* Arrival info */}
                        <div className="flex-1 text-right">
                          <div className="font-bold text-xl mb-1">{formatTime(segment.arriving_at)}</div>
                          <div className="text-sm text-gray-300">{formatDate(segment.arriving_at)}</div>
                          <div className="mt-1 font-medium">{segment.destination.iata_code}</div>
                          <div className="text-sm text-gray-300 truncate max-w-[180px] ml-auto">{segment.destination.name}</div>
                        </div>
                      </div>

                      {/* Flight details */}
                      <div className="bg-white/5 rounded-lg p-3 text-sm">
                        <div className="flex items-center mb-2">
                          <div className="bg-white p-1 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                            {flightOffer.owner?.logo_symbol_url ? (
                              <Image 
                                src={flightOffer.owner.logo_symbol_url} 
                                alt={flightOffer.owner.name || "Airline"} 
                                width={16} 
                                height={16}
                                className="object-contain"
                              />
                            ) : (
                              <PlaneIcon className="w-3 h-3 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium">{segment.marketing_carrier.name}</span>
                            {segment.marketing_carrier.iata_code !== segment.operating_carrier.iata_code && (
                              <span className="text-xs text-gray-300 ml-1">
                                (Operated by {segment.operating_carrier.name})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-300 mr-1">Flight:</span>
                            {segment.marketing_carrier.iata_code}-{segment.marketing_carrier_flight_number}
                          </div>
                          <div>
                            <span className="text-gray-300 mr-1">Aircraft:</span>
                            {segment.aircraft?.name || 'Unknown'}
                          </div>
                          <div>
                            <span className="text-gray-300 mr-1">Class:</span>
                            {segment.cabin_class === 'economy' ? 'Economy' : 
                              segment.cabin_class === 'premium_economy' ? 'Premium Economy' :
                              segment.cabin_class === 'business' ? 'Business' : 
                              segment.cabin_class === 'first' ? 'First Class' : 'Standard'}
                          </div>
                          <div>
                            <span className="text-gray-300 mr-1">Duration:</span>
                            {formatDuration(segment.duration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection information for all segments except the last one */}
                  {segmentIndex < slice.segments.length - 1 && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm flex items-center">
                      <div className="bg-yellow-500/20 p-1 rounded-full mr-2">
                        <Clock size={16} className="text-yellow-500" />
                      </div>
                      <div>
                        <span className="font-medium text-yellow-500">
                          Connection • {formatDuration(slice.segments[segmentIndex + 1].departing_at - segment.arriving_at)} layover
                        </span>
                        <div className="text-gray-300">
                          at {segment.destination.name} ({segment.destination.iata_code})
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Flight amenities and services */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <h4 className="font-medium mb-2">Amenities & Services</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 mr-2">
                    {flightOffer.passenger_identity_documents_required ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-400">×</span>
                    )}
                  </div>
                  <span className={flightOffer.passenger_identity_documents_required ? "" : "text-gray-400"}>
                    In-flight meals
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 mr-2">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span>Entertainment</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 mr-2">
                    <span className="text-gray-400">×</span>
                  </div>
                  <span className="text-gray-400">Free Wi-Fi</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 mr-2">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span>Power outlets</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 