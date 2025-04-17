"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Users, Shield, Award, Plane, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-r from-purple-100 via-lavender-200 to-indigo-200">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">Our Story</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Redefining the future of air travel with innovation, sustainability, and exceptional customer experiences.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Learn More
            </Button>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-none shadow-md">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h2>
                  <p className="text-gray-700 mb-6">
                    To connect people and cultures through safe, sustainable, and exceptional air travel experiences
                    that inspire exploration and understanding across the world.
                  </p>
                  <div className="flex items-center">
                    <Globe className="w-8 h-8 text-indigo-600 mr-4" />
                    <p className="font-medium">Connecting the world, one flight at a time</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-none shadow-md">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Vision</h2>
                  <p className="text-gray-700 mb-6">
                    To be the most innovative and customer-centric airline, pioneering the future of air travel with
                    cutting-edge technology and unparalleled service.
                  </p>
                  <div className="flex items-center">
                    <Plane className="w-8 h-8 text-indigo-600 mr-4" />
                    <p className="font-medium">Reimagining the future of flight</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Core Values</h2>
            <p className="text-gray-700 max-w-3xl mx-auto mb-12">
              These principles guide everything we do, from how we design our services to how we interact with our
              customers and each other.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Customer First</h3>
                  <p className="text-gray-600">
                    We prioritize our customers' needs and experiences in every decision we make, striving to exceed
                    expectations at every touchpoint.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Safety & Reliability</h3>
                  <p className="text-gray-600">
                    Safety is our highest priority. We maintain the highest standards in our operations and are
                    committed to reliable service.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Sustainability</h3>
                  <p className="text-gray-600">
                    We are committed to reducing our environmental impact and contributing to a more sustainable future
                    for air travel.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">Our Leadership Team</h2>
            <p className="text-gray-700 max-w-3xl mx-auto mb-12 text-center">
              Meet the experienced professionals guiding our company toward a future of innovation and excellence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  title: "Chief Executive Officer",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  name: "Michael Chen",
                  title: "Chief Operations Officer",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  name: "Elena Rodriguez",
                  title: "Chief Technology Officer",
                  image: "/placeholder.svg?height=300&width=300",
                },
                {
                  name: "David Kim",
                  title: "Chief Financial Officer",
                  image: "/placeholder.svg?height=300&width=300",
                },
              ].map((leader, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={leader.image || "/placeholder.svg"}
                    alt={leader.name}
                    className="w-full h-64 object-cover object-center"
                  />
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-lg">{leader.name}</h3>
                    <p className="text-gray-600">{leader.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Awards & Recognition</h2>
            <p className="text-gray-700 max-w-3xl mx-auto mb-12">
              We're proud to be recognized for our commitment to excellence in service, innovation, and sustainability.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center">
                  <Award className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Best Airline 2025</h3>
                  <p className="text-gray-600">
                    Recognized for exceptional customer service and innovative flight experiences.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center">
                  <Award className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Sustainability Excellence</h3>
                  <p className="text-gray-600">
                    Leading the industry in environmental initiatives and sustainable practices.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center">
                  <Award className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Innovation Leader</h3>
                  <p className="text-gray-600">
                    Pioneering technological advancements that transform the air travel experience.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Join Our Team */}
        <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="max-w-3xl mx-auto mb-8">
              We're always looking for talented individuals who share our passion for innovation and exceptional
              service. Explore career opportunities with The Worldz Travel.
            </p>
            <Button variant="outline" className="bg-white text-indigo-700 hover:bg-gray-100">
              View Open Positions
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
