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
  availableFamilies?: string[]
  availableBodyParts?: string[]
}> {
  return new Promise((resolve, reject) => {
    let stdoutData = '';
    let stderrData = '';

    const pythonProcess = spawn('python', [
      join(process.cwd(), 'lib/market_predictor.py'),
      fossilFamily,
      bodyPart
    ])

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', stderrData)
        try {
          const errorData = JSON.parse(stderrData)
          reject(new Error(errorData.error || 'Python process failed'))
        } catch {
          reject(new Error(stderrData || 'Python process failed'))
        }
        return
      }

      try {
        if (!stdoutData.trim()) {
          throw new Error('No output from Python script')
        }
        const prediction = JSON.parse(stdoutData)
        resolve(prediction)
      } catch (e) {
        console.error('Failed to parse Python output:', e, 'Output:', stdoutData)
        reject(new Error('Failed to parse prediction results'))
      }
    })

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error)
      reject(new Error('Failed to start prediction process'))
    })
  })
} 