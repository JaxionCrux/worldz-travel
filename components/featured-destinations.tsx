"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function FeaturedDestinations() {
  const [viewAll, setViewAll] = useState(false)

  const destinations = [
    {
      id: 1,
      city: "New York",
      country: "United States",
      description: "Experience the vibrant culture and iconic landmarks of the Big Apple.",
      price: "399",
      discount: "20%",
      image: "/images/destinations/1.jpg",
      popular: true,
    },
    {
      id: 2,
      city: "London",
      country: "United Kingdom",
      description: "Discover the historic charm and modern energy of England's capital.",
      price: "499",
      discount: null,
      image: "/images/destinations/2.jpg",
      popular: true,
    },
    {
      id: 3,
      city: "Tokyo",
      country: "Japan",
      description: "Immerse yourself in the perfect blend of tradition and innovation.",
      price: "799",
      discount: "15%",
      image: "/images/destinations/3.jpg",
      popular: false,
    },
    {
      id: 4,
      city: "Dubai",
      country: "United Arab Emirates",
      description: "Experience luxury and adventure in this stunning desert metropolis.",
      price: "649",
      discount: "10%",
      image: "/images/destinations/4.jpg",
      popular: true,
    },
    {
      id: 5,
      city: "Paris",
      country: "France",
      description: "Fall in love with the romance, art, and cuisine of the City of Light.",
      price: "449",
      discount: null,
      image: "/images/destinations/5.jpg",
      popular: false,
    },
    {
      id: 6,
      city: "Bali",
      country: "Indonesia",
      description: "Relax on pristine beaches and explore the rich cultural heritage.",
      price: "599",
      discount: "25%",
      image: "/images/destinations/6.jpg",
      popular: true,
    },
  ]

  const displayDestinations = viewAll ? destinations : destinations.slice(0, 3)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayDestinations.map((destination) => (
          <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={destination.image}
                  alt={`${destination.city}, ${destination.country}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
                {destination.discount && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white hover:bg-red-600">
                    {destination.discount} OFF
                  </Badge>
                )}
                {destination.popular && (
                  <Badge className="absolute top-4 right-4 bg-amber-500 text-white hover:bg-amber-600">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{destination.city}</h3>
                    <p className="text-gray-500">{destination.country}</p>
                  </div>
                  <div className="text-lg font-bold text-indigo-700">
                    From ${destination.price}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{destination.description}</p>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  aria-label={`Explore flights to ${destination.city}`}
                >
                  <span>Explore Flights</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!viewAll && destinations.length > 3 && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => setViewAll(true)}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            View All Destinations
          </Button>
        </div>
      )}
    </div>
  )
}
