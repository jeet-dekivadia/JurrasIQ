import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu'

interface PredictionResult {
  class: string
  probability: number
}

// These classes should match the folders in identification/dataset
const CLASSES = [
  'Ammonites',
  'Belemnites', 
  'Crinoids',
  'Leaf fossils',
  'Trilobites',
  'Corals'
] as const

const IMAGE_SIZE = 224 // This should match the model's expected input size

export class IdentificationService {
  private model: tf.LayersModel | null = null
  private modelLoading: Promise<tf.LayersModel> | null = null
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      // Try WebGL first for better performance
      await tf.setBackend('webgl')
      await tf.ready()
      console.log('Using WebGL backend')
    } catch (error) {
      console.warn('WebGL initialization failed, falling back to CPU:', error)
      await tf.setBackend('cpu')
      await tf.ready()
      console.log('Using CPU backend')
    }

    this.initialized = true
  }

  async loadModel() {
    if (this.model) return this.model
    
    if (!this.modelLoading) {
      this.modelLoading = (async () => {
        try {
          await this.initialize()
          
          // Load the converted model from public/model
          const model = await tf.loadLayersModel('/model/model.json')
          
          // Warm up the model with a dummy input
          const dummyInput = tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])
          await model.predict(dummyInput).dispose()
          dummyInput.dispose()

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
        // Convert to tensor
        const tensor = tf.browser.fromPixels(img)
        
        // Resize maintaining aspect ratio
        const [height, width] = tensor.shape
        const scale = IMAGE_SIZE / Math.max(height, width)
        const newHeight = Math.round(height * scale)
        const newWidth = Math.round(width * scale)
        
        const resized = tf.image.resizeBilinear(tensor, [newHeight, newWidth])
        
        // Pad to square
        const padTop = Math.floor((IMAGE_SIZE - newHeight) / 2)
        const padBottom = IMAGE_SIZE - newHeight - padTop
        const padLeft = Math.floor((IMAGE_SIZE - newWidth) / 2)
        const padRight = IMAGE_SIZE - newWidth - padLeft
        
        const padded = tf.pad(resized, [
          [padTop, padBottom],
          [padLeft, padRight],
          [0, 0]
        ])

        // Normalize to [0, 1]
        return padded.div(255.0).expandDims(0)
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
      img.onerror = (error) => {
        console.error('Image loading failed:', error)
        reject(new Error('Failed to load image'))
      }
      img.src = url
    })
  }

  async identify(imageUrl: string): Promise<PredictionResult[]> {
    let preprocessed: tf.Tensor | null = null
    let predictions: tf.Tensor | null = null

    try {
      const model = await this.loadModel()
      preprocessed = await this.preprocessImage(imageUrl)

      // Get predictions
      predictions = tf.tidy(() => {
        const pred = model.predict(preprocessed!) as tf.Tensor
        return pred.softmax() // Convert to probabilities
      })

      const probabilities = await predictions.data() as Float32Array

      // Get top 3 predictions
      const topK = 3
      const indices = Array.from(probabilities)
        .map((probability, index) => ({ probability, index }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, topK)

      return indices.map(({ probability, index }) => ({
        class: CLASSES[index],
        probability: probability * 100 // Convert to percentage
      }))
    } catch (error) {
      console.error('Prediction failed:', error)
      throw new Error('Failed to analyze image')
    } finally {
      // Cleanup tensors
      if (preprocessed) preprocessed.dispose()
      if (predictions) predictions.dispose()
      tf.disposeVariables()
    }
  }
} 