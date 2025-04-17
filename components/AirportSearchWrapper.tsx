"use client"

import React, { useState } from 'react';
import { SimpleAirportSearch } from './SimpleAirportSearch';
import type { Airport } from "@/types/module/tripsummary";

interface AirportSearchWrapperProps {
  id: string;
  name: string;
  label: string;
  initialValue?: string;
  onSelect?: (airport: Airport) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AirportSearchWrapper({
  id,
  name,
  label,
  initialValue = "",
  onSelect,
  placeholder,
  required = false,
  disabled = false,
  className = ""
}: AirportSearchWrapperProps) {
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  
  // Handle airport selection
  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    if (onSelect) {
      onSelect(airport);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <SimpleAirportSearch
        label={label}
        onSelect={handleAirportSelect}
        placeholder={placeholder}
      />
      
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={selectedAirport?.iata || ""}
        required={required}
        disabled={disabled}
        aria-hidden="true"
      />
    </div>
  );
}

// Also export as default for compatibility with existing imports
export default AirportSearchWrapper; 