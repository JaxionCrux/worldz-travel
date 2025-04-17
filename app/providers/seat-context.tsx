"use client"

import React, { createContext, useState, useContext, ReactNode } from 'react'

// Seat type based on Duffel API
export type SelectedSeat = {
  id: string
  designator: string
  segment_id: string
  price?: number
  is_exit_row?: boolean
  extra_legroom?: boolean
  cabin_class?: {
    name: string
  }
}

type SeatContextType = {
  selectedSeats: Map<string, SelectedSeat>
  addSeat: (segmentId: string, seat: SelectedSeat) => void
  removeSeat: (segmentId: string) => void
  getSeat: (segmentId: string) => SelectedSeat | undefined
  clearSeats: () => void
  getTotalSeatPrice: () => number
}

const SeatContext = createContext<SeatContextType | undefined>(undefined)

export function SeatProvider({ children }: { children: ReactNode }) {
  const [selectedSeats, setSelectedSeats] = useState<Map<string, SelectedSeat>>(new Map())

  // Add or update a seat selection for a specific segment
  const addSeat = (segmentId: string, seat: SelectedSeat) => {
    setSelectedSeats(prev => {
      const newMap = new Map(prev)
      newMap.set(segmentId, seat)
      return newMap
    })
  }

  // Remove a seat selection for a specific segment
  const removeSeat = (segmentId: string) => {
    setSelectedSeats(prev => {
      const newMap = new Map(prev)
      newMap.delete(segmentId)
      return newMap
    })
  }

  // Get a seat selection for a specific segment
  const getSeat = (segmentId: string) => {
    return selectedSeats.get(segmentId)
  }

  // Clear all seat selections
  const clearSeats = () => {
    setSelectedSeats(new Map())
  }

  // Calculate the total price of all selected seats
  const getTotalSeatPrice = () => {
    let total = 0
    selectedSeats.forEach(seat => {
      total += seat.price || 0
    })
    return total
  }

  return (
    <SeatContext.Provider value={{ 
      selectedSeats, 
      addSeat, 
      removeSeat, 
      getSeat, 
      clearSeats,
      getTotalSeatPrice
    }}>
      {children}
    </SeatContext.Provider>
  )
}

export function useSeats() {
  const context = useContext(SeatContext)
  if (context === undefined) {
    throw new Error('useSeats must be used within a SeatProvider')
  }
  return context
} 