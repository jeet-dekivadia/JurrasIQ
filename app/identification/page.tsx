"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Prediction {
  class: string
  probability: number
}

export default function IdentificationPage() {
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [predictions, setPredictions] = React.useState<Prediction[] | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      setError(null)
    }
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive"
      })
    }
    reader.readAsDataURL(file)

    setSelectedImage(file)
    setPredictions(null)
  }

  const handleAnalyze = async () => {
    if (!imagePreview) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/identification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imagePreview
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image')
      }

      setPredictions(data.predictions)
    } catch (error) {
      console.error('Analysis failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze image')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fossil Identification</CardTitle>
        <CardDescription>
          Upload an image of a fossil to identify its type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="cursor-pointer"
          />
        </div>

        {imagePreview && (
          <div className="aspect-square w-full max-w-sm overflow-hidden rounded-lg">
            <img
              src={imagePreview}
              alt="Selected fossil"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!selectedImage || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <React.Fragment>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Image
            </React.Fragment>
          )}
        </Button>

        {predictions && (
          <div className="space-y-2">
            <h3 className="font-medium">Results:</h3>
            <ul className="space-y-1">
              {predictions.map((pred: Prediction, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{pred.class}</span>
                  <span>{pred.probability.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 