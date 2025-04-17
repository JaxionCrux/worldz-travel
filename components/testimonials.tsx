"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarIcon, Quote } from "lucide-react"

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "New York, USA",
      text: "I've used many travel services before, but this airline truly stands out. Their customer service was exceptional from booking to return. When my flight was delayed, they proactively helped me reschedule without any hassle.",
      rating: 5,
      avatar: "/images/avatars/1.jpg",
      date: "March 15, 2023",
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Toronto, Canada",
      text: "The ability to pay in installments made my dream vacation possible. The process was smooth, transparent, and the interest rates were surprisingly reasonable. I'll definitely book with them again for my next trip!",
      rating: 5,
      avatar: "/images/avatars/2.jpg",
      date: "April 22, 2023",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      location: "London, UK",
      text: "What impressed me most was the value for money. I found flights that were significantly cheaper than other websites, and the experience was still top-notch. Their price match guarantee gives me confidence I'm getting the best deal.",
      rating: 4,
      avatar: "/images/avatars/3.jpg",
      date: "May 9, 2023",
    },
    {
      id: 4,
      name: "James Wilson",
      location: "Sydney, Australia",
      text: "As someone who travels frequently for business, I appreciate the streamlined booking process and the ability to store my preferences. Their mobile app is intuitive and makes managing bookings on the go incredibly simple.",
      rating: 5,
      avatar: "/images/avatars/4.jpg",
      date: "June 18, 2023",
    },
    {
      id: 5,
      name: "Sophia Patel",
      location: "Mumbai, India",
      text: "They found me a last-minute flight during peak season when every other service showed no availability. Their customer service team went above and beyond to make sure my family and I could attend our relative's wedding.",
      rating: 5,
      avatar: "/images/avatars/5.jpg",
      date: "July 3, 2023",
    },
  ]

  const nextTestimonial = useCallback(() => {
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }, [testimonials.length])

  const prevTestimonial = useCallback(() => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  // Auto advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial()
    }, 8000)
    return () => clearInterval(interval)
  }, [nextTestimonial])

  return (
    <div className="relative">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">What Our Travelers Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover why thousands of travelers choose us for their journeys around the world
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow border border-indigo-100">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0 text-center md:text-left">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-indigo-100">
                            <Image
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <h3 className="font-bold text-xl">{testimonial.name}</h3>
                          <p className="text-gray-500 text-sm">{testimonial.location}</p>
                          
                          <div className="flex items-center justify-center md:justify-start mt-3">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-5 h-5 ${
                                  i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-indigo-200 rotate-180" />
                            <blockquote className="text-gray-700 italic px-6 py-1">
                              {testimonial.text}
                            </blockquote>
                            <Quote className="absolute -bottom-2 -right-2 w-8 h-8 text-indigo-200" />
                          </div>
                          <p className="text-sm text-gray-500 text-right mt-4">{testimonial.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white shadow-md border border-gray-200 z-10 rounded-full hidden md:flex"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white shadow-md border border-gray-200 z-10 rounded-full hidden md:flex"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`w-3 h-3 p-0 rounded-full mx-1 ${
                index === activeIndex ? "bg-indigo-600" : "bg-gray-300"
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
