'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Users, 
  Calendar, 
  AlertCircle, 
  Clock,
  ChevronRight,
  Plane
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cva } from "class-variance-authority";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

const badgeVariants = cva(
  "rounded-md px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        economy: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
        premium: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
        business: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        first: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
      },
    },
    defaultVariants: {
      variant: "economy",
    },
  }
);

interface Segment {
  departing_at: string;
  arriving_at: string;
  origin: {
    iata_code: string;
  };
  destination: {
    iata_code: string;
  };
  marketing_carrier: {
    name: string;
    iata_code: string;
  };
  marketing_carrier_flight_number: string;
}

interface FlightSlice {
  segments: Segment[];
}

interface OfferData {
  passenger_count: {
    adults: number;
    children: number;
    infants: number;
  };
  slices: FlightSlice[];
  total_amount: number;
  total_currency: string;
}

interface NewBookingSummaryProps {
  offerData: OfferData | null;
  isLoading: boolean;
}

export default function NewBookingSummary({ offerData, isLoading }: NewBookingSummaryProps) {
  if (isLoading || !offerData) {
    return (
      <Card className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const { passenger_count, slices, total_amount, total_currency } = offerData;
  const outboundSlice = slices[0];
  const returnSlice = slices.length > 1 ? slices[1] : null;
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  const formatPassengerCount = () => {
    if (!passenger_count) return '1 Adult';
    
    const { adults = 0, children = 0, infants = 0 } = passenger_count;
    
    const parts = [];
    if (adults > 0) parts.push(`${adults} ${adults === 1 ? 'Adult' : 'Adults'}`);
    if (children > 0) parts.push(`${children} ${children === 1 ? 'Child' : 'Children'}`);
    if (infants > 0) parts.push(`${infants} ${infants === 1 ? 'Infant' : 'Infants'}`);
    
    return parts.join(', ');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEE, MMM d, yyyy");
  };
  
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };
  
  return (
    <Card className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md border border-white/10 sticky top-4">
      <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-t-lg">
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Passenger Count */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Passengers</div>
            <div className="font-medium">{formatPassengerCount()}</div>
          </div>
          
          <Separator className="bg-gray-700" />
          
          {/* Outbound Flight */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-600">
                Outbound
              </Badge>
              <div className="text-sm text-gray-400">{formatDate(outboundSlice.segments[0].departing_at)}</div>
            </div>
            
            {outboundSlice.segments.map((segment: Segment, index: number) => (
              <div key={index} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-lg font-medium">{formatTime(segment.departing_at)}</div>
                  <Plane className="rotate-90 w-4 h-4 text-blue-400 mx-2" />
                  <div className="text-lg font-medium">{formatTime(segment.arriving_at)}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <div>{segment.origin.iata_code}</div>
                  <div>{segment.destination.iata_code}</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {segment.marketing_carrier.name} {segment.marketing_carrier.iata_code}{segment.marketing_carrier_flight_number}
                </div>
              </div>
            ))}
          </div>
          
          {returnSlice && (
            <>
              <Separator className="bg-gray-700" />
              
              {/* Return Flight */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-600">
                    Return
                  </Badge>
                  <div className="text-sm text-gray-400">{formatDate(returnSlice.segments[0].departing_at)}</div>
                </div>
                
                {returnSlice.segments.map((segment: Segment, index: number) => (
                  <div key={index} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-lg font-medium">{formatTime(segment.departing_at)}</div>
                      <Plane className="rotate-90 w-4 h-4 text-blue-400 mx-2" />
                      <div className="text-lg font-medium">{formatTime(segment.arriving_at)}</div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>{segment.origin.iata_code}</div>
                      <div>{segment.destination.iata_code}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {segment.marketing_carrier.name} {segment.marketing_carrier.iata_code}{segment.marketing_carrier_flight_number}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <Separator className="bg-gray-700" />
          
          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="text-sm text-gray-400 mb-1">Price Details</div>
            <div className="flex justify-between">
              <div>Base fare</div>
              <div>{formatCurrency(total_amount * 0.85, total_currency)}</div>
            </div>
            <div className="flex justify-between">
              <div>Taxes & Fees</div>
              <div>{formatCurrency(total_amount * 0.15, total_currency)}</div>
            </div>
            <Separator className="bg-gray-700 my-2" />
            <div className="flex justify-between font-semibold">
              <div>Total</div>
              <div>{formatCurrency(total_amount, total_currency)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSummary() {
  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-800">
        <CardTitle className="text-lg text-center">
          <Skeleton className="h-6 w-40 mx-auto bg-gray-800" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-5 w-24 bg-gray-800" />
            <Skeleton className="h-5 w-20 bg-gray-800" />
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-10 w-16 bg-gray-800" />
            <div className="flex-1 mx-2 px-2">
              <Skeleton className="h-4 w-full bg-gray-800" />
            </div>
            <Skeleton className="h-10 w-16 bg-gray-800" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gray-800" />
            <Skeleton className="h-4 w-full bg-gray-800" />
            <Skeleton className="h-4 w-3/4 bg-gray-800" />
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 bg-gray-800" />
            <Skeleton className="h-4 w-16 bg-gray-800" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 bg-gray-800" />
            <Skeleton className="h-4 w-24 bg-gray-800" />
          </div>
          <div className="flex justify-between pb-2 border-b border-gray-800">
            <Skeleton className="h-4 w-24 bg-gray-800" />
            <Skeleton className="h-4 w-16 bg-gray-800" />
          </div>
          <div className="flex justify-between pt-1">
            <Skeleton className="h-6 w-24 bg-gray-800" />
            <Skeleton className="h-6 w-28 bg-gray-800" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 