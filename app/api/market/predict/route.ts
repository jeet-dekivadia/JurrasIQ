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
    try {
      const prediction = await runPythonPredictor(fossilFamily, bodyPart)
      return NextResponse.json(prediction)
    } catch (error) {
      console.error('Prediction process error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Prediction failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Market prediction failed:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
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
      const text = data.toString()
      console.log('Python stdout:', text)
      stdoutData += text
    })

    pythonProcess.stderr.on('data', (data) => {
      const text = data.toString()
      console.log('Python stderr:', text)
      stderrData += text
    })

    pythonProcess.on('close', (code) => {
      console.log('Python process exited with code:', code)
      console.log('Final stdout:', stdoutData)
      console.log('Final stderr:', stderrData)

      if (code !== 0) {
        try {
          const errorData = JSON.parse(stderrData)
          reject(new Error(errorData.error || 'Python process failed'))
        } catch {
          reject(new Error(stderrData || 'Python process failed'))
        }
        return
      }

      try {
        const output = stdoutData.trim()
        if (!output) {
          throw new Error('No output from Python script')
        }
        const prediction = JSON.parse(output)
        if (!prediction.median && prediction.median !== 0) {
          throw new Error('Invalid prediction format')
        }
        resolve(prediction)
      } catch (e) {
        console.error('Parse error:', e)
        console.error('Raw stdout:', stdoutData)
        reject(new Error('Failed to parse prediction results'))
      }
    })

    pythonProcess.on('error', (error) => {
      console.error('Process error:', error)
      reject(new Error('Failed to start prediction process'))
    })
  })
} 