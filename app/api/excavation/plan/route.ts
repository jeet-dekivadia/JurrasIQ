import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const site = await req.json()

    if (!site || typeof site !== 'object') {
      return NextResponse.json({ error: 'Invalid site data' }, { status: 400 })
    }

    const prompt = `Generate a comprehensive excavation and financial planning document for this paleontological site:

SITE DETAILS:
- Fossil Type: ${site.fossilType || 'Unknown'}
- Geological Environment: ${site.environment || 'Unknown'}
- Age Range: ${site.age_start || 0} - ${site.age_end || 0} Million Years Ago
- Location: ${site.locationName || 'Unknown Location'}

Please provide an extremely detailed plan (minimum 5000 words) with the following sections:

1. EXECUTIVE SUMMARY
- Project overview
- Key objectives
- Expected outcomes
- Critical success factors

2. SITE ANALYSIS & SCIENTIFIC SIGNIFICANCE
- Geological context
- Historical significance
- Research potential
- Expected discoveries
- Scientific value proposition

3. FINANCIAL PLANNING
- Total budget estimation
- Cost breakdown
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

4. OPERATIONAL STRATEGY
- Team structure and roles
- Equipment requirements
- Site infrastructure
- Safety protocols
- Conservation methods
- Documentation procedures
- Quality control measures

5. PROJECT TIMELINE
- Pre-excavation phase
- Site preparation
- Main excavation phases
- Conservation work
- Post-excavation activities
- Key milestones and deadlines

6. RISK ASSESSMENT & MITIGATION
- Safety risks
- Financial risks
- Technical challenges
- Environmental concerns
- Mitigation strategies
- Emergency procedures
- Insurance coverage

7. STAKEHOLDER MANAGEMENT
- Academic partnerships
- Local community engagement
- Government relations
- Media communication
- Public outreach

8. LONG-TERM IMPACT & SUSTAINABILITY
- Scientific contributions
- Educational opportunities
- Community benefits
- Environmental protection
- Cultural heritage preservation

Format the response using markdown headings (# for main sections, ## for subsections) and bullet points where appropriate.
Include specific numbers, timelines, and cost estimates.
Make the plan extremely detailed and professional, suitable for corporate and academic stakeholders.`

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

    return NextResponse.json({ 
      plan: completion.choices[0].message.content || 'Failed to generate plan'
    })
  } catch (error) {
    console.error('Failed to generate plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate excavation plan' },
      { status: 500 }
    )
  }
} 
