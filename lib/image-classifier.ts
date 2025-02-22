import * as tf from '@tensorflow/tfjs'
import sharp from 'sharp'

const CLASS_NAMES = [
  'Allosaurus',
  'Brachiosaurus',
  'Stegosaurus',
  'Triceratops',
  'Tyrannosaurus',
  'Velociraptor'
]

export class ImageClassifier {
  private model: tf.LayersModel | null = null
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      // Load the model
      this.model = await tf.loadLayersModel('/models/dino_species_model/model.json')
      this.initialized = true
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Failed to load model:', error)
      throw new Error('Failed to initialize image classifier')
    }
  }

  async classifyImage(imageBuffer: Buffer): Promise<{
    className: string
    confidence: number
  }> {
    if (!this.initialized || !this.model) {
      throw new Error('Model not initialized. Call initialize() first.')
    }

    try {
      // Preprocess image
      const processedImage = await this.preprocessImage(imageBuffer)
      
      // Make prediction
      const predictions = await this.model.predict(processedImage) as tf.Tensor
      const scores = await predictions.data()
      
      // Cleanup
      predictions.dispose()
      processedImage.dispose()

      // Get the class with highest confidence
      const maxScore = Math.max(...Array.from(scores))
      const maxIndex = scores.indexOf(maxScore)

      if (maxScore < 0.5) {
        throw new Error('Low confidence in classification result')
      }

      return {
        className: CLASS_NAMES[maxIndex],
        confidence: maxScore
      }
    } catch (error) {
      console.error('Classification failed:', error)
      throw error
    }
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<tf.Tensor4D> {
    try {
      // Resize and normalize image
      const image = await sharp(imageBuffer)
        .resize(224, 224, { fit: 'cover' })
        .removeAlpha()
        .toColorspace('srgb')
        .raw()
        .toBuffer()

      // Convert to tensor and normalize
      const tensor = tf.tensor4d(new Float32Array(image), [1, 224, 224, 3])
      const normalized = tensor.div(255.0)
      tensor.dispose()

      return normalized
    } catch (error) {
      console.error('Image preprocessing failed:', error)
      throw new Error('Failed to process image')
    }
  }
} 