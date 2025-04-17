"use server"

import { airports } from "@/lib/airports-data"
import type { Airport } from "@/types/module/tripsummary"

export async function searchAirports(query: string): Promise<Airport[]> {
  // Return empty array for short queries
  if (!query || query.length < 2) return []

  try {
    const searchTerm = query.trim().toLowerCase();
    
    // Get all airports as array
    const airportsList = Object.values(airports);
    
    // Direct matching on all fields
    const results = airportsList
      // Map to normalized structure
      .map(airport => ({
        id: airport.iata,
        iata: airport.iata,
        iata_code: airport.iata,
        name: airport.name,
        city: airport.city,
        city_name: airport.city,
        state: airport.state,
        country: airport.country
      }))
      // Filter with exact matching
      .filter(airport => {
        // Exact matches on all fields
        return airport.iata.toLowerCase() === searchTerm || 
               airport.name.toLowerCase() === searchTerm ||
               airport.city.toLowerCase() === searchTerm ||
               // Partial matches - only if exact matches aren't found
               airport.iata.toLowerCase().includes(searchTerm) ||
               airport.name.toLowerCase().includes(searchTerm) ||
               airport.city.toLowerCase().includes(searchTerm) ||
               (airport.state && airport.state.toLowerCase().includes(searchTerm)) ||
               airport.country.toLowerCase().includes(searchTerm);
      })
      // Simple priority sorting
      .sort((a, b) => {
        // 1. Exact IATA matches
        if (a.iata.toLowerCase() === searchTerm) return -1;
        if (b.iata.toLowerCase() === searchTerm) return 1;
        
        // 2. Exact city matches  
        if (a.city.toLowerCase() === searchTerm) return -1;
        if (b.city.toLowerCase() === searchTerm) return 1;
        
        // 3. Exact name matches
        if (a.name.toLowerCase() === searchTerm) return -1;
        if (b.name.toLowerCase() === searchTerm) return 1;
        
        // 4. IATA starts with
        if (a.iata.toLowerCase().startsWith(searchTerm)) return -1;
        if (b.iata.toLowerCase().startsWith(searchTerm)) return 1;
        
        // 5. City starts with
        if (a.city.toLowerCase().startsWith(searchTerm)) return -1;
        if (b.city.toLowerCase().startsWith(searchTerm)) return 1;
        
        // 6. Name starts with
        if (a.name.toLowerCase().startsWith(searchTerm)) return -1;
        if (b.name.toLowerCase().startsWith(searchTerm)) return 1;
        
        // Default sort by name
        return a.name.localeCompare(b.name);
      })
      .slice(0, 15); // Limit to 15 results for performance
    
    console.log(`[SearchAirports] Found ${results.length} results for "${searchTerm}"`);
    if (results.length > 0) {
      console.log('First result:', results[0]);
    }
    
    return results;
  } catch (error) {
    console.error("Error in airport search:", error);
    return [];
  }
}
