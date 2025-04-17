import Link from "next/link"
import { BrandLogo } from "./brand-logo"

export function Footer() {
  return (
    <footer className="bg-indigo-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-1 mb-4">
              <BrandLogo width={42} height={42} isFooter={true} />
              <span className="text-lg font-bold text-white">The Worldz Travel</span>
            </Link>
            <p className="text-indigo-200 mb-4">Book your perfect flight with confidence.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-indigo-200 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-indigo-200 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-indigo-200 hover:text-white transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="text-indigo-200 hover:text-white transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-indigo-200 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-indigo-200 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-indigo-200 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-indigo-200 hover:text-white transition-colors">
                  Booking Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="grid grid-cols-3 gap-2">
              {["Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay", "Bitcoin"].map((method) => (
                <div key={method} className="bg-indigo-800/50 rounded-md p-2 text-xs text-center">
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-indigo-800 mt-8 pt-8 text-center text-indigo-300 text-sm">
          <p>© {new Date().getFullYear()} The Worldz Travel. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
