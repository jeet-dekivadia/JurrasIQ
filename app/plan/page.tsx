"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import ReactMarkdown from 'react-markdown'

function PlanContent() {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<string>('')
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
        setPlan(data.plan)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load plan')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [searchParams])

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

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-[60%]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[95%]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{plan}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Loading fallback component
function PlanLoading() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto mt-4" />
      </div>
      <div className="grid gap-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="bg-muted">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function PlanPage() {
  return (
    <Suspense fallback={<PlanLoading />}>
      <PlanContent />
    </Suspense>
  )
} 