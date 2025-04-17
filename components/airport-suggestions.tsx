"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Globe } from "lucide-react"
import type { Airport, AirportGroup } from "@/types/module/tripsummary"
import { cn } from "@/lib/utils"

interface AirportSuggestionsProps {
  suggestions: Airport[]
  inputValue: string
  onSelect: (airport: Airport) => void
}

export function AirportSuggestions({ suggestions, inputValue, onSelect }: AirportSuggestionsProps) {
  console.log("AirportSuggestions received:", suggestions.length, "suggestions")
  console.log("First suggestion sample:", suggestions.length > 0 ? suggestions[0] : 'none')

  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [groupedAirports, setGroupedAirports] = useState<AirportGroup[]>([])
  const [flattenedResults, setFlattenedResults] = useState<
    (Airport | { isAllAirports: true; city: string; country: string; airports: Airport[] })[]
  >([])
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Group airports by city
  useEffect(() => {
    const groups: Record<string, AirportGroup> = {}

    suggestions.forEach((airport) => {
      const key = `${airport.city}-${airport.country}`

      if (!groups[key]) {
        groups[key] = {
          city: airport.city,
          country: airport.country,
          airports: [],
        }
      }

      groups[key].airports.push(airport)
    })

    const sortedGroups = Object.values(groups).sort((a, b) => {
      // Sort by relevance to input
      const aRelevance = calculateRelevance(a.city, inputValue)
      const bRelevance = calculateRelevance(b.city, inputValue)

      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance
      }

      // Then by city name
      return a.city.localeCompare(b.city)
    })

    setGroupedAirports(sortedGroups)

    // Create flattened results for keyboard navigation
    const flattened: (Airport | { isAllAirports: true; city: string; country: string; airports: Airport[] })[] = []

    sortedGroups.forEach((group) => {
      // Add "All Airports" option for cities with multiple airports
      if (group.airports.length > 1) {
        flattened.push({
          isAllAirports: true,
          city: group.city,
          country: group.country,
          airports: group.airports,
        })
      }

      // Add individual airports
      group.airports.forEach((airport) => {
        flattened.push(airport)
      })
    })

    setFlattenedResults(flattened)
    itemRefs.current = flattened.map(() => null)
  }, [suggestions, inputValue])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!flattenedResults.length) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedIndex((prev) => (prev < flattenedResults.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : flattenedResults.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < flattenedResults.length) {
            const item = flattenedResults[focusedIndex]
            if ("isAllAirports" in item) {
              // Select the first airport from the group
              onSelect(item.airports[0])
            } else {
              onSelect(item)
            }
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [flattenedResults, focusedIndex, onSelect])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [focusedIndex])

  // Calculate relevance score for fuzzy matching
  const calculateRelevance = (text: string, query: string): number => {
    if (!query) return 0

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()

    // Exact match gets highest score
    if (lowerText === lowerQuery) return 100

    // Starts with gets high score
    if (lowerText.startsWith(lowerQuery)) return 80

    // Contains gets medium score
    if (lowerText.includes(lowerQuery)) return 60

    // Fuzzy match - count matching characters in order
    let textIndex = 0
    let queryIndex = 0
    let matchCount = 0

    while (textIndex < lowerText.length && queryIndex < lowerQuery.length) {
      if (lowerText[textIndex] === lowerQuery[queryIndex]) {
        matchCount++
        queryIndex++
      }
      textIndex++
    }

    return (matchCount / lowerQuery.length) * 40
  }

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()

    // For exact matches or starts with
    if (lowerText.startsWith(lowerQuery)) {
      const matchLength = lowerQuery.length
      return (
        <>
          <span className="bg-purple-100 text-purple-800 font-medium">{text.substring(0, matchLength)}</span>
          {text.substring(matchLength)}
        </>
      )
    }

    // For contains
    const index = lowerText.indexOf(lowerQuery)
    if (index >= 0) {
      const matchLength = lowerQuery.length
      return (
        <>
          {text.substring(0, index)}
          <span className="bg-purple-100 text-purple-800 font-medium">
            {text.substring(index, index + matchLength)}
          </span>
          {text.substring(index + matchLength)}
        </>
      )
    }

    // For fuzzy matches, just return the text
    return text
  }

  // Handle selection of an airport
  const handleSelectAirport = (airport: Airport) => {
    onSelect(airport)
  }

  // Handle selection of "All Airports" option
  const handleSelectAllAirports = (group: AirportGroup) => {
    // Select the first airport from the group
    onSelect(group.airports[0])
  }

  if (suggestions.length === 0) {
    return <div className="py-6 text-center text-gray-500">No airports found matching your search</div>
  }

  return (
    <div ref={containerRef} className="max-h-[300px] overflow-y-auto py-2 divide-y divide-gray-100">
      {groupedAirports.map((group, groupIndex) => (
        <div key={`${group.city}-${group.country}`} className="py-2">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
            {group.city}, {group.country}
          </div>

          {/* "All Airports" option for cities with multiple airports */}
          {group.airports.length > 1 && (
            <div
              ref={(el) => {
                const allAirportsIndex = flattenedResults.findIndex(
                  (item) => "isAllAirports" in item && item.city === group.city,
                )
                if (allAirportsIndex >= 0) {
                  itemRefs.current[allAirportsIndex] = el
                }
              }}
              className={cn(
                "px-3 py-2 flex items-center cursor-pointer transition-colors",
                "hover:bg-purple-50",
                focusedIndex ===
                  flattenedResults.findIndex((item) => "isAllAirports" in item && item.city === group.city) &&
                  "bg-purple-50",
              )}
              onClick={() => handleSelectAllAirports(group)}
            >
              <Globe className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
              <div>
                <div className="font-medium">All Airports in {group.city}</div>
                <div className="text-xs text-gray-500">{group.airports.length} airports available</div>
              </div>
            </div>
          )}

          {/* Individual airports */}
          {group.airports.map((airport, airportIndex) => {
            const flatIndex = flattenedResults.findIndex(
              (item) => !("isAllAirports" in item) && item.iata === airport.iata,
            )

            return (
              <div
                key={airport.iata}
                ref={(el) => {
                  if (flatIndex >= 0) {
                    itemRefs.current[flatIndex] = el
                  }
                }}
                className={cn(
                  "px-3 py-2 flex items-start cursor-pointer transition-colors",
                  "hover:bg-purple-50",
                  focusedIndex === flatIndex && "bg-purple-50",
                )}
                onClick={() => handleSelectAirport(airport)}
              >
                <MapPin className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{highlightMatch(airport.name, inputValue)}</div>
                    <div className="ml-2 text-purple-600 font-bold">{airport.iata}</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {airport.city}, {airport.country}
                    {airport.state ? `, ${airport.state}` : ""}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
