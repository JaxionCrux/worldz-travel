"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Airport } from "@/types/module/tripsummary"
import { searchAirports } from "@/app/actions/airport-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DebugAirportSearchProps {
  id: string;
  label?: string;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  initialValue?: string;
}

// Debug version of SimpleAirportSearch with extra debugging features
function DebugAirportSearch({
  id,
  label,
  onSelect,
  placeholder = "Search airports...",
  initialValue = "",
}: DebugAirportSearchProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [showDropdown, setShowDropdown] = useState(false)
  const [results, setResults] = useState<Airport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState({
    dropdownVisible: false,
    dropdownExists: false,
    lastAction: "None",
    eventsCaught: 0
  })
  
  // Track render count
  useEffect(() => {
    setRenderCount(prev => prev + 1)
    console.log(`DebugAirportSearch rendered: ${renderCount + 1} times`)
  }, [])
  
  // Handle input change with basic debounce
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setDebugInfo(prev => ({ ...prev, lastAction: `Input changed: ${value}` }))
    
    if (value.length >= 2) {
      // Show loading state immediately
      setIsLoading(true)
      setShowDropdown(true)
      setDebugInfo(prev => ({ ...prev, dropdownVisible: true }))
      
      try {
        console.log("Searching for:", value)
        const searchResults = await searchAirports(value)
        console.log(`Found ${searchResults.length} results`)
        
        // Check if dropdown is still in the DOM
        const dropdownElement = document.querySelector(`[data-testid="${id}-dropdown"]`)
        setDebugInfo(prev => ({ 
          ...prev, 
          dropdownExists: !!dropdownElement,
          lastAction: `Search completed for "${value}": ${searchResults.length} results` 
        }))
        
        setResults(searchResults)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    } else {
      setResults([])
      setShowDropdown(false)
      setDebugInfo(prev => ({ ...prev, dropdownVisible: false }))
    }
  }
  
  // Log dropdown state changes
  useEffect(() => {
    console.log(`Dropdown state changed: ${showDropdown ? 'VISIBLE' : 'HIDDEN'}`)
    
    // Check if dropdown is in the DOM
    setTimeout(() => {
      const dropdownElement = document.querySelector(`[data-testid="${id}-dropdown"]`)
      setDebugInfo(prev => ({ 
        ...prev, 
        dropdownExists: !!dropdownElement,
        dropdownVisible: showDropdown
      }))
    }, 0)
  }, [showDropdown, id])
  
  // Handle manual dropdown toggle for debugging
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev)
    setDebugInfo(prev => ({ 
      ...prev, 
      lastAction: `Dropdown manually ${!showDropdown ? 'shown' : 'hidden'}` 
    }))
  }
  
  // Capture all click events for debugging
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const searchContainer = document.querySelector(`[data-testid="${id}-container"]`)
      if (searchContainer && !searchContainer.contains(e.target as Node)) {
        setDebugInfo(prev => ({ 
          ...prev, 
          eventsCaught: prev.eventsCaught + 1,
          lastAction: 'Click outside detected' 
        }))
      }
    }
    
    document.addEventListener('click', handleDocumentClick, true) // Use capture phase
    return () => document.removeEventListener('click', handleDocumentClick, true)
  }, [id])
  
  return (
    <div className="space-y-4">
      <div 
        data-testid={`${id}-container`} 
        className="relative border-2 border-blue-200 p-2 rounded" 
        onClick={(e: React.MouseEvent) => e.stopPropagation()} // Stop propagation to test event bubbling issues
      >
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <input
          id={id}
          data-testid={`${id}-input`}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length >= 2) {
              setShowDropdown(true)
              setDebugInfo(prev => ({ ...prev, lastAction: 'Focus event', dropdownVisible: true }))
            }
          }}
          placeholder={placeholder}
          className="w-full p-2 pl-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
        />
        
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
          </div>
        )}
        
        {/* Dropdown with very obvious styling and high z-index */}
        {showDropdown && (
          <div 
            data-testid={`${id}-dropdown`}
            className="absolute z-[9999] w-full mt-1 bg-white border border-red-500 rounded-md shadow-lg max-h-60 overflow-y-auto"
            style={{ borderWidth: '3px', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}
          >
            {results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((airport) => (
                  <div 
                    key={airport.iata}
                    className="p-2 hover:bg-purple-50 cursor-pointer"
                    onClick={() => {
                      setInputValue(`${airport.city} (${airport.iata})`)
                      setShowDropdown(false)
                      onSelect(airport)
                      setDebugInfo(prev => ({ 
                        ...prev, 
                        lastAction: `Selected airport: ${airport.iata}`,
                        dropdownVisible: false
                      }))
                    }}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">{airport.city}</div>
                      <div className="text-purple-600 font-bold">{airport.iata}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {airport.name} • {airport.country}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-center text-gray-500">
                {isLoading ? "Searching..." : "No results found"}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Debug Controls */}
      <div className="bg-gray-100 p-3 rounded border border-gray-300">
        <div className="font-medium mb-2">Debug Controls</div>
        <div className="flex space-x-2 mb-3">
          <Button 
            onClick={toggleDropdown} 
            variant="outline" 
            size="sm"
          >
            {showDropdown ? "Hide Dropdown" : "Show Dropdown"}
          </Button>
          
          <Button 
            onClick={() => {
              // Force search with current value
              if (inputValue.length >= 2) {
                handleInputChange({ target: { value: inputValue } } as React.ChangeEvent<HTMLInputElement>)
              }
            }} 
            variant="outline" 
            size="sm"
          >
            Force Search
          </Button>
        </div>
        
        <div className="text-xs space-y-1">
          <div><span className="font-medium">Dropdown State:</span> {debugInfo.dropdownVisible ? 'Visible' : 'Hidden'}</div>
          <div><span className="font-medium">Dropdown in DOM:</span> {debugInfo.dropdownExists ? 'Yes' : 'No'}</div>
          <div><span className="font-medium">Render Count:</span> {renderCount}</div>
          <div><span className="font-medium">Outside Clicks:</span> {debugInfo.eventsCaught}</div>
          <div><span className="font-medium">Last Action:</span> {debugInfo.lastAction}</div>
        </div>
      </div>
    </div>
  )
}

export default function AirportSearchDebugPage() {
  const [selectedOrigin, setSelectedOrigin] = useState<Airport | null>(null)
  const [renderCount, setRenderCount] = useState(0)
  
  // Track parent render count
  useEffect(() => {
    setRenderCount(prev => prev + 1)
    console.log(`Parent component rendered: ${renderCount + 1} times`)
  }, [])

  const handleOriginSelect = (airport: Airport) => {
    console.log("Origin selected:", airport)
    setSelectedOrigin(airport)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Airport Search Debug Page</h1>
        <p className="text-center text-gray-500 mb-8">Investigating external factors affecting dropdown behavior</p>
        
        <div className="max-w-3xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Debug Airport Search</CardTitle>
            </CardHeader>
            <CardContent>
              <DebugAirportSearch 
                id="debug-origin-search"
                label="Search for an airport"
                placeholder="Type to search airports..."
                onSelect={handleOriginSelect}
              />
              
              {selectedOrigin && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium">Selected Airport:</h3>
                  <div className="flex justify-between mt-2">
                    <span>{selectedOrigin.city}, {selectedOrigin.country}</span>
                    <span className="text-purple-600 font-bold">{selectedOrigin.iata}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{selectedOrigin.name}</div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                <h3 className="font-medium mb-2">Debugging Investigation:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Parent render count: {renderCount}</li>
                  <li>Z-index set to 9999 on dropdown</li>
                  <li>Added visible border to dropdown (red)</li>
                  <li>Click propagation stopped in container</li>
                  <li>Added manual controls to show/hide dropdown</li>
                  <li>Tracking if dropdown actually exists in DOM</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Browser Layout Inspection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>After typing in the search field, if you don't see results, check:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Open browser developer tools (F12 or right-click → Inspect)</li>
                  <li>Navigate to the Elements tab</li>
                  <li>Search for elements with data-testid="debug-origin-search-dropdown"</li>
                  <li>Check if the element exists and inspect its CSS properties</li>
                  <li>Look at the Computed tab to see if any styles are overriding display/z-index</li>
                </ol>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium mb-2">Common External Issues:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Global CSS rules hiding the dropdown (check for display: none !important)</li>
                    <li>Z-index conflicts with other elements (header, footer, etc.)</li>
                    <li>Event handlers at document level capturing clicks</li>
                    <li>Parent component re-rendering and resetting state</li>
                    <li>Layout shifts causing dropdown to render off-screen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 