import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { join } from 'path'
import { MarketPredictor } from '@/lib/market-predictor'
import type { ParseResult } from 'csv-parse'

let predictor: MarketPredictor | null = null

async function initializePredictor() {
  if (predictor) return predictor

  try {
    const filePath = join(process.cwd(), 'data', 'Dinosaur_Fossil_Transactions.csv')
    
    // Check if file exists
    try {
      await readFile(filePath, 'utf-8')
    } catch (error) {
      console.error('CSV file not found:', error)
      throw new Error('Market data not available')
    }

    const fileContent = await readFile(filePath, 'utf-8')
    
    // Validate CSV content
    if (!fileContent.trim()) {
      throw new Error('Market data file is empty')
    }

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as ParseResult<Record<string, string>>

    // Validate parsed records
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No market data available')
    }

    // Validate required columns
    const requiredColumns = ['Fossil Family', 'Body part', 'Adjusted Cost']
    const missingColumns = requiredColumns.filter(col => 
      !records[0].hasOwnProperty(col)
    )

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
    }

    predictor = new MarketPredictor(records)
    return predictor
  } catch (error) {
    console.error('Failed to initialize market predictor:', error)
    throw error instanceof Error ? error : new Error('Failed to initialize market data')
  }
}

export async function POST(req: Request) {
  try {
    const { fossilFamily, bodyPart } = await req.json()

    if (!fossilFamily || !bodyPart) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const predictor = await initializePredictor()
    const prediction = predictor.predict(fossilFamily, bodyPart)
    const options = predictor.getAvailableOptions()

    return NextResponse.json({
      prediction,
      options
    })
  } catch (error) {
    console.error('Market prediction failed:', error)
    
    if (error instanceof Error) {
      const status = error.message.includes('not available') ? 503 
        : error.message.includes('Unknown') ? 400 
        : 500

      return NextResponse.json(
        { 
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        },
        { status }
      )
    }

    return NextResponse.json(
      { error: 'Failed to predict market value' },
      { status: 500 }
    )
  }
} 