'use server';

import { createOrder, getOffers } from '@/lib/duffel';
import { createPaymentIntent, mapPaymentMethodType } from '@/lib/duffel-payments';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Passenger schema for validation
const PassengerSchema = z.object({
  type: z.enum(['adult', 'child', 'infant_without_seat']),
  title: z.enum(['mr', 'ms', 'mrs', 'miss', 'dr']),
  givenName: z.string().min(1, 'First name is required'),
  familyName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const BookingRequestSchema = z.object({
  offerId: z.string(),
  passengers: z.array(PassengerSchema),
  paymentType: z.enum(['card', 'applePay', 'googlePay']),
  returnUrl: z.string().url()
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type PassengerInfo = z.infer<typeof PassengerSchema>;

export async function createBookingAction(formData: FormData) {
  try {
    console.log('[BOOKING-DEBUG] Starting booking action with form data');
    
    // Extract and validate form data
    const offerId = formData.get('offerId') as string;
    
    if (!offerId) {
      return { success: false, error: 'Offer ID is required' };
    }

    // Get the number of passengers from form data
    const passengerCount = parseInt(formData.get('passengerCount') as string, 10) || 0;
    
    if (passengerCount <= 0) {
      return { success: false, error: 'At least one passenger is required' };
    }

    // Extract passenger information
    const passengers = [];
    let mainPassengerEmail = '';
    
    for (let i = 0; i < passengerCount; i++) {
      try {
        const passenger = {
          type: formData.get(`passengers[${i}].type`) as string,
          title: formData.get(`passengers[${i}].title`) as string,
          givenName: formData.get(`passengers[${i}].givenName`) as string,
          familyName: formData.get(`passengers[${i}].familyName`) as string,
          email: formData.get(`passengers[${i}].email`) as string,
          phone: formData.get(`passengers[${i}].phone`) as string,
          birthDate: formData.get(`passengers[${i}].birthDate`) as string,
        };
        
        // Save primary passenger email
        if (i === 0) {
          mainPassengerEmail = passenger.email;
        }
        
        // Validate passenger data
        const validatedPassenger = PassengerSchema.parse(passenger);
        passengers.push(validatedPassenger);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: `Passenger ${i + 1} data error: ${error.errors.map(e => e.message).join(', ')}`
          };
        }
        throw error;
      }
    }

    // Get the payment type
    const paymentType = formData.get('paymentType') as string;
    if (!['card', 'applePay', 'googlePay'].includes(paymentType)) {
      return { success: false, error: 'Invalid payment type' };
    }

    const returnUrl = formData.get('returnUrl') as string;
    if (!returnUrl) {
      return { success: false, error: 'Return URL is required' };
    }

    // Construct booking request
    const bookingRequest = {
      offerId,
      passengers,
      paymentType,
      returnUrl
    };

    // Validate the entire request
    const validatedRequest = BookingRequestSchema.parse(bookingRequest);

    // Get offer details to calculate payment amount
    console.log('[BOOKING-DEBUG] Fetching offer details for ID:', offerId);
    const offerResponse = await getOffers(offerId);
    if (!offerResponse || !offerResponse.data) {
      return {
        success: false,
        error: 'Failed to retrieve offer details'
      };
    }

    const offer = offerResponse.data;
    console.log('[BOOKING-DEBUG] Offer details retrieved:', {
      id: offer.id,
      baseAmount: offer.base_amount,
      totalAmount: offer.total_amount,
      currency: offer.total_currency
    });

    // Calculate total price based on passenger count and types
    const adultCount = passengers.filter(p => p.type === 'adult').length;
    const childCount = passengers.filter(p => p.type === 'child').length;
    const infantCount = passengers.filter(p => p.type === 'infant_without_seat').length;
    
    const baseFare = parseFloat(offer.base_amount);
    const taxAmount = parseFloat(offer.tax_amount);
    const perPersonCost = baseFare + taxAmount;
    
    // Apply appropriate pricing for each passenger type
    const adultTotal = perPersonCost * adultCount;
    const childTotal = perPersonCost * 0.75 * childCount; // 25% discount for children
    const infantTotal = perPersonCost * 0.1 * infantCount; // 90% discount for infants
    
    const totalAmount = (adultTotal + childTotal + infantTotal).toFixed(2);
    console.log('[BOOKING-DEBUG] Calculated total amount:', {
      adultTotal,
      childTotal,
      infantTotal,
      totalAmount,
      currency: offer.total_currency
    });

    // Create payment intent first
    console.log('[BOOKING-DEBUG] Creating payment intent');
    const paymentIntentResponse = await createPaymentIntent({
      amount: totalAmount,
      currency: offer.total_currency,
      payment_method_types: [mapPaymentMethodType(validatedRequest.paymentType)],
      return_url: validatedRequest.returnUrl,
      client_token: true
    });

    if (!paymentIntentResponse.success || !paymentIntentResponse.data) {
      console.error('[BOOKING-DEBUG] Payment intent creation failed:', paymentIntentResponse.error);
      return {
        success: false,
        error: paymentIntentResponse.error || 'Failed to create payment intent'
      };
    }
    
    console.log('[BOOKING-DEBUG] Payment intent created successfully:', {
      id: paymentIntentResponse.data.id,
      status: paymentIntentResponse.data.status
    });

    // Create order in Duffel (this initializes the booking)
    console.log('[BOOKING-DEBUG] Creating order for', passengerCount, 'passengers');
    const orderResponse = await createOrder(
      validatedRequest.offerId, 
      validatedRequest.passengers.map(p => ({
        type: p.type,
        title: p.title,
        given_name: p.givenName,
        family_name: p.familyName,
        email: p.email || mainPassengerEmail, // Use primary passenger email as fallback
        phone_number: p.phone,
        born_on: p.birthDate
      })),
      {
        type: 'instant',
        payments: [{
          type: 'balance',
          amount: totalAmount,
          currency: offer.total_currency
        }]
      }
    );

    if (!orderResponse.success || !orderResponse.data) {
      console.error('[BOOKING-DEBUG] Order creation failed:', orderResponse.error);
      return {
        success: false,
        error: orderResponse.error || 'Failed to create booking'
      };
    }
    
    console.log('[BOOKING-DEBUG] Order created successfully:', {
      id: orderResponse.data.id,
      bookingReference: orderResponse.data.booking_reference
    });

    revalidatePath('/booking');

    // Return booking and payment data
    return {
      success: true,
      data: {
        booking: orderResponse.data,
        payment: paymentIntentResponse.data,
        clientSecret: paymentIntentResponse.data.client_secret,
        totalAmount,
        currency: offer.total_currency
      }
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating booking'
    };
  }
} 