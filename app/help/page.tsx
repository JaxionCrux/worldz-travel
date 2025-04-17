"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, MessageSquare, Phone, Mail, Clock, ChevronRight } from "lucide-react"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      category: "Booking",
      questions: [
        {
          question: "How do I change or cancel my flight?",
          answer:
            "You can change or cancel your flight by going to 'My Trips' in your account dashboard. Select the trip you want to modify and follow the instructions. Please note that change and cancellation fees may apply depending on your fare type and how close to departure you make the change.",
        },
        {
          question: "Can I reserve a specific seat?",
          answer:
            "Yes, you can select your preferred seat during the booking process or later through the 'Manage Booking' section. Some seats may have an additional fee depending on your fare type and loyalty status.",
        },
        {
          question: "How do I add baggage to my booking?",
          answer:
            "You can add baggage during the initial booking process or later through the 'Manage Booking' section. Adding baggage after booking may incur higher fees than adding it during the initial purchase.",
        },
      ],
    },
    {
      category: "Check-in",
      questions: [
        {
          question: "When can I check in for my flight?",
          answer:
            "Online check-in opens 24 hours before your scheduled departure time and closes 1 hour before departure. You can check in through our website or mobile app.",
        },
        {
          question: "How do I get my boarding pass?",
          answer:
            "After completing the check-in process, you can download your boarding pass to your mobile device, print it at home, or collect it from a self-service kiosk or check-in counter at the airport.",
        },
      ],
    },
    {
      category: "Baggage",
      questions: [
        {
          question: "What are the baggage allowance limits?",
          answer:
            "Baggage allowances vary depending on your route, fare type, and loyalty status. Generally, economy passengers are allowed one carry-on bag (max 7kg) and can purchase checked baggage. Business and first-class passengers typically have higher allowances included in their fare.",
        },
        {
          question: "What items are prohibited in checked baggage?",
          answer:
            "Prohibited items include but are not limited to: flammable materials, explosives, compressed gases, corrosives, poisons, radioactive materials, magnetic materials, and certain electronic devices with lithium batteries. For a complete list, please check our baggage policy.",
        },
      ],
    },
    {
      category: "Loyalty Program",
      questions: [
        {
          question: "How do I earn loyalty points?",
          answer:
            "You earn points by flying with us or our partner airlines, using our co-branded credit cards, shopping with our retail partners, or booking hotels and car rentals through our partners. The number of points earned depends on the fare type, route, and your membership tier.",
        },
        {
          question: "How do I redeem my loyalty points?",
          answer:
            "You can redeem your points for flights, upgrades, extra baggage allowance, lounge access, and various merchandise through our loyalty program portal in your account dashboard.",
        },
      ],
    },
  ]

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Help & Support</h1>

          <div className="relative mb-12">
            <Input
              type="text"
              placeholder="Search for help topics..."
              className="pl-10 h-12 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">Chat with Us</h3>
                <p className="text-sm text-gray-600 mb-4">Get instant answers from our virtual assistant</p>
                <Button variant="outline" className="w-full">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-sm text-gray-600 mb-4">Speak with our customer service team</p>
                <Button variant="outline" className="w-full">
                  +1 (800) 123-4567
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-sm text-gray-600 mb-4">We'll respond within 24 hours</p>
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={faqs[0].category.toLowerCase()}>
                <TabsList className="grid grid-cols-4 mb-6">
                  {faqs.map((category) => (
                    <TabsTrigger key={category.category} value={category.category.toLowerCase()}>
                      {category.category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {faqs.map((category) => (
                  <TabsContent key={category.category} value={category.category.toLowerCase()}>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Ways to reach our customer support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-gray-600">+1 (800) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">support@worldztravel.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Hours of Operation</p>
                      <p className="text-sm text-gray-600">24/7 for emergency support</p>
                      <p className="text-sm text-gray-600">8am - 8pm ET for general inquiries</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="font-medium">Popular Help Topics</p>
                  <ul className="space-y-2">
                    {[
                      "Booking Changes and Cancellations",
                      "Baggage Information",
                      "Check-in Procedures",
                      "Flight Delays and Disruptions",
                      "Refund Status",
                    ].map((topic, index) => (
                      <li key={index}>
                        <Button variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-800">
                          <span>{topic}</span>
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
