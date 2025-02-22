import { NextResponse } from 'next/server'
import { ImageClassifier } from '@/lib/image-classifier'

const classifier = new ImageClassifier()

export async function POST(req: Request) {
  try {
    // Initialize model if needed
    await classifier.initialize()

    // Get image data from request
    const formData = await req.formData()
    const file = formData.get('image') as File
    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Classify image
    const result = await classifier.classifyImage(buffer)

    return NextResponse.json({
      species: result.className,
      confidence: result.confidence,
      description: await getSpeciesDescription(result.className)
    })
  } catch (error) {
    console.error('Identification failed:', error)
    return NextResponse.json(
      { error: 'Failed to identify fossil' },
      { status: 500 }
    )
  }
}

async function getSpeciesDescription(species: string): Promise<string> {
  const descriptions: Record<string, string> = {
    'Allosaurus': 'A large theropod dinosaur from the Late Jurassic period...',
    'Brachiosaurus': 'A genus of sauropod dinosaur from the Late Jurassic period...',
    'Stegosaurus': 'A thyreophoran dinosaur from the Late Jurassic period...',
    'Triceratops': 'A genus of herbivorous ceratopsid dinosaur...',
    'Tyrannosaurus': 'One of the largest land carnivores of all time...',
    'Velociraptor': 'A genus of dromaeosaurid theropod dinosaur...'
  }
  return descriptions[species] || 'Description not available'
} 