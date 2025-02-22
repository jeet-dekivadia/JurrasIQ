"use client"

import { useEffect, useRef, useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { FossilLocation } from '@/lib/load-fossil-data'

interface DynamicMapProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

export default function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const heatmapLayerRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const [isCustomLocation, setIsCustomLocation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let map: any = null;
    
    const initMap = async () => {
      try {
        if (!containerRef.current || mapRef.current) return;

        // Import dependencies
        const L = (await import('leaflet')).default;
        await import('leaflet.heat');

        // Create map
        map = L.map(containerRef.current).setView([20, 0], 2);
        mapRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Create markers layer
        markersLayerRef.current = L.layerGroup().addTo(map);

        // Load fossil data
        const response = await fetch('/api/fossils');
        if (!response.ok) throw new Error('Failed to load fossil data');
        const fossilData: FossilLocation[] = await response.json();

        // Create heatmap
        const heatData = fossilData.map(loc => [
          loc.latitude,
          loc.longitude,
          Math.min(10, loc.significance)
        ]);

        heatmapLayerRef.current = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: 10,
          gradient: {
            0.4: '#3b82f6',
            0.6: '#84cc16',
            0.8: '#facc15',
            1.0: '#ef4444'
          }
        }).addTo(map);

        // Add top 10 markers
        const topSites = [...fossilData]
          .sort((a, b) => b.significance - a.significance)
          .slice(0, 10);

        topSites.forEach((site, index) => {
          const marker = L.marker([site.latitude, site.longitude], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: `<div class='marker-pin' data-index='${index + 1}'></div>`,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })
          });

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
              });

              const data = await response.json();
              
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
              }).openPopup();
            } catch (error) {
              console.error('Failed to get site analysis:', error);
              toast({
                title: "Error",
                description: "Failed to load site analysis",
                variant: "destructive"
              });
            }
          });

          marker.addTo(markersLayerRef.current);
        });

        // Handle custom location selection
        map.on('click', (e: any) => {
          if (!isCustomLocation) return;

          const { lat, lng } = e.latlng;

          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          markerRef.current = L.marker([lat, lng]).addTo(map);
          onLocationSelect?.({ lat, lng });
        });

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
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [isCustomLocation, onLocationSelect, toast]);

  // Handle mode switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isCustomLocation) {
      if (heatmapLayerRef.current) map.removeLayer(heatmapLayerRef.current);
      if (markersLayerRef.current) map.removeLayer(markersLayerRef.current);
    } else {
      if (heatmapLayerRef.current) map.addLayer(heatmapLayerRef.current);
      if (markersLayerRef.current) map.addLayer(markersLayerRef.current);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [isCustomLocation]);

  return (
    <div className="relative w-full h-[80vh]">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
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
  );
} 