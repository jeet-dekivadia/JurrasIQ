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
    const prompt = `Generate a comprehensive corporate-level excavation and financial planning document for this paleontological site. Treat this as a high-stakes consulting project where every decision must be thoroughly justified with data and industry best practices.

SITE DETAILS:
- Fossil Type: ${site.fossilType || 'Unknown'}
- Geological Environment: ${site.environment || 'Unknown'}
- Age Range: ${site.age_start || 0} - ${site.age_end || 0} Million Years Ago
- Location: ${site.locationName || 'Unknown Location'}

Create an exhaustive plan (minimum 7000 words) with the following sections:

# EXECUTIVE SUMMARY
- Project overview with key value propositions
- Strategic objectives with measurable KPIs
- Expected ROI and scientific impact metrics
- Critical success factors with supporting data

# SITE ANALYSIS & SCIENTIFIC SIGNIFICANCE
- Detailed geological analysis with historical data
- Comparative analysis with similar excavation sites
- Research potential quantified with impact metrics
- Expected discoveries based on geological modeling
- Scientific value proposition with citation potential

# COMPREHENSIVE FINANCIAL ANALYSIS
## Budget Overview
- Total project cost: [Provide exact figure with breakdown]
- Cost per phase analysis
- Contingency allocations (justify percentages)

## Detailed Cost Structure
1. Capital Expenditure (CAPEX)
   - Equipment acquisition vs. rental analysis
   - Infrastructure development costs
   - Technology investments
   - Initial setup costs
   [Include percentage breakdown and justification for each]

2. Operational Expenditure (OPEX)
   - Personnel costs (detailed by role)
   - Daily operation expenses
   - Maintenance and repairs
   - Consumables and supplies
   - Utility costs
   [Provide monthly burn rate and justification]

3. Financial Metrics
   - Net Present Value (NPV) calculation
   - Internal Rate of Return (IRR) for commercial aspects
   - Payback period analysis
   - Cost-benefit ratios
   [Include assumptions and sensitivity analysis]

## Funding Strategy
- Proposed funding sources with allocation percentages
- Grant opportunities with success probabilities
- Private sector partnerships
- Academic funding channels
[Justify each funding source selection]

## Financial Risk Management
- Risk-adjusted return analysis
- Insurance coverage recommendations
- Currency exposure management
- Contingency fund allocation method

[Present all financial data with clear justifications and industry benchmarks]

# OPERATIONAL STRATEGY
- Detailed organizational structure with reporting lines
- Equipment specifications and selection criteria
- Infrastructure requirements with technical specifications
- Safety protocols with industry standards references
- Quality control metrics and procedures
[Include decision matrices for key choices]

# PROJECT TIMELINE
- Critical path analysis with dependencies
- Resource loading charts
- Phase-wise milestones with success criteria
- Buffer allocation strategy
[Justify duration and sequence of each phase]

# RISK ASSESSMENT & MITIGATION
- Comprehensive risk matrix with probability and impact scores
- Detailed mitigation strategies with cost implications
- Emergency response protocols with trigger points
- Insurance coverage analysis
[Include quantitative risk assessment]

# STAKEHOLDER MANAGEMENT
- Stakeholder influence/interest matrix
- Communication strategy by stakeholder group
- Engagement KPIs and metrics
- Value proposition for each stakeholder group

# LONG-TERM IMPACT ANALYSIS
- Scientific impact metrics
- Economic benefit calculations
- Environmental impact assessment
- Cultural heritage value proposition
[Provide quantifiable metrics for each impact area]

Format Requirements:
1. Use markdown formatting for clear hierarchy
2. Include data tables where relevant
3. Present financial data in structured formats
4. Use bullet points for key details
5. Include decision matrices for major choices
6. Provide clear justifications for all recommendations

Make this document extremely detailed and professional, suitable for:
- Corporate board presentations
- Grant applications
- Academic review committees
- Government permit applications
- Stakeholder presentations

For each major decision or recommendation:
1. State the decision/recommendation
2. Provide data-driven justification
3. Include industry benchmarks or standards
4. Discuss alternatives considered
5. Explain selection criteria
6. Address potential challenges
7. Include success metrics

This should be a complete, professional planning document that would be acceptable at the highest levels of corporate and academic review.`

    // Call the OpenAI Chat Completion API with the expanded prompt.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a world-class consortium combining expertise in paleontology, project management, financial planning, and operations management. Generate an exhaustive, corporate-grade excavation plan with extreme attention to detail. Focus on providing thorough justifications for all recommendations and detailed financial analysis. Your output should meet the highest standards of professional consulting firms."
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
