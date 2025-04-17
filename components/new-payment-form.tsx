'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  CreditCard, 
  Smartphone, 
  Apple, 
  User, 
  CalendarIcon, 
  ShieldCheck 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Define payment form schema
const paymentSchema = z.object({
  paymentType: z.enum(['card', 'applePay', 'googlePay'], {
    required_error: 'Please select a payment method',
  }),
  // Credit card fields (only required when paymentType is 'card')
  cardNumber: z.string().min(16).max(19).optional()
    .refine(val => val === undefined || (val && val.length >= 16), {
      message: 'Card number must be at least 16 digits',
    }),
  cardholderName: z.string().min(2).optional()
    .refine(val => val === undefined || val, {
      message: 'Cardholder name is required',
    }),
  expiryDate: z.string().min(5).max(5).optional()
    .refine(val => val === undefined || val, {
      message: 'Expiry date is required (MM/YY)',
    }),
  cvv: z.string().min(3).max(4).optional()
    .refine(val => val === undefined || val, {
      message: 'CVV must be 3-4 digits',
    }),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface NewPaymentFormProps {
  onComplete: (data: { paymentType: string }) => void;
  amount?: string;
  currency?: string;
}

export default function NewPaymentForm({ 
  onComplete, 
  amount = '0.00', 
  currency = 'USD' 
}: NewPaymentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format currency amount
  const formatCurrency = (amount: string = '0.00', currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  // Form setup
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: 'card',
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
    },
    mode: 'onChange',
  });

  // Watch payment type to conditionally render card fields
  const paymentType = form.watch('paymentType');

  // Handle form submission
  function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);
    
    try {
      // Filter out card details if using digital wallets
      const paymentData = {
        paymentType: data.paymentType
      };
      
      onComplete(paymentData);
      
      toast({
        title: "Payment method selected",
        description: `You will be redirected to complete your ${data.paymentType} payment.`,
      });
    } catch (error) {
      toast({
        title: "Error processing payment",
        description: "There was a problem with your payment method.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md border border-white/10">
      <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-t-lg">
        <CardTitle>Payment Method</CardTitle>
        <CardDescription className="text-white/90">
          Select your preferred payment method for this booking.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-md border border-blue-500/20">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white">Total amount:</p>
            <p className="text-xl font-bold text-white">{formatCurrency(amount, currency)}</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-white font-medium">Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="bg-white/5 rounded-md border border-white/10 p-1">
                        <FormItem className="flex items-center space-x-3 space-y-0 p-2 cursor-pointer hover:bg-white/10 rounded-md">
                          <FormControl>
                            <RadioGroupItem value="card" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center text-white">
                            <CreditCard className="mr-2 h-5 w-5 text-white/80" />
                            Credit or Debit Card
                          </FormLabel>
                        </FormItem>
                      </div>
                      
                      <div className="bg-white/5 rounded-md border border-white/10 p-1">
                        <FormItem className="flex items-center space-x-3 space-y-0 p-2 cursor-pointer hover:bg-white/10 rounded-md">
                          <FormControl>
                            <RadioGroupItem value="applePay" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center text-white">
                            <Apple className="mr-2 h-5 w-5 text-white/80" />
                            Apple Pay
                          </FormLabel>
                        </FormItem>
                      </div>
                      
                      <div className="bg-white/5 rounded-md border border-white/10 p-1">
                        <FormItem className="flex items-center space-x-3 space-y-0 p-2 cursor-pointer hover:bg-white/10 rounded-md">
                          <FormControl>
                            <RadioGroupItem value="googlePay" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex items-center text-white">
                            <Smartphone className="mr-2 h-5 w-5 text-white/80" />
                            Google Pay
                          </FormLabel>
                        </FormItem>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {paymentType === 'card' && (
              <div className="space-y-5 border border-white/10 rounded-md p-4 bg-white/5">
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-3 rounded-md border border-blue-500/20">
                  <h3 className="font-medium text-white flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-blue-400" />
                    Card Details
                  </h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Card Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            className="bg-white/15 border-white/30 pl-9 text-white" 
                            placeholder="1234 5678 9012 3456" 
                            {...field} 
                            onChange={(e) => {
                              // Only allow numbers and format with spaces
                              const value = e.target.value.replace(/[^\d]/g, '');
                              const formatted = value.replace(/(.{4})/g, '$1 ').trim();
                              field.onChange(value);
                              e.target.value = formatted;
                            }}
                            maxLength={19}
                          />
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Cardholder Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              className="bg-white/15 border-white/30 pl-9 text-white" 
                              placeholder="Name on card" 
                              {...field} 
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Expiry Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                className="bg-white/15 border-white/30 pl-9 text-white" 
                                placeholder="MM/YY" 
                                {...field} 
                                onChange={(e) => {
                                  // Format as MM/YY
                                  let value = e.target.value.replace(/[^\d]/g, '');
                                  if (value.length > 2) {
                                    value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                                  }
                                  field.onChange(value);
                                  e.target.value = value;
                                }}
                                maxLength={5}
                              />
                              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">CVV</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                className="bg-white/15 border-white/30 pl-9 text-white" 
                                placeholder="123" 
                                type="password" 
                                {...field} 
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(/[^\d]/g, '');
                                  field.onChange(value);
                                  e.target.value = value;
                                }}
                                maxLength={4}
                              />
                              <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-md mt-4">
                  <p className="text-xs text-white/80">
                    Your payment information is encrypted and processed securely.
                    We do not store your full card details on our servers.
                  </p>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-11" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 