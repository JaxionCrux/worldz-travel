import type React from "react"
import { Nunito_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SeatProvider } from "@/app/providers/seat-context"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata = {
  title: "The Worldz Travel - Book flights. Pay later.",
  description: "Book your perfect flight with confidence.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://flagcdn.com" />
      </head>
      <body className={nunitoSans.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SeatProvider>
            {children}
          </SeatProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'