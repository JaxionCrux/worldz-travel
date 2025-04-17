"use client"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import type { Airport } from "@/types/module/tripsummary"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { searchAirports } from "@/app/actions/airport-actions"

interface AirportSearchProps {
  id: string
  label: string
  placeholder?: string
  onSelect: (airport: Airport) => void
  initialValue?: string
  initialCode?: string
  className?: string
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
}: AirportSearchProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  // Minimal React state - just for input value tracking
  const [inputValue, setInputValue] = useState(initialValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Use direct DOM manipulation to handle the dropdown
  useEffect(() => {
    console.log("Setting up direct DOM manipulation for airport search")
    
    if (!containerRef.current || !inputRef.current) {
      console.error("Required DOM elements not found")
      return
    }
    
    const container = containerRef.current
    const input = inputRef.current
    
    // Create dropdown element
    let dropdown = document.createElement('div')
    dropdown.setAttribute('data-testid', 'airport-dropdown')
    dropdown.className = 'absolute z-50 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200'
    dropdown.style.display = 'none'
    container.appendChild(dropdown)
    
    // Search timeout reference
    let searchTimeout: NodeJS.Timeout | null = null
    
    // Function to perform search and show results
    const performSearch = async (query: string) => {
      console.log("Direct DOM: Performing search for", query)
      
      if (query.length < 2) {
        dropdown.style.display = 'none'
        return
      }
      
      // Show loading state
      dropdown.style.display = 'block'
      dropdown.innerHTML = '<div class="px-4 py-2 text-center text-gray-500">Searching...</div>'
      
      try {
        const results = await searchAirports(query)
        console.log("Direct DOM: Got", results.length, "results")
        
        // Handle no results
        if (results.length === 0) {
          dropdown.innerHTML = '<div class="px-4 py-2 text-center text-gray-500">No airports found</div>'
          return
        }
        
        // Create HTML for results
        dropdown.innerHTML = `
          <ul class="divide-y divide-gray-200">
            ${results.map(airport => `
              <li class="cursor-pointer hover:bg-purple-50 px-4 py-2" 
                  data-iata="${airport.iata}" 
                  data-city="${airport.city}"
                  data-name="${airport.name}"
                  data-country="${airport.country}"
                  data-state="${airport.state || ''}">
                <div class="flex justify-between">
                  <div class="font-medium">${airport.city}</div>
                  <div class="text-purple-600 font-bold">${airport.iata}</div>
                </div>
                <div class="text-sm text-gray-500">
                  ${airport.name} • ${airport.country}
                </div>
              </li>
            `).join('')}
          </ul>
        `
        
        // Add click handlers to each result
        dropdown.querySelectorAll('li').forEach(li => {
          li.addEventListener('click', () => {
            const iata = li.getAttribute('data-iata') || ''
            const city = li.getAttribute('data-city') || ''
            const name = li.getAttribute('data-name') || ''
            const country = li.getAttribute('data-country') || ''
            const state = li.getAttribute('data-state') || ''
            
            // Update input value
            setInputValue(`${city} (${iata})`)
            input.value = `${city} (${iata})`
            
            // Call the onSelect handler
            onSelect({
              iata,
              name,
              city,
              country,
              state: state || undefined
            })
            
            // Hide dropdown
            dropdown.style.display = 'none'
          })
        })
        
      } catch (error) {
        console.error("Direct DOM: Search error", error)
        dropdown.innerHTML = '<div class="px-4 py-2 text-center text-gray-500">Error searching airports</div>'
      }
    }
    
    // Input event handler - triggered on every keystroke
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement
      const query = target.value
      console.log("Direct DOM: Input event", query)
      
      // Update React state for controlled input
      setInputValue(query)
      
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      
      // Handle empty/short query
      if (query.length < 2) {
        dropdown.style.display = 'none'
        return
      }
      
      // Show loading state immediately
      dropdown.style.display = 'block'
      dropdown.innerHTML = '<div class="px-4 py-2 text-center text-gray-500">Searching...</div>'
      
      // Debounce search
      searchTimeout = setTimeout(() => {
        performSearch(query)
      }, 300)
    }
    
    // Focus event handler
    const handleFocus = () => {
      console.log("Direct DOM: Focus event")
      const query = input.value
      
      // Only show dropdown if we have enough characters
      if (query.length >= 2) {
        // If dropdown has content, show it
        if (dropdown.children.length > 0 && dropdown.innerHTML.trim() !== '') {
          dropdown.style.display = 'block'
        } else {
          // Otherwise perform new search
          performSearch(query)
        }
      }
    }
    
    // Document click handler to close dropdown when clicking outside
    const handleDocumentClick = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        dropdown.style.display = 'none'
      }
    }
    
    // Add all event listeners
    input.addEventListener('input', handleInput)
    input.addEventListener('focus', handleFocus)
    document.addEventListener('click', handleDocumentClick)
    
    // Initialize with search if we have an initial value
    if (initialValue && initialValue.length >= 2) {
      console.log("Direct DOM: Initial search for", initialValue)
      performSearch(initialValue)
    }
    
    // Clean up all event listeners and DOM elements on unmount
    return () => {
      console.log("Direct DOM: Cleaning up")
      input.removeEventListener('input', handleInput)
      input.removeEventListener('focus', handleFocus)
      document.removeEventListener('click', handleDocumentClick)
      
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      
      if (dropdown && dropdown.parentNode) {
        dropdown.parentNode.removeChild(dropdown)
      }
    }
  }, [onSelect, initialValue]) // Dependencies
  
  // Handle React controlled input value change
  const handleControlledInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }
  
  return (
    <div ref={containerRef} className={cn("relative w-full", className)} {...props}>
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
          data-testid="airport-input"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleControlledInputChange}
          className="pl-10 pr-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      
      {/* No dropdown in JSX - it's created and managed directly in the DOM */}
    </div>
  )
}
