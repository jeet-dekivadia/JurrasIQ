"use client"

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PlanViewerProps {
  site: {
    locationName: string;
    latitude: number;
    longitude: number;
    fossilType: string;
    environment: string;
    age_start: number;
    age_end: number;
  }
}

export function PlanViewer({ site }: PlanViewerProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const handleViewPlan = (e: React.MouseEvent<HTMLButtonElement>) => {
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
        <React.Fragment>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </React.Fragment>
      ) : (
        <React.Fragment>
          <FileText className="mr-2 h-4 w-4" />
          Create Plan
        </React.Fragment>
      )}
    </Button>
  )
} 