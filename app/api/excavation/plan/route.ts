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
    Create a detailed excavation plan for the following site. Format your response as a JSON object with these exact keys:
    {
      "project_overview": "Overview text here...",
      "financial_breakdown": "Financial details here...",
      "organizational_structure": "Team structure here...",
      "equipment_logistics": "Equipment details here...",
      "excavation_timeline": "Timeline here...",
      "risk_assessment": "Risks here...",
      "long_term_impact": "Impact details here..."
    }

    Site Details:
    - Fossil Type: ${site.fossilType || 'Unknown'}
    - Environment: ${site.environment || 'Unknown'}
    - Age: ${site.age_start || 0} - ${site.age_end || 0} Mya
    - Location: ${site.locationName || 'Unknown Location'}

    Make sure each section is detailed but concise. Include practical information about budget, 
    team structure, equipment needs, timeline, and risks. Format strictly as JSON.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in excavation planning. Generate detailed plans in valid JSON format with predefined keys."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    })

    let report: any
    try {
      report = JSON.parse(completion.choices[0].message.content)
    } catch (e) {
      throw new Error('Failed to parse AI response as JSON')
    }

    // Validate report structure and provide defaults
    const requiredFields = [
      'project_overview',
      'financial_breakdown',
      'organizational_structure',
      'equipment_logistics',
      'excavation_timeline',
      'risk_assessment',
      'long_term_impact'
    ]

    const validatedReport = requiredFields.reduce((acc, field) => ({
      ...acc,
      [field]: typeof report[field] === 'string' ? report[field] : 'Information not available'
    }), {})

    return NextResponse.json({ report: validatedReport })
  } catch (error) {
    console.error('Failed to generate plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate excavation plan' },
      { status: 500 }
    )
  }
} 
