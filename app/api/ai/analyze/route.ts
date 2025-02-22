import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { loadFossilData } from '@/lib/load-fossil-data'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
    score: nearbyFossils ? (totalScore / nearbyFossils) * 10 : 0,
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
          content: "You are a paleontology expert AI. Analyze the given location data and provide insights about potential fossil deposits. Be specific and concise."
        },
        {
          role: "user",
          content: `Analyze this location for fossil potential:
            Location: ${JSON.stringify(data)}
            Proximity Score: ${score.toFixed(2)}/10
            Nearby Fossil Sites: ${nearbyFossils}
            
            Provide a brief analysis of the excavation potential at this location.`
        }
      ],
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