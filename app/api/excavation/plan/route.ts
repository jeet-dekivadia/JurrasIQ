import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const site = await req.json()

    const prompt = `
    Generate a **detailed** financial and organizational overview for an **archaeological excavation project**. 
    Ensure the document is at least **5 pages long** and contains structured sections. 

    ### **Project Overview**
    - Fossil Type: ${site.fossilType}
    - Environment: ${site.environment}
    - Estimated Age: ${site.age_start} - ${site.age_end} million years ago
    - Location: ${site.locationName}
    - Explain the **importance of this excavation** and what scientific discoveries are expected.

    ### **Financial Breakdown**
    - Provide a **detailed budget** (total cost, funding sources, breakdown by category).
    - Justify each **cost category** (e.g., why each piece of equipment or labor expense is necessary).
    - Include **operational costs** (permits, insurance, contingency funds).
        
    ### **Organizational Structure**
    - Provide a **detailed list of personnel involved** (archaeologists, laborers, geologists, logistics, security).
    - **Do NOT include names of people**—only their **roles and responsibilities**.
    - Justify why each role is **critical to the success** of the excavation.
    - Include a **team hierarchy** (who reports to whom).

    ### **Equipment & Logistics**
    - Provide a **detailed list of excavation tools** and their costs.
    - Justify why **each tool or machine** is needed.
    - Explain **transportation and storage logistics** for fossils.
    - Discuss **preservation techniques** to protect fossils after extraction.

    ### **Excavation Timeline & Phases**
    - Break the excavation into **detailed phases** (planning, digging, extraction, preservation, documentation).
    - Estimate **duration in days/weeks** for each phase.
    - Include **logistical challenges** (weather, terrain difficulties).

    ### **Risk Assessment & Contingency Plan**
    - Identify **major risks** (funding issues, equipment failure, site hazards).
    - Describe **preventative measures** (backup funding, safety protocols, emergency contacts).
    - Explain how risks **could impact the timeline and budget**.

    ### **Long-Term Impact**
    - Discuss what happens **after excavation** (museum displays, research papers, public education).
    - Explain how the **findings will be preserved** and shared with the scientific community.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })

    return NextResponse.json({ report: JSON.parse(completion.choices[0].message.content) })
  } catch (error) {
    console.error('Failed to generate plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate excavation plan' },
      { status: 500 }
    )
  }
} 
