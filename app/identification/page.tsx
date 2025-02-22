"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function IdentificationPage() {
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [description, setDescription] = useState("")

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both an image and description",
      })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('description', description)

      const response = await fetch('/api/ai/identify', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Fossil Identification</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Fossil Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>

            <Textarea
              placeholder="Describe the fossil and its finding context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />

            <Button disabled={loading}>
              {loading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Fossil"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 