"use client"

import React, { useState } from "react";
import { Airport } from "@/types/module/tripsummary";
import { searchAirports } from "@/app/actions/airport-actions";

interface SimpleAirportSearchProps {
  label: string;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
}

// Simple search icon SVG component
const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-gray-400"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export function SimpleAirportSearch({ label, onSelect, placeholder = "Search airports..." }: SimpleAirportSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setQuery(query);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const airports = await searchAirports(query);
      setResults(airports);
      setIsOpen(true);
    } catch (error) {
      console.error("Error searching airports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={placeholder}
          className="w-full h-10 px-3 pl-9 text-sm rounded-md border-0 bg-transparent focus:outline-none"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm overflow-auto focus:outline-none">
          {results.map((airport) => (
            <li
              key={airport.iata}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
              onClick={() => {
                onSelect(airport);
                setIsOpen(false);
                setQuery(`${airport.city} (${airport.iata})`);
              }}
            >
              <div className="flex items-center">
                <span className="font-medium">{airport.city}</span>
                <span className="text-gray-500 ml-1">({airport.iata})</span>
              </div>
              <p className="text-gray-500 text-xs">{airport.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Also export as default for compatibility
export default SimpleAirportSearch; 