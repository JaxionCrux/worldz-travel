"use client"

import { User, Mail, Phone, MapPin, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export function ProfileOverview() {
  // Mock user data
  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    memberSince: "January 2023",
    loyaltyPoints: 2450,
    nextTierPoints: 5000,
    upcomingTrips: 2,
    completedTrips: 8,
  }

  const pointsPercentage = (user.loyaltyPoints / user.nextTierPoints) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{user.location}</p>
                </div>
              </div>
              <Button variant="outline" className="mt-2 w-full">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Loyalty Status</CardTitle>
            <CardDescription>Member since {user.memberSince}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="h-10 w-10 text-indigo-600" />
                <div className="flex-1">
                  <p className="font-medium">Silver Member</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>{user.loyaltyPoints} points</span>
                    <span>{user.nextTierPoints} points for Gold</span>
                  </div>
                  <Progress value={pointsPercentage} className="h-2" />
                </div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 mt-4">
                <p className="font-medium text-indigo-700">Benefits</p>
                <ul className="mt-2 space-y-1 text-sm text-indigo-900">
                  <li>• Priority boarding</li>
                  <li>• Extra baggage allowance</li>
                  <li>• Lounge access (2 visits/year)</li>
                </ul>
              </div>
              <Button className="mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                View Loyalty Program
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Travel Summary</CardTitle>
          <CardDescription>Your trip statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-indigo-600">{user.upcomingTrips}</p>
              <p className="text-gray-600">Upcoming Trips</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-indigo-600">{user.completedTrips}</p>
              <p className="text-gray-600">Completed Trips</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-indigo-600">3</p>
              <p className="text-gray-600">Countries Visited</p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full">
            View All Trips
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
