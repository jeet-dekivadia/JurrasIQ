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
    const pythonProcess = spawn('python', [
      join(process.cwd(), 'lib/market_predictor.py'),
      fossilFamily,
      bodyPart
    ])

    let outputData = ''

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString())
    })

    pythonProcess.on('close', (code) => {
      try {
        const output = outputData.trim()
        if (!output) {
          reject(new Error('No output from prediction script'))
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
      reject(new Error(`Failed to run prediction script: ${error.message}`))
    })
  })
} 