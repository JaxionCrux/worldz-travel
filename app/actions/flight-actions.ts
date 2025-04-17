"use server"

import { searchFlights, getOffers, createOrder, getOrder, cancelOrder, getSeatMaps, type Passenger } from "@/lib/duffel"

export async function searchFlightsAction(formData: FormData): Promise<{ data: any; error: string | null }> {
  console.log("[SEARCH-DEBUG] Starting searchFlightsAction with form data", 
    Object.fromEntries(formData.entries()));
  
  const origin = formData.get("origin") as string
  const destination = formData.get("destination") as string
  const departureDate = formData.get("departureDate") as string
  const returnDate = (formData.get("returnDate") as string) || undefined
  const adults = parseInt(formData.get("adults") as string) || 1
  const children = parseInt(formData.get("children") as string) || 0
  const infants = parseInt(formData.get("infants") as string) || 0
  const cabinClass = (formData.get("cabinClass") as string) || "economy"
  const tripType = formData.get("tripType") as string

  // Validate required fields
  if (!origin || !destination || !departureDate) {
    console.error("[SEARCH-DEBUG] Missing required fields:", { origin, destination, departureDate });
    return {
      data: null,
      error: "Missing required fields: origin, destination, and departure date are required",
    }
  }

  // For round trips, ensure returnDate is provided
  if (tripType === "return" && !returnDate) {
    console.error("[SEARCH-DEBUG] Return date missing for round-trip:", { tripType, returnDate });
    return {
      data: null,
      error: "Return date is required for round-trip flights",
    }
  }

  // Handle multi-city trips
  const multiCity = []
  if (tripType === "multi_city" || tripType === "multi") {
    const segments = formData.getAll("multiCitySegment") as string[]
    console.log("[SEARCH-DEBUG] Processing multi-city segments:", segments);
    for (const segment of segments) {
      try {
        const segmentData = JSON.parse(segment)
        multiCity.push({
          origin: segmentData.origin,
          destination: segmentData.destination,
          departureDate: segmentData.departureDate,
        })
      } catch (e) {
        console.error("[SEARCH-DEBUG] Error parsing multi-city segment:", e, segment)
      }
    }
  }

  // Validate passenger counts
  if (adults + children + infants > 9) {
    console.error("[SEARCH-DEBUG] Too many passengers:", { adults, children, infants });
    return {
      data: null,
      error: "Maximum 9 passengers allowed per booking",
    }
  }
  
  if (infants > adults) {
    console.error("[SEARCH-DEBUG] Too many infants:", { adults, infants });
    return {
      data: null,
      error: "Number of infants cannot exceed number of adults",
    }
  }

  console.log("[SEARCH-DEBUG] Validated search parameters:", {
    origin,
    destination,
    departureDate,
    returnDate,
    tripType,
    adults,
    children,
    infants,
    cabinClass,
    multiCity: tripType === "multi_city" || tripType === "multi" ? multiCity : [],
  });

  // Build the passenger array
  const passengers: any[] = []
  
  // Add adult passengers
  for (let i = 0; i < adults; i++) {
    passengers.push({
      type: "adult",
      given_name: "John",
      family_name: "Doe",
      loyalty_programme_accounts: [],
    })
  }
  
  // Add child passengers
  for (let i = 0; i < children; i++) {
    passengers.push({
      given_name: "Jane",
      family_name: "Doe",
      age: 8, // Default age for children
      loyalty_programme_accounts: [],
    })
  }
  
  // Add infant passengers
  for (let i = 0; i < infants; i++) {
    passengers.push({
      given_name: "Baby",
      family_name: "Doe",
      age: 1, // Default age for infants
      loyalty_programme_accounts: [],
    })
  }

  console.log("[SEARCH-DEBUG] Created passenger array:", JSON.stringify(passengers, null, 2));

  try {
    console.log("[SEARCH-DEBUG] Preparing to call searchFlights API");
    const searchParams = {
      origin,
      destination,
      departureDate,
      returnDate: tripType === "return" ? returnDate : undefined,
      adults,
      children,
      infants,
      cabinClass,
      multiCity: tripType === "multi_city" || tripType === "multi" ? multiCity : [],
      passengers,
    };
    console.log("[SEARCH-DEBUG] Search parameters:", JSON.stringify(searchParams, null, 2));
    
    const response = await searchFlights(searchParams)

    console.log("[SEARCH-DEBUG] Received API response:", {
      status: "success",
      hasData: !!response?.data,
      offersCount: response?.data?.offers?.length || 0,
      errors: response?.errors || null
    });

    // Log the number of slices and offers for debugging
    if (response.data && response.data.offers) {
      console.log(`[SEARCH-DEBUG] Found ${response.data.offers.length} offers`);
      
      if (response.data.offers.length > 0) {
        const firstOffer = response.data.offers[0];
        console.log(`[SEARCH-DEBUG] First offer has ${firstOffer.slices ? firstOffer.slices.length : 0} slices`);
        console.log(`[SEARCH-DEBUG] First offer price: ${firstOffer.total_amount} ${firstOffer.total_currency}`);
        
        if (firstOffer.slices && firstOffer.slices.length > 0) {
          const firstSlice = firstOffer.slices[0];
          console.log(`[SEARCH-DEBUG] First slice: ${firstSlice.origin?.iata_code || 'N/A'} to ${firstSlice.destination?.iata_code || 'N/A'}`);
          
          if (firstOffer.slices.length > 1) {
            const secondSlice = firstOffer.slices[1];
            console.log(`[SEARCH-DEBUG] Second slice: ${secondSlice.origin?.iata_code || 'N/A'} to ${secondSlice.destination?.iata_code || 'N/A'}`);
          }
        }
      } else {
        console.warn("[SEARCH-DEBUG] No offers found in search results. Check search criteria.");
      }
    } else {
      console.error("[SEARCH-DEBUG] Missing expected data in API response:", response);
    }

    return { data: response.data, error: null }
  } catch (error) {
    console.error("[SEARCH-DEBUG] Error during flight search:", error);
    console.error("[SEARCH-DEBUG] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      searchParams: {
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        children,
        infants,
        cabinClass
      }
    });
    
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to search flights",
    }
  }
}

export async function getOfferDetails(offerId: string): Promise<{ data: any; error: string | null }> {
  try {
    const response = await getOffers(offerId)
    return { data: response.data, error: null }
  } catch (error) {
    console.error("Error getting offer details:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to get offer details",
    }
  }
}

export async function createBookingAction(offerId: string, passengers: Passenger[]): Promise<{ data: any; error: string | null }> {
  try {
    // Validate passenger data format for Duffel API requirements
    const validatedPassengers = passengers.map(passenger => {
      // Deep copy to avoid modifying the original
      const copy = { ...passenger };
      
      // If it has an age, ensure it doesn't have a type
      if (typeof copy.age === 'number') {
        delete copy.type;
      }
      
      return copy;
    });
    
    const response = await createOrder(offerId, validatedPassengers)
    return { data: response.data, error: null }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create booking",
    }
  }
}

export async function getBookingDetails(orderId: string): Promise<{ data: any; error: string | null }> {
  try {
    const response = await getOrder(orderId)
    return { data: response.data, error: null }
  } catch (error) {
    console.error("Error getting booking details:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to get booking details",
    }
  }
}

export async function cancelBooking(orderId: string): Promise<{ data: any; error: string | null }> {
  try {
    const response = await cancelOrder(orderId)
    return { data: response.data, error: null }
  } catch (error) {
    console.error("Error canceling booking:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to cancel booking",
    }
  }
}

export async function getSeatMapDetails(offerId: string): Promise<{ data: any; error: string | null }> {
  try {
    const response = await getSeatMaps(offerId)
    return { data: response.data, error: null }
  } catch (error) {
    console.error("Error getting seat map:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to get seat map",
    }
  }
}

// Add a new function specifically for return flight search
export async function searchReturnFlightsAction(params: {
  outboundDestination: string,
  outboundOrigin: string,
  returnDate: string,
  passengers: {
    adults: number,
    children?: number,
    infants?: number
  },
  cabinClass: string
}): Promise<{ data: any; error: string | null; meta?: any }> {
  console.log("[RETURN-FLIGHT] Searching for return flights:", params);
  
  try {
    // Ensure we're using the correct parameters
    const searchParams = {
      origin: params.outboundDestination,      // Return flight originates from outbound destination
      destination: params.outboundOrigin,      // Return flight goes back to outbound origin
      departureDate: params.returnDate,        // Use the return date
      adults: params.passengers.adults,
      children: params.passengers.children || 0,
      infants: params.passengers.infants || 0,
      cabinClass: params.cabinClass,
      // Treat as a one-way search for simplicity
    };
    
    console.log("[RETURN-FLIGHT] Processed search parameters:", searchParams);
    
    // Call the Duffel API
    const response = await searchFlights(searchParams);
    
    // Log the response summary
    console.log("[RETURN-FLIGHT] Search response:", {
      offersCount: response.data?.offers?.length || 0,
      returnDate: params.returnDate
    });
    
    // If no offers were found, try to get some diagnostic information
    if (!response.data?.offers || response.data.offers.length === 0) {
      console.warn("[RETURN-FLIGHT] No return flights found. Details:", {
        params,
        response: {
          errors: response.errors || [],
          warnings: response.warnings || [],
          status: response.status || "unknown"
        }
      });
    }
    
    return {
      data: response.data,
      error: null,
      meta: {
        outboundDestination: params.outboundDestination,
        outboundOrigin: params.outboundOrigin,
        returnDate: params.returnDate
      }
    };
  } catch (error) {
    console.error("[RETURN-FLIGHT] Error searching for return flights:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to search for return flights",
      meta: {
        params
      }
    };
  }
}
