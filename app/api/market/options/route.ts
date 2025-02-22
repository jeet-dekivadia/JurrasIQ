import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'

export async function GET() {
  try {
    const pythonProcess = spawn('python', [
      join(process.cwd(), 'lib/market_predictor.py'),
      '--get-options'
    ])

    let result = ''
    let error = ''

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })

    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) resolve(null)
        else reject(new Error(error))
      })
    })

    const options = JSON.parse(result)
    return NextResponse.json(options)
  } catch (error) {
    console.error('Failed to load market options:', error)
    return NextResponse.json(
      { error: 'Failed to load fossil options' },
      { status: 500 }
    )
  }
} 