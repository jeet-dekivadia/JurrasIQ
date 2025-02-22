"use client"

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { FossilLocation } from '@/lib/load-fossil-data'
import { useToast } from "@/components/ui/use-toast"

interface DynamicMapProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export default function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const heatmapLayerRef = useRef<any>(null)
  const [isCustomLocation, setIsCustomLocation] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initMap = async () => {
      if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return

      // Dynamically import Leaflet
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      await import('leaflet.heat')

      // Fix Leaflet's default marker icon issue
      const icon = L.icon({
        iconUrl: '/marker-icon.png',
        iconRetinaUrl: '/marker-icon-2x.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })

      // Initialize map
      mapRef.current = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          })
        ]
      })

      // Load and add heatmap data
      try {
        const response = await fetch('/api/fossils')
        const fossilData: FossilLocation[] = await response.json()
        
        if (fossilData.length === 0) {
          throw new Error('No fossil data available')
        }

        const heatmapData = fossilData.map(location => ([
          location.latitude,
          location.longitude,
          location.significance * 2
        ]))

        // @ts-ignore
        heatmapLayerRef.current = L.heatLayer(heatmapData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: 10,
          gradient: {
            0.4: 'blue',
            0.6: 'cyan',
            0.7: 'lime',
            0.8: 'yellow',
            1.0: 'red'
          }
        }).addTo(mapRef.current)

        // Handle location button click
        if (isCustomLocation) {
          // Remove heatmap when in location selection mode
          if (heatmapLayerRef.current) {
            mapRef.current.removeLayer(heatmapLayerRef.current)
          }
          
          // Try to get user's location
          mapRef.current.locate({
            setView: true,
            maxZoom: 8,
            enableHighAccuracy: true
          })

          mapRef.current.on('locationfound', (e: any) => {
            if (markerRef.current) {
              markerRef.current.setLatLng(e.latlng)
            } else {
              markerRef.current = L.marker(e.latlng, { icon }).addTo(mapRef.current!)
            }
            onLocationSelect?.(e.latlng)
          })

          mapRef.current.on('locationerror', (e: any) => {
            toast({
              title: "Location Error",
              description: "Could not get your location. Please click on the map to select a location.",
              variant: "destructive"
            })
          })
        } else {
          // Show heatmap in view mode
          if (heatmapLayerRef.current) {
            mapRef.current.addLayer(heatmapLayerRef.current)
          }
        }

        // Handle map clicks
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          if (isCustomLocation) {
            const { lat, lng } = e.latlng
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng])
            } else {
              markerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current!)
            }
            onLocationSelect?.({ lat, lng })
          } else {
            // Show fossil info popup
            const nearbyFossils = fossilData.filter(location => {
              const distance = mapRef.current!.distance(
                [location.latitude, location.longitude],
                [e.latlng.lat, e.latlng.lng]
              )
              return distance < 100000
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
                .openOn(mapRef.current!)
            }
          }
        })

      } catch (error) {
        console.error('Failed to load heatmap data:', error)
        toast({
          title: "Error",
          description: "Failed to load fossil data. Please try refreshing the page.",
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
  }, [onLocationSelect, isCustomLocation, toast])

  return (
    <div className="relative w-full h-[80vh]">
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setIsCustomLocation(!isCustomLocation)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          {isCustomLocation ? 'View Heatmap' : 'Use Your Location'}
        </button>
      </div>
      <div ref={containerRef} className="w-full h-full rounded-lg" />
    </div>
  )
} 