import OpenAI from 'openai'

interface PredictionResult {
  class: string
  probability: number
}

// These classes should match your training data classes
const CLASSES = [
  'Ammonites',
  'Belemnites', 
  'Crinoids',
  'Leaf fossils',
  'Trilobites',
  'Corals'
] as const

const IMAGE_SIZE = 224 // Standard input size for many CNN models

export class IdentificationService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async identify(imageUrl: string): Promise<PredictionResult[]> {
    try {
      // Convert base64 URL to base64 string if needed
      const base64Image = imageUrl.split(',')[1]

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",  // Note: gpt-4o-mini doesn't support vision
        messages: [
          {
            role: "system",
            content: "You are an expert paleontologist. When shown a fossil image, identify the type of fossil and the body part in a concise way."
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              },
              {
                type: "text",
                text: "What type of fossil is this and what body part is shown?"
              }
            ]
          }
        ],
        max_tokens: 100
      })

      const prediction = response.choices[0]?.message?.content || "Unknown fossil"
      
      return [{
        class: prediction,
        probability: 100
      }]

    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('Failed to analyze image')
    }
  }
} 