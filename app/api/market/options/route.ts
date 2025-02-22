import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { join } from 'path'
import { MarketPredictor } from '@/lib/market-predictor'
import type { ParseResult } from 'csv-parse'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'Dinosaur_Fossil_Transactions.csv')
    const fileContent = await readFile(filePath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as ParseResult<Record<string, string>>

    const predictor = new MarketPredictor(records)
    return NextResponse.json(predictor.getAvailableOptions())
  } catch (error) {
    console.error('Failed to load options:', error)
    return NextResponse.json(
      { error: 'Failed to load fossil options' },
      { status: 500 }
    )
  }
} 