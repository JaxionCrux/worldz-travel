"use client"

import { User, Plane, Settings, Award, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function ProfileSidebar({ activeTab, setActiveTab }: ProfileSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Account Overview", icon: User },
    { id: "trips", label: "My Trips", icon: Plane },
    { id: "settings", label: "Account Settings", icon: Settings },
    { id: "loyalty", label: "Loyalty Program", icon: Award },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === item.id
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                : "text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
