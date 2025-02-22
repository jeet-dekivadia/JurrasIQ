import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { join } from 'path'

export async function GET() {
  try {
    // Read the CSV file
    const filePath = join(process.cwd(), 'Dinosaur_Fossil_Transactions.csv')
    const fileContent = await readFile(filePath, 'utf-8')
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Return first 30 records
    return NextResponse.json(records.slice(0, 30))
  } catch (error) {
    console.error('Failed to load preview data:', error)
    return NextResponse.json(
      { error: 'Failed to load preview data' },
      { status: 500 }
    )
  }
} 