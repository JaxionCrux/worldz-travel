"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

export function Testimonials() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "New York, USA",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: "The Worldz Travel made booking my family vacation so easy! The flexible payment options were a lifesaver, and their customer service was exceptional when we needed to make last-minute changes.",
      date: "May 15, 2025",
    },
    {
      id: 2,
      name: "David Chen",
      location: "Toronto, Canada",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: "I've been using The Worldz Travel for all my business trips for the past year. Their platform is intuitive, prices are competitive, and the loyalty program offers great benefits. Highly recommended!",
      date: "April 22, 2025",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      location: "London, UK",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4,
      text: "My experience with The Worldz Travel has been mostly positive. Their app is convenient for booking on the go, and I appreciate the 24/7 customer support. The only reason for 4 stars is a slight delay in refund processing.",
      date: "March 10, 2025",
    },
    {
      id: 4,
      name: "Michael Kim",
      location: "Seoul, South Korea",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: "As a frequent traveler, I've tried many booking platforms, but The Worldz Travel stands out for their transparent pricing and excellent rewards program. I've saved thousands on my travels this year alone!",
      date: "February 28, 2025",
    },
    {
      id: 5,
      name: "Olivia Patel",
      location: "Sydney, Australia",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: "I was skeptical about using a new booking platform, but The Worldz Travel exceeded all my expectations. Their price match guarantee saved me money, and the booking process was seamless from start to finish.",
      date: "January 15, 2025",
    },
  ]

  const visibleTestimonials = isMobile
    ? testimonials.slice(currentSlide, currentSlide + 1)
    : testimonials.slice(currentSlide, currentSlide + 3)

  const nextSlide = () => {
    const maxSlide = isMobile ? testimonials.length - 1 : testimonials.length - 3
    setCurrentSlide(currentSlide === maxSlide ? 0 : currentSlide + 1)
    setAutoplay(false)
  }

  const prevSlide = () => {
    const maxSlide = isMobile ? testimonials.length - 1 : testimonials.length - 3
    setCurrentSlide(currentSlide === 0 ? maxSlide : currentSlide - 1)
    setAutoplay(false)
  }

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      const maxSlide = isMobile ? testimonials.length - 1 : testimonials.length - 3
      setCurrentSlide(currentSlide === maxSlide ? 0 : currentSlide + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSlide, autoplay, isMobile, testimonials.length])

  return (
    <div className="relative">
      <div className="flex justify-between absolute -top-16 right-0">
        <Button
          variant="outline"
          size="icon"
          className="mr-2 rounded-full"
          onClick={prevSlide}
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={nextSlide}
          aria-label="Next testimonials"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {visibleTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-700 mb-4 line-clamp-4">{testimonial.text}</p>

              <p className="text-sm text-gray-500">{testimonial.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile pagination indicators */}
      {isMobile && (
        <div className="flex justify-center mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${index === currentSlide ? "bg-indigo-600" : "bg-gray-300"}`}
              onClick={() => {
                setCurrentSlide(index)
                setAutoplay(false)
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
