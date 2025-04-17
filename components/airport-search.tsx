"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import type { Airport } from "@/types/module/tripsummary"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AirportSuggestions } from "./airport-suggestions"

interface AirportSearchProps extends React.ComponentPropsWithoutRef<"div"> {
  id: string
  label: string
  placeholder?: string
  onSelect: (airport: Airport) => void
  initialValue?: string
  initialCode?: string
}

export function AirportSearch({
  id,
  label,
  placeholder = "Search for airports...",
  onSelect,
  initialValue = "",
  initialCode = "",
  className,
  ...props
}: AirportSearchProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<Airport[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch airports from API
  const fetchAirports = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      // This would be replaced with your actual API call
      const response = await fetch(`/api/airports?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.success) {
        setSuggestions(data.airports)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error("Error fetching airports:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length < 2) {
      setSuggestions([])
      setIsDropdownOpen(false)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchAirports(value)
      setIsDropdownOpen(true)
    }, 200) // 200ms debounce
  }

  // Handle airport selection
  const handleSelect = (airport: Airport) => {
    setInputValue(`${airport.city} (${airport.iata})`)
    onSelect(airport)
    setIsDropdownOpen(false)
    inputRef.current?.blur()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn("relative", className)} {...props}>
      <Label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          id={id}
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setIsDropdownOpen(true)}
          className="pl-10 pr-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
          <AirportSuggestions suggestions={suggestions} inputValue={inputValue} onSelect={handleSelect} />
        </div>
      )}
    </div>
  )
}
