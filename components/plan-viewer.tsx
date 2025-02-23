"use client"

import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PlanViewerProps {
  site: any
}

export function PlanViewer({ site }: PlanViewerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleViewPlan = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    
    // Navigate to plan page with site data
    const siteData = encodeURIComponent(JSON.stringify(site))
    router.push(`/plan?site=${siteData}`)
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="absolute top-2 right-2"
      onClick={handleViewPlan}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Create Plan
        </>
      )}
    </Button>
  )
} 