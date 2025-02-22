const fs = require('fs')
const path = require('path')

function prepareModel() {
  try {
    // Create model directory if it doesn't exist
    const modelDir = path.join(process.cwd(), 'public', 'model')
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true })
    }

    // Copy the converted model files from identification folder
    const sourceDir = path.join(process.cwd(), 'identification')
    const modelFiles = ['model.json', 'group1-shard1of1.bin'].map(file => 
      path.join(sourceDir, file)
    )

    modelFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const fileName = path.basename(file)
        fs.copyFileSync(file, path.join(modelDir, fileName))
        console.log(`Copied ${fileName}`)
      } else {
        console.warn(`Warning: ${file} not found`)
      }
    })

    console.log('Model files prepared successfully')
  } catch (error) {
    console.error('Failed to prepare model:', error)
    process.exit(1)
  }
}

prepareModel() 