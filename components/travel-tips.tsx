"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Clock, Luggage, CreditCard, Umbrella, Utensils, Camera, Map, Wifi } from "lucide-react"

export function TravelTips() {
  const [activeTab, setActiveTab] = useState("before")

  const tipCategories = {
    before: [
      {
        icon: "Clock",
        title: "Book Early",
        description: "Book flights 2-3 months in advance for the best prices and availability.",
      },
      {
        icon: "Luggage",
        title: "Pack Smart",
        description: "Roll clothes instead of folding to save space and prevent wrinkles.",
      },
      {
        icon: "CreditCard",
        title: "Currency Exchange",
        description: "Exchange some currency before your trip for immediate expenses upon arrival.",
      },
      {
        icon: "Umbrella",
        title: "Check Weather",
        description: "Research typical weather patterns for your destination during your travel dates.",
      },
    ],
    during: [
      {
        icon: "Utensils",
        title: "Local Cuisine",
        description: "Try local dishes at restaurants where residents eat for authentic experiences.",
      },
      {
        icon: "Camera",
        title: "Capture Memories",
        description: "Take photos but also put the camera down to fully experience the moment.",
      },
      {
        icon: "Map",
        title: "Explore on Foot",
        description: "Walking is often the best way to discover hidden gems in a new destination.",
      },
      {
        icon: "Wifi",
        title: "Stay Connected",
        description: "Download offline maps and translation apps before exploring new areas.",
      },
    ],
  }

  return (
    <div>
      <Tabs defaultValue="before" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="before">Before Your Trip</TabsTrigger>
          <TabsTrigger value="during">During Your Trip</TabsTrigger>
        </TabsList>
        <TabsContent value="before" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tipCategories.before.map((tip, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    {tip.icon === "Clock" && <Clock className="w-6 h-6 text-indigo-600" />}
                    {tip.icon === "Luggage" && <Luggage className="w-6 h-6 text-indigo-600" />}
                    {tip.icon === "CreditCard" && <CreditCard className="w-6 h-6 text-indigo-600" />}
                    {tip.icon === "Umbrella" && <Umbrella className="w-6 h-6 text-indigo-600" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                  <p className="text-gray-600 mb-4">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="during" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tipCategories.during.map((tip, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    {tip.icon === "Utensils" && <Utensils className="w-6 h-6 text-indigo-600" />}
                    {tip.icon === "Camera" && <Camera className="w-6 h-6 text-indigo-600" />}
                    {tip.icon === "Map" && <Map className="w-6 h-6 text-indigo-600" />}
                    {tip.icon === "Wifi" && <Wifi className="w-6 h-6 text-indigo-600" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                  <p className="text-gray-600 mb-4">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center mt-10">
        <Button
          variant="outline"
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          aria-label="View all travel tips"
        >
          View All Travel Tips
        </Button>
      </div>
    </div>
  )
}
