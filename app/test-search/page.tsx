"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SimpleAirportSearch from "@/components/SimpleAirportSearch"
import type { Airport } from "@/types/module/tripsummary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TestSearchPage() {
  const [selectedOrigin, setSelectedOrigin] = useState<Airport | null>(null)
  const [selectedDestination, setSelectedDestination] = useState<Airport | null>(null)

  const handleOriginSelect = (airport: Airport) => {
    console.log("Origin selected:", airport)
    setSelectedOrigin(airport)
  }

  const handleDestinationSelect = (airport: Airport) => {
    console.log("Destination selected:", airport)
    setSelectedDestination(airport)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Airport Search Test Page</h1>
        
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Simplified Airport Search Component</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SimpleAirportSearch 
                    id="origin-search"
                    label="From"
                    placeholder="Search origin airport"
                    onSelect={handleOriginSelect}
                  />

                  {selectedOrigin && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <h3 className="font-medium">Selected Origin:</h3>
                      <div className="flex justify-between mt-2">
                        <span>{selectedOrigin.city}, {selectedOrigin.country}</span>
                        <span className="text-purple-600 font-bold">{selectedOrigin.iata}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{selectedOrigin.name}</div>
                    </div>
                  )}
                </div>

                <div>
                  <SimpleAirportSearch 
                    id="destination-search"
                    label="To"
                    placeholder="Search destination airport"
                    onSelect={handleDestinationSelect}
                  />

                  {selectedDestination && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <h3 className="font-medium">Selected Destination:</h3>
                      <div className="flex justify-between mt-2">
                        <span>{selectedDestination.city}, {selectedDestination.country}</span>
                        <span className="text-purple-600 font-bold">{selectedDestination.iata}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{selectedDestination.name}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-md text-blue-700 text-sm">
                <h3 className="font-medium mb-2">Debugging Instructions:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Try typing in each search field to see if suggestions appear immediately</li>
                  <li>Check if clicking away and back on the field shows suggestions correctly</li>
                  <li>Test selection of airports from the dropdown</li>
                  <li>Verify the selected airport displays correctly below each field</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-gray-500 mb-6">
              This page demonstrates a completely rebuilt airport search component with simplified state management and direct rendering logic.
            </p>
            
            <Link href="/test-search/debug-page">
              <Button variant="outline" className="mx-auto">
                Open Advanced Debug Version
              </Button>
            </Link>
            
            <p className="text-xs text-gray-400 mt-4">
              The debug version includes special tools to investigate external factors that might be interfering with the dropdown
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 