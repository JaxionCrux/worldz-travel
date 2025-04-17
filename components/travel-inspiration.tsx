"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronLeft, ChevronRight, Globe, Compass, Sparkles } from "lucide-react"

export function TravelInspiration() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentSlide, setCurrentSlide] = useState(0)

  // Travel inspiration data
  const inspirations = [
    {
      id: 1,
      title: "Adventure Seekers",
      description: "Thrilling destinations for adrenaline junkies and outdoor enthusiasts.",
      image: "/placeholder.svg?height=400&width=600",
      destinations: ["New Zealand", "Costa Rica", "Switzerland"],
      icon: "Compass",
    },
    {
      id: 2,
      title: "Cultural Immersion",
      description: "Dive deep into rich histories, traditions, and authentic local experiences.",
      image: "/placeholder.svg?height=400&width=600",
      destinations: ["Japan", "Morocco", "Italy"],
      icon: "Globe",
    },
    {
      id: 3,
      title: "Luxury Escapes",
      description: "Indulge in premium accommodations and exclusive experiences.",
      image: "/placeholder.svg?height=400&width=600",
      destinations: ["Maldives", "Dubai", "French Polynesia"],
      icon: "Sparkles",
    },
    {
      id: 4,
      title: "Hidden Gems",
      description: "Discover off-the-beaten-path destinations that few travelers experience.",
      image: "/placeholder.svg?height=400&width=600",
      destinations: ["Slovenia", "Bhutan", "Uruguay"],
      icon: "Compass",
    },
    {
      id: 5,
      title: "Island Paradise",
      description: "Relax on pristine beaches and enjoy crystal clear waters.",
      image: "/placeholder.svg?height=400&width=600",
      destinations: ["Seychelles", "Bali", "Hawaii"],
      icon: "Sparkles",
    },
    {
      id: 6,
      title: "Urban Exploration",
      description: "Experience the energy and diversity of the world's most vibrant cities.",
      image: "/placeholder.svg?height=400&width=600",
      destinations: ["New York", "Tokyo", "Barcelona"],
      icon: "Globe",
    },
  ]

  const visibleInspirations = isMobile
    ? inspirations.slice(currentSlide, currentSlide + 1)
    : inspirations.slice(currentSlide, currentSlide + 3)

  const nextSlide = () => {
    const maxSlide = isMobile ? inspirations.length - 1 : inspirations.length - 3
    setCurrentSlide(currentSlide === maxSlide ? 0 : currentSlide + 1)
  }

  const prevSlide = () => {
    const maxSlide = isMobile ? inspirations.length - 1 : inspirations.length - 3
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
          aria-label="Previous inspiration"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={nextSlide}
          aria-label="Next inspiration"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {visibleInspirations.map((inspiration) => (
          <Card key={inspiration.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src={inspiration.image || "/placeholder.svg"}
                alt={inspiration.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                    {inspiration.icon === "Globe" && <Globe className="w-4 h-4 text-white" />}
                    {inspiration.icon === "Compass" && <Compass className="w-4 h-4 text-white" />}
                    {inspiration.icon === "Sparkles" && <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-white">{inspiration.title}</h3>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">{inspiration.description}</p>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Popular Destinations:</div>
                <div className="flex flex-wrap gap-2">
                  {inspiration.destinations.map((destination, idx) => (
                    <Badge key={idx} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      {destination}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                aria-label={`Explore ${inspiration.title}`}
              >
                Explore
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile pagination indicators */}
      {isMobile && (
        <div className="flex justify-center mt-6">
          {inspirations.map((_, index) => (
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
