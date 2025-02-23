"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { useToast } from "@/components/ui/use-toast"

interface PdfGeneratorProps {
  site: any;
}

export function PdfGenerator({ site }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const stripMarkdown = (text: string) => {
    if (!text) return ""
    return text
      .replace(/#+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/\n\s*\n/g, "\n\n")
      .trim()
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Get the excavation plan from the API
      const response = await fetch('/api/excavation/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site)
      })

      const data = await response.json()
      if (!data.report) throw new Error('Failed to generate report')

      // Create PDF
      const doc = new jsPDF()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(18)
      doc.text("Excavation Financial & Operational Plan", 10, 15)

      let y = 30
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)

      const sections = [
        { title: "Project Overview", content: stripMarkdown(data.report.project_overview) },
        { title: "Financial Breakdown", content: stripMarkdown(data.report.financial_breakdown) },
        { title: "Organizational Structure", content: stripMarkdown(data.report.organizational_structure) },
        { title: "Equipment & Logistics", content: stripMarkdown(data.report.equipment_logistics) },
        { title: "Excavation Timeline", content: stripMarkdown(data.report.excavation_timeline) },
        { title: "Risk Assessment", content: stripMarkdown(data.report.risk_assessment) },
        { title: "Long-Term Impact", content: stripMarkdown(data.report.long_term_impact) }
      ]

      sections.forEach((section) => {
        if (y > 250) {
          doc.addPage()
          y = 30
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(14)
        doc.text(section.title, 10, y)
        y += 10

        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)

        const splitText = doc.splitTextToSize(section.content, 180)
        splitText.forEach(line => {
          if (y > 270) {
            doc.addPage()
            y = 30
          }
          doc.text(line, 10, y)
          y += 7
        })

        y += 20
      })

      doc.save(`Excavation_Plan_${site.locationName.replace(/\s+/g, '_')}.pdf`)
      
      toast({
        title: "Success",
        description: "Excavation plan PDF has been generated and downloaded",
      })
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast({
        title: "Error",
        description: "Failed to generate excavation plan PDF",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="absolute top-2 right-2"
      onClick={generatePDF}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download Plan
        </>
      )}
    </Button>
  )
} 