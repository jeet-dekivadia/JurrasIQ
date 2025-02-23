import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize the OpenAI client with your API key.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Set a maximum duration (in seconds) for the process.
export const maxDuration = 60

// The API endpoint to handle POST requests.
export async function POST(req: Request) {
  try {
    // Parse the JSON body from the request.
    const site = await req.json()

    // Validate that the site data is an object.
    if (!site || typeof site !== 'object') {
      return NextResponse.json({ error: 'Invalid site data' }, { status: 400 })
    }

    // Expanded prompt with extensive details and sections.
    const prompt = `Generate a comprehensive excavation and financial planning document for this paleontological site:

SITE DETAILS:
- Fossil Type: ${site.fossilType || 'Unknown'}
- Geological Environment: ${site.environment || 'Unknown'}
- Age Range: ${site.age_start || 0} - ${site.age_end || 0} Million Years Ago
- Location: ${site.locationName || 'Unknown Location'}

Create an extremely detailed plan (minimum 5000 words) with the following sections:

# EXECUTIVE SUMMARY
- Project overview
- Key objectives
- Expected outcomes
- Critical success factors

# SITE ANALYSIS & SCIENTIFIC SIGNIFICANCE
- Geological context
- Historical significance
- Research potential
- Expected discoveries
- Scientific value proposition

# FINANCIAL PLANNING
- Total budget estimation
- Cost breakdown:
  * Equipment and machinery
  * Personnel and labor
  * Site infrastructure
  * Transportation and logistics
  * Conservation supplies
  * Documentation technology
  * Insurance and permits
- Funding sources and strategies
- ROI analysis
- Grant opportunities
- Financial risk management

# OPERATIONAL STRATEGY
- Team structure and roles
- Equipment requirements
- Site infrastructure
- Safety protocols
- Conservation methods
- Documentation procedures
- Quality control measures

# PROJECT TIMELINE
- Pre-excavation phase
- Site preparation
- Main excavation phases
- Conservation work
- Post-excavation activities
- Key milestones and deadlines

# RISK ASSESSMENT & MITIGATION
- Safety risks
- Financial risks
- Technical challenges
- Environmental concerns
- Mitigation strategies
- Emergency procedures
- Insurance coverage

# STAKEHOLDER MANAGEMENT
- Academic partnerships
- Local community engagement
- Government relations
- Media communication
- Public outreach

# LONG-TERM IMPACT & SUSTAINABILITY
- Scientific contributions
- Educational opportunities
- Community benefits
- Environmental protection
- Cultural heritage preservation

Format your response using markdown headings (#, ##) and bullet points.
Include specific numbers, timelines, and cost estimates.
Make the plan extremely detailed and professional, suitable for corporate and academic stakeholders.`

    // Call the OpenAI Chat Completion API with the expanded prompt.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class expert consortium combining expertise in paleontology, project management, financial planning, and operations management. Generate an exhaustive, corporate-grade excavation plan with extreme attention to detail."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    // Return the generated plan as a JSON response.
    return NextResponse.json({ 
      plan: completion.choices[0].message.content || 'Failed to generate plan'
    })
  } catch (error) {
    // Log and return any errors encountered during the process.
    console.error('Failed to generate plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate excavation plan' },
      { status: 500 }
    )
  }
}
