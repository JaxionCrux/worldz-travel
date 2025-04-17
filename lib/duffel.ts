const DUFFEL_API_URL = "https://api.duffel.com"
// Update from "beta" to the current supported version
const DUFFEL_API_VERSION = "v1"

export async function duffelRequest(endpoint: string, method = "GET", data?: any) {
  console.log(`[DUFFEL-DEBUG] Starting API request: ${method} ${endpoint}`);
  
  const apiKey = process.env.DUFFEL_API_KEY

  if (!apiKey) {
    console.error("[DUFFEL-DEBUG] Missing API key: DUFFEL_API_KEY is not defined");
    throw new Error("DUFFEL_API_KEY is not defined")
  }

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Duffel-Version": DUFFEL_API_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  console.log(`[DUFFEL-DEBUG] Request Options:`, {
    method,
    endpoint,
    hasData: !!data,
    apiVersion: DUFFEL_API_VERSION,
  });

  try {
    console.log(`[DUFFEL-DEBUG] Sending request to: ${DUFFEL_API_URL}${endpoint}`);
    const response = await fetch(`${DUFFEL_API_URL}${endpoint}`, options)

    const statusText = response.statusText;
    const status = response.status;
    console.log(`[DUFFEL-DEBUG] Response received: ${status} ${statusText}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("[DUFFEL-DEBUG] API error response (JSON):", {
          status,
          statusText,
          errorData 
        });
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        errorData = await response.text();
        console.error("[DUFFEL-DEBUG] API error response (Text):", {
          status, 
          statusText,
          errorData,
          parseError
        });
      }
      
      const errorMessage = `Duffel API error: ${status} ${JSON.stringify(errorData)}`;
      console.error("[DUFFEL-DEBUG] Throwing error:", errorMessage);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log(`[DUFFEL-DEBUG] Response parsed successfully:`, {
      hasData: !!responseData,
      dataKeys: responseData ? Object.keys(responseData) : []
    });
    
    return responseData;
  } catch (error) {
    console.error("[DUFFEL-DEBUG] Request failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      endpoint,
      method
    });
    
    throw error;
  }
}

export async function searchFlights(params: {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  cabinClass: string
  children?: number
  infants?: number
  passengers?: Passenger[]
  multiCity?: Array<{ origin: string; destination: string; departureDate: string }>
}) {
  console.log("[DUFFEL] Search flights request parameters:", JSON.stringify(params, null, 2));

  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults,
    cabinClass,
    children = 0,
    infants = 0,
    multiCity = [],
    passengers,
  } = params

  let slices = []

  // Handle multi-city itineraries
  if (multiCity.length > 0) {
    slices = multiCity.map((segment) => ({
      origin: segment.origin,
      destination: segment.destination,
      departure_date: segment.departureDate,
    }))
    console.log("[DUFFEL] Creating multi-city flight request with segments:", multiCity.length);
  } else {
    // Handle one-way and return trips
    slices = [
      {
        origin,
        destination,
        departure_date: departureDate,
      },
    ]

    if (returnDate) {
      // For round trips, the return slice should start from the destination and end at the origin
      // This ensures proper round trip logic
      slices.push({
        origin: destination,
        destination: origin,
        departure_date: returnDate,
      })
      console.log("[DUFFEL] Creating round trip flight request:", {
        outbound: { origin, destination, departure_date: departureDate },
        return: { origin: destination, destination: origin, departure_date: returnDate }
      });

      // Add validation for the date range
      try {
        const departureDateTime = new Date(departureDate);
        const returnDateTime = new Date(returnDate);
        const daysBetween = Math.floor((returnDateTime.getTime() - departureDateTime.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`[DUFFEL] Round trip date validation: ${daysBetween} days between outbound and return`);
        
        if (returnDateTime < departureDateTime) {
          console.warn("[DUFFEL] WARNING: Return date is before departure date!");
        } else if (daysBetween === 0) {
          console.warn("[DUFFEL] WARNING: Same-day return trip - this may limit available options");
        } else if (daysBetween > 30) {
          console.warn("[DUFFEL] WARNING: Long trip duration (${daysBetween} days) - some airlines may not offer this");
        }
      } catch (e) {
        console.error("[DUFFEL] Error validating dates:", e);
      }
    } else {
      console.log("[DUFFEL] Creating one-way flight request:", {
        origin, destination, departure_date: departureDate
      });
    }
  }

  // Debug log to verify correct slice creation
  console.log("[DUFFEL] API request slices:", JSON.stringify(slices, null, 2));

  // Validate that for round trips, the return slice origin matches the outbound destination
  if (slices.length > 1) {
    const outboundDestination = slices[0].destination;
    const returnOrigin = slices[1].origin;
    
    if (outboundDestination !== returnOrigin) {
      console.warn(`[DUFFEL] WARNING: Return flight origin (${returnOrigin}) does not match outbound destination (${outboundDestination}). This may cause issues with round trip validation.`);
    } else {
      console.log(`[DUFFEL] Valid round trip: outbound destination (${outboundDestination}) matches return origin (${returnOrigin})`);
    }
  }

  // Build passengers array
  const passengersArray = passengers || []

  if (!passengers) {
    // For Duffel API requests without complete passenger details, we use a simpler format with type/count
    // This is different from the Passenger types used for creating orders
    interface SimplePassenger {
      type: string;
      count: number;
    }
    
    const simplePassengers: SimplePassenger[] = [];
    
    if (adults > 0) {
      simplePassengers.push({ type: "adult", count: adults })
    }

    if (children > 0) {
      simplePassengers.push({ type: "child", count: children })
    }

    if (infants > 0) {
      simplePassengers.push({ type: "infant_without_seat", count: infants })
    }
    
    // Use the simplePassengers for search requests
    return await performSearch(slices, simplePassengers, cabinClass);
  }

  // If we have full passenger details, use those
  return await performSearch(slices, passengersArray, cabinClass);
}

// Helper function to perform the actual search
async function performSearch(slices: any[], passengers: any[], cabinClass: string) {
  const requestData = {
    data: {
      slices,
      passengers,
      cabin_class: cabinClass.toLowerCase(),
    },
  }

  console.log("[DUFFEL-DEBUG] Preparing search request payload:", JSON.stringify(requestData, null, 2));

  try {
    console.log("[DUFFEL-DEBUG] Sending offer request...");
    const startTime = Date.now();
    const response = await duffelRequest("/air/offer_requests", "POST", requestData);
    const endTime = Date.now();
    
    console.log(`[DUFFEL-DEBUG] API request completed in ${endTime - startTime}ms`);
    
    // Detailed response logging
    console.log("[DUFFEL-DEBUG] API response overview:", {
      offersCount: response?.data?.offers?.length || 0,
      slicesCount: response?.data?.slices?.length || 0,
      hasErrors: !!(response?.errors && response.errors.length > 0),
      metadata: response?.meta || {},
      requestId: response?.data?.id || 'unknown'
    });
    
    // Log any warnings
    if (response?.warnings && response.warnings.length > 0) {
      console.warn("[DUFFEL-DEBUG] API returned warnings:", response.warnings);
    }
    
    // Log errors if present
    if (response?.errors && response.errors.length > 0) {
      console.error("[DUFFEL-DEBUG] API returned errors:", response.errors);
    }
    
    // Check if we got any offers
    if (!response?.data?.offers || response.data.offers.length === 0) {
      console.warn("[DUFFEL-DEBUG] No offers found. Request details:", {
        requestId: response?.data?.id || 'unknown',
        sliceCount: slices.length,
        passengerCount: passengers.length,
        cabinClass,
        responseData: response?.data ? JSON.stringify(response.data, null, 2) : 'No data'
      });
    } else {
      console.log(`[DUFFEL-DEBUG] Found ${response.data.offers.length} offers!`);
    }
    
    return response;
  } catch (error) {
    console.error("[DUFFEL-DEBUG] Search request failed:", error);
    console.error("[DUFFEL-DEBUG] Request details:", {
      slices: JSON.stringify(slices),
      passengerCount: passengers.length,
      cabinClass
    });
    throw error;
  }
}

export async function getOffers(offerId: string, retryCount = 0, maxRetries = 3) {
  if (!offerId) {
    console.error("[DUFFEL-DEBUG] Missing offer ID in getOffers call");
    throw new Error("Offer ID is required");
  }
  
  console.log(`[DUFFEL-DEBUG] Getting offer details for ID: ${offerId} (Attempt ${retryCount + 1}/${maxRetries + 1})`);
  
  try {
    const response = await duffelRequest(`/air/offers/${offerId}`);
    
    console.log("[DUFFEL-DEBUG] Offer details response:", {
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      offerId: response.data?.id || 'unknown'
    });
    
    // Verify the response data structure
    if (!response.data || !response.data.id) {
      console.error("[DUFFEL-DEBUG] Invalid offer data structure:", JSON.stringify(response));
      throw new Error("Invalid offer data returned from API");
    }
    
    return response;
  } catch (error) {
    console.error(`[DUFFEL-DEBUG] Error fetching offer details for ID ${offerId}:`, error);
    
    // Implement retry logic
    if (retryCount < maxRetries) {
      console.log(`[DUFFEL-DEBUG] Retrying getOffers (${retryCount + 1}/${maxRetries})...`);
      // Exponential backoff: 1s, 2s, 4s, etc.
      const backoffTime = Math.pow(2, retryCount) * 1000;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getOffers(offerId, retryCount + 1, maxRetries));
        }, backoffTime);
      });
    }
    
    // Add more context to the error
    const enhancedError = new Error(
      `Failed to retrieve offer details after ${maxRetries + 1} attempts. ` + 
      `Original error: ${error instanceof Error ? error.message : String(error)}`
    );
    
    throw enhancedError;
  }
}

export async function getAirports(query: string) {
  return duffelRequest(`/air/airports?query=${encodeURIComponent(query)}`)
}

export async function createOrder(
  offerId: string, 
  passengers: Passenger[], 
  options?: {
    type?: 'instant' | 'hold',
    payments?: Array<{
      type: string,
      amount: string,
      currency: string
    }>
  }
) {
  // Prepare default options
  const defaultOptions = {
    type: 'instant',
    payments: [{
      type: "balance",
      amount: "0",
      currency: "USD",
    }]
  };

  // Merge with provided options
  const finalOptions = { ...defaultOptions, ...options };

  // Build request data
  const requestData = {
    data: {
      type: finalOptions.type,
      selected_offers: [offerId],
      passengers,
      payments: finalOptions.payments,
    },
  }

  return duffelRequest("/air/orders", "POST", requestData)
}

export async function getOrder(orderId: string) {
  return duffelRequest(`/air/orders/${orderId}`)
}

export async function cancelOrder(orderId: string) {
  return duffelRequest(`/air/orders/${orderId}/actions/cancel`, "POST")
}

export async function getSeatMaps(offerId: string) {
  return duffelRequest(`/air/seat_maps?offer_id=${offerId}`)
}

export type Airport = {
  id: string
  name: string
  iata_code: string
  city: string
  city_name?: string
  country: string
  country_name?: string
}

export type FlightOffer = {
  id: string
  total_amount: string
  total_currency: string
  base_amount: string
  base_currency: string
  tax_amount: string
  tax_currency: string
  slices: any[]
  passengers: any[]
  owner: {
    name: string
    logo_symbol_url: string
  }
}

export type PassengerBase = {
  id?: string
  given_name: string
  family_name: string
  gender?: "m" | "f"
  title?: string
  born_on: string
  email: string
  phone_number?: string
  loyalty_programme_accounts?: any[]
}

export type AdultPassenger = PassengerBase & {
  type: "adult"
  age?: never // Prevent using age with type
}

export type ChildPassenger = PassengerBase & {
  type: "child"
  age?: never
}

export type InfantPassenger = PassengerBase & {
  type: "infant_without_seat"
  age?: never
}

export type AgeBasedPassenger = PassengerBase & {
  type?: never // Prevent using type with age
  age: number
}

// Union type representing all passenger formats
export type Passenger = AdultPassenger | ChildPassenger | InfantPassenger | AgeBasedPassenger

export type Order = {
  id: string
  booking_reference: string
  created_at: string
  updated_at: string
  passengers: Passenger[]
  slices: any[]
  total_amount: string
  total_currency: string
  base_amount: string
  base_currency: string
  tax_amount: string
  tax_currency: string
  payment_status: {
    awaiting_payment: boolean
    payment_required_by: string
  }
}
