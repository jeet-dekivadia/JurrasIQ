import type { NextPage } from 'next'
import React from 'react'

const AboutPage: NextPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">About JurrasIQ</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-xl mb-8">
          JurrasIQ is revolutionizing fossil discovery and analysis through cutting-edge AI technology.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p>
              We're dedicated to advancing paleontology by combining artificial intelligence with 
              traditional excavation methods. Our platform helps researchers, collectors, and 
              enthusiasts maximize their fossil discovery potential while ensuring scientific accuracy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Technology</h2>
            <p>
              Using advanced machine learning algorithms and comprehensive geological data analysis, 
              JurrasIQ provides unprecedented accuracy in fossil site prediction and specimen 
              identification.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p>
            For inquiries about our platform or partnership opportunities, reach out to us at:
            <br />
            Email: jdekivadia3@gatech.edu
            <br />
            Phone: 678-998-1234
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage 