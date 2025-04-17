"use server"

import { getAirports } from "@/lib/duffel"

export async function searchAirports(query: string) {
  if (!query || query.length < 2) return []

  try {
    const response = await getAirports(query)
    return response.data || []
  } catch (error) {
    console.error("Error searching airports:", error)
    return []
  }
}
