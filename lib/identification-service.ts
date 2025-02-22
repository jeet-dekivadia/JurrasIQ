import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu'

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
  private model: tf.LayersModel | null = null
  private modelLoading: Promise<tf.LayersModel> | null = null

  async loadModel() {
    if (this.model) return this.model
    
    if (!this.modelLoading) {
      this.modelLoading = (async () => {
        try {
          // Try WebGL first for better performance
          await tf.setBackend('webgl')
          await tf.ready()
          console.log('Using WebGL backend')
          
          // Load the converted model
          const model = await tf.loadLayersModel('/identification/model/model.json')
          
          // Warm up the model
          const dummyInput = tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])
          await model.predict(dummyInput).dispose()
          dummyInput.dispose()

          this.model = model
          return model
        } catch (error) {
          console.error('Failed to load model:', error)
          // Fallback to CPU
          try {
            await tf.setBackend('cpu')
            await tf.ready()
            console.log('Falling back to CPU backend')
            
            const model = await tf.loadLayersModel('/identification/model/model.json')
            this.model = model
            return model
          } catch (cpuError) {
            console.error('CPU fallback failed:', cpuError)
            throw new Error('Failed to load identification model')
          }
        }
      })()
    }

    return this.modelLoading
  }

  async preprocessImage(imageUrl: string): Promise<tf.Tensor> {
    const img = await this.loadImage(imageUrl)
    
    return tf.tidy(() => {
      // Convert to tensor
      const tensor = tf.browser.fromPixels(img)
      
      // Resize to expected size
      const resized = tf.image.resizeBilinear(tensor, [IMAGE_SIZE, IMAGE_SIZE])
      
      // Normalize to [0,1]
      const normalized = resized.div(255.0)
      
      // Add batch dimension
      return normalized.expandDims(0)
    })
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

      // Get predictions
      predictions = model.predict(preprocessed) as tf.Tensor
      const probabilities = await predictions.data()

      // Get top 3 predictions
      return Array.from(probabilities)
        .map((prob, idx) => ({
          class: CLASSES[idx],
          probability: prob * 100
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 3)

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