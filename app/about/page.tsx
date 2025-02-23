import type { NextPage } from 'next'
import React from 'react'

export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-6 md:px-12 lg:px-24">
      
      {/* Header Section */}
      <h1 className="text-5xl font-extrabold text-center text-amber-500 mb-6">
        About JurrasIQ
      </h1>
      <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
        JurrasIQ is revolutionizing fossil discovery and analysis through cutting-edge AI technology.
      </p>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-12 mt-12">

        {/* Mission Section */}
        <div className="bg-black/50 backdrop-blur-md p-8 rounded-lg shadow-lg border border-amber-500/20">
          <h2 className="text-3xl font-bold text-amber-400 mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            We're dedicated to advancing paleontology by combining artificial intelligence with 
            traditional excavation methods. Our platform helps researchers, collectors, and 
            enthusiasts maximize their fossil discovery potential while ensuring scientific accuracy.
          </p>
        </div>

        {/* Technology Section */}
        <div className="bg-black/50 backdrop-blur-md p-8 rounded-lg shadow-lg border border-amber-500/20">
          <h2 className="text-3xl font-bold text-amber-400 mb-4">Technology</h2>
          <p className="text-gray-300 leading-relaxed">
            Using advanced machine learning algorithms and comprehensive geological data analysis, 
            JurrasIQ provides unprecedented accuracy in fossil site prediction and specimen identification.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-amber-400 mb-4">Contact Us</h2>
        <p className="text-lg text-gray-300 leading-relaxed">
          For inquiries about our platform or partnership opportunities, reach out to us at:
        </p>
        <p className="text-xl text-amber-300 font-semibold mt-2">
          Email: <a href="mailto:jdekivadia3@gatech.edu" className="hover:underline">jdekivadia3@gatech.edu</a>
        </p>
        <p className="text-xl text-amber-300 font-semibold">
          Phone: 678-998-1234
        </p>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-gray-400 text-sm">
        Built by JurrasIQ. The AI-Powered Fossil Discovery Platform.
      </div>

    </div>
  )
}
