"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const FOSSIL_FAMILIES = [
  "Tyrannosauridae",
  "Ceratopsidae",
  "Hadrosauridae",
  "Allosauridae",
  "Diplodocidae",
  "Stegosauridae",
  // Add more from your dataset
]

const BODY_PARTS = [
  "Skull",
  "Skeleton",
  "Partial skeleton",
  "Femur",
  "Nest with eggs",
  // Add more from your dataset
]

interface MarketPrediction {
  median: number
  lowerBound: number
  upperBound: number
}

export function MarketValue() {
  const [fossilFamily, setFossilFamily] = useState<string>("")
  const [bodyPart, setBodyPart] = useState<string>("")
  const [prediction, setPrediction] = useState<MarketPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePredict = async () => {
    if (!fossilFamily || !bodyPart) {
      toast({
        title: "Missing information",
        description: "Please select both fossil family and body part",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/market/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fossilFamily, bodyPart })
      })

      if (!response.ok) throw new Error('Prediction failed')
      const data = await response.json()
      setPrediction(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get market prediction. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Market Value Estimation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fossil Family</label>
          <Select value={fossilFamily} onValueChange={setFossilFamily}>
            <SelectTrigger>
              <SelectValue placeholder="Select fossil family" />
            </SelectTrigger>
            <SelectContent>
              {FOSSIL_FAMILIES.map(family => (
                <SelectItem key={family} value={family}>
                  {family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Body Part</label>
          <Select value={bodyPart} onValueChange={setBodyPart}>
            <SelectTrigger>
              <SelectValue placeholder="Select body part" />
            </SelectTrigger>
            <SelectContent>
              {BODY_PARTS.map(part => (
                <SelectItem key={part} value={part}>
                  {part}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handlePredict} 
          disabled={isLoading || !fossilFamily || !bodyPart}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <DollarSign className="h-4 w-4 mr-2" />
          )}
          Estimate Value
        </Button>

        {prediction && (
          <div className="mt-4 space-y-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(prediction.median)}
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Value
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>Range:</div>
              <div>
                {formatCurrency(prediction.lowerBound)} - {formatCurrency(prediction.upperBound)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 