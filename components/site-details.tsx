import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SiteDetailsProps {
  site: any;
  onClose: () => void;
}

export function SiteDetails({ site, onClose }: SiteDetailsProps) {
  const [expandedAnalysis, setExpandedAnalysis] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getDetailedAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analyze_location',
          data: {
            lat: site.latitude,
            lng: site.longitude,
            fossilType: site.fossilType,
            environment: site.environment,
            age_start: site.age_start,
            age_end: site.age_end,
            locationName: site.locationName
          }
        })
      })

      const data = await response.json()
      setExpandedAnalysis(data.analysis)
    } catch (error) {
      console.error('Failed to get detailed analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{site.locationName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Location Details</h4>
            <p className="text-sm">Coordinates: {site.latitude}, {site.longitude}</p>
            <p className="text-sm">Distance: {site.distance?.toFixed(2)} km</p>
          </div>
          <div>
            <h4 className="font-medium">Geological Info</h4>
            <p className="text-sm">Age: {site.age_start} - {site.age_end} Mya</p>
            <p className="text-sm">Environment: {site.environment}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Fossil Types</h4>
          <p className="text-sm">{site.fossilType}</p>
        </div>

        {!expandedAnalysis && (
          <Button
            onClick={getDetailedAnalysis}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Get Detailed Analysis'
            )}
          </Button>
        )}

        {expandedAnalysis && (
          <div className="space-y-2">
            <h4 className="font-medium">Detailed Analysis</h4>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-sm">{expandedAnalysis}</p>
            </div>
          </div>
        )}

        <Button variant="outline" onClick={onClose} className="mt-4">
          Close Details
        </Button>
      </CardContent>
    </Card>
  )
} 