import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const maxDuration = 60 // Set to maximum allowed for hobby plan

export async function POST(req: Request) {
  try {
    const site = await req.json()

    if (!site || typeof site !== 'object') {
      return NextResponse.json({ error: 'Invalid site data' }, { status: 400 })
    }

    const prompt = `
    Generate a concise but detailed excavation plan as a JSON object with these keys:
    project_overview, financial_breakdown, organizational_structure, equipment_logistics, 
    excavation_timeline, risk_assessment, long_term_impact.

    Site Details:
    - Fossil Type: ${site.fossilType || 'Unknown'}
    - Environment: ${site.environment || 'Unknown'}
    - Age: ${site.age_start || 0} - ${site.age_end || 0} Mya
    - Location: ${site.locationName || 'Unknown Location'}

    Keep each section focused and precise. Include key details about budget, 
    team structure, equipment needs, timeline, and risks.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert in excavation planning. Generate concise, practical plans in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500 // Reduced to get faster responses
    })

    const report = JSON.parse(completion.choices[0].message.content)
    
    // Validate report structure
    const requiredFields = [
      'project_overview',
      'financial_breakdown',
      'organizational_structure',
      'equipment_logistics',
      'excavation_timeline',
      'risk_assessment',
      'long_term_impact'
    ]

    if (!requiredFields.every(field => typeof report[field] === 'string')) {
      throw new Error('Invalid report format received from AI')
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Failed to generate plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate excavation plan' },
      { status: 500 }
    )
  }
} 
