import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { join } from 'path'
import { MarketPredictor } from '@/lib/market-predictor'

let predictor: MarketPredictor | null = null

async function initializePredictor() {
  if (predictor) return predictor

  try {
    const filePath = join(process.cwd(), 'Dinosaur_Fossil_Transactions.csv')
    const fileContent = await readFile(filePath, 'utf-8')

    const records: Record<string, string>[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    predictor = new MarketPredictor(records)
    return predictor
  } catch (error) {
    console.error('Error initializing predictor:', error)
    throw new Error('Failed to load fossil transaction data.')
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { fossilFamily, bodyPart } = json

    if (!fossilFamily || !bodyPart) {
      return NextResponse.json(
        { error: 'Missing required fields: fossilFamily and bodyPart are required.' },
        { status: 400 }
      )
    }

    const predictor = await initializePredictor()
    const prediction = predictor.predict(fossilFamily, bodyPart)

    return NextResponse.json({
      ...prediction,
      availableOptions: predictor.getAvailableOptions()
    })
  } catch (error) {
    console.error('Market prediction failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to predict market value' },
      { status: 500 }
    )
  }
}
