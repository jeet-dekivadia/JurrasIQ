"use client"

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { FossilLocation } from '@/lib/load-fossil-data'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface DynamicMapProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export default function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const heatmapLayerRef = useRef<any>(null)
  const [isCustomLocation, setIsCustomLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
      if (!containerRef.current || mapRef.current) return

      setIsLoading(true)
      try {
        // Import Leaflet dynamically
        const L = (await import('leaflet')).default

        // Wait for container to be ready
        await new Promise(resolve => setTimeout(resolve, 100))

        // Initialize map
        const map = L.map(containerRef.current)
        mapRef.current = map
        map.setView([20, 0], 2)

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // Load fossil data
        const response = await fetch('/api/fossils')
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.details || error.error || 'Failed to fetch fossil data')
        }

        const fossilData: FossilLocation[] = await response.json()
        if (!fossilData?.length) {
          throw new Error('No fossil data available')
        }

        console.log(`Rendering ${fossilData.length} fossil locations`)

        // Create heatmap layer
        const { HeatLayer } = await import('leaflet.heat')
        const heatmapData = fossilData.map(location => ([
          location.latitude,
          location.longitude,
          location.significance * 2
        ]))

        // @ts-ignore - HeatLayer types are not properly defined
        heatmapLayerRef.current = L.heatLayer(heatmapData, {
          radius: 30,
          blur: 20,
          maxZoom: 10,
          max: 20,
          gradient: {
            0.2: 'blue',
            0.4: 'cyan',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
          }
        }).addTo(map)

        // Handle location selection
        map.on('click', (e: L.LeafletMouseEvent) => {
          if (isCustomLocation) {
            const { lat, lng } = e.latlng
            
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng])
            } else {
              markerRef.current = L.marker([lat, lng]).addTo(map)
            }

            onLocationSelect?.({ lat, lng })
          } else {
            // Show fossil info popup
            const nearbyFossils = fossilData.filter(location => {
              const distance = map.distance(
                [location.latitude, location.longitude],
                [e.latlng.lat, e.latlng.lng]
              )
              return distance < 100000 // Within 100km
            })

            if (nearbyFossils.length > 0) {
              L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                  <div class="p-2">
                    <h3 class="font-bold">Fossil Site Information</h3>
                    <p>Number of sites: ${nearbyFossils.length}</p>
                    <p>Types found: ${Array.from(new Set(nearbyFossils.map(f => f.fossilType))).slice(0, 3).join(', ')}...</p>
                  </div>
                `)
                .openOn(map)
            }
          }
        })

      } catch (error) {
        console.error('Failed to initialize map:', error)
        toast({
          title: "Error",
          description: String(error) || "Failed to load map data. Please try refreshing the page.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isCustomLocation, onLocationSelect, toast])

  // Toggle between heatmap and location selection
  useEffect(() => {
    if (!mapRef.current) return

    if (isCustomLocation) {
      if (heatmapLayerRef.current) {
        mapRef.current.removeLayer(heatmapLayerRef.current)
      }
    } else {
      if (heatmapLayerRef.current) {
        mapRef.current.addLayer(heatmapLayerRef.current)
      }
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current)
        markerRef.current = null
      }
    }
  }, [isCustomLocation])

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-[80vh]">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setIsCustomLocation(!isCustomLocation)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          {isCustomLocation ? 'View Heatmap' : 'Use Your Location'}
        </button>
      </div>
    </div>
  )
} 