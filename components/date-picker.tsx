"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  startDate: Date | undefined
  endDate: Date | undefined
  onDateChange: (start: Date | undefined, end: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function DatePicker({ startDate, endDate, onDateChange, disabled = false, className }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (date: Date | undefined) => {
    if (!date) return

    if (!startDate || (startDate && endDate)) {
      // If no start date or both dates are set, set new start date and clear end date
      onDateChange(date, undefined)
    } else {
      // If start date is earlier than selected date, set end date
      if (date < startDate) {
        onDateChange(date, startDate)
      } else {
        onDateChange(startDate, date)
      }
    }
  }

  const formatDateRange = () => {
    if (startDate && endDate) {
      const startDay = format(startDate, "EEE").substring(0, 3)
      const endDay = format(endDate, "EEE").substring(0, 3)
      return `${startDay}, ${format(startDate, "d MMM")} - ${endDay}, ${format(endDate, "d MMM")}`
    }
    if (startDate) {
      return format(startDate, "d MMM")
    }
    return "Select dates"
  }

  return (
    <div className={className}>
      <div className="text-sm font-medium text-gray-500 mb-1">Dates</div>
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center w-full p-4 text-left bg-white rounded-full focus:outline-none",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            disabled={disabled}
          >
            <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
            <div className="font-medium text-gray-900">{startDate ? formatDateRange() : "Select dates"}</div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: startDate,
              to: endDate,
            }}
            onSelect={(range) => {
              onDateChange(range?.from, range?.to)
              if (range?.to) setOpen(false)
            }}
            initialFocus
            numberOfMonths={2}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </PopoverContent>
      </Popover>
      <input type="hidden" name="departureDate" value={startDate ? format(startDate, "yyyy-MM-dd") : ""} />
      <input type="hidden" name="returnDate" value={endDate ? format(endDate, "yyyy-MM-dd") : ""} />
    </div>
  )
}
