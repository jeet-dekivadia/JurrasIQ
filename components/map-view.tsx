"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export function MapView({ onLocationSelect }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !mapRef.current) {
      // Initialize the map
      mapRef.current = L.map(containerRef.current).setView([0, 0], 2)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current)

      // Add terrain layer (optional)
      L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', {
        maxZoom: 18,
      }).addTo(mapRef.current)

      // Handle click events
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        if (onLocationSelect) {
          onLocationSelect({
            lat: e.latlng.lat,
            lng: e.latlng.lng
          })
        }
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onLocationSelect])

  return <div ref={containerRef} className="w-full h-[600px] rounded-lg" />
} 