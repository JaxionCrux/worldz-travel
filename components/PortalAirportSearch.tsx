"use client"

import React, { useState, useEffect, useRef } from 'react';
import type { Airport } from "@/types/module/tripsummary";
import { searchAirports } from "@/app/actions/airport-actions";
import { DropdownPortal } from './DropdownPortal';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PortalAirportSearchProps {
  id: string;
  label?: string;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export default function PortalAirportSearch({ 
  id, 
  label, 
  onSelect, 
  placeholder = "Search airports...", 
  initialValue = "", 
  className = "" 
}: PortalAirportSearchProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle input change with basic debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length >= 2) {
      // Show loading state immediately
      setIsLoading(true);
      setShowDropdown(true);
      
      // Simple debounce
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log("PortalAirportSearch: Searching for", value);
          const searchResults = await searchAirports(value);
          console.log("PortalAirportSearch: Found", searchResults.length, "results");
          setResults(searchResults);
        } catch (error) {
          console.error("PortalAirportSearch: Error searching", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setShowDropdown(false);
      setIsLoading(false);
    }
  };
  
  // Handle airport selection
  const handleSelect = (airport: Airport) => {
    console.log("PortalAirportSearch: Selected", airport.iata);
    setInputValue(`${airport.city} (${airport.iata})`);
    setShowDropdown(false);
    onSelect(airport);
  };
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Note: With portal, this check needs to be more careful since the dropdown is outside
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && 
          !document.getElementById('portal-root')?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // Render dropdown content
  const renderDropdownContent = () => (
    <div className="divide-y divide-gray-100 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
      {results.length > 0 ? (
        <div>
          {results.map((airport) => (
            <div 
              key={airport.iata}
              className="p-2 hover:bg-purple-50 cursor-pointer"
              onClick={() => handleSelect(airport)}
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
  );
  
  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && (
        <Label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </Label>
      )}
      
      <Input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue.length >= 2) {
            setShowDropdown(true);
          }
        }}
        placeholder={placeholder}
        className="w-full pl-3 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
      />
      
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
        </div>
      )}
      
      {/* Use Portal for the dropdown */}
      {showDropdown && (
        <DropdownPortal
          isOpen={true}
          positionRef={containerRef as React.RefObject<HTMLElement>}
        >
          {renderDropdownContent()}
        </DropdownPortal>
      )}
    </div>
  );
} 