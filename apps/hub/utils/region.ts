import { Region } from '@prisma/client';

// Regional coordinate boundaries (approximate)
const REGION_BOUNDS = {
  [Region.EUROPE]: {
    minLat: 35,
    maxLat: 71,
    minLng: -25,
    maxLng: 40,
    centerLat: 54.5,
    centerLng: 15.2,
  },
  [Region.NORTH_AMERICA]: {
    minLat: 15,
    maxLat: 71,
    minLng: -168,
    maxLng: -50,
    centerLat: 45.5,
    centerLng: -101.2,
  },
  [Region.ASIA]: {
    minLat: -10,
    maxLat: 63,
    minLng: 40,
    maxLng: 180,
    centerLat: 34.0,
    centerLng: 100.6,
  },
  [Region.AUSTRALIA]: {
    minLat: -47,
    maxLat: -10,
    minLng: 110,
    maxLng: 180,
    centerLat: -25.2,
    centerLng: 133.7,
  },
};

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findRegionByCoordinates(latitude: number, longitude: number): Region {
  // First check if coordinates fall within any region's bounds
  for (const [region, bounds] of Object.entries(REGION_BOUNDS)) {
    if (
      latitude >= bounds.minLat &&
      latitude <= bounds.maxLat &&
      longitude >= bounds.minLng &&
      longitude <= bounds.maxLng
    ) {
      return region as Region;
    }
  }

  // If not in any bounds, find closest region center
  let closestRegion: Region = Region.EUROPE;
  let minDistance = Infinity;

  for (const [region, bounds] of Object.entries(REGION_BOUNDS)) {
    const distance = calculateDistance(
      latitude,
      longitude,
      bounds.centerLat,
      bounds.centerLng
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region as Region;
    }
  }

  return closestRegion;
}

export function mapToRegion(
  regionStr: string,
  latitude?: number,
  longitude?: number
): Region {
  const normalized = regionStr.toLowerCase();

  // Try string-based mapping first
  if (normalized.includes('europe') || normalized.includes('eu')) {
    return Region.EUROPE;
  }
  if (normalized.includes('asia')) {
    return Region.ASIA;
  }
  if (
    normalized.includes('america') ||
    normalized.includes('us') ||
    normalized.includes('canada')
  ) {
    return Region.NORTH_AMERICA;
  }
  if (normalized.includes('australia') || normalized.includes('oceania')) {
    return Region.AUSTRALIA;
  }

  // For development/localhost
  if (normalized === 'unknown' || normalized.includes('localhost')) {
    return Region.EUROPE;
  }

  // If coordinates are available, use them for mapping
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return findRegionByCoordinates(latitude, longitude);
  }

  console.warn(
    `Unknown region "${regionStr}", defaulting to closest major region`
  );
  return Region.EUROPE;
}

export function isLocalhost(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  );
}

export function getRegionInfo(region: Region) {
  return REGION_BOUNDS[region];
}
