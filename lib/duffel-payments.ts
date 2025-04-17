/**
 * This file implements the Duffel Payments API integration
 * Documentation: https://duffel.com/docs/api/payment-intents
 */

import { v4 as uuidv4 } from 'uuid';

interface SeatSelection {
  segment_id: string;
  seat_id: string;
  designator: string;
  price?: number;
}

interface PaymentDetails {
  type: 'card' | 'paypal' | 'apple-pay';
  amount: string;
  currency: string;
}

interface PaymentIntentParams {
  offers: string[];
  passengers: Passenger[];
  seatSelections?: SeatSelection[];
  payment: PaymentDetails;
}

// Types for payment requests
export type PaymentIntentRequest = {
  amount: string;
  currency: string;
  payment_method_types: string[];
  return_url: string;
  setup_future_usage?: string;
  client_token?: boolean;
};

export type PaymentConfirmRequest = {
  payment_intent_id: string;
};

/**
 * Creates a payment intent with Duffel Payments API
 */
export async function createPaymentIntent(params: PaymentIntentRequest) {
  try {
    console.log('[PAYMENT-DEBUG] Creating payment intent with params:', params);
    
    const apiKey = process.env.DUFFEL_API_KEY;
    if (!apiKey) {
      throw new Error("DUFFEL_API_KEY is not defined");
    }

    const response = await fetch('https://api.duffel.com/air/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Duffel-Version": "v1",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          amount: params.amount,
          currency: params.currency,
          payment_method_types: params.payment_method_types || ['card'],
          return_url: params.return_url,
          setup_future_usage: params.setup_future_usage,
          client_token: params.client_token || true,
          metadata: {
            session_id: uuidv4()
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[PAYMENT-DEBUG] Error response from Duffel:', errorData);
      throw new Error(`Duffel API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log('[PAYMENT-DEBUG] Successfully created payment intent:', {
      id: responseData.data?.id,
      status: responseData.data?.status,
      hasClientToken: !!responseData.data?.client_token
    });
    
    return {
      success: true,
      data: responseData.data
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating payment intent'
    };
  }
}

/**
 * Confirms a payment intent with Duffel Payments API
 */
export async function confirmPaymentIntent(params: PaymentConfirmRequest) {
  try {
    console.log('[PAYMENT-DEBUG] Confirming payment intent:', params.payment_intent_id);
    
    const apiKey = process.env.DUFFEL_API_KEY;
    if (!apiKey) {
      throw new Error("DUFFEL_API_KEY is not defined");
    }

    const response = await fetch(`https://api.duffel.com/air/payment_intents/${params.payment_intent_id}/actions/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Duffel-Version": "v1",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[PAYMENT-DEBUG] Error confirming payment intent:', errorData);
      throw new Error(`Duffel API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log('[PAYMENT-DEBUG] Payment intent confirmed successfully:', {
      id: responseData.data?.id,
      status: responseData.data?.status
    });
    
    return {
      success: true,
      data: responseData.data
    };
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error confirming payment intent'
    };
  }
}

/**
 * Retrieves a payment intent from Duffel Payments API
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    console.log('[PAYMENT-DEBUG] Getting payment intent:', paymentIntentId);
    
    const apiKey = process.env.DUFFEL_API_KEY;
    if (!apiKey) {
      throw new Error("DUFFEL_API_KEY is not defined");
    }

    const response = await fetch(`https://api.duffel.com/air/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Duffel-Version": "v1",
        "Content-Type": "application/json",
        Accept: "application/json",
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[PAYMENT-DEBUG] Error retrieving payment intent:', errorData);
      throw new Error(`Duffel API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log('[PAYMENT-DEBUG] Successfully retrieved payment intent:', {
      id: responseData.data?.id,
      status: responseData.data?.status
    });
    
    return {
      success: true,
      data: responseData.data
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error retrieving payment intent'
    };
  }
}

/**
 * Maps our internal payment method types to Duffel's payment method types
 */
export function mapPaymentMethodType(type: string): string {
  switch (type) {
    case 'card':
      return 'card';
    case 'applePay':
      return 'apple_pay';
    case 'googlePay':
      return 'google_pay';
    default:
      return 'card';
  }
} 