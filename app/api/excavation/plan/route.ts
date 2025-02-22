import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const site = await req.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in excavation planning and cost analysis."
        },
        {
          role: "user",
          content: `Generate a detailed excavation plan for:
            Location: ${site.location}
            Fossil Type: ${site.fossilType}
            Environment: ${site.environment}
            Age: ${site.age} million years
            Distance: ${site.distance}km
            
            Include:
            1. Estimated costs
            2. Required equipment
            3. Team composition
            4. Timeline
            5. Risk assessment
            6. Expected outcomes
            7. Financial projections
            
            Format as a structured JSON object.`
        }
      ],
      response_format: { type: "json_object" }
    })

    const plan = JSON.parse(response.choices[0].message.content)

    return NextResponse.json({ report: plan })
  } catch (error) {
    console.error('Failed to generate plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate excavation plan' },
      { status: 500 }
    )
  }
} 