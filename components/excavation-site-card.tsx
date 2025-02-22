import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, MapPin, Loader2 } from 'lucide-react'
import { PDFDocument, StandardFonts } from 'pdf-lib'

interface ExcavationSite {
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

export function ExcavationSiteCard({ site }: { site: ExcavationSite }) {
  const [isSelected, setIsSelected] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    try {
      // Get excavation plan
      const response = await fetch('/api/excavation/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site)
      })

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

      const { report } = await response.json()
      
      // Create PDF
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const fontSize = 12
      const lineHeight = 14
      const margin = 50

      // Add header
      page.drawText(`Excavation Plan: ${site.location.city}, ${site.location.state}`, {
        x: margin,
        y: height - margin,
        size: 20,
        font
      })

      // Add site details
      let y = height - margin - 40
      const details = [
        `Location: ${site.location.city}, ${site.location.county}, ${site.location.state}`,
        `Fossil Type: ${site.fossilType}`,
        `Environment: ${site.environment}`,
        `Age: ${site.age.start} - ${site.age.end} million years ago`,
        `Distance: ${site.distance.toFixed(2)}km`,
        '',
        'Excavation Details:'
      ]

      details.forEach(text => {
        page.drawText(text, {
          x: margin,
          y,
          size: fontSize,
          font
        })
        y -= lineHeight
      })

      // Add report content
      Object.entries(report).forEach(([key, value]) => {
        y -= lineHeight * 1.5
        page.drawText(`${key}:`, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.4, 0.4, 0.4)
        })
        y -= lineHeight
        page.drawText(String(value), {
          x: margin + 10,
          y,
          size: fontSize,
          font
        })
      })

      const pdfBytes = await pdfDoc.save()
      
      // Download PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `excavation_plan_${site.location.city.toLowerCase()}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)

      setIsSelected(true)
    } catch (error) {
      console.error('Failed to generate plan:', error)
      alert('Failed to generate excavation plan')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className={`absolute right-2 top-2 ${isSelected ? 'text-green-500' : 'text-gray-400'}`}
        onClick={generatePDF}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Check className="h-5 w-5" />
        )}
      </Button>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-amber-500 mt-1" />
          <div>
            <h3 className="font-semibold">{site.location.city}</h3>
            <p className="text-sm text-muted-foreground">
              {site.location.county}, {site.location.state}
            </p>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Fossil Type:</span> {site.fossilType}</p>
          <p><span className="font-medium">Environment:</span> {site.environment}</p>
          <p><span className="font-medium">Age:</span> {site.age.start} - {site.age.end} Mya</p>
          <p><span className="font-medium">Distance:</span> {site.distance.toFixed(2)} km</p>
          <p className="mt-2 text-muted-foreground">{site.details}</p>
        </div>

        {isSelected && (
          <div className="mt-3 text-sm text-green-600">
            ✓ Site selected for excavation
          </div>
        )}
      </div>
    </div>
  )
} 