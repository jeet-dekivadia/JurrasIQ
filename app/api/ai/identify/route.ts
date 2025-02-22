import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Set max duration to 60 seconds (Vercel hobby plan limit)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured');
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Process image
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimize image before sending to OpenAI
    const optimizedBuffer = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64Image = optimizedBuffer.toString('base64');

    console.log('Sending request to OpenAI Vision API...');

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert paleontologist with extensive knowledge of fossil identification and classification."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this fossil image and provide a detailed report including:

1. Species Identification:
- Taxonomic classification
- Confidence level of identification
- Similar known species

2. Age and Period:
- Estimated geological time period
- Dating methodology considerations

3. Notable Features:
- Key anatomical structures
- Distinctive characteristics
- Preservation details

4. Scientific Significance:
- Research value
- Comparative analysis
- Historical context

Please provide your analysis in a clear, structured format that both professionals and enthusiasts can understand.`
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
      max_tokens: 1000,
      temperature: 0.7
    });

    console.log('Received response from OpenAI');

    if (!response.choices[0]?.message?.content) {
      throw new Error('No analysis received from OpenAI');
    }

    return NextResponse.json({
      analysis: response.choices[0].message.content
    });

  } catch (error) {
    console.error('Fossil identification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze fossil image',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 