import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface ExcavationSite {
  name: string
  location: string
  fossilType: string
  environment: string
  age: number
  distance: number
  details: string
}

export function ExcavationPlanner({ site }: { site: ExcavationSite }) {
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

      page.drawText('Excavation Plan', {
        x: 50,
        y: height - 50,
        size: 20,
        font
      })

      // Add report content
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
      link.download = `excavation_plan_${site.name.toLowerCase().replace(/\s+/g, '_')}.pdf`
      link.click()

    } catch (error) {
      console.error('Failed to generate plan:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">{site.name}</h3>
        <p className="text-sm text-muted-foreground">{site.location}</p>
        <div className="mt-2 space-y-1 text-sm">
          <p>Fossil Type: {site.fossilType}</p>
          <p>Environment: {site.environment}</p>
          <p>Age: {site.age} million years</p>
          <p>Distance: {site.distance}km</p>
          <p className="mt-2">{site.details}</p>
        </div>
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="mt-4"
        >
          {isGenerating ? 'Generating Plan...' : 'Choose to excavate, Make plan!'}
        </Button>
      </div>
    </div>
  )
} 