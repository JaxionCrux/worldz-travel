"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, ShieldCheck, Zap } from "lucide-react"

export function MobileAppPromo() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-indigo-900">
              Get the full experience with our mobile app
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Download our app to unlock exclusive features and make your travel experience even more seamless. Book flights, manage your trips, and receive real-time updates, all from your smartphone.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Faster Booking</h3>
                  <p className="text-gray-600">Book flights in under 30 seconds with saved preferences and payment methods.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <ShieldCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Secure Travel</h3>
                  <p className="text-gray-600">Get real-time safety alerts, digital boarding passes, and contactless check-in.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <ArrowDownToLine className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Offline Access</h3>
                  <p className="text-gray-600">Access your bookings, boarding passes, and trip details even without internet.</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full py-6 px-6 bg-black text-white hover:bg-gray-800">
                <div className="flex items-center">
                  <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.0001 5.17322C17.6443 4.45987 18.0709 3.47151 17.9998 2.5C17.1108 2.53785 16.1089 3.02338 15.4417 3.75661C14.8334 4.41291 14.3127 5.41227 14.3997 6.36959C15.3891 6.43542 16.3282 5.90323 17.0001 5.17322Z" fill="white"/>
                    <path d="M20.5001 11.9999C20.5126 9.74075 21.9864 8.32098 22.0001 8.30864C22.0137 8.29629 20.8387 6.41666 19.0689 6.41666C17.2991 6.41666 16.7503 7.59258 15.1689 7.59258C13.5876 7.59258 12.4803 6.42901 11.0501 6.42901C8.77525 6.42901 6.37525 8.32097 6.37525 11.9876C6.37525 14.3086 7.2639 16.7284 8.40139 18.1728C9.37523 19.3704 10.213 20.5 11.413 20.5C12.613 20.5 13.0628 19.6049 14.5566 19.6049C16.0503 19.6049 16.4385 20.5 17.713 20.5C18.9876 20.5 19.7629 19.4815 20.6501 18.3334C21.6876 16.9753 22.1374 15.6543 22.1499 15.6049C22.1251 15.5926 20.4878 14.8766 20.4878 12.037L20.5001 11.9999Z" fill="white"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-xl font-semibold">App Store</div>
                  </div>
                </div>
              </Button>
              
              <Button className="rounded-full py-6 px-6 bg-black text-white hover:bg-gray-800">
                <div className="flex items-center">
                  <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.43053 3.68081L13.2347 12.0001L4.43053 20.3194C4.16293 20.1199 3.94262 19.8695 3.78323 19.5846C3.62384 19.2996 3.52968 18.9857 3.50636 18.6625C3.48304 18.3392 3.53106 18.0151 3.64709 17.7127C3.76312 17.4103 3.94439 17.1366 4.18053 16.9094L9.09053 12.0001L4.18053 7.09081C3.70553 6.60081 3.43053 5.93081 3.43053 5.25081C3.43053 4.58081 3.69053 3.94081 4.15053 3.44081C4.23531 3.51851 4.32851 3.60226 4.43053 3.69081V3.68081Z" fill="white"/>
                    <path d="M4.43053 3.68081L13.2347 12.0001L4.43053 20.3194C4.16293 20.1199 3.94262 19.8695 3.78323 19.5846C3.62384 19.2996 3.52968 18.9857 3.50636 18.6625C3.48304 18.3392 3.53106 18.0151 3.64709 17.7127C3.76312 17.4103 3.94439 17.1366 4.18053 16.9094L9.09053 12.0001L4.18053 7.09081C3.70553 6.60081 3.43053 5.93081 3.43053 5.25081C3.43053 4.58081 3.69053 3.94081 4.15053 3.44081C4.23531 3.51851 4.32851 3.60226 4.43053 3.69081V3.68081Z" fill="white"/>
                    <path d="M4.18 16.91L9.09 12L4.18 7.09C3.9439 6.86279 3.76265 6.58915 3.64664 6.28674C3.53064 5.98434 3.48264 5.66021 3.50597 5.33696C3.52929 5.01371 3.62346 4.69981 3.78285 4.41485C3.94224 4.12989 4.16255 3.87949 4.43014 3.68L15.59 15.29L19.17 13.26C19.9574 12.8136 20.477 12.0001 20.477 11.1001C20.477 10.2001 19.9574 9.38661 19.17 8.94006L15.59 6.91L4.43 18.52C4.16242 18.3205 3.94211 18.0701 3.78272 17.7851C3.62333 17.5002 3.52916 17.1863 3.50584 16.863C3.48252 16.5398 3.53053 16.2157 3.64656 15.9132C3.76259 15.6108 3.94387 15.3372 4.18 15.11V16.91Z" fill="white"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-xl font-semibold">Google Play</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="relative h-[500px] md:h-[600px] flex justify-center">
            <div className="absolute top-1/2 -translate-y-1/2 w-[250px] md:w-[300px]">
              <Image 
                src="/images/app/1.jpg"
                alt="The Worldz Travel Mobile App"
                width={300}
                height={600}
                className="rounded-[36px] shadow-2xl border-8 border-black"
              />
              
              <div className="absolute -bottom-6 -right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg">
                <div className="text-center">
                  <div className="text-xl font-bold">4.9</div>
                  <div className="text-xs">★★★★★</div>
                  <div className="text-[10px] mt-1">10K+ Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
