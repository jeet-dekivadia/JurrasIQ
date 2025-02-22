import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

async function prepareModel() {
  try {
    // Create model directory if it doesn't exist
    const modelDir = join(process.cwd(), 'public', 'identification', 'model')
    if (!existsSync(modelDir)) {
      mkdirSync(modelDir, { recursive: true })
    }

    // Run Python conversion script
    console.log('Converting model...')
    execSync('python scripts/convert_model.py', { stdio: 'inherit' })
    
    console.log('Model prepared successfully')
  } catch (error) {
    console.error('Failed to prepare model:', error)
    process.exit(1)
  }
}

prepareModel() 