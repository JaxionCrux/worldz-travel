"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MailIcon, PlaneIcon, ArrowRight } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export function NewsletterSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubscribed(true)
    form.reset()

    toast({
      title: "Subscription successful!",
      description: "Thanks for signing up. Check your inbox for exclusive deals.",
      duration: 5000,
    })
  }

  return (
    <section className="py-16 bg-indigo-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              <PlaneIcon
                className="text-white"
                style={{
                  width: `${20 + Math.random() * 30}px`,
                  height: `${20 + Math.random() * 30}px`,
                  opacity: 0.2 + Math.random() * 0.3,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-800 rounded-full mb-6">
            <MailIcon className="h-6 w-6 text-indigo-200" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Exclusive Flight Deals
          </h2>
          
          <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about special offers, 
            new destinations, and travel tips from our experts.
          </p>

          {!isSubscribed ? (
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          className="rounded-full px-5 py-6 text-gray-900 border-none focus-visible:ring-indigo-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300 text-sm mt-1 ml-2" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-6 h-auto"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="bg-indigo-800/50 rounded-lg p-6 max-w-xl mx-auto">
              <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Thank You for Subscribing!</h3>
              <p className="text-indigo-200">
                You've been added to our mailing list and will be among the first to hear about new deals and promotions.
              </p>
            </div>
          )}

          <p className="text-xs text-indigo-300 mt-6">
            By subscribing, you agree to our Privacy Policy and consent to receive marketing communications.
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}
