import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are a paleontologist expert. Analyze this fossil image and provide detailed information about: \n1. Species identification and classification\n2. Estimated age/period\n3. Notable features\n4. Preservation quality\n5. Scientific significance\nBe specific but explain in an engaging way that both experts and enthusiasts can understand."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    return NextResponse.json({
      analysis: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Fossil identification error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze fossil image' },
      { status: 500 }
    );
  }
} 