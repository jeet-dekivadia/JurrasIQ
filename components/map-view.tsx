"use client"

import { useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MapViewProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export function MapView({ onLocationSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const map = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
      })

      const { Map } = await loader.importLibrary("maps")

      if (mapRef.current) {
        map.current = new Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          mapTypeId: 'terrain'
        })

        map.current.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (onLocationSelect && e.latLng) {
            onLocationSelect({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            })
          }
        })
      }
    }

    initMap()
  }, [onLocationSelect])

  return <div ref={mapRef} className="w-full h-[600px] rounded-lg" />
} 