import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Search, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
          Excavate Smarter.
          <span className="block text-primary">Discover More.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
          Maximize Fossil Value with AI
        </p>

        {/* Three main action buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link href="/analysis">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white min-w-[240px] h-14 text-lg flex items-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Site Analysis Map
            </Button>
          </Link>

          <Link href="/identification">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white min-w-[240px] h-14 text-lg flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Fossil Identification
            </Button>
          </Link>

          <Link href="/market">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white min-w-[240px] h-14 text-lg flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Market Value Prediction
            </Button>
          </Link>
        </div>

        {/* Optional: Add feature highlights below buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto text-left">
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-white/10">
            <MapPin className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Site Analysis</h3>
            <p className="text-gray-300">
              AI-powered analysis of potential excavation sites using geological and historical data.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-white/10">
            <Search className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Smart Identification</h3>
            <p className="text-gray-300">
              Advanced fossil identification using machine learning and expert knowledge.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-white/10">
            <TrendingUp className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Market Insights</h3>
            <p className="text-gray-300">
              Real-time market value predictions based on comprehensive fossil data.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

