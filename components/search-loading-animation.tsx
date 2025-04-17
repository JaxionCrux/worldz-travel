"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plane, Globe, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function SearchLoadingAnimation() {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Searching for the best flights")

  // Simulate progress and update loading text
  useEffect(() => {
    const texts = [
      "Searching for the best flights",
      "Checking multiple airlines",
      "Finding the best deals",
      "Optimizing routes",
      "Almost there",
    ]

    let interval: NodeJS.Timeout
    let textInterval: NodeJS.Timeout

    // Progress animation
    interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down progress as it gets closer to 100
        const increment = Math.max(1, 10 - Math.floor(prev / 10))
        const newProgress = Math.min(95, prev + increment)
        return newProgress
      })
    }, 300)

    // Text animation
    let textIndex = 0
    textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length
      setLoadingText(texts[textIndex])
    }, 3000)

    return () => {
      clearInterval(interval)
      clearInterval(textInterval)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Flight path animation */}
        <div className="relative h-40 mb-8">
          <motion.div
            className="absolute top-1/2 left-0 transform -translate-y-1/2"
            animate={{
              x: ["0%", "100%"],
              y: [0, -20, 0, 20, 0],
            }}
            transition={{
              x: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              y: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-indigo-100/50"
              />
              <Plane className="h-8 w-8 text-indigo-600 transform rotate-90" />
            </div>
          </motion.div>

          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Globe className="h-16 w-16 text-indigo-400/50" />
          </motion.div>

          {/* Flight path */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150">
            <motion.path
              d="M 0,75 C 100,30 300,120 400,75"
              fill="transparent"
              stroke="rgba(99, 102, 241, 0.2)"
              strokeWidth="2"
              strokeDasharray="5,5"
              animate={{
                strokeDashoffset: [0, -1000],
              }}
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          </svg>
        </div>

        {/* Loading text */}
        <motion.h3
          className="text-xl font-bold text-indigo-700 mb-3"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          {loadingText}
        </motion.h3>

        <p className="text-gray-500 mb-6">We're searching across hundreds of airlines to find your perfect flight</p>

        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={progress} className="h-2 bg-indigo-100" />
        </div>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1 text-indigo-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Please wait while we find the best options for you</span>
        </div>

        {/* Fun facts */}
        <motion.div
          className="mt-8 p-4 bg-indigo-50 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h4 className="font-medium text-indigo-800 mb-2">Did you know?</h4>
          <p className="text-sm text-indigo-700">
            The average commercial airplane flies at an altitude of 35,000 feet (10,668 meters) and at a speed of about
            575 mph (925 km/h).
          </p>
        </motion.div>
      </div>
    </div>
  )
}
