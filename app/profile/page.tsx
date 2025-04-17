"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { ProfileOverview } from "@/components/profile-overview"
import { TripHistory } from "@/components/trip-history"
import { AccountSettings } from "@/components/account-settings"
import { LoyaltyProgram } from "@/components/loyalty-program"
import { PaymentMethods } from "@/components/payment-methods"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const isMobile = useMediaQuery("(max-width: 768px)")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <ProfileOverview />
      case "trips":
        return <TripHistory />
      case "settings":
        return <AccountSettings />
      case "loyalty":
        return <LoyaltyProgram />
      case "payment":
        return <PaymentMethods showHeader={true} />
      default:
        return <ProfileOverview />
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile sidebar trigger */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="mb-4 flex items-center gap-2">
                  <Menu size={16} />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                <div className="p-6 overflow-y-auto h-full">
                  <h2 className="text-xl font-bold mb-4">Account Menu</h2>
                  <ProfileSidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab)} />
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <ProfileSidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab)} />
          </div>

          {/* Main content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-6">{renderContent()}</div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
