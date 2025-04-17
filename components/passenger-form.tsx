'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, User, Mail, Phone, BadgeCheck, Globe2, CreditCard, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { format, subYears, isBefore, isAfter, addYears } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { countries, Country } from '@/lib/countries';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

// Custom year-month selector component
const YearMonthPicker = ({ 
  date, 
  onChange, 
  minYear, 
  maxYear,
  className,
  disabled = false
}: { 
  date: Date;
  onChange: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
  disabled?: boolean;
}) => {
  // Generate years array
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: (maxYear || currentYear) - (minYear || 1900) + 1 }, 
    (_, i) => (maxYear || currentYear) - i
  );
  
  // Months array
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

  // Days array
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth();
  const selectedDay = date.getDate();
  
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleYearChange = (year: string) => {
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(year));
    onChange(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(date);
    newDate.setMonth(parseInt(month));
    
    // Adjust day if current day is greater than days in the new month
    const daysInNewMonth = getDaysInMonth(selectedYear, parseInt(month));
    if (selectedDay > daysInNewMonth) {
      newDate.setDate(daysInNewMonth);
    }
    
    onChange(newDate);
  };

  const handleDayChange = (day: string) => {
    const newDate = new Date(date);
    newDate.setDate(parseInt(day));
    onChange(newDate);
  };

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <Select
        value={selectedDay.toString()}
        onValueChange={handleDayChange}
        disabled={disabled}
      >
        <SelectTrigger className="bg-white/15 border-white/30 text-white">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {days.map((day) => (
            <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={selectedMonth.toString()}
        onValueChange={handleMonthChange}
        disabled={disabled}
      >
        <SelectTrigger className="bg-white/15 border-white/30 text-white">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={selectedYear.toString()}
        onValueChange={handleYearChange}
        disabled={disabled}
      >
        <SelectTrigger className="bg-white/15 border-white/30 text-white">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Define the form schema with validation rules
const passengerSchema = z.object({
  type: z.enum(['adult', 'child', 'infant_without_seat'], {
    required_error: 'Please select a passenger type',
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
  // New passport/ID fields
  hasPassport: z.boolean().default(false),
  passportNumber: z.string().optional(),
  passportCountry: z.string().optional(),
  passportExpiry: z.date().optional(),
}).refine((data) => {
  // If hasPassport is true, validate passport fields
  if (data.hasPassport) {
    return (
      !!data.passportNumber && 
      data.passportNumber.length >= 5 && 
      !!data.passportCountry && 
      !!data.passportExpiry
    );
  }
  return true;
}, {
  message: "Please complete all passport information",
  path: ["passportNumber"],
});

type PassengerFormValues = z.infer<typeof passengerSchema>;

interface PassengerFormProps {
  passengerIndex: number;
  passengerType: 'adult' | 'child' | 'infant_without_seat';
  onComplete: (data: PassengerFormValues, index: number) => void;
  initialData?: Partial<PassengerFormValues>;
  isInternational?: boolean;
}

export default function PassengerForm({ 
  passengerIndex, 
  passengerType, 
  onComplete, 
  initialData,
  isInternational = false
}: PassengerFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!initialData);

  // Get passenger type display name
  const getPassengerTypeDisplay = (type: string): string => {
    switch (type) {
      case 'adult': return 'Adult';
      case 'child': return 'Child';
      case 'infant_without_seat': return 'Infant (no seat)';
      default: return type;
    }
  };

  // Form setup
  const form = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      type: passengerType,
      title: initialData?.title || 'mr',
      givenName: initialData?.givenName || '',
      familyName: initialData?.familyName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      birthDate: initialData?.birthDate || new Date(),
      hasPassport: initialData?.hasPassport || false,
      passportNumber: initialData?.passportNumber || '',
      passportCountry: initialData?.passportCountry || '',
      passportExpiry: initialData?.passportExpiry || addYears(new Date(), 5),
    },
  });

  // Function to handle form submission
  function onSubmit(data: PassengerFormValues) {
    try {
      onComplete(data, passengerIndex);
      setIsEditing(false);
      toast({
        title: "Passenger information saved",
        description: `${data.givenName} ${data.familyName}'s details have been saved.`,
      });
    } catch (error) {
      toast({
        title: "Error saving passenger",
        description: "There was a problem saving the passenger information.",
        variant: "destructive",
      });
    }
  }

  // Age restrictions based on passenger type
  const getDateRestrictions = () => {
    const today = new Date();
    
    if (passengerType === 'infant_without_seat') {
      // Infants: 0-2 years
      return { 
        from: undefined, 
        to: subYears(today, 2),
        minYear: today.getFullYear() - 2,
        maxYear: today.getFullYear()
      };
    } else if (passengerType === 'child') {
      // Children: 2-12 years
      return { 
        from: subYears(today, 12), 
        to: subYears(today, 2),
        minYear: today.getFullYear() - 12,
        maxYear: today.getFullYear() - 2
      };
    } else {
      // Adults: 12+ years
      return { 
        from: subYears(today, 120), // Reasonable upper limit 
        to: subYears(today, 12),
        minYear: today.getFullYear() - 120,
        maxYear: today.getFullYear() - 12
      };
    }
  };
  
  const dateRestrictions = getDateRestrictions();
  const hasPassport = form.watch('hasPassport');

  return (
    <Card className="w-full mb-6 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md border border-white/10">
      <CardHeader className={cn(
        "rounded-t-lg",
        passengerType === 'adult' ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50" : 
        passengerType === 'child' ? "bg-gradient-to-r from-purple-900/50 to-pink-900/50" : 
        "bg-gradient-to-r from-green-900/50 to-teal-900/50"
      )}>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5 text-white" />
            <span>
              Passenger {passengerIndex + 1} - {getPassengerTypeDisplay(passengerType)}
            </span>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}
              className="border-white/20 text-white hover:bg-white/10">
              Edit
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-white/90">
          Enter the passenger details exactly as they appear on their travel document.
        </CardDescription>
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
                        <YearMonthPicker
                          date={field.value}
                          onChange={field.onChange}
                          minYear={dateRestrictions.minYear}
                          maxYear={dateRestrictions.maxYear}
                          className="pt-1"
                        />
                      </FormControl>
                      <FormDescription className="text-white/80 mt-2">
                        {passengerType === 'adult' && 'Must be 12 years or older'}
                        {passengerType === 'child' && 'Must be between 2 and 12 years'}
                        {passengerType === 'infant_without_seat' && 'Must be under 2 years'}
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
                      <FormLabel className="text-white font-medium">Email {passengerIndex === 0 && "(Primary Contact)"}</FormLabel>
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
                      {passengerIndex === 0 && (
                        <FormDescription className="text-white/80">
                          Booking confirmation will be sent to this email
                        </FormDescription>
                      )}
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Phone Number {passengerIndex === 0 && "(Primary Contact)"}</FormLabel>
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

              {(isInternational || passengerType === 'adult') && (
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
                              <SelectContent className="max-h-[200px]">
                                {countries.map((country: Country) => (
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
                              <YearMonthPicker
                                date={field.value || addYears(new Date(), 5)}
                                onChange={field.onChange}
                                minYear={new Date().getFullYear()}
                                maxYear={new Date().getFullYear() + 15}
                                className="pt-1"
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
            {initialData && (
              <>
                <div className="flex items-center mb-4 bg-green-900/20 p-3 rounded-md border border-green-500/30">
                  <BadgeCheck className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-300">Passenger information complete</span>
                </div>
              
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-md border border-white/10">
                    <p className="text-sm font-medium text-white/90">Name</p>
                    <p className="text-base text-white">{initialData.title?.toUpperCase()}. {initialData.givenName} {initialData.familyName}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-md border border-white/10">
                    <p className="text-sm font-medium text-white/90">Date of Birth</p>
                    <p className="text-base text-white">
                      {initialData.birthDate && format(new Date(initialData.birthDate), 'PPP')}
                    </p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-md border border-white/10">
                    <p className="text-sm font-medium text-white/90">Email</p>
                    <p className="text-base text-white break-words">{initialData.email}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-md border border-white/10">
                    <p className="text-sm font-medium text-white/90">Phone</p>
                    <p className="text-base text-white">{initialData.phone}</p>
                  </div>
                  
                  {initialData.hasPassport && initialData.passportNumber && (
                    <>
                      <div className="bg-white/10 p-3 rounded-md border border-white/10">
                        <p className="text-sm font-medium text-white/90">Passport/ID</p>
                        <p className="text-base text-white">{initialData.passportNumber}</p>
                      </div>
                      {initialData.passportExpiry && (
                        <div className="bg-white/10 p-3 rounded-md border border-white/10">
                          <p className="text-sm font-medium text-white/90">Expiry Date</p>
                          <p className="text-base text-white">
                            {format(new Date(initialData.passportExpiry), 'PPP')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 