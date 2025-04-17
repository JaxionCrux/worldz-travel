"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FlightSearchForm } from "@/components/flight-search-form"
import { TrustpilotRating } from "@/components/trustpilot-rating"
import { PaymentMethods } from "@/components/payment-methods"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Clock, CreditCard, Gift, Star, ChevronRight, Calendar } from "lucide-react"
import { FeaturedDestinations } from "@/components/featured-destinations"
import { Testimonials } from "@/components/testimonials"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Search, CheckCircle, Plane, Tag, XCircle, Armchair, Award } from "lucide-react"
import Image from "next/image"
import { TravelInspiration } from "@/components/travel-inspiration"
import { TravelTips } from "@/components/travel-tips"
import { SpecialOffers } from "@/components/special-offers"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isSmallMobile = useMediaQuery("(max-width: 375px)")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <Head>
        <title>The Worldz Travel - Book flights. Pay later.</title>
        <meta
          name="description"
          content="Book your perfect flight with confidence. Flexible payment options, competitive prices, and exceptional service."
        />
        <meta name="keywords" content="flight booking, airline tickets, cheap flights, travel, pay later" />
        <meta property="og:title" content="The Worldz Travel - Book flights. Pay later." />
        <meta
          property="og:description"
          content="Book your perfect flight with confidence. Flexible payment options, competitive prices, and exceptional service."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://worldztravel.com" />
        <meta property="og:image" content="https://worldztravel.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="relative min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Section with enhanced design */}
          <section
            className={`relative ${isMobile ? "pt-28 pb-40" : "pt-32 pb-40"} px-4 overflow-hidden bg-gradient-to-r from-purple-100 via-lavender-200 to-indigo-200`}
            aria-labelledby="hero-heading"
          >
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-pattern opacity-10" aria-hidden="true"></div>

            {/* Floating elements for visual interest */}
            <div
              className="absolute top-20 left-10 w-16 h-16 bg-purple-300 rounded-full opacity-20 animate-float-slow"
              aria-hidden="true"
            ></div>
            <div
              className="absolute bottom-40 right-20 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-float-medium"
              aria-hidden="true"
            ></div>
            <div
              className="absolute top-40 right-10 w-12 h-12 bg-indigo-300 rounded-full opacity-20 animate-float-fast"
              aria-hidden="true"
            ></div>

            <div className="container mx-auto text-center relative z-10">
              {isMobile ? (
                <>
                  <Badge
                    variant="outline"
                    className="mb-6 bg-white/80 backdrop-blur-sm text-indigo-700 border-indigo-200 px-4 py-1.5"
                  >
                    Limited Time: 10% Off All International Flights
                  </Badge>
                  <h1 id="hero-heading" className="text-5xl font-bold mb-4 text-gray-800">
                    Your Journey{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                      Starts Here
                    </span>
                  </h1>
                  <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
                    Book your perfect flight with confidence. Flexible payment options, competitive prices, and
                    exceptional service.
                  </p>

                  <FlightSearchForm />

                  <div className="mt-16">
                    <TrustpilotRating />
                  </div>
                </>
              ) : (
                <>
                  <Badge
                    variant="outline"
                    className="mb-6 bg-white/80 backdrop-blur-sm text-indigo-700 border-indigo-200 px-4 py-1.5"
                  >
                    Limited Time: 10% Off All International Flights
                  </Badge>
                  <h1 id="hero-heading" className="text-7xl font-bold mb-4 text-gray-800">
                    Your Journey{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                      Starts Here
                    </span>
                  </h1>
                  <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
                    Book your perfect flight with confidence. Flexible payment options, competitive prices, and
                    exceptional service.
                  </p>

                  <FlightSearchForm />

                  <div className="mt-16">
                    <TrustpilotRating />
                  </div>
                </>
              )}
            </div>

            {/* Enhanced cloud background with adjusted opacity */}
            <div className="absolute bottom-0 left-0 right-0 h-40 cloud-bg" aria-hidden="true"></div>
          </section>

          {/* Featured Destinations Section */}
          <section className="py-16 px-4 bg-white" aria-labelledby="featured-destinations-heading">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 id="featured-destinations-heading" className="text-3xl font-bold mb-4 text-gray-800">
                  Featured Destinations
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Explore our handpicked selection of amazing destinations with exclusive deals and offers.
                </p>
              </div>

              <FeaturedDestinations />

              <div className="text-center mt-10">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  aria-label="View all destinations"
                >
                  View All Destinations
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>

          {/* Travel Inspiration Section */}
          <section className="py-16 px-4 bg-gray-50" aria-labelledby="travel-inspiration-heading">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 id="travel-inspiration-heading" className="text-3xl font-bold mb-4 text-gray-800">
                  Travel Inspiration
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Discover curated travel experiences tailored to your interests and preferences.
                </p>
              </div>

              <TravelInspiration />
            </div>
          </section>

          {/* Special Offers Section */}
          <section className="py-16 px-4 bg-white" aria-labelledby="special-offers-heading">
            <div className="container mx-auto">
              <SpecialOffers />
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="py-16 px-4 bg-white" aria-labelledby="why-choose-us-heading">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 id="why-choose-us-heading" className="text-3xl font-bold mb-4 text-gray-800">
                  Why Choose The Worldz Travel
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  We're committed to providing the best travel experience from booking to landing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    title: "Flexible Booking",
                    description:
                      "Change or cancel your flights with minimal fees. Your plans may change, and we understand.",
                    icon: Calendar,
                  },
                  {
                    title: "Secure Payments",
                    description: "Multiple payment options with industry-leading security to protect your information.",
                    icon: Shield,
                  },
                  {
                    title: "24/7 Support",
                    description: "Our customer service team is available around the clock to assist with any issues.",
                    icon: Clock,
                  },
                  {
                    title: "Best Price Guarantee",
                    description: "Find a lower price elsewhere? We'll match it and give you extra loyalty points.",
                    icon: CreditCard,
                  },
                ].map((feature, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section
            className="py-16 px-4 bg-gradient-to-r from-indigo-50 to-purple-50"
            aria-labelledby="how-it-works-heading"
          >
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 id="how-it-works-heading" className="text-3xl font-bold mb-4 text-gray-800">
                  Book Your Flight in 3 Simple Steps
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  We've simplified the booking process so you can focus on planning your perfect trip.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  {
                    step: "1",
                    title: "Search Flights",
                    description: "Enter your destination and dates to find the best available flights.",
                    icon: "Search",
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    step: "2",
                    title: "Choose & Customize",
                    description: "Select your preferred flight, add extras, and customize your journey.",
                    icon: "CheckCircle",
                    color: "bg-purple-100 text-purple-600",
                  },
                  {
                    step: "3",
                    title: "Book & Relax",
                    description: "Secure your booking with our flexible payment options and get ready to fly.",
                    icon: "Plane",
                    color: "bg-indigo-100 text-indigo-600",
                  },
                ].map((item, index) => (
                  <div key={index} className="relative">
                    {index < 2 && (
                      <div className="hidden md:block absolute top-16 left-full w-16 h-4 z-0">
                        <div className="h-0.5 w-full bg-gray-300 relative">
                          <div className="absolute -right-1 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-gray-300 transform rotate-45"></div>
                        </div>
                      </div>
                    )}
                    <div className="bg-white rounded-xl p-8 shadow-sm relative z-10 h-full flex flex-col items-center text-center transform transition-transform hover:scale-105">
                      <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mb-4`}>
                        {item.icon === "Search" && <Search className="w-6 h-6" />}
                        {item.icon === "CheckCircle" && <CheckCircle className="w-6 h-6" />}
                        {item.icon === "Plane" && <Plane className="w-6 h-6" />}
                      </div>
                      <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {item.step}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Popular Routes Section */}
          <section className="py-16 px-4 bg-white" aria-labelledby="popular-routes-heading">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 id="popular-routes-heading" className="text-3xl font-bold mb-4 text-gray-800">
                  Popular Flight Routes
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Discover our most popular routes with competitive prices and frequent departures.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    from: "New York",
                    fromCode: "NYC",
                    to: "London",
                    toCode: "LHR",
                    price: "399",
                    duration: "7h 20m",
                    image: "/images/flights/1.jpg",
                  },
                  {
                    from: "Los Angeles",
                    fromCode: "LAX",
                    to: "Tokyo",
                    toCode: "HND",
                    price: "799",
                    duration: "11h 15m",
                    image: "/images/flights/2.jpg",
                  },
                  {
                    from: "Chicago",
                    fromCode: "ORD",
                    to: "Paris",
                    toCode: "CDG",
                    price: "449",
                    duration: "8h 30m",
                    image: "/images/flights/3.jpg",
                  },
                  {
                    from: "Miami",
                    fromCode: "MIA",
                    to: "Cancun",
                    toCode: "CUN",
                    price: "199",
                    duration: "1h 45m",
                    image: "/images/flights/4.jpg",
                  },
                  {
                    from: "San Francisco",
                    fromCode: "SFO",
                    to: "Sydney",
                    toCode: "SYD",
                    price: "899",
                    duration: "14h 35m",
                    image: "/images/flights/5.jpg",
                  },
                  {
                    from: "Boston",
                    fromCode: "BOS",
                    to: "Dublin",
                    toCode: "DUB",
                    price: "349",
                    duration: "6h 20m",
                    image: "/images/flights/6.jpg",
                  },
                ].map((route, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20">
                        <Image
                          src={route.image}
                          alt={`${route.from} to ${route.to}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="relative z-10 flex items-center text-white">
                        <div className="text-center">
                          <div className="font-bold">{route.fromCode}</div>
                          <div className="text-xs">{route.from}</div>
                        </div>
                        <div className="mx-3 flex flex-col items-center">
                          <div className="w-20 h-px bg-white/50 relative">
                            <div className="absolute -right-1 -top-1.5 w-3 h-3 border-t border-r border-white/50 transform rotate-45"></div>
                          </div>
                          <div className="text-xs mt-1">{route.duration}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{route.toCode}</div>
                          <div className="text-xs">{route.to}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">From</div>
                        <div className="text-xl font-bold text-indigo-700">${route.price}</div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        aria-label={`Book flights from ${route.from} to ${route.to}`}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Travel Benefits Section */}
          <section
            className="py-16 px-4 bg-gradient-to-b from-white to-indigo-50"
            aria-labelledby="travel-benefits-heading"
          >
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 id="travel-benefits-heading" className="text-3xl font-bold mb-4 text-gray-800">
                  Exclusive Travel Benefits
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Enjoy these premium benefits when you book with The Worldz Travel.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    title: "Price Match Guarantee",
                    description: "Found a lower price? We'll match it and give you extra loyalty points.",
                    icon: "Tag",
                  },
                  {
                    title: "Free Cancellation",
                    description: "Plans change? Cancel for free up to 24 hours before your flight.",
                    icon: "XCircle",
                  },
                  {
                    title: "Seat Selection",
                    description: "Choose your preferred seat at no extra cost on most flights.",
                    icon: "Armchair",
                  },
                  {
                    title: "Loyalty Rewards",
                    description: "Earn points with every booking and redeem them for future travel.",
                    icon: "Award",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 h-full">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                      {benefit.icon === "Tag" && <Tag className="w-6 h-6 text-indigo-600" />}
                      {benefit.icon === "XCircle" && <XCircle className="w-6 h-6 text-indigo-600" />}
                      {benefit.icon === "Armchair" && <Armchair className="w-6 h-6 text-indigo-600" />}
                      {benefit.icon === "Award" && <Award className="w-6 h-6 text-indigo-600" />}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 px-4 bg-white" aria-labelledby="testimonials-heading">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 id="testimonials-heading" className="text-3xl font-bold mb-4 text-gray-800">
                  What Our Customers Say
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Don't just take our word for it. Here's what travelers have to say about their experience with us.
                </p>
              </div>

              <Testimonials />
            </div>
          </section>

          {/* Travel Tips Section */}
          <section className="py-16 px-4 bg-white" aria-labelledby="travel-tips-heading">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 id="travel-tips-heading" className="text-3xl font-bold mb-4 text-gray-800">
                  Expert Travel Tips
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Make the most of your journey with these helpful tips from our travel experts.
                </p>
              </div>

              <TravelTips />
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="py-16 px-4 bg-white" aria-labelledby="newsletter-heading">
            <div className="container mx-auto">
              <NewsletterSignup />
            </div>
          </section>

          {/* Payment Methods Section */}
          <section className="py-12 bg-gray-50" aria-labelledby="payment-methods-heading">
            <div className="container mx-auto">
              <h2 id="payment-methods-heading" className="text-2xl font-bold mb-8 text-center text-gray-800">
                Trusted Payment Methods
              </h2>
              <PaymentMethods />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
