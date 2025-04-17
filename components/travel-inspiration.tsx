"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"

export function TravelInspiration() {
  const [activeCategory, setActiveCategory] = useState("all")

  const inspirations = [
    {
      id: 1,
      title: "Adventure Seekers",
      description: "Thrilling experiences for those who crave excitement and challenge.",
      image: "/images/travel/1.jpg",
      category: "adventure",
    },
    {
      id: 2,
      title: "Cultural Exploration",
      description: "Immerse yourself in the rich heritage and traditions around the world.",
      image: "/images/travel/2.jpg",
      category: "cultural",
    },
    {
      id: 3,
      title: "Luxury Getaways",
      description: "Indulge in premium experiences with unparalleled comfort and service.",
      image: "/images/travel/3.jpg",
      category: "luxury",
    },
    {
      id: 4,
      title: "Nature Retreats",
      description: "Reconnect with the natural world in stunning landscapes and serene environments.",
      image: "/images/travel/4.jpg",
      category: "nature",
    },
    {
      id: 5,
      title: "Family Vacations",
      description: "Create lasting memories with experiences designed for all ages.",
      image: "/images/travel/5.jpg",
      category: "family",
    },
    {
      id: 6,
      title: "Romantic Escapes",
      description: "Perfect getaways for couples looking to rekindle their connection.",
      image: "/images/travel/6.jpg",
      category: "romantic",
    },
  ]

  const categories = [
    { id: "all", label: "All Experiences" },
    { id: "adventure", label: "Adventure" },
    { id: "cultural", label: "Cultural" },
    { id: "luxury", label: "Luxury" },
    { id: "nature", label: "Nature" },
    { id: "family", label: "Family" },
    { id: "romantic", label: "Romantic" },
  ]

  const filteredInspirations = activeCategory === "all" 
    ? inspirations 
    : inspirations.filter(item => item.category === activeCategory)

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            className={activeCategory === category.id 
              ? "bg-indigo-600 hover:bg-indigo-700" 
              : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInspirations.map((inspiration) => (
          <Card key={inspiration.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-52 w-full">
                <Image
                  src={inspiration.image}
                  alt={inspiration.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-indigo-500 text-white">
                  {categories.find(c => c.id === inspiration.category)?.label}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2">{inspiration.title}</h3>
                <p className="text-gray-600 mb-4">{inspiration.description}</p>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <span>Explore More</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
