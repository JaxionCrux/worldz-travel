"use client"

import Image from "next/image"

interface BrandLogoProps {
  width: number
  height: number
  className?: string
  isFooter?: boolean
}

// Increase the default size of the logo for better prominence
// The width and height props will still allow for custom sizing when needed

export function BrandLogo({ width, height, className = "", isFooter = false }: BrandLogoProps) {
  // Calculate slightly larger dimensions (approximately 20% larger)
  const actualWidth = width * 1.2
  const actualHeight = height * 1.2

  return (
    <div className={`relative ${className}`} style={{ width: actualWidth, height: actualHeight }}>
      <Image
        src="/brand-logo.svg"
        alt="The Worldz Travel Logo"
        width={actualWidth}
        height={actualHeight}
        className={`${isFooter ? "invert brightness-0" : ""}`}
        style={{ objectFit: "contain" }}
      />
    </div>
  )
}
