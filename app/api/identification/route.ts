import { NextResponse } from 'next/server'
import { IdentificationService } from '@/lib/identification-service'
import * as tf from '@tensorflow/tfjs-node'

const identificationService = new IdentificationService()

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert image to buffer
    const buffer = await imageFile.arrayBuffer()
    const imageData = await createImageData(buffer)
    
    // Get predictions
    const predictions = await identificationService.identify(imageData)
    
    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Identification failed:', error)
    return NextResponse.json(
      { error: 'Failed to identify fossil' },
      { status: 500 }
    )
  }
}

async function createImageData(buffer: ArrayBuffer): Promise<ImageData> {
  // Load image using tfjs-node
  const tensor = tf.node.decodeImage(new Uint8Array(buffer))
  const [height, width] = tensor.shape
  
  // Convert to ImageData format
  const pixels = await tensor.data()
  const imageData = new ImageData(
    new Uint8ClampedArray(pixels),
    width,
    height
  )
  
  tf.dispose(tensor)
  return imageData
} 