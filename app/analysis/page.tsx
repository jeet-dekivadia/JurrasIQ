"use client"

import { useState } from "react"
import { MapView } from "@/components/map-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)

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
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Site Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Select Location</CardTitle>
          </CardHeader>
          <CardContent>
            <MapView onLocationSelect={handleLocationSelect} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : analysis ? (
              <div className="prose dark:prose-invert">
                <p>{analysis}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Select a location on the map to analyze fossil potential
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 