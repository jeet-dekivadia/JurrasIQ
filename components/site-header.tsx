import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold text-amber-500">JurrasIQ</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/excavation" className="text-foreground/60 transition-colors hover:text-foreground">
              Excavation
            </Link>
            <Link href="/analysis" className="text-foreground/60 transition-colors hover:text-foreground">
              Analysis
            </Link>
            <Link href="/market" className="text-foreground/60 transition-colors hover:text-foreground">
              Market
            </Link>
            <Link href="/about" className="text-foreground/60 transition-colors hover:text-foreground">
              About
            </Link>
          </nav>
          <Button variant="ghost" size="icon" className="ml-2">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

