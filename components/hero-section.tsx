"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5
    }
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://4kwallpapers.com/images/wallpapers/allosaurus-dinosaur-rocks-3840x2160-13444.jpg)`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Animated content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="text-center" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Excavate Smarter.</span>
              <span className="block text-amber-400">Discover More.</span>
            </h1>
            <p className="mt-4 text-xl text-gray-300">Maximize Fossil Value with AI</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-x-4"
          >
            <Button
              size="lg"
              className={cn(
                "bg-amber-500 text-white hover:bg-amber-600",
                "transition-all duration-300 hover:scale-105",
                "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
              )}
            >
              Start Exploring Fossils →
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Animated footprints */}
      <div className="absolute bottom-0 left-0 right-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="flex justify-center space-x-16"
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 w-8 bg-amber-500/20 rounded-full transform -rotate-12" />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

