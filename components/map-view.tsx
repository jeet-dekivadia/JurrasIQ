"use client"

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export function MapView({ onLocationSelect }: MapViewProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamic import of Leaflet to avoid SSR issues
    const initMap = async () => {
      if (typeof window !== 'undefined' && containerRef.current && !mapRef.current) {
        // Dynamically import Leaflet
        const L = (await import('leaflet')).default

        // Fix Leaflet's default marker icon issue
        const icon = L.icon({
          iconUrl: '/marker-icon.png',
          iconRetinaUrl: '/marker-icon-2x.png',
          shadowUrl: '/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
        L.Marker.prototype.options.icon = icon

        // Initialize the map
        mapRef.current = L.map(containerRef.current).setView([0, 0], 2)

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current)

        // Add terrain layer
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
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onLocationSelect])

  return <div ref={containerRef} className="w-full h-[600px] rounded-lg" />
} 