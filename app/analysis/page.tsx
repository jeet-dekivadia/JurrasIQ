"use client"

import { useState } from 'react'
import { ExcavationSiteCard } from '@/components/excavation-site-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchSites = async (query: string) => {
    if (!query.trim()) return
    
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/excavation/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error('Failed to search sites')
      }

      const data = await response.json()
      
      // Get detailed information for each site
      const sitesWithDetails = await Promise.all(
        data.sites.map(async (site: any) => {
          const detailsResponse = await fetch('/api/excavation/details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: site.location.coordinates[0],
              longitude: site.location.coordinates[1],
              fossilType: site.fossilType,
              age: site.age.start
            })
          })
          if (!detailsResponse.ok) {
            throw new Error('Failed to get site details')
          }
          const { details } = await detailsResponse.json()
          return { ...site, details }
        })
      )
      
      setSites(sitesWithDetails)
    } catch (error) {
      console.error('Failed to search sites:', error)
      setError('Failed to search excavation sites')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchSites(searchQuery)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Site Analysis</h1>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button 
          type="submit"
          disabled={loading || !searchQuery.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <ExcavationSiteCard key={site.id} site={site} />
        ))}
      </div>

      {!loading && sites.length === 0 && searchQuery && (
        <p className="text-center text-muted-foreground">
          No excavation sites found for "{searchQuery}"
        </p>
      )}
    </div>
  )
} 