import { NextResponse } from 'next/server'
import { checkPythonEnvironment } from '@/lib/check-python'

export async function GET() {
  try {
    const status = await checkPythonEnvironment()
    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check Python environment' },
      { status: 500 }
    )
  }
} 