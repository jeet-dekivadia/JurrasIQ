import * as tf from '@tensorflow/tfjs'

const CLASSES = [
  'Ammonites',
  'Belemnites',
  'Crinoids',
  'Leaf fossils',
  'Trilobites',
  'Corals'
]

const IMAGE_SIZE = 224

export class IdentificationService {
  private model: tf.LayersModel | null = null

  async loadModel() {
    if (this.model) return this.model

    this.model = await tf.loadLayersModel('/model/model.json')
    return this.model
  }

  async preprocessImage(imageUrl: string): Promise<tf.Tensor> {
    // Load image
    const img = await this.loadImage(imageUrl)
    
    // Convert to tensor
    const tensor = tf.browser.fromPixels(img)
    
    // Resize
    const resized = tf.image.resizeBilinear(tensor, [IMAGE_SIZE, IMAGE_SIZE])
    
    // Normalize and add batch dimension
    const normalized = resized.div(255.0).expandDims(0)
    
    // Cleanup
    tensor.dispose()
    resized.dispose()
    
    return normalized
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)
      img.src = url
    })
  }

  async identify(imageUrl: string) {
    try {
      const model = await this.loadModel()
      const preprocessed = await this.preprocessImage(imageUrl)

      // Get predictions
      const predictions = await model.predict(preprocessed) as tf.Tensor
      const probabilities = await predictions.data()

      // Get top 3 predictions
      const topK = 3
      const indices = Array.from(probabilities)
        .map((p, i) => ({ probability: p, index: i }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, topK)

      // Cleanup
      tf.dispose([preprocessed, predictions])

      return indices.map(({ probability, index }) => ({
        class: CLASSES[index],
        probability: probability * 100
      }))
    } catch (error) {
      console.error('Prediction failed:', error)
      throw new Error('Failed to analyze image')
    }
  }
} 