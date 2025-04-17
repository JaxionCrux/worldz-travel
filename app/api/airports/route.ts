import { type NextRequest, NextResponse } from "next/server"
import { airports } from "@/lib/airports-data"
import { fuzzyMatch } from "@/lib/fuzzy-match"

// Cache for frequently searched queries
const searchCache = new Map<string, any[]>();
// City groups mapping - airport codes that represent city groups
const cityGroups = new Set([
  'NYC', 'CHI', 'DTT', 'WAS', 'YTO', 'YMQ', 'LON', 'PAR', 
  'ROM', 'MIL', 'STO', 'BUH', 'IZM', 'MOW', 'BJS', 'SEL', 
  'BUE', 'RIO', 'OSA', 'TYO', 'JKT', 'REK', 'EAP', 'MMA'
]);

// Helper function to identify if an airport belongs to a city group
function findCityGroup(airport: { city: string; country: string }): string | undefined {
  // Create a key from city and country
  const cityKey = `${airport.city}-${airport.country}`;
  
  // Check if we already have a mapping for this city
  return Object.keys(airports).find(code => {
    const groupAirport = airports[code];
    if (cityGroups.has(code) && 
        groupAirport.city === airport.city && 
        groupAirport.country === airport.country) {
      return true;
    }
    return false;
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query || query.length < 2) {
    return NextResponse.json({
      success: false,
      message: "Query must be at least 2 characters",
      airports: [],
    })
  }

  // Check cache first for this query
  const cacheKey = query.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return NextResponse.json({
      success: true,
      airports: searchCache.get(cacheKey),
      cached: true
    });
  }

  // Track potential city groups found during search
  const cityGroupsFound = new Map();
  
  // Search airports by name, city, or IATA code
  let results = Object.values(airports)
    .filter((airport) => {
      // Skip city group codes in the initial search
      if (cityGroups.has(airport.iata)) {
        return false;
      }
      
      const nameScore = fuzzyMatch(airport.name, query)
      const cityScore = fuzzyMatch(airport.city, query)
      const iataScore = fuzzyMatch(airport.iata, query)
      const stateScore = airport.state ? fuzzyMatch(airport.state, query) : 0

      // Track city groups
      if (cityScore > 40 || nameScore > 40) {
        const cityGroupCode = findCityGroup(airport);
        if (cityGroupCode) {
          // Store the highest match score for this city group
          const currentScore = cityGroupsFound.get(cityGroupCode) || 0;
          const newScore = Math.max(nameScore, cityScore, iataScore, stateScore);
          if (newScore > currentScore) {
            cityGroupsFound.set(cityGroupCode, newScore);
          }
        }
      }

      // Return airports with a score above threshold - lower threshold for better results
      return Math.max(nameScore, cityScore, iataScore, stateScore) > 15
    })
    .sort((a, b) => {
      // Sort by best match
      const aNameScore = fuzzyMatch(a.name, query)
      const aCityScore = fuzzyMatch(a.city, query)
      const aIataScore = fuzzyMatch(a.iata, query)
      const aStateScore = a.state ? fuzzyMatch(a.state, query) : 0
      const aMaxScore = Math.max(aNameScore, aCityScore, aIataScore, aStateScore)

      const bNameScore = fuzzyMatch(b.name, query)
      const bCityScore = fuzzyMatch(b.city, query)
      const bIataScore = fuzzyMatch(b.iata, query)
      const bStateScore = b.state ? fuzzyMatch(b.state, query) : 0
      const bMaxScore = Math.max(bNameScore, bCityScore, bIataScore, bStateScore)

      return bMaxScore - aMaxScore
    })
    .slice(0, 25) // Increase limit slightly for better coverage

  // Add relevant city groups to the results
  if (cityGroupsFound.size > 0) {
    const cityGroupResults = [...cityGroupsFound.entries()]
      .sort((a, b) => b[1] - a[1]) // Sort by score descending
      .map(([code]) => airports[code])
      .filter(airport => !!airport);

    // Prepend city groups at the top of results
    results = [...cityGroupResults, ...results];
  }

  // Cache the results (keep only top 30 entries in the cache)
  if (searchCache.size >= 30) {
    // Delete oldest entry (first item in the map)
    const oldestKey = Array.from(searchCache.keys())[0];
    searchCache.delete(oldestKey);
  }
  
  // Store in cache
  searchCache.set(cacheKey, results.slice(0, 20));

  return NextResponse.json({
    success: true,
    airports: results.slice(0, 20), // Still limit to 20 final results
  })
}
