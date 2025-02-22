import * as tf from '@tensorflow/tfjs-node'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

async function prepareModel() {
  try {
    // Create model directory if it doesn't exist
    const modelDir = join(process.cwd(), 'public', 'identification', 'model')
    if (!existsSync(modelDir)) {
      mkdirSync(modelDir, { recursive: true })
    }

    // Load your trained model
    const modelPath = join(process.cwd(), 'identification', 'model.h5')
    const model = await tf.loadLayersModel(`file://${modelPath}`)

    // Save as tfjs format
    const outputPath = join(modelDir, 'model.json')
    await model.save(`file://${outputPath}`)

    console.log('Model prepared successfully')
  } catch (error) {
    console.error('Failed to prepare model:', error)
    process.exit(1)
  }
}

prepareModel() 