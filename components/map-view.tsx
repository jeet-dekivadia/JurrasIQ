"use client"

import { Loader2 } from "lucide-react"
import dynamic from 'next/dynamic'

interface MapViewProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

// Dynamically import the map component with no SSR
const DynamicMap = dynamic(
  () => import('./dynamic-map').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[80vh] rounded-lg flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
)

export function MapView(props: MapViewProps) {
  return <DynamicMap {...props} />
} 