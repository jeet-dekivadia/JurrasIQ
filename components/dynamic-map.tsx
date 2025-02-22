"use client"

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { FossilLocation } from '@/lib/load-fossil-data'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

interface DynamicMapProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export default function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const heatmapLayerRef = useRef<any>(null)
  const [isCustomLocation, setIsCustomLocation] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return

    // Fix Leaflet's default marker icon issue
    const icon = L.icon({
      iconUrl: '/marker-icon.png',
      iconRetinaUrl: '/marker-icon-2x.png',
      shadowUrl: '/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
    L.Marker.prototype.options.icon = icon

    // Initialize map
    mapRef.current = L.map(containerRef.current, {
      center: [0, 0],
      zoom: 2,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        })
      ]
    })

    // Load and add heatmap data
    const loadHeatmapData = async () => {
      try {
        const response = await fetch('/api/fossils')
        const fossilData: FossilLocation[] = await response.json()
        
        const heatmapData = fossilData.map(location => [
          location.latitude,
          location.longitude,
          location.significance
        ])

        heatmapLayerRef.current = L.heatLayer(heatmapData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: 10,
          gradient: {
            0.4: 'blue',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
          }
        }).addTo(mapRef.current!)
      } catch (error) {
        console.error('Failed to load heatmap data:', error)
      }
    }

    loadHeatmapData()

    // Handle click events when custom location is enabled
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      if (isCustomLocation && onLocationSelect) {
        const { lat, lng } = e.latlng
        
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!)
        }

        onLocationSelect({ lat, lng })
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onLocationSelect, isCustomLocation])

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setIsCustomLocation(!isCustomLocation)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          {isCustomLocation ? 'View Heatmap' : 'Use Your Location'}
        </button>
      </div>
      <div ref={containerRef} className="w-full h-[80vh] rounded-lg" />
    </div>
  )
} 