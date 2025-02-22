import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

interface PredictionResult {
  class: string
  probability: number
}

const CLASSES = [
  'Ammonites',
  'Belemnites',
  'Crinoids',
  'Leaf fossils',
  'Trilobites',
  'Corals'
] as const

const IMAGE_SIZE = 224

export class IdentificationService {
  private model: tf.LayersModel | null = null
  private modelLoading: Promise<tf.LayersModel> | null = null
  private modelPath = '/model/model.json'

  async loadModel() {
    if (this.model) return this.model
    
    if (!this.modelLoading) {
      this.modelLoading = (async () => {
        try {
          // Initialize WebGL backend
          await tf.setBackend('webgl')
          await tf.ready()
          
          // Check if model exists
          try {
            const response = await fetch(this.modelPath)
            if (!response.ok) {
              throw new Error('Model not found')
            }
          } catch (error) {
            throw new Error('Failed to find model file')
          }

          // Load model
          const model = await tf.loadLayersModel(this.modelPath)
          this.model = model
          return model
        } catch (error) {
          console.error('Failed to load model:', error)
          this.modelLoading = null
          throw new Error('Failed to load identification model')
        }
      })()
    }

    return this.modelLoading
  }

  async preprocessImage(imageUrl: string): Promise<tf.Tensor> {
    try {
      const img = await this.loadImage(imageUrl)
      
      return tf.tidy(() => {
        // Convert to tensor and normalize
        const tensor = tf.browser.fromPixels(img)
        const resized = tf.image.resizeBilinear(tensor, [IMAGE_SIZE, IMAGE_SIZE])
        const normalized = resized.div(255.0)
        return normalized.expandDims(0)
      })
    } catch (error) {
      console.error('Image preprocessing failed:', error)
      throw new Error('Failed to process image')
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = url
    })
  }

  async identify(imageUrl: string): Promise<PredictionResult[]> {
    let preprocessed: tf.Tensor | null = null
    let predictions: tf.Tensor | null = null

    try {
      const model = await this.loadModel()
      preprocessed = await this.preprocessImage(imageUrl)
      predictions = model.predict(preprocessed) as tf.Tensor

      const probabilities = await predictions.data() as Float32Array
      const topK = 3
      const indices = Array.from(probabilities)
        .map((probability, index) => ({ probability, index }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, topK)

      return indices.map(({ probability, index }) => ({
        class: CLASSES[index],
        probability: probability * 100
      }))
    } catch (error) {
      console.error('Prediction failed:', error)
      throw new Error('Failed to analyze image')
    } finally {
      // Cleanup tensors
      if (preprocessed) preprocessed.dispose()
      if (predictions) predictions.dispose()
    }
  }
} 