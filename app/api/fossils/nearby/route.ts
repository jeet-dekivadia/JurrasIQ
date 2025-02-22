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

export async function POST(req: Request) {
  try {
    const { latitude, longitude, radius } = await req.json();
    const fossilData = loadFossilData();

    const nearbyLocations = fossilData
      .map(location => ({
        ...location,
        distance: getDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        )
      }))
      .filter(location => location.distance <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return NextResponse.json(nearbyLocations);
  } catch (error) {
    console.error('Failed to find nearby locations:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby locations' },
      { status: 500 }
    );
  }
} 