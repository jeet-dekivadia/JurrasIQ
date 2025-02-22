import { NextResponse } from 'next/server'
import { IdentificationService } from '@/lib/identification-service'

const identificationService = new IdentificationService()

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }
    
    const predictions = await identificationService.identify(imageUrl)
    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Identification failed:', error)
    return NextResponse.json(
      { error: 'Failed to identify fossil' },
      { status: 500 }
    )
  }
} 