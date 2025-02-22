import { join } from 'path'
import * as tf from '@tensorflow/tfjs-node'

async function convertModel() {
  try {
    // Load the model
    const modelPath = join(process.cwd(), 'identification/dino_species_fixed.h5')
    const model = await tf.loadLayersModel(`file://${modelPath}`)

    // Save as tfjs format
    const outputPath = join(process.cwd(), 'public/model/model.json')
    await model.save(`file://${outputPath}`)

    console.log('Model converted successfully')
  } catch (error) {
    console.error('Failed to convert model:', error)
  }
}

convertModel() 