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
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async identify(imageUrl: string): Promise<PredictionResult[]> {
    try {
<<<<<<< HEAD
      const base64Image = imageUrl.split(',')[1]

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
=======
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
>>>>>>> parent of ff8b48c (update)
        messages: [
          {
            role: "system",
            content: "You are an expert paleontologist. When shown a fossil image, identify the type of fossil and the body part in a concise way. Respond with only the fossil type and body part, nothing else."
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: imageUrl
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
      
      // Return in the expected format
      return [{
        class: prediction,
        probability: 100 // Since GPT doesn't provide confidence scores
      }]

    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('Failed to analyze image')
    }
  }
} 