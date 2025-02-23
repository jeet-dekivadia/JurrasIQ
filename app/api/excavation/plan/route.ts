import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const maxDuration = 300 // Increase timeout

export async function POST(req: Request) {
  try {
    const site = await req.json()

    if (!site || typeof site !== 'object') {
      return NextResponse.json({ error: 'Invalid site data' }, { status: 400 })
    }

    const prompt = `
    Generate a detailed financial and organizational overview for an archaeological excavation project.
    Format the response as a JSON object with the following keys:
    - project_overview
    - financial_breakdown
    - organizational_structure
    - equipment_logistics
    - excavation_timeline
    - risk_assessment
    - long_term_impact

    Site Details:
    - Fossil Type: ${site.fossilType || 'Unknown'}
    - Environment: ${site.environment || 'Unknown'}
    - Estimated Age: ${site.age_start || 0} - ${site.age_end || 0} million years ago
    - Location: ${site.locationName || 'Unknown Location'}
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in excavation planning and cost analysis. Generate detailed, realistic plans in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
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
