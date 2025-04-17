import { Star } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

export function TrustpilotRating() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="flex flex-col items-center">
      {isMobile ? (
        <div className="trustpilot-mobile">
          <div className="text-center mb-2">
            <p className="trustpilot-text text-gray-800">Trusted by 100,000+ customers every year</p>
          </div>

          <div className="flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="trustpilot-stars">
                  <Star className="trustpilot-star" />
                </div>
              ))}
            </div>
            <div className="ml-2 flex items-center">
              <span className="text-gray-800 font-medium text-sm">25,059 reviews on</span>
              <div className="ml-1">
                <Star className="w-4 h-4 trustpilot-logo" />
              </div>
              <span className="text-gray-800 font-medium text-sm ml-1">Trustpilot</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-2">
            <p className="text-gray-800 text-base">Trusted by 100,000+ customers every year</p>
          </div>

          <div className="flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="trustpilot-stars">
                  <Star className="trustpilot-star" />
                </div>
              ))}
            </div>
            <div className="ml-2 flex items-center">
              <span className="text-gray-800 font-medium text-base">25,059 reviews on</span>
              <div className="ml-1">
                <Star className="w-4 h-4 trustpilot-logo" />
              </div>
              <span className="text-gray-800 font-medium text-base ml-1">Trustpilot</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
