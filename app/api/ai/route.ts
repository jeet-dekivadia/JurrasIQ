import OpenAI from 'openai';
import { NextResponse } from 'next/server';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    switch (type) {
      case 'analyze_location':
        const locationResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a paleontology expert AI. Analyze the given location data and provide insights about potential fossil deposits."
            },
            {
              role: "user",
              content: `Analyze this location for fossil potential: ${JSON.stringify(data)}`
            }
          ],
        });
        return NextResponse.json({ analysis: locationResponse.choices[0].message.content });

      case 'identify_fossil':
        const fossilResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert in fossil identification and valuation. Analyze the provided fossil description and image data."
            },
            {
              role: "user",
              content: `Identify and value this fossil: ${JSON.stringify(data)}`
            }
          ],
        });
        return NextResponse.json({ analysis: fossilResponse.choices[0].message.content });

      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
} 