export interface Airport {
  iata: string
  name: string
  city: string
  state?: string
  country: string
  elevation?: number
  lat?: number
  lon?: number
  tz?: string
}

export interface AirportGroup {
  city: string
  country: string
  airports: Airport[]
}
