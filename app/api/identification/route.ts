import { NextResponse } from 'next/server'
import { ImageClassifier } from '@/lib/image-classifier'

const classifier = new ImageClassifier()

export async function POST(req: Request) {
  try {
    // Initialize model if needed
    await classifier.initialize()

    // Get image data from request
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    try {
      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Classify image
      const result = await classifier.classifyImage(buffer)

      // Get description with more details
      const description = await getSpeciesDescription(result.className)
      
      return NextResponse.json({
        species: result.className,
        confidence: result.confidence,
        description: `${result.className} (${(result.confidence * 100).toFixed(1)}% confidence)\n\n${description}`
      })
    } catch (error) {
      console.error('Processing error:', error)
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Identification failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to identify fossil',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

async function getSpeciesDescription(species: string): Promise<string> {
  const descriptions: Record<string, string> = {
    'Allosaurus': 
      'The Allosaurus was a large theropod dinosaur from the Late Jurassic period (155-145 million years ago). ' +
      'Known as the "different lizard," it was one of the most successful predatory dinosaurs of its time. ' +
      'Growing up to 32 feet long and weighing up to 2.5 tons, it was characterized by its large skull, ' +
      'sharp serrated teeth, and distinctive crests above its eyes.',
    
    'Brachiosaurus': 
      'The Brachiosaurus was a genus of sauropod dinosaur from the Late Jurassic period (154-150 million years ago). ' +
      'One of the largest dinosaurs ever discovered, it could reach heights of up to 39-52 feet and weigh up to 62 tons. ' +
      'Its most distinctive feature was its long neck, which it used to reach high tree branches. ' +
      'The name means "arm lizard," referring to its unusually long front legs.',
    
    'Stegosaurus': 
      'The Stegosaurus was a thyreophoran dinosaur from the Late Jurassic period (155-145 million years ago). ' +
      'Instantly recognizable by its row of large bony plates along its back and spiked tail, it was a herbivorous ' +
      'quadruped that grew up to 30 feet long. Despite its size, it had a brain about the size of a walnut.',
    
    'Triceratops': 
      'The Triceratops was a genus of herbivorous ceratopsid dinosaur that lived during the Late Cretaceous period ' +
      '(68-66 million years ago). Its most distinctive features were its large skull frill and three horns – two above ' +
      'its eyes and one on its snout. These features were likely used for defense against predators and in mating displays.',
    
    'Tyrannosaurus': 
      'The Tyrannosaurus Rex, or T-Rex, lived during the Late Cretaceous period (68-66 million years ago). ' +
      'One of the largest land carnivores of all time, it could grow up to 40 feet long and 12 feet tall at the hips. ' +
      'Known for its massive skull, powerful jaws, and tiny two-fingered forearms, it was an apex predator of its time.',
    
    'Velociraptor': 
      'The Velociraptor was a small dromaeosaurid dinosaur that lived during the Late Cretaceous period ' +
      '(75-71 million years ago). Despite its portrayal in popular media, it was actually only about the size of a ' +
      'turkey, growing up to 6.8 feet long and weighing up to 33 pounds. It was characterized by its sickle-shaped ' +
      'claws and is believed to have been feathered.'
  }
  return descriptions[species] || 'Description not available for this species.'
} 