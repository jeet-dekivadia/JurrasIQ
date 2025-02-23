"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock, FileText, Users, Wrench } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

  const site = searchParams.get('site') ? JSON.parse(decodeURIComponent(searchParams.get('site')!)) : null

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Excavation Plan</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive Analysis & Operational Strategy
        </p>
        {site && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">Fossil Type</p>
                  <p className="text-sm text-muted-foreground">{site.fossilType}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">Age Range</p>
                  <p className="text-sm text-muted-foreground">
                    {site.age_start} - {site.age_end} Mya
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Wrench className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">Environment</p>
                  <p className="text-sm text-muted-foreground">{site.environment}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Card className="overflow-hidden max-w-5xl mx-auto">
        <CardContent className="p-8">
          {loading ? (
            <div className="space-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-8 w-[40%]" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[90%]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <article className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold border-b pb-2 mb-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-medium mt-6 mb-3" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-4 list-disc pl-6" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-4 list-decimal pl-6" {...props} />,
                  li: ({node, ...props}) => <li className="mt-2" {...props} />,
                  p: ({node, ...props}) => <p className="my-4 leading-relaxed" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-primary/20 pl-4 italic my-6" {...props} />
                  ),
                }}
              >
                {plan}
              </ReactMarkdown>
            </article>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PlanLoading() {
  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      <div className="text-center max-w-3xl mx-auto">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto mt-4" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-muted/5">
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Card className="overflow-hidden max-w-5xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-8 w-[40%]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-4 w-[90%]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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