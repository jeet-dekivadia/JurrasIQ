"use client"

import { MarketValue } from "@/components/market-value"
import { MarketDataPreview } from "@/components/market-data-preview"

export default function MarketPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Fossil Market Analysis</h1>
      <div className="grid gap-8">
        <div className="max-w-md mx-auto">
          <MarketValue />
        </div>
        <div>
          <MarketDataPreview />
        </div>
      </div>
    </div>
  )
} 