import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, MapPin } from 'lucide-react'
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
    setIsGenerating(true)
    try {
      const response = await fetch('/api/excavation/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site)
      })

      const data = await response.json()
      
      // Create PDF
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Add header
      page.drawText(`Excavation Plan: ${site.location.city}, ${site.location.state}`, {
        x: 50,
        y: height - 50,
        size: 20,
        font
      })

      // Add content
      let yPosition = height - 100
      Object.entries(data.report).forEach(([key, value]) => {
        yPosition -= 30
        page.drawText(`${key}: ${value}`, {
          x: 50,
          y: yPosition,
          size: 12,
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

    } catch (error) {
      console.error('Failed to generate plan:', error)
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
        onClick={() => {
          setIsSelected(!isSelected)
          if (!isSelected) {
            generatePDF()
          }
        }}
      >
        <Check className="h-5 w-5" />
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