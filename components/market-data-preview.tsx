"use client"

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TransactionData {
  'Fossil Family': string
  'Body part': string
  'Original Cost': string
  'Adjusted Cost': string
}

export function MarketDataPreview() {
  const [data, setData] = useState<TransactionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        setError(null)
        const response = await fetch('/api/market/preview')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const text = await response.text()
        if (!text) {
          throw new Error('Empty response received')
        }

        try {
          const jsonData = JSON.parse(text)
          if (!Array.isArray(jsonData)) {
            throw new Error('Invalid data format received')
          }
          setData(jsonData)
        } catch (e) {
          console.error('JSON parse error:', e, 'Raw text:', text)
          throw new Error('Failed to parse response data')
        }
      } catch (error) {
        console.error('Failed to load preview data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    loadPreviewData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Fossil Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fossil Family</TableHead>
                <TableHead>Body Part</TableHead>
                <TableHead className="text-right">Original Cost</TableHead>
                <TableHead className="text-right">Adjusted Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((row: TransactionData, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row['Fossil Family']}</TableCell>
                    <TableCell>{row['Body part']}</TableCell>
                    <TableCell className="text-right">{row['Original Cost']}</TableCell>
                    <TableCell className="text-right">{row['Adjusted Cost']}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No transaction data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 