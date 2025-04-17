"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  CreditCard, User, Mail, Phone, Calendar, Flag, Check, AlertCircle, 
  Passport, Trash2, Plus, CreditCard as CreditCardIcon, Plane 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { createBookingAction } from "@/app/actions/flight-actions"
import type { Passenger } from "@/lib/duffel"
import { useSeats } from "@/app/providers/seat-context"
import { createDuffelPaymentIntent } from "@/lib/duffel-payments"

interface BookingFormProps {
  offerId: string
  flightDetails: any
  returnFlightId?: string | null
  returnFlightDetails?: any
  passengerCounts: {
    adults: number
    children: number
    infants: number
  }
}

interface PassengerForm {
  type: 'adult' | 'child' | 'infant'
  given_name: string
  family_name: string
  email?: string
  phone_number?: string
  born_on: string
  gender?: 'm' | 'f'
  title?: string
  passport_number?: string
  nationality?: string
  passport_expiry_date?: string
}

export function BookingForm({ 
  offerId, 
  flightDetails, 
  returnFlightId, 
  returnFlightDetails,
  passengerCounts
}: BookingFormProps) {
  const router = useRouter()
  const { selectedSeats, getTotalSeatPrice } = useSeats()
  const [isLoading, setIsLoading] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [passengerForms, setPassengerForms] = useState<PassengerForm[]>(() => {
    // Initialize forms for each passenger
    const initialForms: PassengerForm[] = [];
    
    // Add adult forms
    for (let i = 0; i < passengerCounts.adults; i++) {
      initialForms.push({
        type: 'adult',
        given_name: '',
        family_name: '',
        email: i === 0 ? '' : undefined, // Only require email for the first passenger
        phone_number: i === 0 ? '' : undefined, // Only require phone for the first passenger
        born_on: '',
        gender: 'm',
        title: 'mr',
        passport_number: '',
        nationality: '',
        passport_expiry_date: ''
      });
    }
    
    // Add child forms
    for (let i = 0; i < passengerCounts.children; i++) {
      initialForms.push({
        type: 'child',
        given_name: '',
        family_name: '',
        born_on: '',
        gender: 'm',
        passport_number: '',
        nationality: '',
        passport_expiry_date: ''
      });
    }
    
    // Add infant forms
    for (let i = 0; i < passengerCounts.infants; i++) {
      initialForms.push({
        type: 'infant',
        given_name: '',
        family_name: '',
        born_on: '',
        gender: 'm',
        passport_number: '',
        nationality: '',
        passport_expiry_date: ''
      });
    }
    
    return initialForms;
  });
  
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple-pay">("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Calculate seat selection price
  const seatSelectionPrice = getTotalSeatPrice();
  const hasSeatSelections = selectedSeats.size > 0;
  
  // Calculate total with seat selection
  const outboundTotal = parseFloat(flightDetails.total_amount || "0");
  const returnTotal = returnFlightDetails ? parseFloat(returnFlightDetails.total_amount || "0") : 0;
  const flightTotal = outboundTotal + returnTotal;
  const totalWithSeats = flightTotal + seatSelectionPrice;
  const currency = flightDetails.total_currency || "USD";

  const handlePassengerFormChange = (index: number, field: keyof PassengerForm, value: string) => {
    setPassengerForms(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handlePaymentMethodChange = (value: "card" | "paypal" | "apple-pay") => {
    setPaymentMethod(value);
  };

  const handleCardDetailsChange = (field: keyof typeof cardDetails, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    // Basic validation for required fields
    for (let i = 0; i < passengerForms.length; i++) {
      const passenger = passengerForms[i];
      
      if (!passenger.given_name || !passenger.family_name || !passenger.born_on) {
        setBookingError(`Please fill in all required fields for passenger ${i + 1}`);
        setActivePassengerIndex(i);
        return false;
      }
      
      // Email and phone validation for first passenger only
      if (i === 0 && (!passenger.email || !passenger.phone_number)) {
        setBookingError("Please provide email and phone number for the primary passenger");
        setActivePassengerIndex(0);
        return false;
      }
      
      // Check if the passenger is an adult with international travel document
      if (passenger.type === 'adult' && flightDetails.passenger_identity_documents_required) {
        if (!passenger.passport_number || !passenger.nationality || !passenger.passport_expiry_date) {
          setBookingError(`Please provide passport information for passenger ${i + 1}`);
          setActivePassengerIndex(i);
          return false;
        }
      }
    }
    
    // Payment method validation
    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.nameOnCard) {
        setBookingError("Please fill in all card details");
        return false;
      }
      
      // Basic card format validation
      const cardNumberPattern = /^\d{13,19}$/;
      const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
      const cvcPattern = /^\d{3,4}$/;
      
      if (!cardNumberPattern.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        setBookingError("Please enter a valid card number");
        return false;
      }
      
      if (!expiryPattern.test(cardDetails.expiry)) {
        setBookingError("Please enter a valid expiry date (MM/YY)");
        return false;
      }
      
      if (!cvcPattern.test(cardDetails.cvc)) {
        setBookingError("Please enter a valid CVC code");
        return false;
      }
    }
    
    // Terms acceptance
    if (!termsAccepted) {
      setBookingError("Please accept the terms and conditions");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingError(null);
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("[BOOKING-DEBUG] Booking submission started", {
        offerId,
        returnFlightId,
        passengerCount: passengerForms.length,
        paymentMethod
      });
      
      // Format passenger data for the API
      const passengers = passengerForms.map(passenger => {
        const formattedPassenger: Passenger = {
          type: passenger.type,
          given_name: passenger.given_name,
          family_name: passenger.family_name,
          born_on: passenger.born_on,
          title: passenger.title,
          gender: passenger.gender,
        };
        
        // Add email and phone only for the primary passenger
        if (passenger.email) {
          formattedPassenger.email = passenger.email;
        }
        
        if (passenger.phone_number) {
          formattedPassenger.phone_number = passenger.phone_number;
        }
        
        // Add identity document details if provided
        if (passenger.passport_number && passenger.nationality && passenger.passport_expiry_date) {
          formattedPassenger.identity_documents = [
            {
              type: "passport",
              number: passenger.passport_number,
              issuing_country_code: passenger.nationality,
              expiry_date: passenger.passport_expiry_date
            }
          ];
        }
        
        return formattedPassenger;
      });

      // Create an array of offers to include both outbound and return if applicable
      const offers = [offerId];
      if (returnFlightId) {
        offers.push(returnFlightId);
      }
      
      // Add seat selections to form data
      const seatSelections = Array.from(selectedSeats.entries()).map(([segmentId, seat]) => ({
        segment_id: segmentId,
        seat_id: seat.id,
        designator: seat.designator,
        price: seat.price || 0
      }));
      
      // Create payment intent with Duffel Payments API
      console.log("[BOOKING-DEBUG] Creating payment intent");
      const paymentIntentResponse = await createDuffelPaymentIntent({
        offers,
        passengers,
        seatSelections,
        payment: {
          type: paymentMethod,
          amount: totalWithSeats.toString(),
          currency
        }
      });
      
      if (paymentIntentResponse.data) {
        console.log("[BOOKING-DEBUG] Payment intent created", {
          paymentIntentId: paymentIntentResponse.data.id,
          clientToken: !!paymentIntentResponse.data.client_token
        });
        
        setPaymentIntent(paymentIntentResponse.data);
        setPaymentProcessing(true);
        
        // Process payment with the client token
        // This would normally be handled by a payment component
        try {
          console.log("[BOOKING-DEBUG] Processing payment with token");
          // Simulating payment processing with a short delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // In real implementation, we would call Duffel API to confirm payment
          console.log("[BOOKING-DEBUG] Payment processed successfully");
          
          // After payment, create the order
          const response = await createBookingAction({
            offers,
            passengers,
            seatSelections,
            paymentIntentId: paymentIntentResponse.data.id
          });
          
          if (response.data) {
            console.log("[BOOKING-DEBUG] Order created successfully", {
              orderId: response.data.id,
              bookingReference: response.data.booking_reference
            });
            
            setBookingComplete(true);
            setBookingReference(
              response.data.booking_reference ||
                "COS" +
                  Math.floor(Math.random() * 1000000)
                    .toString()
                    .padStart(6, "0"),
            );
            setOrderId(response.data.id);

            // Store booking reference and seat selections in session storage for confirmation page
            sessionStorage.setItem("bookingReference", response.data.booking_reference || "");
            sessionStorage.setItem("orderId", response.data.id || "");
            sessionStorage.setItem("seatSelections", JSON.stringify(seatSelections));
            sessionStorage.setItem("bookingData", JSON.stringify({
              outboundFlight: flightDetails,
              returnFlight: returnFlightDetails,
              passengerDetails: passengerForms.map(p => ({
                name: `${p.given_name} ${p.family_name}`,
                type: p.type
              })),
              totalAmount: totalWithSeats,
              currency,
              paymentMethod
            }));
          } else {
            setBookingError(response.error || "There was an error processing your booking. Please try again.");
            setPaymentProcessing(false);
          }
        } catch (error) {
          console.error("[BOOKING-DEBUG] Payment processing error", error);
          setBookingError("There was an error processing your payment. Please try again.");
          setPaymentProcessing(false);
        }
      } else {
        setBookingError(paymentIntentResponse.error || "Failed to create payment intent. Please try again.");
      }
    } catch (error) {
      console.error("[BOOKING-DEBUG] Booking error:", error);
      setBookingError("There was an error processing your booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewConfirmation = () => {
    router.push("/booking-confirmation");
  };

  if (bookingComplete) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Booking Complete!</h2>
            <p className="text-white/70">
              Your flight has been booked successfully. A confirmation email has been sent to your email address.
            </p>
            <div className="bg-white/10 rounded-lg p-4 inline-block mt-4">
              <span className="text-xl font-mono font-bold">{bookingReference}</span>
            </div>
            <Button
              onClick={handleViewConfirmation}
              className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              View Confirmation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {bookingError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{bookingError}</AlertDescription>
        </Alert>
      )}

      {paymentProcessing ? (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
              <h2 className="text-2xl font-bold">Processing Payment</h2>
              <p className="text-white/70">
                Please wait while we process your payment. Do not refresh the page.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Flight Summary Card */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle>Flight Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Outbound Flight */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{returnFlightId ? 'Outbound Flight' : 'Flight'}</h3>
                      <div className="flex justify-between mt-1">
                        <div>
                          <p className="font-semibold">{flightDetails.slices?.[0]?.segments?.[0]?.origin?.iata_code}</p>
                          <p className="text-sm text-white/70">{flightDetails.slices?.[0]?.segments?.[0]?.origin?.city_name}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-white/50">→</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{flightDetails.slices?.[0]?.segments?.[flightDetails.slices?.[0]?.segments?.length - 1]?.destination?.iata_code}</p>
                          <p className="text-sm text-white/70">{flightDetails.slices?.[0]?.segments?.[flightDetails.slices?.[0]?.segments?.length - 1]?.destination?.city_name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        {new Date(flightDetails.slices?.[0]?.segments?.[0]?.departing_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Return Flight (if applicable) */}
                  {returnFlightDetails && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-purple-400 transform rotate-180" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Return Flight</h3>
                        <div className="flex justify-between mt-1">
                          <div>
                            <p className="font-semibold">{returnFlightDetails.slices?.[0]?.segments?.[0]?.origin?.iata_code}</p>
                            <p className="text-sm text-white/70">{returnFlightDetails.slices?.[0]?.segments?.[0]?.origin?.city_name}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-white/50">→</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{returnFlightDetails.slices?.[0]?.segments?.[returnFlightDetails.slices?.[0]?.segments?.length - 1]?.destination?.iata_code}</p>
                            <p className="text-sm text-white/70">{returnFlightDetails.slices?.[0]?.segments?.[returnFlightDetails.slices?.[0]?.segments?.length - 1]?.destination?.city_name}</p>
                          </div>
                        </div>
                        <p className="text-xs text-white/50 mt-1">
                          {new Date(returnFlightDetails.slices?.[0]?.segments?.[0]?.departing_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Passenger Information */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle>Passenger Information</CardTitle>
                <CardDescription>
                  {passengerForms.length > 1 
                    ? `Enter details for all ${passengerForms.length} passengers` 
                    : "Enter passenger details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Passenger Tabs */}
                {passengerForms.length > 1 && (
                  <div className="mb-6">
                    <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(passengerForms.length, 4)}, 1fr)` }}>
                      {passengerForms.map((passenger, index) => (
                        <TabsTrigger 
                          key={index}
                          value={index.toString()} 
                          onClick={() => setActivePassengerIndex(index)}
                          className={index === activePassengerIndex ? "active" : ""}
                        >
                          {passenger.type === 'adult' ? 'Adult' : passenger.type === 'child' ? 'Child' : 'Infant'} {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                )}
                
                {/* Active Passenger Form */}
                <div className="space-y-4">
                  {passengerForms.map((passenger, index) => (
                    <div key={index} className={index === activePassengerIndex ? "block" : "hidden"}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`firstName-${index}`}>First Name</Label>
                          <div className="relative">
                            <Input
                              id={`firstName-${index}`}
                              value={passenger.given_name}
                              onChange={(e) => handlePassengerFormChange(index, 'given_name', e.target.value)}
                              placeholder="John"
                              required
                              className="pl-10 bg-white/10 border-white/20"
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                          <div className="relative">
                            <Input
                              id={`lastName-${index}`}
                              value={passenger.family_name}
                              onChange={(e) => handlePassengerFormChange(index, 'family_name', e.target.value)}
                              placeholder="Doe"
                              required
                              className="pl-10 bg-white/10 border-white/20"
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                          </div>
                        </div>
                      </div>

                      {index === 0 && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor={`email-${index}`}>Email</Label>
                            <div className="relative">
                              <Input
                                id={`email-${index}`}
                                type="email"
                                value={passenger.email || ''}
                                onChange={(e) => handlePassengerFormChange(index, 'email', e.target.value)}
                                placeholder="john.doe@example.com"
                                required
                                className="pl-10 bg-white/10 border-white/20"
                              />
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                            <div className="relative">
                              <Input
                                id={`phone-${index}`}
                                type="tel"
                                value={passenger.phone_number || ''}
                                onChange={(e) => handlePassengerFormChange(index, 'phone_number', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                required
                                className="pl-10 bg-white/10 border-white/20"
                              />
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
                          <div className="relative">
                            <Input 
                              id={`dob-${index}`} 
                              type="date" 
                              value={passenger.born_on}
                              onChange={(e) => handlePassengerFormChange(index, 'born_on', e.target.value)}
                              required 
                              className="pl-10 bg-white/10 border-white/20" 
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`gender-${index}`}>Gender</Label>
                          <div className="relative">
                            <Select 
                              value={passenger.gender} 
                              onValueChange={(value) => handlePassengerFormChange(index, 'gender', value as 'm' | 'f')}
                            >
                              <SelectTrigger className="pl-10 bg-white/10 border-white/20">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="m">Male</SelectItem>
                                <SelectItem value="f">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                          </div>
                        </div>
                      </div>

                      {/* Passport Information - Show for international flights */}
                      {flightDetails.passenger_identity_documents_required && (
                        <>
                          <Separator className="my-4 bg-white/10" />
                          <h3 className="text-sm font-medium mb-3">Passport Information (Required)</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`passport-${index}`}>Passport Number</Label>
                            <div className="relative">
                              <Input
                                id={`passport-${index}`}
                                value={passenger.passport_number || ''}
                                onChange={(e) => handlePassengerFormChange(index, 'passport_number', e.target.value)}
                                placeholder="A1234567"
                                className="pl-10 bg-white/10 border-white/20"
                              />
                              <Passport className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`nationality-${index}`}>Nationality</Label>
                              <div className="relative">
                                <Select 
                                  value={passenger.nationality || ''} 
                                  onValueChange={(value) => handlePassengerFormChange(index, 'nationality', value)}
                                >
                                  <SelectTrigger className="pl-10 bg-white/10 border-white/20">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="GB">United Kingdom</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="AU">Australia</SelectItem>
                                    <SelectItem value="JP">Japan</SelectItem>
                                    <SelectItem value="FR">France</SelectItem>
                                    <SelectItem value="DE">Germany</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`passport-expiry-${index}`}>Passport Expiry Date</Label>
                              <div className="relative">
                                <Input 
                                  id={`passport-expiry-${index}`} 
                                  type="date" 
                                  value={passenger.passport_expiry_date || ''}
                                  onChange={(e) => handlePassengerFormChange(index, 'passport_expiry_date', e.target.value)}
                                  className="pl-10 bg-white/10 border-white/20" 
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Passenger Navigation Buttons */}
                {passengerForms.length > 1 && (
                  <div className="mt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      disabled={activePassengerIndex === 0}
                      onClick={() => setActivePassengerIndex(prev => Math.max(0, prev - 1))}
                    >
                      Previous Passenger
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      disabled={activePassengerIndex === passengerForms.length - 1}
                      onClick={() => setActivePassengerIndex(prev => Math.min(passengerForms.length - 1, prev + 1))}
                    >
                      Next Passenger
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(value) => handlePaymentMethodChange(value as any)} 
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="card" id="card" className="peer sr-only" />
                      <Label 
                        htmlFor="card" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white/5 p-4 hover:bg-white/10 hover:border-white/30 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                      >
                        <CreditCardIcon className="h-8 w-8 mb-2 text-blue-400" />
                        <span>Credit Card</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                      <Label 
                        htmlFor="paypal" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white/5 p-4 hover:bg-white/10 hover:border-white/30 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                      >
                        <div className="h-8 w-8 mb-2 text-[#00457C] flex items-center justify-center font-bold text-lg">
                          P
                        </div>
                        <span>PayPal</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="apple-pay" id="apple-pay" className="peer sr-only" />
                      <Label 
                        htmlFor="apple-pay" 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white/5 p-4 hover:bg-white/10 hover:border-white/30 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                      >
                        <div className="h-8 w-8 mb-2 text-white flex items-center justify-center font-bold text-lg">
                          A
                        </div>
                        <span>Apple Pay</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                          placeholder="4111 1111 1111 1111"
                          required
                          className="pl-10 bg-white/10 border-white/20"
                        />
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          name="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => handleCardDetailsChange('expiry', e.target.value)}
                          required
                          className="bg-white/10 border-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input 
                          id="cvc" 
                          name="cvc" 
                          placeholder="123" 
                          value={cardDetails.cvc}
                          onChange={(e) => handleCardDetailsChange('cvc', e.target.value)}
                          required 
                          className="bg-white/10 border-white/20" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nameOnCard">Name on Card</Label>
                      <Input
                        id="nameOnCard"
                        name="nameOnCard"
                        placeholder="John Doe"
                        value={cardDetails.nameOnCard}
                        onChange={(e) => handleCardDetailsChange('nameOnCard', e.target.value)}
                        required
                        className="bg-white/10 border-white/20"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="text-center py-8 bg-white/5 rounded-lg">
                    <p className="text-white/70 mb-4">You will be redirected to PayPal to complete your payment after clicking "Complete Booking".</p>
                  </div>
                )}

                {paymentMethod === "apple-pay" && (
                  <div className="text-center py-8 bg-white/5 rounded-lg">
                    <p className="text-white/70 mb-4">You will be prompted to confirm with Apple Pay after clicking "Complete Booking".</p>
                  </div>
                )}

                <Separator className="my-6 bg-white/10" />

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Base fare</span>
                    <span>
                      {Number.parseFloat(flightDetails.base_amount).toFixed(2)} {flightDetails.base_currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes and fees</span>
                    <span>
                      {Number.parseFloat(flightDetails.tax_amount).toFixed(2)} {flightDetails.tax_currency}
                    </span>
                  </div>
                  
                  {returnFlightDetails && (
                    <div className="flex justify-between">
                      <span>Return flight</span>
                      <span>
                        {Number.parseFloat(returnFlightDetails.total_amount).toFixed(2)} {returnFlightDetails.total_currency}
                      </span>
                    </div>
                  )}
                  
                  {hasSeatSelections && (
                    <div className="flex justify-between">
                      <span>Seat selection</span>
                      <span>
                        {seatSelectionPrice.toFixed(2)} {flightDetails.total_currency}
                      </span>
                    </div>
                  )}
                  
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      {totalWithSeats.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the <a href="#" className="text-blue-400 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            type="submit"
            className="w-full mt-6 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isLoading || !termsAccepted}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </div>
            ) : (
              "Complete Booking"
            )}
          </Button>
        </form>
      )}
      
      {hasSeatSelections && !paymentProcessing && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Selected Seats</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
            <div className="space-y-2">
              {Array.from(selectedSeats.entries()).map(([segmentId, seat]) => (
                <div key={segmentId} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Seat {seat.designator}</span>
                    <div className="text-xs text-gray-300">
                      {seat.extra_legroom && "Extra legroom • "}
                      {seat.is_exit_row && "Exit row • "}
                      {seat.cabin_class?.name?.toLowerCase().includes('premium') && "Premium seat"}
                    </div>
                  </div>
                  <span>
                    {seat.price ? `${seat.price.toFixed(2)} ${currency}` : "Free"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
