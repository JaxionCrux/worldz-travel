"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, MapPin, Tag, TrendingUp } from "lucide-react"

export function SpecialOffers() {
  const [activeTab, setActiveTab] = useState("all")

  const offers = [
    {
      id: 1,
      title: "Winter Escape to Tokyo",
      description: "Experience the magic of Tokyo in winter with exclusive deals on direct flights",
      image: "/images/destinations/3.jpg",
      price: 799,
      oldPrice: 1099,
      discount: "27%",
      expires: "Feb 28, 2024",
      destination: "Tokyo",
      category: "seasonal",
      tags: ["asia", "city", "popular"],
      featured: true,
    },
    {
      id: 2,
      title: "Weekend Getaway to Paris",
      description: "Perfect for a romantic weekend in the City of Lights with premium economy seating",
      image: "/images/destinations/5.jpg",
      price: 549,
      oldPrice: 649,
      discount: "15%",
      expires: "Mar 15, 2024",
      destination: "Paris",
      category: "weekend",
      tags: ["europe", "luxury", "romantic"],
      featured: true,
    },
    {
      id: 3,
      title: "Business Class to New York",
      description: "Upgrade your travel experience with our business class promotion to NYC",
      image: "/images/destinations/1.jpg",
      price: 1299,
      oldPrice: 1899,
      discount: "32%",
      expires: "Feb 10, 2024",
      destination: "New York",
      category: "business",
      tags: ["north america", "business", "city"],
      featured: false,
    },
    {
      id: 4,
      title: "Family Holiday in Bali",
      description: "Take the whole family to Bali with our special package including extra baggage",
      image: "/images/destinations/6.jpg",
      price: 849,
      oldPrice: 1049,
      discount: "19%",
      expires: "Apr 20, 2024",
      destination: "Bali",
      category: "family",
      tags: ["asia", "beach", "family"],
      featured: false,
    },
    {
      id: 5,
      title: "Last Minute to Barcelona",
      description: "Spontaneous trip to Barcelona with special last-minute deals and flexible dates",
      image: "/images/travel/2.jpg",
      price: 399,
      oldPrice: 599,
      discount: "33%",
      expires: "Jan 31, 2024",
      destination: "Barcelona",
      category: "last-minute",
      tags: ["europe", "city", "beach"],
      featured: true,
    },
    {
      id: 6,
      title: "Summer in Santorini",
      description: "Book early for summer flights to stunning Santorini and secure the best rates",
      image: "/images/travel/4.jpg",
      price: 699,
      oldPrice: 899,
      discount: "22%",
      expires: "May 15, 2024",
      destination: "Santorini",
      category: "seasonal",
      tags: ["europe", "beach", "romantic"],
      featured: false,
    },
  ]

  const categories = [
    { id: "all", label: "All Offers" },
    { id: "featured", label: "Featured" },
    { id: "seasonal", label: "Seasonal" },
    { id: "weekend", label: "Weekend" },
    { id: "business", label: "Business" },
    { id: "last-minute", label: "Last Minute" },
    { id: "family", label: "Family" },
  ]

  const filteredOffers = activeTab === "all" 
    ? offers 
    : activeTab === "featured" 
      ? offers.filter(offer => offer.featured) 
      : offers.filter(offer => offer.category === activeTab)

  return (
    <section className="py-12 bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Special Flight Offers</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Limited-time deals to your favorite destinations. Book now to secure these exclusive prices.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeTab === category.id ? "default" : "outline"}
              className={activeTab === category.id 
                ? "bg-indigo-600 hover:bg-indigo-700" 
                : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"}
              onClick={() => setActiveTab(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/search" className="block h-full">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="relative h-48">
                    <Image 
                      src={offer.image} 
                      alt={offer.title} 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white hover:bg-red-600">
                        {offer.discount} OFF
                      </Badge>
                    </div>
                    
                    {offer.featured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                          <TrendingUp className="w-3.5 h-3.5 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{offer.title}</h3>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{offer.destination}</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    <p className="text-gray-600 mb-4 text-sm">{offer.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Expires: {offer.expires}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Tag className="w-4 h-4 mr-1" />
                        <span className="capitalize">{offer.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-lg text-indigo-600 font-bold">${offer.price}</div>
                        <div className="text-sm text-gray-400 line-through">${offer.oldPrice}</div>
                      </div>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            View All Offers
            <CalendarDays className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
} 