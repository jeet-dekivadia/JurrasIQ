"use client"

import { useEffect, useRef, useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin } from "lucide-react"
import { SearchLocation } from "@/components/search-location"
import type { FossilLocation } from '@/lib/load-fossil-data'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlanViewer } from "@/components/plan-viewer"

interface DynamicMapProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

interface ExtendedFossilLocation extends FossilLocation {
  distance?: number;
  locationName?: string;
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
    const loadMapDependencies = async () => {
      try {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const L = (await import('leaflet')).default;
        await import('leaflet.heat');

        // Create map
        const map = L.map(containerRef.current!, {
          center: [39.8283, -98.5795],
          zoom: 4,
          zoomControl: false,
          minZoom: 3,
          maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
          maxBoundsViscosity: 1.0
        });
        
        mapRef.current = map;

        // Define base layers with more reliable sources
        const baseLayers = {
          'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
          }),
          'Streets': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }),
          'Terrain': L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.jpg', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            maxZoom: 18
          }),
          'Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
          })
        };

        // Add default layer (Satellite)
        baseLayers['Satellite'].addTo(map);

        // Add labels layer
        const labelsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
          attribution: '©OpenStreetMap, ©CartoDB',
          subdomains: 'abcd',
          maxZoom: 19,
          pane: 'labels'  // Ensure labels are always on top
        });

        // Create overlay layers object for layer control
        const overlayLayers = {
          'Labels': labelsLayer
        };

        // Add layer control
        L.control.layers(baseLayers, overlayLayers, {
          position: 'topright',
          collapsed: false
        }).addTo(map);

        // Add other controls
        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        L.control.scale({
          imperial: true,
          metric: true,
          position: 'bottomright'
        }).addTo(map);

        // Load and add heatmap
        const response = await fetch('/api/fossils');
        if (!response.ok) throw new Error('Failed to load fossil data');
        const fossilData: FossilLocation[] = await response.json();

        // Process data for heatmap
        const heatData = fossilData
          .filter(loc => loc.latitude && loc.longitude)
          .map(loc => [
            loc.latitude,
            loc.longitude,
            Math.min(1, loc.significance * 0.2)
          ]);

        // Create heatmap layer
        const heat = (L as any).heatLayer(heatData, {
          radius: 20,
          blur: 30,
          maxZoom: 12,
          max: 1.0,
          gradient: {
            0.0: 'rgba(0, 0, 255, 0)',
            0.2: 'rgba(0, 0, 255, 0.5)',
            0.4: 'rgba(0, 255, 255, 0.7)',
            0.6: 'rgba(0, 255, 0, 0.7)',
            0.8: 'rgba(255, 255, 0, 0.8)',
            1.0: 'rgba(255, 0, 0, 0.9)'
          },
          minOpacity: 0.2
        }).addTo(map);

        // Add heatmap to overlay layers
        overlayLayers['Heatmap'] = heat;

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

    loadMapDependencies();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // Remove Leaflet CSS
      const leafletLink = document.querySelector('link[href*="leaflet.css"]');
      if (leafletLink) {
        leafletLink.remove();
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
                className={`p-4 transition-colors cursor-pointer hover:bg-accent relative ${
                  selectedSite === site ? 'border-primary' : ''
                }`}
                onClick={() => handleSiteSelect(site)}
              >
                <PlanViewer site={site} />
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{site.locationName || `Site #${index + 1}`}</h4>
                    <p className="text-sm text-muted-foreground">
                      {site.distance?.toFixed(2)} km away
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Fossils:</span> {site.fossilType}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Age:</span> {site.age_start} - {site.age_end} Mya
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Environment:</span> {site.environment}
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