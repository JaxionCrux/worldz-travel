"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Mail } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
      setEmail("")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 border-none shadow-md overflow-hidden">
      <CardContent className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-gray-700 mb-4">
                Get exclusive deals, travel tips, and personalized recommendations delivered straight to your inbox.
              </p>
              <ul className="space-y-2">
                {[
                  "Exclusive flight deals and promotions",
                  "Personalized travel recommendations",
                  "Travel guides and destination tips",
                  "Early access to seasonal sales",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:w-1/2">
              {isSuccess ? (
                <div className="bg-white p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Thank You for Subscribing!</h4>
                  <p className="text-gray-600">
                    You've been added to our newsletter. Get ready for exclusive deals and travel inspiration.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Join Our Community</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        aria-describedby={error ? "email-error" : undefined}
                        required
                      />
                      {error && (
                        <p id="email-error" className="mt-1 text-sm text-red-600">
                          {error}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-2">Subscribing</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        </>
                      ) : (
                        "Subscribe Now"
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By subscribing, you agree to our Privacy Policy and Terms of Service. We respect your privacy and
                      will never share your information.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
