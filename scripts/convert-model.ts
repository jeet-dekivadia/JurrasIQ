import * as tf from '@tensorflow/tfjs-node'
import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'

const execAsync = promisify(exec)

async function convertModel() {
  try {
    // Convert Keras model to tfjs format
    const modelPath = join(process.cwd(), 'identification/dino_species_fixed.h5')
    const outputPath = join(process.cwd(), 'public/model')
    
    await execAsync(`tensorflowjs_converter --input_format=keras ${modelPath} ${outputPath}`)
    
    console.log('Model converted successfully')
  } catch (error) {
    console.error('Failed to convert model:', error)
  }
}

convertModel() 