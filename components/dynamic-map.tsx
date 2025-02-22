"use client"

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker } from 'leaflet'
import type { FossilLocation } from '@/lib/load-fossil-data'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface DynamicMapProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export default function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<Marker | null>(null)
  const heatmapLayerRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const [isCustomLocation, setIsCustomLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [topSites, setTopSites] = useState<FossilLocation[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === 'undefined') return

    let isMounted = true

    const initMap = async () => {
      try {
        if (!containerRef.current || mapRef.current) return

        // Import Leaflet dynamically
        const L = (await import('leaflet')).default
        await import('leaflet.heat')

        // Create map instance
        const map = L.map(containerRef.current, {
          center: [20, 0],
          zoom: 2,
          layers: [
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            })
          ]
        })

        if (!isMounted) {
          map.remove()
          return
        }

        mapRef.current = map

        // Load fossil data
        const response = await fetch('/api/fossils')
        const fossilData: FossilLocation[] = await response.json()

        // Create heatmap layer
        const heatData = fossilData.map(loc => [
          loc.latitude,
          loc.longitude,
          loc.significance // Weight by significance
        ])
        
        heatmapLayerRef.current = L.heatLayer(heatData, {
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
        })

        // Get top 10 sites by significance
        const topSites = [...fossilData]
          .sort((a, b) => b.significance - a.significance)
          .slice(0, 10)
        
        setTopSites(topSites)

        // Create markers layer
        markersLayerRef.current = L.layerGroup()
        topSites.forEach((site, index) => {
          const marker = L.marker([site.latitude, site.longitude], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: `<div class='marker-pin'>${index + 1}</div>`,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })
          })

          marker.on('click', async () => {
            try {
              const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: 'analyze_location',
                  data: {
                    lat: site.latitude,
                    lng: site.longitude,
                    fossilType: site.fossilType,
                    environment: site.environment,
                    age_start: site.age_start,
                    age_end: site.age_end
                  }
                }),
              })

              const data = await response.json()
              
              marker.bindPopup(
                `<div class="site-popup">
                  <h3>Top Excavation Site #${index + 1}</h3>
                  <p><strong>Fossil Types:</strong> ${site.fossilType}</p>
                  <p><strong>Environment:</strong> ${site.environment}</p>
                  <p><strong>Age:</strong> ${site.age_start} - ${site.age_end} million years ago</p>
                  <p><strong>Analysis:</strong> ${data.analysis}</p>
                </div>`,
                { maxWidth: 300 }
              ).openPopup()
            } catch (error) {
              console.error('Failed to get site analysis:', error)
            }
          })

          marker.addTo(markersLayerRef.current)
        })

        // Add layers to map
        heatmapLayerRef.current.addTo(map)
        markersLayerRef.current.addTo(map)

        // Handle clicks for custom location
        map.on('click', (e: any) => {
          if (!isCustomLocation) return

          const { lat, lng } = e.latlng

          if (markerRef.current) {
            map.removeLayer(markerRef.current)
          }

          markerRef.current = L.marker([lat, lng]).addTo(map)
          onLocationSelect?.({ lat, lng })
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Map initialization failed:', error)
        toast({
          title: "Error",
          description: "Failed to load the map. Please try again.",
          variant: "destructive"
        })
      }
    }

    initMap()

    return () => {
      isMounted = false
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
      if (markersLayerRef.current) {
        mapRef.current.removeLayer(markersLayerRef.current)
      }
    } else {
      if (heatmapLayerRef.current) {
        mapRef.current.addLayer(heatmapLayerRef.current)
      }
      if (markersLayerRef.current) {
        mapRef.current.addLayer(markersLayerRef.current)
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
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 rounded-lg"
      />
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setIsCustomLocation(!isCustomLocation)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-lg"
        >
          {isCustomLocation ? 'View Heatmap' : 'Use Your Location'}
        </button>
      </div>
    </div>
  )
} 