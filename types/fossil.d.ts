export interface FossilLocation {
  id?: string
  location?: string
  latitude: number
  longitude: number
  fossilType?: string
  environment?: string
  age_start?: number
  age_end?: number
  distance?: number
  significance?: number
}

export interface ExcavationSite {
  id: string
  location: {
    city: string
    county: string
    state: string
    coordinates: [number, number]
  }
  fossilType: string
  environment: string
  age: {
    start: number
    end: number
  }
  distance: number
  details: string
  significance: number
} 