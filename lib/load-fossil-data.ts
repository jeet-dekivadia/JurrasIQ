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
    const filePath = path.join(process.cwd(), 'data', 'fossil_data_cleaned.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: ['Latitude', 'Longitude', 'Fossil_Name', 'Early_Age', 'Late_Age', 'Environment', 'Country_Code'],
      skip_empty_lines: true,
      from_line: 2 // Skip header row
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
    return Array.from(locationMap.entries()).map(([coords, fossils]) => {
      const [lat, lng] = coords.split(',').map(Number)
      
      // Calculate significance based on number of fossils and age range
      const significance = Math.min(10, Math.sqrt(fossils.length) * 2)

      return {
        latitude: lat,
        longitude: lng,
        fossilType: fossils.map((f: any) => f.Fossil_Name).join(', '),
        significance,
        age_start: parseFloat(fossils[0].Early_Age),
        age_end: parseFloat(fossils[0].Late_Age),
        environment: fossils[0].Environment,
        country: fossils[0].Country_Code
      }
    })
  } catch (error) {
    console.error('Error loading fossil data:', error)
    return []
  }
} 