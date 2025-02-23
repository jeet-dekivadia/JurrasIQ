import { NextResponse } from 'next/server'
import { loadFossilData } from '@/lib/load-fossil-data'

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number) {
  return value * Math.PI / 180;
}

function getLocationName(lat: number, lng: number): Promise<string> {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  )
    .then(res => res.json())
    .then(data => data.display_name)
    .catch(() => 'Unknown Location');
}

export async function POST(req: Request) {
  try {
    const { latitude, longitude, radius } = await req.json();
    const fossilData = loadFossilData();

    // Get all locations with distances
    let locations = fossilData.map(location => ({
      ...location,
      distance: getDistance(
        latitude,
        longitude,
        location.latitude,
        location.longitude
      )
    }));

    // Sort by distance
    locations = locations.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // Filter locations within radius and maintain minimum distance between sites
    const selectedLocations: typeof locations = [];
    const MIN_DISTANCE = 100; // km

    for (const location of locations) {
      if (location.distance > radius) continue;
      
      // Check if this location is far enough from already selected locations
      const isFarEnough = selectedLocations.every(selected => 
        getDistance(
          selected.latitude,
          selected.longitude,
          location.latitude,
          location.longitude
        ) >= MIN_DISTANCE
      );

      if (isFarEnough) {
        // Get location name
        const locationName = await getLocationName(location.latitude, location.longitude);
        selectedLocations.push({
          ...location,
          locationName
        });
      }

      if (selectedLocations.length >= 5) break;
    }

    return NextResponse.json(selectedLocations);
  } catch (error) {
    console.error('Failed to find nearby locations:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby locations' },
      { status: 500 }
    );
  }
} 