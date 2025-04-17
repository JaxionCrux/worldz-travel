"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Check } from "lucide-react"

export function MobileAppPromo() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <section
      className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
      aria-labelledby="mobile-app-heading"
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="max-w-lg">
              <h2 id="mobile-app-heading" className="text-3xl font-bold mb-4">
                Download Our Mobile App
              </h2>
              <p className="text-white/90 mb-6">
                Take The Worldz Travel with you wherever you go. Book flights, manage your trips, and receive real-time
                updates right from your phone.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Book flights with just a few taps",
                  "Manage your bookings on the go",
                  "Get real-time flight notifications",
                  "Access mobile boarding passes",
                  "Earn and redeem loyalty points",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="bg-white text-indigo-700 hover:bg-gray-100 border-none"
                  aria-label="Download on the App Store"
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                        <path d="M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.019-1.154-.242-1.729-.781-.368-.32-.83-.87-1.389-1.652-.594-.82-1.083-1.773-1.465-2.858-.407-1.168-.611-2.301-.611-3.4 0-1.258.269-2.343.808-3.254a4.78 4.78 0 0 1 1.67-1.725A4.506 4.506 0 0 1 9.62 7.484c.453 0 1.047.137 1.785.413.736.276 1.202.416 1.4.416.153 0 .671-.164 1.549-.492.829-.307 1.529-.434 2.1-.384 1.551.123 2.715.727 3.492 1.816-1.388.84-2.07 2.013-2.07 3.521 0 1.178.419 2.157 1.258 2.936.374.391.79.691 1.247.902a4.03 4.03 0 0 1-.614 1.698zM13.398 3.7c0 .924-.27 1.787-.811 2.587-.55.801-1.214 1.265-1.945 1.424a3.35 3.35 0 0 1-.033-.427c0-.904.293-1.867.879-2.87.293-.501.666-.911 1.117-1.228.452-.319.878-.499 1.279-.541.012.128.017.255.017.379z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs">Download on the</span>
                      <span className="text-base font-semibold">App Store</span>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="bg-white text-indigo-700 hover:bg-gray-100 border-none"
                  aria-label="Get it on Google Play"
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                        <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5S3 21.33 3 20.5zM16.5 12L9 3v18l7.5-9z" />
                        <path d="M9.5 7.5v9l8.5 5V2.5z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs">GET IT ON</span>
                      <span className="text-base font-semibold">Google Play</span>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-[500px]">
              <div className="absolute inset-0 bg-black/20 rounded-3xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-black/20 rounded-3xl transform -rotate-3"></div>
              <div className="relative bg-black rounded-3xl overflow-hidden w-full h-full p-2">
                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                  <Image
                    src="/placeholder.svg?height=500&width=250"
                    alt="The Worldz Travel mobile app"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 250px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
