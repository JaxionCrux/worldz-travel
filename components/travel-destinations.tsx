"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function TravelDestinations() {
  const destinations = [
    {
      id: 1,
      name: "Tokyo",
      country: "Japan",
      description: "Experience the blend of traditional culture and futuristic technology",
      image: "/images/destinations/tokyo.jpg",
      price: 899,
    },
    {
      id: 2,
      name: "Bali",
      country: "Indonesia",
      description: "Discover pristine beaches, lush rice terraces and spiritual temples",
      image: "/images/destinations/bali.jpg",
      price: 799,
    },
    {
      id: 3,
      name: "Paris",
      country: "France",
      description: "Explore the city of lights with its iconic landmarks and cuisine",
      image: "/images/destinations/paris.jpg",
      price: 649,
    },
    {
      id: 4,
      name: "New York",
      country: "United States",
      description: "Immerse yourself in the vibrant energy of the city that never sleeps",
      image: "/images/destinations/newyork.jpg",
      price: 749,
    },
    {
      id: 5,
      name: "Santorini",
      country: "Greece",
      description: "Enjoy breathtaking views of white buildings against the blue Aegean Sea",
      image: "/images/destinations/santorini.jpg",
      price: 849,
    },
    {
      id: 6,
      name: "Marrakech",
      country: "Morocco",
      description: "Wander through colorful markets and experience rich cultural heritage",
      image: "/images/destinations/marrakech.jpg",
      price: 599,
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
          <p className="text-xl text-gray-600">
            Explore our most popular flight destinations with exclusive deals and offers
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Link href="/search" key={destination.id}>
              <Card className="overflow-hidden group h-full transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={destination.image}
                    alt={`${destination.name}, ${destination.country}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <CardContent className="p-5 relative">
                  <div className="absolute top-0 right-0 -mt-14 mr-4 bg-white text-indigo-600 py-1 px-3 rounded-full font-bold shadow-lg">
                    From ${destination.price}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{destination.country}</p>
                  <p className="text-gray-700">{destination.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/search" 
            className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
          >
            View all destinations
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
} 