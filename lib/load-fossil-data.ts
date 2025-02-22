import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export interface FossilLocation {
  latitude: number
  longitude: number
  fossilType: string
  significance: number
  age_start: number
  age_end: number
  environment: string
  country: string
}

export function loadFossilData(): FossilLocation[] {
  const filePath = path.join(process.cwd(), 'data', 'fossil_data_cleaned.csv')
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  })

  // Group fossils by location to calculate site significance
  const locationMap = new Map<string, any[]>()
  
  records.forEach((record: any) => {
    const key = `${record[0]},${record[1]}`
    if (!locationMap.has(key)) {
      locationMap.set(key, [])
    }
    locationMap.get(key)!.push(record)
  })

  // Convert grouped data to FossilLocation array
  return Array.from(locationMap.entries()).map(([coords, fossils]) => {
    const [lat, lng] = coords.split(',').map(Number)
    const firstFossil = fossils[0]
    
    // Calculate significance based on number of fossils and age
    const significance = Math.min(10, fossils.length * 0.5) // More fossils = higher significance

    return {
      latitude: lat,
      longitude: lng,
      fossilType: fossils.map((f: any) => f[2]).join(', '), // Join all fossil types
      significance,
      age_start: parseFloat(firstFossil[3]),
      age_end: parseFloat(firstFossil[4]),
      environment: firstFossil[5],
      country: firstFossil[6]
    }
  })
} 