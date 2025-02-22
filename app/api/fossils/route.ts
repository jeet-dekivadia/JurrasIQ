import { NextResponse } from 'next/server'
import { loadFossilData } from '@/lib/load-fossil-data'

export async function GET() {
  try {
    const fossilData = loadFossilData()
    
    if (!fossilData || fossilData.length === 0) {
      console.error('No fossil data loaded')
      return NextResponse.json({ error: 'No fossil data available' }, { status: 500 })
    }

    console.log(`Loaded ${fossilData.length} fossil locations`)
    return NextResponse.json(fossilData)
  } catch (error) {
    console.error('Failed to load fossil data:', error)
    return NextResponse.json(
      { error: 'Failed to load fossil data' }, 
      { status: 500 }
    )
  }
} 