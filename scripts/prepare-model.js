const fs = require('fs')
const path = require('path')

function prepareModel() {
  try {
    // Create model directory if it doesn't exist
    const modelDir = path.join(process.cwd(), 'public', 'model')
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true })
    }

    // Copy model files if they exist
    const sourceDir = path.join(process.cwd(), 'identification')
    const modelFiles = ['model.json', 'weights.bin'].map(file => 
      path.join(sourceDir, file)
    )

    modelFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const fileName = path.basename(file)
        fs.copyFileSync(file, path.join(modelDir, fileName))
      }
    })

    console.log('Model files prepared successfully')
  } catch (error) {
    console.error('Failed to prepare model:', error)
    process.exit(1)
  }
}

prepareModel() 