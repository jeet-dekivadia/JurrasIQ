"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock, DollarSign, HardHat, LineChart, Shield, Target, Truck } from "lucide-react"

interface PlanSection {
  title: string
  content: string
  icon: React.ComponentType<any>
}

export default function PlanPage() {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const siteData = searchParams.get('site')
    if (!siteData) {
      setError('No site data provided')
      setLoading(false)
      return
    }

    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/excavation/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: siteData
        })

        const data = await response.json()
        if (data.error) throw new Error(data.error)
        setPlan(data.report)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load plan')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [searchParams])

  const sections: PlanSection[] = [
    { title: "Project Overview", content: plan?.project_overview || '', icon: Target },
    { title: "Financial Breakdown", content: plan?.financial_breakdown || '', icon: DollarSign },
    { title: "Organizational Structure", content: plan?.organizational_structure || '', icon: HardHat },
    { title: "Equipment & Logistics", content: plan?.equipment_logistics || '', icon: Truck },
    { title: "Excavation Timeline", content: plan?.excavation_timeline || '', icon: Clock },
    { title: "Risk Assessment", content: plan?.risk_assessment || '', icon: Shield },
    { title: "Long-Term Impact", content: plan?.long_term_impact || '', icon: LineChart }
  ]

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Excavation Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A comprehensive analysis and operational plan for the excavation site
        </p>
      </div>

      <div className="grid gap-6">
        {sections.map((section, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-muted">
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  {section.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 