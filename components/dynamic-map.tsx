"use client"

import { useEffect, useRef, useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { SearchLocation } from "@/components/search-location"
import type { FossilLocation } from '@/lib/load-fossil-data'

interface DynamicMapProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export default function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nearbyLocations, setNearbyLocations] = useState<FossilLocation[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const initMap = async () => {
      try {
        if (!containerRef.current || mapRef.current) return;

        // Import dependencies
        const L = (await import('leaflet')).default;

        // Load the pre-generated heatmap HTML
        const response = await fetch('/map/fossil_heatmap.html');
        const html = await response.text();
        
        // Extract the heatmap data from the HTML
        const heatmapDataMatch = html.match(/L\.heatLayer\((.*?)\)/s);
        const heatmapData = heatmapDataMatch ? JSON.parse(heatmapDataMatch[1]) : [];

        // Create map
        const map = L.map(containerRef.current).setView([20, 0], 2);
        mapRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add heatmap layer
        L.heatLayer(heatmapData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          gradient: {
            0.4: '#3b82f6',
            0.6: '#84cc16',
            0.8: '#facc15',
            1.0: '#ef4444'
          }
        }).addTo(map);

        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization failed:', error);
        toast({
          title: "Error",
          description: "Failed to load the map. Please try again.",
          variant: "destructive"
        });
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [toast]);

  const handleLocationSelect = async (location: { lat: number; lng: number; address: string }) => {
    if (!mapRef.current) return;

    try {
      // Clear existing marker
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      const L = (await import('leaflet')).default;
      markerRef.current = L.marker([location.lat, location.lng])
        .bindPopup(`Your Location: ${location.address}`)
        .addTo(mapRef.current);

      // Center map on location
      mapRef.current.setView([location.lat, location.lng], 8);

      // Get nearby excavation sites
      const response = await fetch('/api/fossils/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          radius: 10000 // 10,000 km radius
        })
      });

      const data = await response.json();
      setNearbyLocations(data.slice(0, 5)); // Get top 5 sites

      // Notify parent component
      onLocationSelect?.({ lat: location.lat, lng: location.lng });

    } catch (error) {
      console.error('Failed to process location:', error);
      toast({
        title: "Error",
        description: "Failed to process location. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchLocation 
          onLocationSelect={handleLocationSelect}
          isLoading={isLoading}
        />
      </div>

      <div className="relative w-full h-[60vh]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <div 
          ref={containerRef} 
          className="absolute inset-0 z-0 rounded-lg"
        />
      </div>

      {nearbyLocations.length > 0 && (
        <div className="grid gap-4 mt-4">
          <h3 className="text-lg font-semibold">Nearby Excavation Sites</h3>
          {nearbyLocations.map((site, index) => (
            <div 
              key={index}
              className="p-4 bg-card rounded-lg shadow"
            >
              <h4 className="font-semibold">Site #{index + 1}</h4>
              <p><strong>Fossil Types:</strong> {site.fossilType}</p>
              <p><strong>Environment:</strong> {site.environment}</p>
              <p><strong>Age:</strong> {site.age_start} - {site.age_end} million years ago</p>
              <p><strong>Distance:</strong> {site.distance?.toFixed(2)} km</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 