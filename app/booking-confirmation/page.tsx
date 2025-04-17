"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingConfirmation } from "@/components/booking-confirmation"

export default function BookingConfirmationPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 pt-20 md:pt-24">
        <h1 className="text-3xl font-bold mb-8">Booking Confirmation</h1>
        <BookingConfirmation />
      </main>

      <Footer />
    </div>
  )
}
