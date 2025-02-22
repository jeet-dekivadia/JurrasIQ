import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const description = formData.get('description') as string;
    const image = formData.get('image') as File;

    // For now, we'll just analyze the description since image analysis requires additional setup
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert paleontologist specializing in fossil identification and valuation. Provide detailed analysis and estimated market value ranges."
        },
        {
          role: "user",
          content: `Analyze this fossil description: ${description}`
        }
      ],
    });

    return NextResponse.json({ analysis: response.choices[0].message.content });
  } catch (error) {
    console.error('Fossil identification error:', error);
    return NextResponse.json({ error: 'Identification failed' }, { status: 500 });
  }
} 