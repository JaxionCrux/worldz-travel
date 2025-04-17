import { type NextRequest, NextResponse } from "next/server"
import { airports } from "@/lib/airports-data"
import { fuzzyMatch } from "@/lib/fuzzy-match"

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

  // Search airports by name, city, or IATA code
  const results = Object.values(airports)
    .filter((airport) => {
      const nameScore = fuzzyMatch(airport.name, query)
      const cityScore = fuzzyMatch(airport.city, query)
      const iataScore = fuzzyMatch(airport.iata, query)

      // Return airports with a score above threshold
      return Math.max(nameScore, cityScore, iataScore) > 20
    })
    .sort((a, b) => {
      // Sort by best match
      const aNameScore = fuzzyMatch(a.name, query)
      const aCityScore = fuzzyMatch(a.city, query)
      const aIataScore = fuzzyMatch(a.iata, query)
      const aMaxScore = Math.max(aNameScore, aCityScore, aIataScore)

      const bNameScore = fuzzyMatch(b.name, query)
      const bCityScore = fuzzyMatch(b.city, query)
      const bIataScore = fuzzyMatch(b.iata, query)
      const bMaxScore = Math.max(bNameScore, bCityScore, bIataScore)

      return bMaxScore - aMaxScore
    })
    .slice(0, 20) // Limit to 20 results for performance

  return NextResponse.json({
    success: true,
    airports: results,
  })
}
