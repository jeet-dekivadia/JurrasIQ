import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'

export async function POST(req: Request) {
  try {
    const { fossilFamily, bodyPart } = await req.json()

    // Validate input
    if (!fossilFamily || !bodyPart) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const prediction = await runPythonPredictor(fossilFamily, bodyPart)
    return NextResponse.json(prediction)
  } catch (error) {
    console.error('Market prediction failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to predict market value' },
      { status: 500 }
    )
  }
}

async function runPythonPredictor(fossilFamily: string, bodyPart: string) {
  return new Promise((resolve, reject) => {
    // Try different Python commands
    const pythonCommands = ['python3', 'python', 'py']
    let currentCommand = 0
    
    function tryRunPython() {
      if (currentCommand >= pythonCommands.length) {
        reject(new Error('Python interpreter not found. Please ensure Python is installed and in your PATH.'))
        return
      }

      const pythonProcess = spawn(pythonCommands[currentCommand], [
        join(process.cwd(), 'lib/market_predictor.py'),
        fossilFamily,
        bodyPart
      ])

      let outputData = ''
      let errorData = ''

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString()
        console.error('Python error:', data.toString())
      })

      pythonProcess.on('close', (code) => {
        if (code === null) {
          currentCommand++
          tryRunPython()
          return
        }

        try {
          const output = outputData.trim()
          if (!output) {
            if (errorData) {
              reject(new Error(`Python error: ${errorData}`))
            } else {
              reject(new Error('No output from prediction script'))
            }
            return
          }

          const result = JSON.parse(output)
          if (result.error) {
            reject(new Error(result.error))
            return
          }

          resolve(result)
        } catch (error) {
          console.error('Failed to parse prediction output:', error)
          console.error('Raw output:', outputData)
          reject(new Error('Failed to parse prediction results'))
        }
      })

      pythonProcess.on('error', (error) => {
        if (error.code === 'ENOENT') {
          currentCommand++
          tryRunPython()
        } else {
          reject(new Error(`Failed to run prediction script: ${error.message}`))
        }
      })
    }

    // Start trying Python commands
    tryRunPython()
  })
} 