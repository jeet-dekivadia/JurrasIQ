"use client"

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"
import type { Map as LeafletMap } from 'leaflet'
import type { FossilLocation } from '@/lib/load-fossil-data'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

// Dynamically import the map component with no SSR
const DynamicMap = dynamic(() => import('./dynamic-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[80vh] rounded-lg flex items-center justify-center bg-muted">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

interface MapViewProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export function MapView(props: MapViewProps) {
  return <DynamicMap {...props} />
} 