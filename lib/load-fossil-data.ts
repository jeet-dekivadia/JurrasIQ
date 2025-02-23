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
  try {
    // Use the map folder directly
    const filePath = path.join(process.cwd(), 'map', 'fossil_data_cleaned.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ','
    })

    // Group fossils by location to calculate site significance
    const locationMap = new Map<string, any[]>()
    
    records.forEach((record: any) => {
      const key = `${record.Latitude},${record.Longitude}`
      if (!locationMap.has(key)) {
        locationMap.set(key, [])
      }
      locationMap.get(key)!.push(record)
    })

    // Convert grouped data to FossilLocation array
    const locations = Array.from(locationMap.entries()).map(([coords, fossils]) => {
      const [lat, lng] = coords.split(',').map(Number)
      
      return {
        latitude: lat,
        longitude: lng,
        fossilType: fossils.map((f: any) => f.Fossil_Name).join(', '),
        significance: Math.min(10, Math.sqrt(fossils.length) * 2), // Scale significance
        age_start: parseFloat(fossils[0].Early_Age),
        age_end: parseFloat(fossils[0].Late_Age),
        environment: fossils[0].Environment,
        country: fossils[0].Country_Code
      }
    })

    return locations

  } catch (error) {
    console.error('Error loading fossil data:', error)
    throw error
  }
} 
