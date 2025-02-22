"use client"

import { useState } from "react"
import MapView from "../../src/components/map-view"
import { Card, CardContent, CardHeader, CardTitle } from "../../src/components/ui/card"
import { Loader2 } from "lucide-react"

interface AnalysisResult {
  analysis: string;
  score: number;
  nearbyFossils: number;
}

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'analyze_location',
          data: location
        }),
      })
      
      const data = await response.json()
      if (response.ok) {
        setResult(data)
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-4 space-y-6">
      <h1 className="text-4xl font-bold">Site Analysis</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Interactive Fossil Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0 min-h-[80vh]">
            <MapView onLocationSelect={handleLocationSelect} />
          </CardContent>
        </Card>

        {(loading || result) && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : result && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Potential Score</div>
                      <div className="text-2xl font-bold">{result.score.toFixed(1)}/10</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Nearby Sites</div>
                      <div className="text-2xl font-bold">{result.nearbyFossils}</div>
                    </div>
                  </div>
                  <div className="prose dark:prose-invert">
                    <p>{result.analysis}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 