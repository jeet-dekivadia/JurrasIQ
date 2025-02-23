import { Button } from "@/components/ui/button"
import { Search, Microscope, LineChart } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background to-background z-0" />
        
        {/* Main Content */}
        <div className="relative z-10 text-center space-y-16 px-4">
          {/* Logo/Title */}
          <div className="space-y-6">
            <h1 className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
              JurrasIQ
            </h1>
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold">
                Excavate Smarter.
              </h2>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-600">
                Discover More.
              </p>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Maximize Fossil Value with AI
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/analysis">
              <Button size="lg" className="min-w-[240px] h-14 text-lg gap-3 bg-primary/90 hover:bg-primary">
                <Search className="w-5 h-5" />
                Site Analysis Map
              </Button>
            </Link>
            <Link href="/identify">
              <Button size="lg" className="min-w-[240px] h-14 text-lg gap-3 bg-primary/90 hover:bg-primary">
                <Microscope className="w-5 h-5" />
                Fossil Identification
              </Button>
            </Link>
            <Link href="/market">
              <Button size="lg" className="min-w-[240px] h-14 text-lg gap-3 bg-primary/90 hover:bg-primary">
                <LineChart className="w-5 h-5" />
                Market Value Prediction
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">About JurrasIQ</h2>
            <p className="text-lg text-muted-foreground">
              JurrasIQ is an advanced AI-powered platform revolutionizing paleontological excavation. 
              Our system combines cutting-edge artificial intelligence with comprehensive geological data 
              to help researchers, collectors, and institutions maximize the value and success of their 
              fossil excavation projects.
            </p>
            <div className="grid md:grid-cols-3 gap-8 pt-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Smart Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced AI algorithms analyze geological data to identify promising excavation sites
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Precise Identification</h3>
                <p className="text-muted-foreground">
                  State-of-the-art image recognition for accurate fossil classification
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Market Intelligence</h3>
                <p className="text-muted-foreground">
                  Real-time market analysis and value prediction for discovered specimens
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

