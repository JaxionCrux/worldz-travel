"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronLeft, ChevronRight, Calendar, Star } from "lucide-react"

export function FeaturedDestinations() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentSlide, setCurrentSlide] = useState(0)

  // Featured destinations data
  const destinations = [
    {
      id: 1,
      city: "Paris",
      country: "France",
      image: "/placeholder.svg?height=400&width=600",
      price: "499",
      rating: 4.8,
      discount: "15% OFF",
      description: "Experience the city of love with its iconic landmarks and world-class cuisine.",
      departureDate: "Jun 15 - Jun 22",
    },
    {
      id: 2,
      city: "Tokyo",
      country: "Japan",
      image: "/placeholder.svg?height=400&width=600",
      price: "799",
      rating: 4.9,
      discount: "10% OFF",
      description: "Discover the perfect blend of traditional culture and futuristic innovation.",
      departureDate: "Jul 10 - Jul 20",
    },
    {
      id: 3,
      city: "Bali",
      country: "Indonesia",
      image: "/placeholder.svg?height=400&width=600",
      price: "649",
      rating: 4.7,
      discount: null,
      description: "Relax on pristine beaches and immerse yourself in rich cultural experiences.",
      departureDate: "Aug 5 - Aug 15",
    },
    {
      id: 4,
      city: "New York",
      country: "USA",
      image: "/placeholder.svg?height=400&width=600",
      price: "399",
      rating: 4.6,
      discount: "20% OFF",
      description: "Explore the city that never sleeps with its iconic skyline and vibrant neighborhoods.",
      departureDate: "Sep 12 - Sep 19",
    },
    {
      id: 5,
      city: "Cape Town",
      country: "South Africa",
      image: "/placeholder.svg?height=400&width=600",
      price: "749",
      rating: 4.8,
      discount: null,
      description: "Experience breathtaking landscapes and diverse wildlife in this coastal gem.",
      departureDate: "Oct 8 - Oct 18",
    },
    {
      id: 6,
      city: "Barcelona",
      country: "Spain",
      image: "/placeholder.svg?height=400&width=600",
      price: "549",
      rating: 4.7,
      discount: "12% OFF",
      description: "Enjoy stunning architecture, beautiful beaches, and delicious Mediterranean cuisine.",
      departureDate: "Nov 15 - Nov 22",
    },
  ]

  const visibleDestinations = isMobile
    ? destinations.slice(currentSlide, currentSlide + 1)
    : destinations.slice(currentSlide, currentSlide + 3)

  const nextSlide = () => {
    const maxSlide = isMobile ? destinations.length - 1 : destinations.length - 3
    setCurrentSlide(currentSlide === maxSlide ? 0 : currentSlide + 1)
  }

  const prevSlide = () => {
    const maxSlide = isMobile ? destinations.length - 1 : destinations.length - 3
    setCurrentSlide(currentSlide === 0 ? maxSlide : currentSlide - 1)
  }

  return (
    <div className="relative">
      <div className="flex justify-between absolute -top-16 right-0">
        <Button
          variant="outline"
          size="icon"
          className="mr-2 rounded-full"
          onClick={prevSlide}
          aria-label="Previous destinations"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={nextSlide}
          aria-label="Next destinations"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {visibleDestinations.map((destination) => (
          <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src={destination.image || "/placeholder.svg"}
                alt={`${destination.city}, ${destination.country}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {destination.discount && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  {destination.discount}
                </Badge>
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold">{destination.city}</h3>
                  <p className="text-gray-600">{destination.country}</p>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{destination.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{destination.description}</p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{destination.departureDate}</span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">From</span>
                  <p className="text-2xl font-bold text-indigo-700">${destination.price}</p>
                </div>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  aria-label={`Book flights to ${destination.city}`}
                >
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile pagination indicators */}
      {isMobile && (
        <div className="flex justify-center mt-6">
          {destinations.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${index === currentSlide ? "bg-indigo-600" : "bg-gray-300"}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
