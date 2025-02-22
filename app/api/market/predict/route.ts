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

    // Run Python script
    const prediction = await runPythonPredictor(fossilFamily, bodyPart)
    return NextResponse.json(prediction)
  } catch (error) {
    console.error('Market prediction failed:', error)
    return NextResponse.json(
      { error: 'Failed to predict market value' },
      { status: 500 }
    )
  }
}

async function runPythonPredictor(fossilFamily: string, bodyPart: string): Promise<{
  median: number
  lowerBound: number
  upperBound: number
}> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      join(process.cwd(), 'lib/market_predictor.py'),
      fossilFamily,
      bodyPart
    ])

    let result = ''
    let error = ''

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process failed: ${error}`))
        return
      }

      try {
        const prediction = JSON.parse(result)
        resolve(prediction)
      } catch (e) {
        reject(new Error('Failed to parse Python output'))
      }
    })
  })
} 