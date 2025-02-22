import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export interface FossilLocation {
  latitude: number
  longitude: number
  fossilType: string
  significance: number // 1-10 scale for heatmap intensity
}

export function loadFossilData(): FossilLocation[] {
  const filePath = path.join(process.cwd(), 'data', 'fossil_data_cleaned.csv')
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  })

  return records.map((record: any) => ({
    latitude: parseFloat(record.latitude),
    longitude: parseFloat(record.longitude),
    fossilType: record.fossil_type,
    significance: parseInt(record.significance) || 5
  }))
} 