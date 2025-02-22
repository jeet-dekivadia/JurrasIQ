import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'

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

    // Extract unique values
    const families = [...new Set(records.map((r: any) => r['Fossil Family']))]
    const bodyParts = [...new Set(records.map((r: any) => r['Body part']))]

    return NextResponse.json({
      families: families.sort(),
      bodyParts: bodyParts.sort()
    })
  } catch (error) {
    console.error('Failed to load options:', error)
    return NextResponse.json(
      { error: 'Failed to load fossil options' },
      { status: 500 }
    )
  }
} 