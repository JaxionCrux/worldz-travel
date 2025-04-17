import Link from "next/link"
import { useMediaQuery } from "@/hooks/use-media-query"
import { BrandLogo } from "./brand-logo"

export function Header() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <header className="sticky top-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo - Mobile & Desktop with adjusted spacing */}
        <Link href="/" className="flex items-center">
          <BrandLogo width={isMobile ? 42 : 48} height={isMobile ? 42 : 48} />
          <div className="flex items-center -ml-1">
            <span className="text-lg font-bold text-gray-800 truncate brand-name">The Worldz Travel</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center bg-gray-800/20 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
              <img src="https://flagcdn.com/w40/us.png" alt="USD" className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-800 font-medium">USD</span>
          </div>

          <button className="text-gray-800 font-medium hover:underline">Manage booking</button>

          <button className="border border-gray-800 rounded-full px-5 py-1.5 text-gray-800 font-medium">Menu</button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <div className="flex items-center bg-gray-800/20 backdrop-blur-sm rounded-full px-3 py-1.5 mr-3">
            <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
              <img src="https://flagcdn.com/w40/us.png" alt="USD" className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-800 font-medium">USD</span>
          </div>

          <button className="w-12 h-12 border border-gray-800 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="#1f2937"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
