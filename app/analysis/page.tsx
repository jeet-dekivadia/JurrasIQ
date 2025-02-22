"use client"

import { useState, useEffect } from 'react'
import { ExcavationSiteCard } from '@/components/excavation-site-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(false)

  const searchSites = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/excavation/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
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
          const { details } = await detailsResponse.json()
          return { ...site, details }
        })
      )
      
      setSites(sitesWithDetails)
    } catch (error) {
      console.error('Failed to search sites:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Site Analysis</h1>
      
      <div className="flex gap-2 mb-8">
        <Input
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button 
          onClick={() => searchSites(searchQuery)}
          disabled={loading}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <ExcavationSiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  )
} 