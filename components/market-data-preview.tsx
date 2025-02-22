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
import { Loader2 } from "lucide-react"

interface TransactionData {
  'Fossil Family': string
  'Body part': string
  'Original Cost': string
  'Adjusted Cost': string
}

export function MarketDataPreview() {
  const [data, setData] = useState<TransactionData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        const response = await fetch('/api/market/preview')
        if (!response.ok) throw new Error('Failed to load preview data')
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error('Failed to load preview data:', error)
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
              {data.map((row: TransactionData, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row['Fossil Family']}</TableCell>
                  <TableCell>{row['Body part']}</TableCell>
                  <TableCell className="text-right">{row['Original Cost']}</TableCell>
                  <TableCell className="text-right">{row['Adjusted Cost']}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 