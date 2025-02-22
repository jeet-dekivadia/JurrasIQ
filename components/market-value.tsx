"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MarketPrediction {
  median: number
  lowerBound: number
  upperBound: number
  availableFamilies: string[]
  availableBodyParts: string[]
}

export function MarketValue() {
  const [fossilFamily, setFossilFamily] = useState<string>("")
  const [bodyPart, setBodyPart] = useState<string>("")
  const [prediction, setPrediction] = useState<MarketPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<{
    families: string[]
    bodyParts: string[]
  }>({
    families: [],
    bodyParts: []
  })
  const { toast } = useToast()

  // Load available options when component mounts
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch('/api/market/options')
        if (!response.ok) throw new Error('Failed to load options')
        
        const data = await response.json()
        if (data.error) throw new Error(data.error)
        
        setOptions({
          families: data.families || [],
          bodyParts: data.bodyParts || []
        })
      } catch (error) {
        console.error('Failed to load options:', error)
        toast({
          title: "Error",
          description: "Failed to load fossil options. Please refresh the page.",
          variant: "destructive"
        })
      }
    }

    loadOptions()
  }, [toast])

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

      const text = await response.text()
      if (!text) {
        throw new Error('Empty response received')
      }

      try {
        const data = JSON.parse(text)
        if (data.error) {
          throw new Error(data.error)
        }
        setPrediction(data)
      } catch (e) {
        console.error('JSON parse error:', e, 'Raw text:', text)
        throw new Error('Failed to parse prediction results')
      }
    } catch (error) {
      console.error('Prediction failed:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get market prediction",
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
        <CardDescription>
          Estimate the market value of fossils based on historical data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fossil Family</label>
          <Select value={fossilFamily} onValueChange={setFossilFamily}>
            <SelectTrigger>
              <SelectValue placeholder="Select fossil family" />
            </SelectTrigger>
            <SelectContent>
              {options.families.map(family => (
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
              {options.bodyParts.map(part => (
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
              <div className="flex items-center gap-1">
                Range
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>80% confidence interval based on model predictions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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