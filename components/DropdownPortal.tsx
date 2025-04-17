"use client"

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface DropdownPortalProps {
  children: React.ReactNode
  isOpen: boolean
  targetId?: string
  positionRef: React.RefObject<HTMLElement | null>
}

export function DropdownPortal({ 
  children, 
  isOpen,
  targetId = 'portal-root',
  positionRef
}: DropdownPortalProps) {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  
  // Create portal container if it doesn't exist
  useEffect(() => {
    let element = document.getElementById(targetId)
    
    if (!element) {
      element = document.createElement('div')
      element.id = targetId
      element.style.position = 'absolute'
      element.style.top = '0'
      element.style.left = '0'
      element.style.width = '100%'
      element.style.zIndex = '9999'
      element.style.pointerEvents = 'none' // Let clicks through when not on dropdown
      document.body.appendChild(element)
    }
    
    setPortalElement(element)
    
    // Clean up
    return () => {
      // Only remove if it's empty when we're done
      if (element && element.childNodes.length === 0) {
        document.body.removeChild(element)
      }
    }
  }, [targetId])
  
  // Update position when open or reference position changes
  useEffect(() => {
    if (isOpen && positionRef.current) {
      const updatePosition = () => {
        const rect = positionRef.current?.getBoundingClientRect()
        if (rect) {
          setPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
          })
        }
      }
      
      updatePosition()
      
      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, positionRef])
  
  if (!isOpen || !portalElement) return null
  
  // Render children into the portal with positioned wrapper
  return createPortal(
    <div 
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        pointerEvents: 'auto', // Make dropdown interactive
        zIndex: 9999
      }}
    >
      {children}
    </div>,
    portalElement
  )
} 