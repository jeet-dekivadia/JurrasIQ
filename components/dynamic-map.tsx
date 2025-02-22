"use client"

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker, LayerGroup, HeatLayer } from 'leaflet'
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
  const heatmapLayerRef = useRef<HeatLayer | null>(null)
  const markersLayerRef = useRef<LayerGroup | null>(null)
  const [isCustomLocation, setIsCustomLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
      try {
        if (!containerRef.current || mapRef.current) return

        // Dynamically import Leaflet
        const L = (await import('leaflet')).default
        const { HeatLayer } = await import('leaflet.heat')

        // Initialize map
        const map = L.map(containerRef.current).setView([20, 0], 2)
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        mapRef.current = map
        markersLayerRef.current = L.layerGroup().addTo(map)

        // Load fossil data
        const response = await fetch('/api/fossils')
        const fossilData: FossilLocation[] = await response.json()

        // Create heatmap data
        const heatData = fossilData.map(loc => [
          loc.latitude,
          loc.longitude,
          Math.min(10, loc.significance) // Normalize significance
        ])

        // Create and add heatmap layer
        heatmapLayerRef.current = new HeatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: 10,
          gradient: {
            0.4: '#3b82f6', // blue
            0.6: '#84cc16', // lime
            0.8: '#facc15', // yellow
            1.0: '#ef4444'  // red
          }
        }).addTo(map)

        // Add markers for top 10 sites
        const topSites = [...fossilData]
          .sort((a, b) => b.significance - a.significance)
          .slice(0, 10)

        topSites.forEach((site, index) => {
          const marker = L.marker([site.latitude, site.longitude], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: `<div class='marker-pin' data-index='${index + 1}'></div>`,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })
          })

          // Add click handler for marker
          marker.on('click', async () => {
            try {
              const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                })
              })

              const data = await response.json()
              
              marker.bindPopup(`
                <div class="site-popup">
                  <h3>Top Excavation Site #${index + 1}</h3>
                  <p><strong>Fossil Types:</strong> ${site.fossilType}</p>
                  <p><strong>Environment:</strong> ${site.environment}</p>
                  <p><strong>Age:</strong> ${site.age_start} - ${site.age_end} million years ago</p>
                  <p><strong>Analysis:</strong> ${data.analysis}</p>
                </div>
              `, {
                maxWidth: 300,
                className: 'fossil-popup'
              }).openPopup()
            } catch (error) {
              console.error('Failed to get site analysis:', error)
              toast({
                title: "Error",
                description: "Failed to load site analysis",
                variant: "destructive"
              })
            }
          })

          marker.addTo(markersLayerRef.current!)
        })

        // Add click handler for custom location
        map.on('click', (e) => {
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
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isCustomLocation, onLocationSelect, toast])

  // Handle toggle between heatmap and custom location
  useEffect(() => {
    if (!mapRef.current) return

    if (isCustomLocation) {
      // Hide heatmap and markers
      if (heatmapLayerRef.current) {
        mapRef.current.removeLayer(heatmapLayerRef.current)
      }
      if (markersLayerRef.current) {
        mapRef.current.removeLayer(markersLayerRef.current)
      }
    } else {
      // Show heatmap and markers
      if (heatmapLayerRef.current) {
        mapRef.current.addLayer(heatmapLayerRef.current)
      }
      if (markersLayerRef.current) {
        mapRef.current.addLayer(markersLayerRef.current)
      }
      // Remove custom location marker
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
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <button
          onClick={() => setIsCustomLocation(!isCustomLocation)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-lg w-full"
        >
          {isCustomLocation ? 'View Heatmap' : 'Use Your Location'}
        </button>
      </div>
    </div>
  )
} 