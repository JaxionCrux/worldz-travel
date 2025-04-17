import { loadStripe, Stripe } from '@stripe/stripe-js';

// Make sure to call this outside of a component's render to avoid recreating the Stripe object on every render
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key is missing');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export type PaymentIntent = {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
};

export async function createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent | null> {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

export async function confirmPayment(
  clientSecret: string, 
  paymentMethod: {
    card: any;
    billing_details: {
      name: string;
      email: string;
    };
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (paymentIntent?.status === 'succeeded') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `Payment status: ${paymentIntent?.status || 'unknown'}` 
      };
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
} 