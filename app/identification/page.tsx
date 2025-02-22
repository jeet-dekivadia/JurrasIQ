"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AnalysisResponse {
  analysis: string;
  error?: string;
  details?: string;
}

export default function IdentificationPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      toast({
        title: "File too large",
        description: "Please select an image under 20MB",
        variant: "destructive"
      })
      return
    }

    // Preview image
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setSelectedImage(file)
    setAnalysis(null)
  }

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedImage)

      const response = await fetch('/api/ai/identify', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to analyze image')
      }

      if (!data.analysis) {
        throw new Error('No analysis received')
      }

      setAnalysis(data.analysis)
      toast({
        title: "Analysis Complete",
        description: "Your fossil has been analyzed successfully!",
      })

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze the image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-4 space-y-6">
      <h1 className="text-4xl font-bold">Fossil Identification</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Fossil Image</CardTitle>
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
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <img
                  src={imagePreview}
                  alt="Selected fossil"
                  className="object-cover"
                />
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
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
                  Analyze Fossil
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {(isLoading || analysis) && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : analysis && (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{analysis}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 