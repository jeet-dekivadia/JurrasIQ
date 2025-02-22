import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { latitude, longitude, fossilType, age } = await req.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert paleontologist with deep knowledge of geological formations and fossil sites worldwide."
        },
        {
          role: "user",
          content: `Generate detailed information about this potential excavation site:
            Coordinates: ${latitude}, ${longitude}
            Fossil Type: ${fossilType}
            Age: ${age} million years ago

            Include:
            1. Geological context
            2. Historical significance
            3. Similar discoveries in the region
            4. Preservation potential
            5. Scientific importance
            6. Local regulations and permissions needed
            
            Make it detailed but concise.`
        }
      ]
    })

    return NextResponse.json({ 
      details: response.choices[0].message.content 
    })
  } catch (error) {
    console.error('Failed to get site details:', error)
    return NextResponse.json(
      { error: 'Failed to generate site details' },
      { status: 500 }
    )
  }
} 