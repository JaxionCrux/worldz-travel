"use client"

import { useState } from "react"
import { User, ChevronDown, Plane } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface PassengersSelectorProps {
  adults: number
  onAdultsChange: (count: number) => void
  children: number
  onChildrenChange: (count: number) => void
  infants: number
  onInfantsChange: (count: number) => void
  cabinClass: string
  onCabinClassChange: (value: string) => void
  className?: string
  showLabel?: boolean
}

export function PassengersSelector({
  adults,
  onAdultsChange,
  children,
  onChildrenChange,
  infants,
  onInfantsChange,
  cabinClass,
  onCabinClassChange,
  className,
  showLabel = false
}: PassengersSelectorProps) {
  const [open, setOpen] = useState(false)

  const formatPassengers = () => {
    const totalPassengers = adults + children + infants;
    
    let cabinDisplay = "";
    switch (cabinClass) {
      case "economy":
        cabinDisplay = "Economy";
        break;
      case "premium_economy":
        cabinDisplay = "Premium Economy";
        break;
      case "business":
        cabinDisplay = "Business";
        break;
      case "first":
        cabinDisplay = "First Class";
        break;
      default:
        cabinDisplay = "Economy";
    }
    
    return (
      <div className="flex items-center gap-1">
        <span>{totalPassengers} {totalPassengers === 1 ? "Traveler" : "Travelers"}</span>
        <span className="text-gray-400 mx-1">•</span>
        <span className="text-gray-500">{cabinDisplay}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {showLabel && <div className="text-sm font-medium text-gray-500 mb-1">Travelers & Class</div>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center w-full h-10 px-3 text-left bg-transparent rounded-md hover:bg-gray-50 focus:outline-none transition-all text-sm"
          >
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <div className="flex-1">
              {formatPassengers()}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 text-base flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                Travelers
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Adults</div>
                    <div className="text-xs text-gray-500">Age 12+</div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{adults}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onAdultsChange(Math.min(9, adults + 1))}
                      disabled={adults >= 9}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Children</div>
                    <div className="text-xs text-gray-500">Age 2-11</div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onChildrenChange(Math.max(0, children - 1))}
                      disabled={children <= 0}
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{children}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onChildrenChange(Math.min(9, children + 1))}
                      disabled={children >= 9}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Infants</div>
                    <div className="text-xs text-gray-500">Under 2</div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onInfantsChange(Math.max(0, infants - 1))}
                      disabled={infants <= 0}
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{infants}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onInfantsChange(Math.min(adults, infants + 1))}
                      disabled={infants >= adults || adults + children + infants >= 9}
                    >
                      +
                    </Button>
                  </div>
                </div>
                {infants > 0 && (
                  <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded-lg">
                    Note: Infants must be under 2 years old and sit on an adult's lap. One infant per adult.
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3 text-base flex items-center">
                <Plane className="w-4 h-4 mr-2 text-blue-500" />
                Cabin Class
              </h4>
              <Select value={cabinClass} onValueChange={onCabinClassChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select cabin class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium_economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="button" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <input type="hidden" name="adults" value={adults} />
      <input type="hidden" name="children" value={children} />
      <input type="hidden" name="infants" value={infants} />
      <input type="hidden" name="cabinClass" value={cabinClass} />
    </div>
  )
}
