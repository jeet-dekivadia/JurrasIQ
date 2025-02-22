"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Prediction {
  class: string
  probability: number
}

export default function IdentificationPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setSelectedImage(file)
    setPredictions(null)
  }

  const handleAnalyze = async () => {
    if (!imagePreview) return

    setIsLoading(true)
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

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const data = await response.json()
      setPredictions(data.predictions)
    } catch (error) {
      console.error('Analysis failed:', error)
      toast({
        title: "Error",
        description: "Failed to analyze the image. Please try again.",
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

        <Button
          onClick={handleAnalyze}
          disabled={!selectedImage || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Image
            </>
          )}
        </Button>

        {predictions && (
          <div className="space-y-2">
            <h3 className="font-medium">Results:</h3>
            <ul className="space-y-1">
              {predictions.map((pred, i) => (
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