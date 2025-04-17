"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plane, Calendar, ArrowRight, Download, Share2, MessageSquare } from "lucide-react"

export function TripHistory() {
  const [activeTab, setActiveTab] = useState("upcoming")

  // Mock trip data
  const upcomingTrips = [
    {
      id: "trip-1",
      bookingRef: "COS123456",
      from: "SFO",
      fromCity: "San Francisco",
      to: "JFK",
      toCity: "New York",
      departureDate: new Date(2025, 5, 15),
      returnDate: new Date(2025, 5, 22),
      airline: "CosmoAir",
      status: "confirmed",
    },
    {
      id: "trip-2",
      bookingRef: "COS789012",
      from: "SFO",
      fromCity: "San Francisco",
      to: "LHR",
      toCity: "London",
      departureDate: new Date(2025, 7, 10),
      returnDate: new Date(2025, 7, 24),
      airline: "CosmoAir",
      status: "pending",
    },
  ]

  const pastTrips = [
    {
      id: "trip-3",
      bookingRef: "COS345678",
      from: "SFO",
      fromCity: "San Francisco",
      to: "NRT",
      toCity: "Tokyo",
      departureDate: new Date(2025, 1, 5),
      returnDate: new Date(2025, 1, 15),
      airline: "CosmoAir",
      status: "completed",
    },
    {
      id: "trip-4",
      bookingRef: "COS901234",
      from: "SFO",
      fromCity: "San Francisco",
      to: "CDG",
      toCity: "Paris",
      departureDate: new Date(2024, 10, 20),
      returnDate: new Date(2024, 10, 27),
      airline: "CosmoAir",
      status: "completed",
    },
    {
      id: "trip-5",
      bookingRef: "COS567890",
      from: "SFO",
      fromCity: "San Francisco",
      to: "MIA",
      toCity: "Miami",
      departureDate: new Date(2024, 8, 3),
      returnDate: new Date(2024, 8, 10),
      airline: "CosmoAir",
      status: "completed",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>
      default:
        return null
    }
  }

  const renderTripCard = (trip: any) => (
    <Card key={trip.id} className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <Plane className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold">{trip.airline}</h3>
                <p className="text-sm text-gray-600">Booking Ref: {trip.bookingRef}</p>
              </div>
            </div>
            {getStatusBadge(trip.status)}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-start">
                <span className="font-semibold text-lg">{trip.from}</span>
                <span className="text-xs text-gray-600">{trip.fromCity}</span>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex flex-col items-start">
                <span className="font-semibold text-lg">{trip.to}</span>
                <span className="text-xs text-gray-600">{trip.toCity}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {format(trip.departureDate, "MMM d, yyyy")} - {format(trip.returnDate, "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>E-Ticket</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>Support</span>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Trip Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Trips</h2>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTrips.length > 0 ? (
            upcomingTrips.map(renderTripCard)
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming trips</h3>
              <p className="text-gray-500 mb-4">You don't have any upcoming trips booked.</p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Book a Flight
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastTrips.length > 0 ? (
            pastTrips.map(renderTripCard)
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No past trips</h3>
              <p className="text-gray-500 mb-4">You haven't completed any trips yet.</p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Book a Flight
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
