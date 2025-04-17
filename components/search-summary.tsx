"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Calendar, User, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FilterSidebar } from "./filter-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { format, addDays } from "date-fns"

export function SearchSummary() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<any>(null)

  useEffect(() => {
    // Get search parameters from sessionStorage
    const params = sessionStorage.getItem("flightSearchParams")
    if (params) {
      setSearchParams(JSON.parse(params))
    }
  }, [])

  if (!searchParams) {
    return null
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "EEE, d MMM yyyy")
    } catch (e) {
      return dateString
    }
  }

  // Extract passengers info
  const passengers = searchParams.adults + (searchParams.children || 0) + (searchParams.infants || 0)
  const passengerText = `${passengers} ${passengers === 1 ? "passenger" : "passengers"}`

  // Format cabin class
  const formatCabinClass = (cabinClass: string) => {
    switch (cabinClass) {
      case "economy":
        return "Economy"
      case "premium_economy":
        return "Premium Economy"
      case "business":
        return "Business"
      case "first":
        return "First Class"
      default:
        return cabinClass
    }
  }

  return (
    <Card className="shadow-sm border-b border-indigo-100">
      <CardContent className="py-3 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm text-gray-500">Route</div>
            <div className="font-medium">
              {searchParams.origin} &rarr; {searchParams.destination}
              {searchParams.tripType === "return" && (
                <span className="text-gray-500 ml-1">(Round-trip)</span>
              )}
              {searchParams.tripType === "one_way" && (
                <span className="text-gray-500 ml-1">(One-way)</span>
              )}
              {searchParams.tripType === "multi_city" && (
                <span className="text-gray-500 ml-1">(Multi-city)</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Dates</div>
            <div className="font-medium">
              {formatDate(searchParams.departureDate)}
              {searchParams.tripType === "return" && searchParams.returnDate && (
                <span> &rarr; {formatDate(searchParams.returnDate)}</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Details</div>
            <div className="font-medium">
              {passengerText}, {formatCabinClass(searchParams.cabinClass)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
