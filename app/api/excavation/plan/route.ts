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

    const systemPrompt = `You are a world-class expert consortium combining expertise in paleontology, project management, financial planning, and operations management. Your task is to generate an exhaustive, corporate-grade excavation plan in JSON format.

    Your response must be a meticulously detailed JSON object containing these key sections, each requiring extensive detail:

    1. project_overview:
    - Executive Summary
    - Site Significance & Scientific Value
    - Project Goals & Objectives
    - Key Stakeholders
    - Success Metrics & KPIs
    - Regulatory Compliance Requirements
    - Environmental Impact Considerations
    - Local Community Relations Strategy

    2. financial_breakdown:
    - Total Project Cost Estimation
    - Detailed Budget Allocation
    - Capital Expenditure (CAPEX)
      * Equipment Purchase/Rental
      * Site Infrastructure
      * Technology & Tools
      * Transportation
    - Operational Expenditure (OPEX)
      * Staff Salaries & Benefits
      * Daily Operations
      * Consumables & Supplies
      * Site Maintenance
    - Insurance & Risk Management Costs
    - Contingency Fund (15-20% of total budget)
    - Funding Sources & Financial Partners
    - ROI Analysis for Commercial Aspects
    - Cash Flow Projections
    - Tax Considerations & Benefits
    - Grant Opportunities
    - Financial Risk Mitigation Strategies

    3. organizational_structure:
    - Leadership Team Composition
    - Department Breakdown
      * Field Operations
      * Research & Analysis
      * Conservation
      * Security
      * Logistics
      * Administration
    - Roles & Responsibilities Matrix
    - Reporting Hierarchies
    - Communication Protocols
    - Decision-Making Framework
    - Required Qualifications & Experience
    - Training Requirements
    - Health & Safety Protocols
    - Performance Evaluation Criteria
    - Staff Accommodation & Facilities
    - Local Workforce Integration Plan

    4. equipment_logistics:
    - Comprehensive Equipment List
      * Excavation Tools
      * Scientific Instruments
      * Safety Equipment
      * Documentation Tools
      * Conservation Materials
    - Transportation Fleet Details
    - Supply Chain Management
    - Equipment Maintenance Schedules
    - Storage Facilities & Security
    - Climate Control Requirements
    - Backup Systems & Redundancies
    - Technology Infrastructure
    - Communication Systems
    - Power Generation & Distribution
    - Water Management Systems
    - Waste Management Protocols

    5. excavation_timeline:
    - Detailed Phase Breakdown
      * Pre-excavation Planning
      * Site Preparation
      * Initial Survey & Documentation
      * Main Excavation Phases
      * Conservation & Documentation
      * Site Restoration
    - Critical Path Analysis
    - Milestone Definitions
    - Dependencies & Prerequisites
    - Resource Allocation Timeline
    - Weather Considerations
    - Seasonal Adjustments
    - Progress Monitoring Methods
    - Quality Control Checkpoints
    - Documentation Requirements
    - Stakeholder Review Points

    6. risk_assessment:
    - Comprehensive Risk Matrix
    - Safety & Health Risks
      * Physical Hazards
      * Environmental Risks
      * Biological Hazards
    - Operational Risks
      * Equipment Failure
      * Weather Disruptions
      * Resource Shortages
    - Financial Risks
      * Budget Overruns
      * Funding Delays
      * Currency Fluctuations
    - Scientific Risks
      * Specimen Damage
      * Preservation Challenges
      * Documentation Loss
    - Mitigation Strategies
    - Emergency Response Plans
    - Insurance Coverage Details
    - Contingency Plans
    - Crisis Communication Protocol

    7. long_term_impact:
    - Scientific Contributions
    - Research Publications Plan
    - Museum Exhibition Strategy
    - Educational Program Development
    - Community Benefits
    - Economic Impact Analysis
    - Environmental Conservation
    - Heritage Preservation
    - Knowledge Transfer
    - Future Research Opportunities
    - Digital Archive Creation
    - Public Engagement Strategy
    - Legacy Planning
    - Sustainable Development Goals
    - Long-term Site Management`

    const userPrompt = `Generate an ultra-detailed, corporate-grade excavation plan for this significant paleontological site:

    Site Specifications:
    - Fossil Type: ${site.fossilType || 'Unknown'}
    - Geological Environment: ${site.environment || 'Unknown'}
    - Age Range: ${site.age_start || 0} - ${site.age_end || 0} Million Years Ago
    - Location: ${site.locationName || 'Unknown Location'}

    Requirements:
    1. Treat this as a major corporate project requiring highest professional standards
    2. Include specific numerical data (costs, timelines, team sizes, etc.)
    3. Consider all stakeholders (academic, commercial, local community)
    4. Incorporate latest industry best practices and technologies
    5. Address sustainability and environmental responsibility
    6. Include specific risk mitigation strategies
    7. Provide detailed financial projections and budgeting
    8. Consider local regulations and international standards
    9. Include comprehensive safety and security protocols
    10. Detail preservation and documentation methodologies

    Format your response as a structured JSON object following the system-defined sections.
    Each section should be exhaustively detailed, suitable for a 20+ page professional document.
    Use markdown formatting within strings for better readability.
    Include specific numbers, percentages, and timeframes where applicable.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
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

    // Validate and provide defaults
    const requiredFields = [
      'project_overview',
      'financial_breakdown',
      'organizational_structure',
      'equipment_logistics',
      'excavation_timeline',
      'risk_assessment',
      'long_term_impact'
    ] as const

    const validatedReport = requiredFields.reduce((acc, field) => ({
      ...acc,
      [field]: typeof report[field] === 'string' ? report[field] : 'Information not available'
    }), {} as Record<typeof requiredFields[number], string>)

    return NextResponse.json({ report: validatedReport })
  } catch (error) {
    console.error('Failed to generate plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate excavation plan' },
      { status: 500 }
    )
  }
} 
