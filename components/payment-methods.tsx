import { useMediaQuery } from "@/hooks/use-media-query"

export function PaymentMethods() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  const paymentMethods = [
    { name: "Klarna", logo: "/placeholder.svg?height=40&width=80" },
    { name: "Mastercard", logo: "/placeholder.svg?height=40&width=80" },
    { name: "PayPal", logo: "/placeholder.svg?height=40&width=80" },
    { name: "Sezzle", logo: "/placeholder.svg?height=40&width=80" },
    { name: "Tamara", logo: "/placeholder.svg?height=40&width=80" },
    { name: "Tether", logo: "/placeholder.svg?height=40&width=80" },
    { name: "Visa", logo: "/placeholder.svg?height=40&width=80" },
    { name: "Zip", logo: "/placeholder.svg?height=40&width=80" },
    { name: "Affirm", logo: "/placeholder.svg?height=40&width=80" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {paymentMethods.map((method) => (
          <div key={method.name} className="flex items-center justify-center">
            <img
              src={method.logo || "/placeholder.svg"}
              alt={method.name}
              className={`${isMobile ? "h-6" : "h-8 md:h-10"} opacity-80 hover:opacity-100 transition-opacity`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
