"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Microscope, Map, Database } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Microscope,
      title: "AI-Powered Analysis",
      description: "Instant fossil identification and classification using advanced machine learning algorithms.",
    },
    {
      icon: Map,
      title: "Site Prediction",
      description: "Discover prime excavation locations with our predictive mapping technology.",
    },
    {
      icon: Database,
      title: "Market Intelligence",
      description: "Real-time valuation and market analysis for fossil specimens.",
    },
  ]

  return (
    <section className="py-24 bg-black/95">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Revolutionizing Fossil Discovery</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Combining cutting-edge AI technology with traditional paleontology
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="bg-black/40 border-amber-500/20">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-amber-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

