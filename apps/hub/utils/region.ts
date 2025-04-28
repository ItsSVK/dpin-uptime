import { Region } from '@prisma/client';

// Regional coordinate boundaries (approximate)
const REGION_BOUNDS = {
  [Region.US_EAST]: {
    minLat: 24,
    maxLat: 49,
    minLng: -82,
    maxLng: -66,
    centerLat: 37,
    centerLng: -77,
  },
  [Region.US_WEST]: {
    minLat: 32,
    maxLat: 49,
    minLng: -125,
    maxLng: -102,
    centerLat: 41,
    centerLng: -120,
  },
  [Region.EUROPE_WEST]: {
    minLat: 36,
    maxLat: 60,
    minLng: -10,
    maxLng: 10,
    centerLat: 48,
    centerLng: 2,
  },
  [Region.EUROPE_EAST]: {
    minLat: 45,
    maxLat: 71,
    minLng: 10,
    maxLng: 40,
    centerLat: 55,
    centerLng: 25,
  },
  [Region.INDIA]: {
    minLat: 8,
    maxLat: 37,
    minLng: 68,
    maxLng: 97,
    centerLat: 22,
    centerLng: 78,
  },
  [Region.JAPAN]: {
    minLat: 24,
    maxLat: 46,
    minLng: 123,
    maxLng: 146,
    centerLat: 36,
    centerLng: 138,
  },
  [Region.SINGAPORE]: {
    minLat: 1,
    maxLat: 2,
    minLng: 103,
    maxLng: 104,
    centerLat: 1.35,
    centerLng: 103.8,
  },
  [Region.AUSTRALIA]: {
    minLat: -44,
    maxLat: -10,
    minLng: 113,
    maxLng: 154,
    centerLat: -25,
    centerLng: 134,
  },
  [Region.BRAZIL]: {
    minLat: -34,
    maxLat: 5,
    minLng: -74,
    maxLng: -34,
    centerLat: -14,
    centerLng: -51,
  },
  [Region.SOUTH_AFRICA]: {
    minLat: -35,
    maxLat: -22,
    minLng: 16,
    maxLng: 33,
    centerLat: -29,
    centerLng: 24,
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
  let closestRegion: Region = Region.EUROPE_WEST;
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

  if (
    normalized.includes('us east') ||
    normalized.includes('new york') ||
    normalized.includes('virginia')
  ) {
    return Region.US_EAST;
  }
  if (
    normalized.includes('us west') ||
    normalized.includes('california') ||
    normalized.includes('oregon')
  ) {
    return Region.US_WEST;
  }
  if (
    normalized.includes('europe west') ||
    normalized.includes('france') ||
    normalized.includes('germany') ||
    normalized.includes('uk')
  ) {
    return Region.EUROPE_WEST;
  }
  if (
    normalized.includes('europe east') ||
    normalized.includes('poland') ||
    normalized.includes('ukraine') ||
    normalized.includes('russia')
  ) {
    return Region.EUROPE_EAST;
  }
  if (normalized.includes('india')) {
    return Region.INDIA;
  }
  if (normalized.includes('japan')) {
    return Region.JAPAN;
  }
  if (normalized.includes('singapore')) {
    return Region.SINGAPORE;
  }
  if (normalized.includes('australia')) {
    return Region.AUSTRALIA;
  }
  if (normalized.includes('brazil')) {
    return Region.BRAZIL;
  }
  if (normalized.includes('south africa')) {
    return Region.SOUTH_AFRICA;
  }

  // For development/localhost
  if (normalized === 'unknown' || normalized.includes('localhost')) {
    return Region.EUROPE_WEST;
  }

  // If coordinates are available, use them for mapping
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return findRegionByCoordinates(latitude, longitude);
  }

  console.warn(
    `Unknown region "${regionStr}", defaulting to closest major region`
  );
  return Region.EUROPE_WEST;
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
