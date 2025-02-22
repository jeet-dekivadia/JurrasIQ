import { NextResponse } from 'next/server'
import { loadFossilData } from '@/lib/load-fossil-data'

export async function GET() {
  try {
    const fossilData = loadFossilData()
    return NextResponse.json(fossilData)
  } catch (error) {
    console.error('Failed to load fossil data:', error)
    return NextResponse.json({ error: 'Failed to load fossil data' }, { status: 500 })
  }
} 