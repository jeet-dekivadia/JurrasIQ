import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { join } from 'path'
import { MarketPredictor } from '@/lib/market-predictor'
import type { ParseResult } from 'csv-parse'

let predictor: MarketPredictor | null = null

async function initializePredictor() {
  if (predictor) return predictor

  const filePath = join(process.cwd(), 'Dinosaur_Fossil_Transactions.csv')
  const fileContent = await readFile(filePath, 'utf-8')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }) as ParseResult<Record<string, string>>

  predictor = new MarketPredictor(records)
  return predictor
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

    return NextResponse.json({
      ...prediction,
      ...predictor.getAvailableOptions()
    })
  } catch (error) {
    console.error('Market prediction failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to predict market value' },
      { status: 500 }
    )
  }
} 