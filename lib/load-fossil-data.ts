import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import type { FossilLocation } from '@/types/fossil'

export function loadFossilData(): FossilLocation[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'fossil_data.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as FossilLocation[]

    return records
  } catch (error) {
    console.error('Failed to load fossil data:', error)
    return []
  }
} 