import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { loadFossilData } from '@/lib/load-fossil-data'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const maxDuration = 60; // 60 seconds max for hobby plan
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

    if (type !== 'analyze_location') {
      return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }

    const fossilData = loadFossilData()
    const { score, nearbyFossils } = calculateProximityScore(data, fossilData)

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a paleontology expert AI. Provide detailed analysis about fossil sites including geological context, excavation potential, and historical significance. Be specific and informative while remaining concise."
        },
        {
          role: "user",
          content: `Analyze this location for fossil potential:
            Location: ${data.locationName}
            Coordinates: ${data.lat}, ${data.lng}
            Fossil Types: ${data.fossilType}
            Environment: ${data.environment}
            Age Range: ${data.age_start} - ${data.age_end} million years ago
            
            Provide a comprehensive analysis including:
            1. Geological context and formation history
            2. Expected fossil types and preservation quality
            3. Historical significance of previous finds
            4. Excavation challenges and recommendations
            5. Research potential and scientific value`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return NextResponse.json({ 
      analysis: response.choices[0].message.content,
      score,
      nearbyFossils
    })
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
} 