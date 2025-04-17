"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { ArrowRight, Clock, Plane, PlaneTakeoff, PlaneLanding } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getOfferDetails } from "@/app/actions/flight-actions"

interface FlightDetailsProps {
  offerId: string
}

export function FlightDetails({ offerId }: FlightDetailsProps) {
  const router = useRouter()
  const [flightOffer, setFlightOffer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await getOfferDetails(offerId)
        if (response.success && response.data) {
          setFlightOffer(response.data)
        } else {
          console.error("Failed to get offer details:", response.error)
          setError(response.error || "Failed to load flight details")
        }
      } catch (error) {
        console.error("Error fetching offer details:", error)
        setError("An unexpected error occurred while loading flight details")
      } finally {
        setLoading(false)
      }
    }

    if (offerId) {
      fetchOfferDetails()
    }
  }, [offerId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !flightOffer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{error || "Flight not found"}</h2>
        <p className="text-white/70 mb-6">
          {error
            ? "We encountered an error while loading the flight details. Please try again later."
            : "The flight you're looking for doesn't exist or has expired."}
        </p>
        <Button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Back to Search
        </Button>
      </div>
    )
  }

  // Safely access nested properties
  const formatDuration = (duration: string) => {
    if (!duration) return "N/A"
    // Format ISO duration (PT2H30M) to readable format (2h 30m)
    const hours = duration.match(/(\d+)H/)?.[1] || "0"
    const minutes = duration.match(/(\d+)M/)?.[1] || "0"
    return `${hours}h ${minutes}m`
  }

  const handleBookFlight = () => {
    // In a real app, this would navigate to a booking form
    router.push(`/booking/${offerId}`)
  }

  // Check if required data exists
  if (!flightOffer.slices || !Array.isArray(flightOffer.slices) || flightOffer.slices.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Incomplete Flight Data</h2>
        <p className="text-white/70 mb-6">This flight offer has incomplete or invalid data.</p>
        <Button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Back to Search
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl">Flight Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {flightOffer.owner && flightOffer.owner.logo_symbol_url ? (
                <Image
                  src={flightOffer.owner.logo_symbol_url || "/placeholder.svg"}
                  alt={flightOffer.owner?.name || "Airline"}
                  width={48}
                  height={48}
                  className="rounded-full bg-white p-1"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Plane className="w-6 h-6" />
                </div>
              )}
              <h3 className="text-xl font-semibold">{flightOffer.owner?.name || "Airline"}</h3>
            </div>

            <Separator className="bg-white/10" />

            {flightOffer.slices.map((slice: any, sliceIndex: number) => {
              // Skip rendering if slice is invalid
              if (!slice || !slice.segments || !Array.isArray(slice.segments) || slice.segments.length === 0) {
                return null
              }

              return (
                <div key={slice.id || `slice-${sliceIndex}`} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{sliceIndex === 0 ? "Outbound" : "Return"} Flight</h4>
                      {slice.segments[0] && slice.segments[0].departing_at && (
                        <p className="text-sm text-white/70">
                          {format(new Date(slice.segments[0].departing_at), "EEE, MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Clock className="w-4 h-4" />
                      <span>Total duration: {formatDuration(slice.duration || "")}</span>
                    </div>
                  </div>

                  {slice.segments.map((segment: any, index: number) => {
                    // Skip rendering if segment is invalid
                    if (!segment || !segment.origin || !segment.destination) {
                      return null
                    }

                    return (
                      <div key={segment.id || `segment-${index}`} className="relative">
                        {index > 0 && (
                          <div className="absolute left-6 -top-4 -bottom-4 border-l-2 border-dashed border-white/20" />
                        )}
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                              <PlaneTakeoff className="w-6 h-6" />
                            </div>
                            {index < slice.segments.length - 1 && (
                              <div className="h-16 border-l-2 border-dashed border-white/20" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div>
                                {segment.departing_at && (
                                  <p className="font-semibold text-lg">
                                    {format(new Date(segment.departing_at), "HH:mm")}
                                  </p>
                                )}
                                <p className="text-sm">
                                  {segment.origin.name || "Origin"} ({segment.origin.iata_code || "---"})
                                </p>
                                {segment.departing_at && (
                                  <p className="text-xs text-white/70">
                                    {format(new Date(segment.departing_at), "EEE, MMM d, yyyy")}
                                  </p>
                                )}
                              </div>

                              <div className="hidden md:block">
                                <div className="flex flex-col items-center">
                                  <span className="text-xs text-white/70">
                                    {formatDuration(segment.duration || "")}
                                  </span>
                                  <div className="relative w-32 md:w-48">
                                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-white/30" />
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2">
                                      <ArrowRight className="w-3 h-3 text-white/70" />
                                    </div>
                                  </div>
                                  <span className="text-xs text-white/70">
                                    Flight {segment.operating_carrier?.iata_code || ""}
                                    {segment.operating_carrier_flight_number || ""}
                                  </span>
                                </div>
                              </div>

                              <div>
                                {segment.arriving_at && (
                                  <p className="font-semibold text-lg">
                                    {format(new Date(segment.arriving_at), "HH:mm")}
                                  </p>
                                )}
                                <p className="text-sm">
                                  {segment.destination.name || "Destination"} ({segment.destination.iata_code || "---"})
                                </p>
                                {segment.arriving_at && (
                                  <p className="text-xs text-white/70">
                                    {format(new Date(segment.arriving_at), "EEE, MMM d, yyyy")}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="md:hidden mt-2 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/70">{formatDuration(segment.duration || "")}</span>
                                <span className="text-xs text-white/70">
                                  Flight {segment.operating_carrier?.iata_code || ""}
                                  {segment.operating_carrier_flight_number || ""}
                                </span>
                              </div>
                            </div>

                            {index < slice.segments.length - 1 && slice.connections && slice.connections[index] && (
                              <div className="mt-4 mb-4 p-3 bg-white/5 rounded-md">
                                <p className="text-sm font-medium">
                                  Connection time: {formatDuration(slice.connections[index]?.duration || "")}
                                </p>
                                <p className="text-xs text-white/70">
                                  {segment.destination.name || "Destination"} ({segment.destination.iata_code || "---"})
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {index === slice.segments.length - 1 && (
                          <div className="flex gap-4 mt-4">
                            <div className="w-12 flex justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <PlaneLanding className="w-6 h-6" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Arrival at destination</p>
                              <p className="text-xs text-white/70">
                                {segment.destination.name || "Destination"} ({segment.destination.iata_code || "---"})
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {sliceIndex < flightOffer.slices.length - 1 && <Separator className="bg-white/10 my-6" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>Price Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Base fare</span>
              <span>
                {flightOffer.base_amount ? Number.parseFloat(flightOffer.base_amount).toFixed(2) : "0.00"}{" "}
                {flightOffer.base_currency || ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Taxes and fees</span>
              <span>
                {flightOffer.tax_amount ? Number.parseFloat(flightOffer.tax_amount).toFixed(2) : "0.00"}{" "}
                {flightOffer.tax_currency || ""}
              </span>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>
                {flightOffer.total_amount ? Number.parseFloat(flightOffer.total_amount).toFixed(2) : "0.00"}{" "}
                {flightOffer.total_currency || ""}
              </span>
            </div>

            <Button
              onClick={handleBookFlight}
              className="w-full mt-4 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
