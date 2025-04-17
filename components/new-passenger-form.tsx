'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Globe2 
} from 'lucide-react';
import { subYears, addYears, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Country data for dropdown
const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" }
  // Add more countries as needed
];

// Enhanced date picker with direct year/month/day selection
const DatePicker = ({
  value,
  onChange,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  label
}: {
  value: Date;
  onChange: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  label?: string;
}) => {
  // Generate years array
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  
  // Generate months array
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" }
  ];
  
  // Calculate days in the selected month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const selectedYear = value.getFullYear();
  const selectedMonth = value.getMonth();
  const selectedDay = value.getDate();
  
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Update handlers
  const handleYearChange = (year: string) => {
    const newDate = new Date(value);
    newDate.setFullYear(parseInt(year));
    onChange(newDate);
  };
  
  const handleMonthChange = (month: string) => {
    const newDate = new Date(value);
    newDate.setMonth(parseInt(month));
    
    // Adjust day if needed (e.g., Feb 30 -> Feb 28/29)
    const newDaysInMonth = getDaysInMonth(selectedYear, parseInt(month));
    if (selectedDay > newDaysInMonth) {
      newDate.setDate(newDaysInMonth);
    }
    
    onChange(newDate);
  };
  
  const handleDayChange = (day: string) => {
    const newDate = new Date(value);
    newDate.setDate(parseInt(day));
    onChange(newDate);
  };
  
  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-medium text-white">{label}</div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Select value={selectedDay.toString()} onValueChange={handleDayChange}>
          <SelectTrigger className="bg-white/15 border-white/30 text-white">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent className="max-h-[240px]">
            {days.map(day => (
              <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="bg-white/15 border-white/30 text-white">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="max-h-[240px]">
            {months.map(month => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="bg-white/15 border-white/30 text-white">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-[240px]">
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Define form schema with validation
const passengerSchema = z.object({
  type: z.enum(['adult', 'child', 'infant_without_seat'], {
    required_error: 'Passenger type is required',
  }),
  title: z.enum(['mr', 'ms', 'mrs', 'miss', 'dr'], {
    required_error: 'Please select a title',
  }),
  givenName: z.string().min(2, {
    message: 'First name must be at least 2 characters',
  }),
  familyName: z.string().min(2, {
    message: 'Last name must be at least 2 characters',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  phone: z.string().min(5, {
    message: 'Phone number must be at least 5 characters',
  }),
  birthDate: z.date({
    required_error: 'Please select a date of birth',
  }),
  // Passport fields
  hasPassport: z.boolean().default(false),
  passportNumber: z.string().optional(),
  passportCountry: z.string().optional(),
  passportExpiry: z.date().optional(),
}).refine((data) => {
  // If passport is selected, require all passport fields
  if (data.hasPassport) {
    return !!data.passportNumber && 
           data.passportNumber.length >= 5 && 
           !!data.passportCountry && 
           !!data.passportExpiry;
  }
  return true;
}, {
  message: "Please complete all passport information",
  path: ["passportNumber"],
});

// Passenger prop type
type PassengerType = {
  id: number;
  type: 'adult' | 'child' | 'infant_without_seat';
  title: string;
  givenName: string;
  familyName: string;
  email: string;
  phone: string;
  birthDate: Date;
  hasPassport: boolean;
  passportNumber?: string;
  passportCountry?: string;
  passportExpiry?: Date;
  isComplete: boolean;
};

interface NewPassengerFormProps {
  passenger: PassengerType;
  onComplete: (data: PassengerType) => void;
  isInternational?: boolean;
}

export default function NewPassengerForm({
  passenger,
  onComplete,
  isInternational = false
}: NewPassengerFormProps) {
  const [isEditing, setIsEditing] = useState(!passenger.isComplete);
  
  // Determine date limits based on passenger type
  const getDateRanges = () => {
    const today = new Date();
    
    if (passenger.type === 'infant_without_seat') {
      return {
        minYear: today.getFullYear() - 2,
        maxYear: today.getFullYear()
      };
    } else if (passenger.type === 'child') {
      return {
        minYear: today.getFullYear() - 12,
        maxYear: today.getFullYear() - 2
      };
    } else { // adult
      return {
        minYear: today.getFullYear() - 100,
        maxYear: today.getFullYear() - 12
      };
    }
  };
  
  const dateRanges = getDateRanges();
  
  // Get display name for passenger type
  const getPassengerTypeDisplay = (type: string): string => {
    switch (type) {
      case 'adult': return 'Adult';
      case 'child': return 'Child';
      case 'infant_without_seat': return 'Infant (no seat)';
      default: return type;
    }
  };
  
  // Form setup with defaults from passenger prop
  const form = useForm<z.infer<typeof passengerSchema>>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      type: passenger.type,
      title: (passenger.title as any) || 'mr',
      givenName: passenger.givenName,
      familyName: passenger.familyName,
      email: passenger.email,
      phone: passenger.phone,
      birthDate: passenger.birthDate,
      hasPassport: passenger.hasPassport,
      passportNumber: passenger.passportNumber,
      passportCountry: passenger.passportCountry,
      passportExpiry: passenger.passportExpiry || addYears(new Date(), 5),
    },
  });
  
  // Watch if passport is selected
  const hasPassport = form.watch('hasPassport');
  
  // Handle form submission
  function onSubmit(data: z.infer<typeof passengerSchema>) {
    // Combine form data with passenger ID
    const updatedPassenger: PassengerType = {
      ...data,
      id: passenger.id,
      isComplete: true
    };
    
    // Call parent component's onComplete handler
    onComplete(updatedPassenger);
    setIsEditing(false);
  }
  
  // Card color based on passenger type
  const cardHeaderClass = cn(
    "rounded-t-lg",
    passenger.type === 'adult' ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50" : 
    passenger.type === 'child' ? "bg-gradient-to-r from-purple-900/50 to-pink-900/50" : 
    "bg-gradient-to-r from-green-900/50 to-teal-900/50"
  );
  
  return (
    <Card className="w-full mb-6 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md border border-white/10">
      <CardHeader className={cardHeaderClass}>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5 text-white" />
            <span className="text-white">
              {getPassengerTypeDisplay(passenger.type)}
            </span>
          </div>
          {!isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Title</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/15 border-white/30 text-white">
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mr">Mr</SelectItem>
                          <SelectItem value="ms">Ms</SelectItem>
                          <SelectItem value="mrs">Mrs</SelectItem>
                          <SelectItem value="miss">Miss</SelectItem>
                          <SelectItem value="dr">Dr</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="givenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            className="bg-white/15 border-white/30 pl-9 text-white" 
                            placeholder="First name" 
                            {...field} 
                          />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="familyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Last Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            className="bg-white/15 border-white/30 pl-9 text-white" 
                            placeholder="Last name" 
                            {...field} 
                          />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white font-medium">Date of Birth</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          minYear={dateRanges.minYear}
                          maxYear={dateRanges.maxYear}
                        />
                      </FormControl>
                      <FormDescription className="text-white/80 mt-2">
                        {passenger.type === 'adult' && 'Must be 12 years or older'}
                        {passenger.type === 'child' && 'Must be between 2 and 12 years'}
                        {passenger.type === 'infant_without_seat' && 'Must be under 2 years'}
                      </FormDescription>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            className="bg-white/15 border-white/30 pl-9 text-white" 
                            type="email" 
                            placeholder="Email address" 
                            {...field} 
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            className="bg-white/15 border-white/30 pl-9 text-white" 
                            placeholder="Phone number" 
                            {...field} 
                          />
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Passport/ID section - shown for international flights or adults */}
              {(isInternational || passenger.type === 'adult') && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-3 rounded-md border border-blue-500/20">
                    <CreditCard className="h-5 w-5 text-blue-400 mr-2" />
                    <h3 className="font-medium text-white">Travel Document Information</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="hasPassport"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-white/20 bg-white/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white">Add passport/ID information</FormLabel>
                          <FormDescription className="text-white/80">
                            Required for international travel
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {hasPassport && (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-2 bg-white/5 p-4 rounded-md border border-white/10">
                      <FormField
                        control={form.control}
                        name="passportNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium">Passport/ID Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  className="bg-white/15 border-white/30 pl-9 text-white" 
                                  placeholder="Passport or ID number" 
                                  {...field} 
                                />
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passportCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium">Issuing Country</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/15 border-white/30 text-white pl-9">
                                  <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[240px]">
                                {countries.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passportExpiry"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-white font-medium">Expiry Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                value={field.value || addYears(new Date(), 5)}
                                onChange={field.onChange}
                                minYear={new Date().getFullYear()}
                                maxYear={new Date().getFullYear() + 15}
                                label="Expiry Date"
                              />
                            </FormControl>
                            <FormDescription className="text-white/80 mt-2">
                              Must be valid for at least 6 months after travel
                            </FormDescription>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-11"
              >
                Save Passenger
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-md border border-white/10">
                <p className="text-sm font-medium text-white/90">Name</p>
                <p className="text-base text-white">{passenger.title?.toUpperCase()}. {passenger.givenName} {passenger.familyName}</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-md border border-white/10">
                <p className="text-sm font-medium text-white/90">Date of Birth</p>
                <p className="text-base text-white">
                  {format(new Date(passenger.birthDate), 'PPP')}
                </p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-md border border-white/10">
                <p className="text-sm font-medium text-white/90">Email</p>
                <p className="text-base text-white break-words">{passenger.email}</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-md border border-white/10">
                <p className="text-sm font-medium text-white/90">Phone</p>
                <p className="text-base text-white">{passenger.phone}</p>
              </div>
              
              {passenger.hasPassport && passenger.passportNumber && (
                <>
                  <div className="bg-white/10 p-3 rounded-md border border-white/10">
                    <p className="text-sm font-medium text-white/90">Passport/ID</p>
                    <p className="text-base text-white">{passenger.passportNumber}</p>
                  </div>
                  
                  {passenger.passportExpiry && (
                    <div className="bg-white/10 p-3 rounded-md border border-white/10">
                      <p className="text-sm font-medium text-white/90">Expiry Date</p>
                      <p className="text-base text-white">
                        {format(new Date(passenger.passportExpiry), 'PPP')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 