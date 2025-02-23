import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { loadFossilData } from '@/lib/load-fossil-data'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const maxDuration = 60 // Set to maximum allowed for hobby plan
export const dynamic = 'force-dynamic';

function calculateProximityScore(location: { lat: number; lng: number }, fossilData: any[]) {
  const MAX_DISTANCE = 500 // km
  let totalScore = 0
  let nearbyFossils = 0

  fossilData.forEach(fossil => {
    const distance = getDistance(
      location.lat,
      location.lng,
      fossil.latitude,
      fossil.longitude
    )
    
    if (distance < MAX_DISTANCE) {
      const score = (1 - distance / MAX_DISTANCE) * fossil.significance
      totalScore += score
      nearbyFossils++
    }
  })

  return {
    score: Math.min(10, nearbyFossils ? (totalScore / nearbyFossils) * 10 : 0),
    nearbyFossils
  }
}

// Haversine formula to calculate distance between two points
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRad(value: number) {
  return value * Math.PI / 180
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a paleontology expert AI. Provide detailed analysis about fossil sites including geological context, excavation potential, and historical significance. Be specific and informative while remaining concise."
        },
        {
          role: "user",
          content: `Analyze this location for fossil potential:
            Location: ${data.locationName || 'Unknown Location'}
            Coordinates: ${data.lat}, ${data.lng}
            Fossil Types: ${data.fossilType || 'Unknown'}
            Environment: ${data.environment || 'Unknown'}
            Age Range: ${data.age_start || 0} - ${data.age_end || 0} million years ago
            
            Provide a comprehensive analysis including:
            1. Geological context and formation history
            2. Expected fossil types and preservation quality
            3. Historical significance of previous finds
            4. Excavation challenges and recommendations
            5. Research potential and scientific value`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    if (!response.choices[0]?.message?.content) {
      throw new Error('No analysis received from AI')
    }

    return NextResponse.json({ 
      analysis: response.choices[0].message.content
    })
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    }, { status: 500 })
  }
} 