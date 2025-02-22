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
      skip_empty_lines: true,
      trim: true,
      cast: true
    })

    // Format the first 30 records
    const previewData = records.slice(0, 30).map((record: any) => ({
      'Fossil Family': record['Fossil Family'] || '',
      'Body part': record['Body part'] || '',
      'Original Cost': typeof record['Original Cost'] === 'string' 
        ? record['Original Cost']
        : `$${record['Original Cost'].toLocaleString()}`,
      'Adjusted Cost': typeof record['Adjusted Cost'] === 'string'
        ? record['Adjusted Cost']
        : `$${record['Adjusted Cost'].toLocaleString()}`
    }))

    return NextResponse.json(previewData)
  } catch (error) {
    console.error('Failed to load preview data:', error)
    return NextResponse.json(
      { error: 'Failed to load preview data' },
      { status: 500 }
    )
  }
} 