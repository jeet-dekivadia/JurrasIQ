interface FossilData {
  fossilFamily: string
  bodyPart: string
  adjustedCost: number
}

interface PredictionResult {
  median: number
  lowerBound: number
  upperBound: number
}

interface AvailableOptions {
  families: string[]
  bodyParts: string[]
}

export class MarketPredictor {
  private data: FossilData[] = []
  private families: Set<string> = new Set()
  private bodyParts: Set<string> = new Set()

  constructor(rawData: Record<string, string>[]) {
    this.data = rawData.map(row => ({
      fossilFamily: row['Fossil Family'],
      bodyPart: row['Body part'],
      adjustedCost: parseFloat(row['Adjusted Cost'].replace(/[$,]/g, ''))
    }))

    // Build unique sets
    this.data.forEach(row => {
      this.families.add(row.fossilFamily)
      this.bodyParts.add(row.bodyPart)
    })
  }

  predict(fossilFamily: string, bodyPart: string): PredictionResult {
    // Validate inputs
    if (!this.families.has(fossilFamily)) {
      throw new Error(`Unknown fossil family: ${fossilFamily}`)
    }
    if (!this.bodyParts.has(bodyPart)) {
      throw new Error(`Unknown body part: ${bodyPart}`)
    }

    // Get similar fossils
    const similarFossils = this.data.filter(row => 
      row.fossilFamily === fossilFamily && row.bodyPart === bodyPart
    )

    if (similarFossils.length === 0) {
      // Fallback to family-only matches
      const familyFossils = this.data.filter(row => row.fossilFamily === fossilFamily)
      if (familyFossils.length === 0) {
        throw new Error('Not enough data for prediction')
      }
      similarFossils.push(...familyFossils)
    }

    // Calculate statistics
    const costs = similarFossils.map(f => f.adjustedCost)
    costs.sort((a, b) => a - b)

    const median = this.calculateMedian(costs)
    const lowerBound = costs[Math.floor(costs.length * 0.1)] || median * 0.7
    const upperBound = costs[Math.floor(costs.length * 0.9)] || median * 1.3

    return {
      median,
      lowerBound,
      upperBound
    }
  }

  getAvailableOptions(): AvailableOptions {
    return {
      families: Array.from(this.families).sort(),
      bodyParts: Array.from(this.bodyParts).sort()
    }
  }

  private calculateMedian(numbers: number[]): number {
    const mid = Math.floor(numbers.length / 2)
    return numbers.length % 2 !== 0
      ? numbers[mid]
      : (numbers[mid - 1] + numbers[mid]) / 2
  }
} 