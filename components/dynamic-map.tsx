"use client"

import { useEffect, useRef, useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin } from "lucide-react"
import { SearchLocation } from "@/components/search-location"
import type { FossilLocation } from '@/lib/load-fossil-data'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DynamicMapProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

interface ExtendedFossilLocation extends FossilLocation {
  distance?: number;
}

export default function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const userMarkerRef = useRef<any>(null)
  const siteMarkerRef = useRef<any>(null)
  const lineRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nearbyLocations, setNearbyLocations] = useState<ExtendedFossilLocation[]>([])
  const [selectedSite, setSelectedSite] = useState<ExtendedFossilLocation | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const initMap = async () => {
      try {
        if (!containerRef.current || mapRef.current) return;

        const L = (await import('leaflet')).default;
        await import('leaflet.heat');

        // Create map with light theme and better controls
        const map = L.map(containerRef.current, {
          center: [20, 0],
          zoom: 3,
          zoomControl: false,
          worldCopyJump: true,
          minZoom: 2,
          maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
          maxBoundsViscosity: 1.0
        });
        
        mapRef.current = map;

        // Add light theme tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '©OpenStreetMap, ©CartoDB',
          maxZoom: 19,
          subdomains: 'abcd'
        }).addTo(map);

        // Add zoom control to top-right
        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        // Add scale control
        L.control.scale({
          imperial: false,
          position: 'bottomright'
        }).addTo(map);

        // Load and add heatmap
        const response = await fetch('/api/fossils');
        if (!response.ok) throw new Error('Failed to load fossil data');
        const fossilData: FossilLocation[] = await response.json();

        // Create more precise heatmap data
        const heatData = fossilData.map(loc => [
          loc.latitude,
          loc.longitude,
          Math.min(8, loc.significance * 0.8) // Reduce intensity
        ]);

        const heat = (L as any).heatLayer(heatData, {
          radius: 15, // Smaller radius
          blur: 20,
          maxZoom: 12,
          max: 8,
          gradient: {
            0.1: '#fee2e2', // Very light red
            0.3: '#fca5a5', // Light red
            0.5: '#f87171', // Medium red
            0.7: '#ef4444', // Red
            0.9: '#dc2626'  // Dark red
          },
          minOpacity: 0.3
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
      setUserLocation(location);
      const L = (await import('leaflet')).default;

      // Clear existing markers and line
      if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
      if (siteMarkerRef.current) mapRef.current.removeLayer(siteMarkerRef.current);
      if (lineRef.current) mapRef.current.removeLayer(lineRef.current);

      // Add user location marker
      userMarkerRef.current = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="user-marker"></div>',
          iconSize: [20, 20]
        })
      })
        .bindPopup(`Your Location: ${location.address}`)
        .addTo(mapRef.current);

      // Center map on location
      mapRef.current.setView([location.lat, location.lng], 5);

      // Get nearby sites
      const response = await fetch('/api/fossils/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          radius: 10000
        })
      });

      const data = await response.json();
      setNearbyLocations(data.slice(0, 5));
      setSelectedSite(null);

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

  const handleSiteSelect = async (site: ExtendedFossilLocation) => {
    if (!mapRef.current || !userLocation) return;

    try {
      const L = (await import('leaflet')).default;

      // Clear existing site marker and line
      if (siteMarkerRef.current) mapRef.current.removeLayer(siteMarkerRef.current);
      if (lineRef.current) mapRef.current.removeLayer(lineRef.current);

      // Add site marker
      siteMarkerRef.current = L.marker([site.latitude, site.longitude], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="site-marker"></div>',
          iconSize: [20, 20]
        })
      }).addTo(mapRef.current);

      // Draw line between user location and site
      lineRef.current = L.polyline(
        [[userLocation.lat, userLocation.lng], [site.latitude, site.longitude]],
        {
          color: '#f97316',
          weight: 2,
          opacity: 0.8,
          dashArray: '5, 10'
        }
      ).addTo(mapRef.current);

      // Fit bounds to show both markers
      const bounds = L.latLngBounds(
        [userLocation.lat, userLocation.lng],
        [site.latitude, site.longitude]
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });

      setSelectedSite(site);

      // Get AI analysis for the site
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
      
      // Show popup with site info
      siteMarkerRef.current.bindPopup(`
        <div class="site-popup">
          <h3>Excavation Site Details</h3>
          <p><strong>Fossil Types:</strong> ${site.fossilType}</p>
          <p><strong>Environment:</strong> ${site.environment}</p>
          <p><strong>Age:</strong> ${site.age_start} - ${site.age_end} million years ago</p>
          <p><strong>Distance:</strong> ${site.distance?.toFixed(2)} km</p>
          <p><strong>Analysis:</strong> ${data.analysis}</p>
        </div>
      `, {
        maxWidth: 300,
        className: 'fossil-popup'
      }).openPopup();

    } catch (error) {
      console.error('Failed to select site:', error);
      toast({
        title: "Error",
        description: "Failed to load site details. Please try again.",
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

      <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
        <div className="relative w-full h-[70vh] rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/50">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <div 
            ref={containerRef} 
            className="absolute inset-0 z-0"
          />
        </div>

        {nearbyLocations.length > 0 && (
          <div className="space-y-4 lg:h-[70vh] lg:overflow-auto p-4 bg-card rounded-lg">
            <h3 className="text-lg font-semibold sticky top-0 bg-card pb-2">
              Nearby Excavation Sites
            </h3>
            {nearbyLocations.map((site, index) => (
              <Card
                key={index}
                className={`p-4 transition-colors cursor-pointer hover:bg-accent ${
                  selectedSite === site ? 'border-primary' : ''
                }`}
                onClick={() => handleSiteSelect(site)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Site #{index + 1}</h4>
                    <p className="text-sm text-muted-foreground">
                      {site.distance?.toFixed(2)} km away
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Fossils:</span> {site.fossilType.split(',')[0]}...
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Age:</span> {site.age_start} - {site.age_end} Mya
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 