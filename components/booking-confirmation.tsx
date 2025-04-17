"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  CheckCircle, Calendar, Plane, User, Mail, Download, Share2, 
  Smartphone, ExternalLink, ArrowRightCircle, QrCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getBookingDetails } from "@/app/actions/flight-actions"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import appStorage from "@/lib/session-storage"

export function BookingConfirmation() {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCardFlipped, setIsCardFlipped] = useState(false)

  useEffect(() => {
    // Try to load booking data from session storage using the new utility
    const reference = appStorage.getBookingReference();
    const id = appStorage.getOrderId();
    const storedBookingData = appStorage.getBookingData();
    
    console.log("[BOOKING-CONFIRMATION] Loading booking data:", {
      hasReference: !!reference,
      hasOrderId: !!id,
      hasStoredData: !!storedBookingData
    });

    if (reference) {
      setBookingReference(reference);
    }

    if (id) {
      setOrderId(id);
      
      // If we have cached booking data, use it
      if (storedBookingData) {
        console.log("[BOOKING-CONFIRMATION] Using cached booking data");
        setBookingDetails(storedBookingData);
        setLoading(false);
      } else {
        // Otherwise fetch from API
        console.log("[BOOKING-CONFIRMATION] Fetching booking details from API");
        fetchBookingDetails(id);
      }
    } else if (reference) {
      // If we have only the reference but no details, show what we know
      console.log("[BOOKING-CONFIRMATION] Only have booking reference, no details");
      setLoading(false);
    } else {
      // If we have no booking data at all, show error and redirect
      console.error("[BOOKING-CONFIRMATION] No booking reference or order ID found");
      setError("No booking information found. Please try searching for your booking.");
      setLoading(false);
      
      // Delayed redirect to home
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [router]);

  const fetchBookingDetails = async (id: string) => {
    try {
      const response = await getBookingDetails(id)
      if (response.data && !response.error) {
        setBookingDetails(response.data)
        
        // Cache the booking details in session storage
        appStorage.setBookingData({
          passengers: response.data.passengers?.map((p: any) => ({
            name: `${p.given_name} ${p.family_name}`,
            type: p.type
          })) || [],
          flight: response.data,
          totalAmount: response.data.total_amount || '0',
          currency: response.data.total_currency || 'USD'
        });
      } else {
        setError("Failed to fetch booking details")
      }
    } catch (error) {
      console.error("Error fetching booking details:", error)
      setError("An error occurred while fetching booking details")
    } finally {
      setLoading(false)
    }
  }

  // Format departure date from the first slice if available
  const getDepartureDate = () => {
    if (bookingDetails && bookingDetails.slices && bookingDetails.slices.length > 0) {
      const departureDate = new Date(bookingDetails.slices[0].segments[0].departing_at)
      return format(departureDate, "MMMM d, yyyy")
    }
    return "April 15, 2025" // Fallback date
  }

  // Get flight number from the first slice if available
  const getFlightNumber = () => {
    if (bookingDetails && bookingDetails.slices && bookingDetails.slices.length > 0) {
      const segment = bookingDetails.slices[0].segments[0]
      return `${segment.operating_carrier.iata_code}${segment.operating_carrier_flight_number}`
    }
    return "CosmoAir CA1234" // Fallback flight number
  }

  // Get passenger name if available
  const getPassengerName = () => {
    if (bookingDetails && bookingDetails.passengers && bookingDetails.passengers.length > 0) {
      const passenger = bookingDetails.passengers[0]
      return `${passenger.given_name} ${passenger.family_name}`
    }
    return "John Doe" // Fallback name
  }

  // Get passenger email if available
  const getPassengerEmail = () => {
    if (bookingDetails && bookingDetails.passengers && bookingDetails.passengers.length > 0) {
      return bookingDetails.passengers[0].email
    }
    return "john.doe@example.com" // Fallback email
  }

  // Get origin and destination if available
  const getRouteInfo = () => {
    if (bookingDetails && bookingDetails.slices && bookingDetails.slices.length > 0) {
      const slice = bookingDetails.slices[0];
      return {
        origin: slice.origin?.iata_code || "JFK",
        originCity: slice.origin?.city_name || "New York",
        destination: slice.destination?.iata_code || "SFO",
        destinationCity: slice.destination?.city_name || "San Francisco"
      };
    }
    return {
      origin: "JFK",
      originCity: "New York",
      destination: "SFO",
      destinationCity: "San Francisco"
    };
  }

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
            <h2 className="text-2xl font-bold">Loading Booking Details</h2>
            <p className="text-white/70">Preparing your boarding pass...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h2 className="text-2xl font-bold">Error Loading Booking</h2>
            <p className="text-white/70">{error}</p>
            <Button
              onClick={() => router.push("/")}
              className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const routeInfo = getRouteInfo();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-indigo-900/70 to-purple-900/70 backdrop-blur-md border-white/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full -mr-16 -mt-16 backdrop-blur-3xl" aria-hidden="true"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full -ml-10 -mb-10 backdrop-blur-3xl" aria-hidden="true"></div>
          
          <CardContent className="pt-6 relative z-10">
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                Booking Confirmed!
              </h2>
              
              <p className="text-white/80 max-w-md mx-auto">
                Your flight has been booked successfully. We've sent the details to your email.
              </p>
              
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 rounded-lg p-4 backdrop-blur-sm inline-block mt-4 border border-white/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-60"></div>
                <span className="text-xl font-mono font-bold relative z-10">{bookingReference || "XYZ12345"}</span>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="relative perspective-1000" style={{ perspective: "1000px" }}>
          <motion.div
            className="relative preserve-3d"
            initial={false}
            animate={{ rotateY: isCardFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front of card (Boarding Pass) */}
            <div 
              className={`backface-hidden ${isCardFlipped ? "invisible" : "visible"}`}
              style={{ backfaceVisibility: "hidden" }}
            >
              <Card className="bg-gradient-to-br from-violet-900/80 to-indigo-900/80 backdrop-blur-md border-white/10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/boarding-pass-pattern.svg')] bg-no-repeat bg-cover opacity-5" aria-hidden="true"></div>
                
                <CardHeader className="relative z-10 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                      Boarding Pass
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                    >
                      <ArrowRightCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-center">
                      <p className="text-white/70 text-sm">From</p>
                      <h3 className="text-2xl font-bold">{routeInfo.origin}</h3>
                      <p className="text-white/70 text-xs">{routeInfo.originCity}</p>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center px-4">
                      <div className="w-full h-px bg-white/20 relative">
                        <Plane className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-white/80 w-5 h-5" />
                        <div className="absolute -right-1 -top-1 w-2 h-2 border-t border-r border-white/40 transform rotate-45"></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-white/70 text-sm">To</p>
                      <h3 className="text-2xl font-bold">{routeInfo.destination}</h3>
                      <p className="text-white/70 text-xs">{routeInfo.destinationCity}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-white/70 text-xs">Flight</p>
                      <p className="font-medium">{getFlightNumber()}</p>
                    </div>
                    
                    <div>
                      <p className="text-white/70 text-xs">Date</p>
                      <p className="font-medium">{getDepartureDate()}</p>
                    </div>
                    
                    <div>
                      <p className="text-white/70 text-xs">Passenger</p>
                      <p className="font-medium truncate">{getPassengerName()}</p>
                    </div>
                    
                    <div>
                      <p className="text-white/70 text-xs">Class</p>
                      <p className="font-medium">Economy</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <QrCode className="w-24 h-24 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center text-white/70 text-xs">
                    Scan this code at the airport for contactless check-in
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Back of card (Additional Details) */}
            <div 
              className={`backface-hidden absolute top-0 left-0 w-full ${isCardFlipped ? "visible" : "invisible"}`}
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <Card className="bg-gradient-to-br from-indigo-900/80 to-violet-900/80 backdrop-blur-md border-white/10 h-full">
                <CardHeader className="relative z-10 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300">
                      Flight Details
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                    >
                      <ArrowRightCircle className="w-5 h-5 transform rotate-180" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-400/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium">Departure Date</p>
                        <p className="text-white/70">{getDepartureDate()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-400/20 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Flight</p>
                        <p className="text-white/70">{getFlightNumber()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Passenger</p>
                        <p className="text-white/70">{getPassengerName()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-white/70">{getPassengerEmail()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Download className="w-4 h-4" />
                Download E-Ticket
              </Button>
              
              <Button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20">
                <Share2 className="w-4 h-4" />
                Share Itinerary
              </Button>
              
              <Button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20">
                <Smartphone className="w-4 h-4" />
                Add to Apple Wallet
              </Button>
              
              <Button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20">
                <ExternalLink className="w-4 h-4" />
                Online Check-in
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center"
      >
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          Return to Home
        </Button>
      </motion.div>
    </div>
  )
}
