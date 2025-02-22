import { NextResponse } from 'next/server'
import { loadFossilData } from '@/lib/load-fossil-data'

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    
    // Load fossil data from your database/file
    const allSites = loadFossilData()
    
    // Filter sites based on query
    const filteredSites = allSites
      .filter(site => {
        const searchStr = query.toLowerCase()
        return (
          site.location?.toLowerCase().includes(searchStr) ||
          site.fossilType?.toLowerCase().includes(searchStr)
        )
      })
      .slice(0, 5) // Limit to 5 sites
      .map(site => ({
        id: site.id || Math.random().toString(36).substr(2, 9),
        location: {
          city: site.location?.split(',')[0] || 'Unknown City',
          county: site.location?.split(',')[1] || 'Unknown County',
          state: site.location?.split(',')[2] || 'Unknown State',
          coordinates: [site.latitude, site.longitude]
        },
        fossilType: site.fossilType || 'Unknown',
        environment: site.environment || 'Not specified',
        age: {
          start: site.age_start || 0,
          end: site.age_end || 0
        },
        distance: site.distance || 0,
        significance: site.significance || 1
      }))

    return NextResponse.json({ sites: filteredSites })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      { error: 'Failed to search sites' },
      { status: 500 }
    )
  }
} 