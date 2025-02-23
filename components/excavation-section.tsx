"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Layers } from "lucide-react"

export function ExcavationSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-black py-24"
      style={{
        backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-02-22%2003.34.05%20-%20A%20realistic%20depiction%20of%20an%20active%20dinosaur%20fossil%20excavation%20site.%20The%20scene%20includes%20paleontologists%20carefully%20uncovering%20a%20large%20fossilized%20dinosau-NTtXgy9n0cSlVUaELnAue3bro4ijEd.webp)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <motion.div style={{ y, opacity }} className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">AI-Powered Excavation Sites</h2>
          <p className="text-xl text-gray-300">
            Discover prime fossil locations with our advanced AI prediction system
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={feature.title} className="bg-black/40 backdrop-blur-sm border-amber-500/20">
              <CardContent className="p-6">
                <feature.icon className="h-12 w-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

const features = [
  {
    title: "Location Analysis",
    description:
      "AI-powered geological analysis to identify potential fossil sites with highest probability of discovery.",
    icon: MapPin,
  },
  {
    title: "Deep Scanning",
    description: "Advanced LIDAR and ground-penetrating radar integration for precise excavation planning.",
    icon: Search,
  },
  {
    title: "Stratigraphy Mapping",
    description: "Layer-by-layer analysis of geological formations to understand fossil preservation contexts.",
    icon: Layers,
  },
]

