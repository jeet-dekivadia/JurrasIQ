"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MarketValue } from "@/components/market-value"

const mockData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 3000 },
  { month: 'Mar', value: 5000 },
  { month: 'Apr', value: 2780 },
  { month: 'May', value: 1890 },
  { month: 'Jun', value: 2390 },
]

export default function MarketPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Fossil Market Analysis</h1>
      <div className="max-w-md mx-auto">
        <MarketValue />
      </div>
    </div>
  )
} 