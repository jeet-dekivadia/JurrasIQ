"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Database, BarChart3 } from "lucide-react"

export function AISection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden py-24"
      style={{
        backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-02-22%2003.27.41%20-%203.%20A%20prehistoric%20dinosaur%20excavation%20site%20at%20night,%20illuminated%20by%20glowing%20amber%20lights%20embedded%20in%20the%20rocks.%20Paleontologists%20are%20working%20alongside%20A-rG19xjKbL4SYUsCWgtTylEYUwlJn5u.webp)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div style={{ scale, opacity }} className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">AI-Powered Analysis</h2>
          <p className="text-xl text-blue-300">
            Advanced machine learning for precise fossil classification and valuation
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="bg-black/40 border-blue-500/20 hover:border-blue-500/40 transition-colors duration-300"
            >
              <motion.div className="p-6" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="flex items-center justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-300 text-center mb-4">{feature.description}</p>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                  >
                    Explore Feature
                  </Button>
                </div>
              </motion.div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Holographic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,149,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,149,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000,transparent)]" />
    </section>
  )
}

const features = [
  {
    title: "Neural Classification",
    description: "Instant species identification using deep learning models trained on vast fossil databases.",
    icon: Brain,
  },
  {
    title: "Data Analysis",
    description: "Comprehensive analysis of fossil characteristics and preservation quality.",
    icon: Database,
  },
  {
    title: "Market Intelligence",
    description: "Real-time valuation based on global market trends and historical data.",
    icon: BarChart3,
  },
]

