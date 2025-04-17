"use client"

import { Badge } from "@/components/ui/badge"

import { Award, Gift, Plane, CreditCard, TrendingUp, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LoyaltyProgram() {
  // Mock loyalty data
  const loyaltyData = {
    tier: "Silver",
    points: 2450,
    nextTier: "Gold",
    pointsToNextTier: 2550,
    totalPointsForNextTier: 5000,
    history: [
      { id: 1, date: "Apr 15, 2025", description: "Flight: SFO to JFK", points: 750 },
      { id: 2, date: "Mar 10, 2025", description: "Flight: SFO to LHR", points: 1200 },
      { id: 3, date: "Feb 5, 2025", description: "Flight: SFO to NRT", points: 1500 },
      { id: 4, date: "Jan 20, 2025", description: "Welcome Bonus", points: 500 },
    ],
  }

  const pointsPercentage = (loyaltyData.points / loyaltyData.totalPointsForNextTier) * 100

  const tiers = [
    {
      name: "Blue",
      points: 0,
      benefits: ["Online check-in", "Seat selection (24h before flight)", "Carry-on baggage"],
      current: false,
    },
    {
      name: "Silver",
      points: 2000,
      benefits: ["All Blue benefits", "Priority boarding", "Extra baggage allowance", "Lounge access (2 visits/year)"],
      current: true,
    },
    {
      name: "Gold",
      points: 5000,
      benefits: [
        "All Silver benefits",
        "Unlimited lounge access",
        "Priority security",
        "Complimentary upgrades",
        "Dedicated customer service",
      ],
      current: false,
    },
    {
      name: "Platinum",
      points: 10000,
      benefits: [
        "All Gold benefits",
        "Guaranteed seat availability",
        "Companion tickets",
        "Concierge service",
        "Status matching with partner airlines",
      ],
      current: false,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Loyalty Program</h2>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Your Status</CardTitle>
          <CardDescription>Current tier and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{loyaltyData.tier}</h3>
                <p className="text-gray-600">Member</p>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{loyaltyData.points} points</span>
                <span className="text-gray-600">
                  {loyaltyData.pointsToNextTier} more points to {loyaltyData.nextTier}
                </span>
              </div>
              <Progress value={pointsPercentage} className="h-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <Gift className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Redeem Points</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <Plane className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Book with Points</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <CreditCard className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Earn with Card</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Points History</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
            <h4 className="font-semibold mb-2">Silver Member Benefits</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Priority boarding</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Extra baggage allowance</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Lounge access (2 visits/year)</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Dedicated check-in counters</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tiers">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="tiers">Membership Tiers</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Membership Tiers</CardTitle>
              <CardDescription>Benefits and requirements for each tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`border rounded-lg p-4 ${
                      tier.current
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tier.current ? "bg-indigo-100" : "bg-gray-100"
                          }`}
                        >
                          <Award className={`w-5 h-5 ${tier.current ? "text-indigo-600" : "text-gray-500"}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{tier.name}</h3>
                          <p className="text-sm text-gray-600">{tier.points}+ points required</p>
                        </div>
                      </div>
                      {tier.current && (
                        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Current Tier</Badge>
                      )}
                    </div>

                    <h4 className="font-medium text-sm mb-2">Benefits:</h4>
                    <ul className="space-y-1 text-sm">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <Check
                            className={`w-4 h-4 mr-2 mt-0.5 ${tier.current ? "text-indigo-600" : "text-gray-500"}`}
                          />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
              <CardDescription>Recent points earned and redeemed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyaltyData.history.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+{item.points}</p>
                      <p className="text-xs text-gray-600">points</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
