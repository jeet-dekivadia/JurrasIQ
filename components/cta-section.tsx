"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-02-22%2003.27.41%20-%203.%20A%20prehistoric%20dinosaur%20excavation%20site%20at%20night,%20illuminated%20by%20glowing%20amber%20lights%20embedded%20in%20the%20rocks.%20Paleontologists%20are%20working%20alongside%20A-rG19xjKbL4SYUsCWgtTylEYUwlJn5u.webp)`,
          filter: "brightness(0.3)",
        }}
      />

      <div className="relative z-10 container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Fossil Discovery?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the future of paleontology with JurrasIQ's AI-powered platform
          </p>
        </motion.div>
      </div>

      {/* Holographic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,149,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,149,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000,transparent)]" />
    </section>
  )
}

