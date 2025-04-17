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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Plane 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Define form schema
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Phone number must be at least 5 characters" }),
});

type PassengerFormProps = {
  passengerCount: { 
    adults: number, 
    children: number, 
    infants: number 
  };
  offerId: string;
  submitAction: (formData: FormData) => Promise<void>;
};

export default function PassengerFormClient({ 
  passengerCount, 
  offerId,
  submitAction 
}: PassengerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Create FormData to pass to the server action
      const formData = new FormData();
      
      // Add the offerId
      formData.append("offerId", offerId);
      
      // Add the form values
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add passenger information
      formData.append("adultCount", passengerCount.adults.toString());
      formData.append("childCount", passengerCount.children.toString());
      formData.append("infantCount", passengerCount.infants.toString());
      
      // Call the server action to handle the form submission
      await submitAction(formData);
      
      toast.success("Passenger information saved");
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to save passenger information");
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalPassengers = passengerCount.adults + passengerCount.children + passengerCount.infants;

  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center">
          <User className="mr-2 h-5 w-5" />
          Passenger Information
        </CardTitle>
        <CardDescription>
          Enter details for {passengerCount.adults} {passengerCount.adults === 1 ? "adult" : "adults"}
          {passengerCount.children > 0 && `, ${passengerCount.children} ${passengerCount.children === 1 ? "child" : "children"}`}
          {passengerCount.infants > 0 && `, ${passengerCount.infants} ${passengerCount.infants === 1 ? "infant" : "infants"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 p-4 rounded-md border border-gray-800 bg-gray-900/50">
              <div className="flex items-center">
                <Plane className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="font-medium text-white">Lead Passenger / Contact</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="First name" className="pl-9" {...field} />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="Last name" className="pl-9" {...field} />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="email" placeholder="your@email.com" className="pl-9" {...field} />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="+1 (555) 123-4567" className="pl-9" {...field} />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Information about additional passengers */}
            {totalPassengers > 1 && (
              <div className="p-4 rounded-md border border-gray-800 bg-blue-900/20">
                <div className="flex items-center mb-3">
                  <CreditCard className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="font-medium text-white">Additional Passengers</h3>
                </div>
                <p className="text-sm text-gray-400">
                  You'll be able to enter details for the {totalPassengers - 1} additional 
                  {totalPassengers - 1 === 1 ? ' passenger' : ' passengers'} on the next page.
                </p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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