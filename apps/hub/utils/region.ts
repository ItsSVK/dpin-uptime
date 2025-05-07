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
  [Region.US_CENTRAL]: {
    minLat: 29,
    maxLat: 49,
    minLng: -102,
    maxLng: -82,
    centerLat: 39,
    centerLng: -94,
  },
  [Region.CANADA_EAST]: {
    minLat: 42,
    maxLat: 62,
    minLng: -70,
    maxLng: -52,
    centerLat: 52,
    centerLng: -63,
  },
  [Region.CANADA_WEST]: {
    minLat: 48,
    maxLat: 60,
    minLng: -140,
    maxLng: -110,
    centerLat: 55,
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
  [Region.EUROPE_NORTH]: {
    minLat: 55,
    maxLat: 71,
    minLng: 10,
    maxLng: 30,
    centerLat: 63,
    centerLng: 20,
  },
  [Region.EUROPE_SOUTH]: {
    minLat: 36,
    maxLat: 46,
    minLng: -10,
    maxLng: 30,
    centerLat: 41,
    centerLng: 15,
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
  [Region.SOUTH_KOREA]: {
    minLat: 33,
    maxLat: 39,
    minLng: 124,
    maxLng: 130,
    centerLat: 36,
    centerLng: 127.5,
  },
  [Region.TAIWAN]: {
    minLat: 21,
    maxLat: 26,
    minLng: 119,
    maxLng: 123,
    centerLat: 23.5,
    centerLng: 121,
  },
  [Region.CHINA_MAINLAND]: {
    minLat: 18,
    maxLat: 54,
    minLng: 73,
    maxLng: 135,
    centerLat: 35,
    centerLng: 104,
  },
  [Region.HONG_KONG]: {
    minLat: 22,
    maxLat: 23,
    minLng: 113.8,
    maxLng: 114.5,
    centerLat: 22.3,
    centerLng: 114.2,
  },
  [Region.SINGAPORE]: {
    minLat: 1,
    maxLat: 2,
    minLng: 103,
    maxLng: 104,
    centerLat: 1.35,
    centerLng: 103.8,
  },
  [Region.SOUTHEAST_ASIA]: {
    minLat: -11,
    maxLat: 28,
    minLng: 95,
    maxLng: 155,
    centerLat: 7,
    centerLng: 110,
  },
  [Region.AUSTRALIA]: {
    minLat: -44,
    maxLat: -10,
    minLng: 113,
    maxLng: 154,
    centerLat: -25,
    centerLng: 134,
  },
  [Region.OCEANIA]: {
    minLat: -50,
    maxLat: 0,
    minLng: 110,
    maxLng: 180,
    centerLat: -20,
    centerLng: 160,
  },
  [Region.BRAZIL]: {
    minLat: -34,
    maxLat: 5,
    minLng: -74,
    maxLng: -34,
    centerLat: -14,
    centerLng: -51,
  },
  [Region.SOUTH_AMERICA_WEST]: {
    minLat: -56,
    maxLat: 12,
    minLng: -81,
    maxLng: -34,
    centerLat: -15,
    centerLng: -70,
  },
  [Region.SOUTH_AMERICA_EAST]: {
    minLat: -34,
    maxLat: 5,
    minLng: -60,
    maxLng: -34,
    centerLat: -20,
    centerLng: -45,
  },
  [Region.MEXICO]: {
    minLat: 14,
    maxLat: 33,
    minLng: -118,
    maxLng: -86,
    centerLat: 23,
    centerLng: -102,
  },
  [Region.CENTRAL_AMERICA]: {
    minLat: 7,
    maxLat: 18,
    minLng: -92,
    maxLng: -77,
    centerLat: 12.5,
    centerLng: -85,
  },
  [Region.SOUTH_AFRICA]: {
    minLat: -35,
    maxLat: -22,
    minLng: 16,
    maxLng: 33,
    centerLat: -29,
    centerLng: 24,
  },
  [Region.AFRICA_NORTH]: {
    minLat: 20,
    maxLat: 37,
    minLng: -17,
    maxLng: 37,
    centerLat: 30,
    centerLng: 10,
  },
  [Region.AFRICA_WEST]: {
    minLat: 4,
    maxLat: 20,
    minLng: -18,
    maxLng: 5,
    centerLat: 10,
    centerLng: -5,
  },
  [Region.AFRICA_EAST]: {
    minLat: -12,
    maxLat: 18,
    minLng: 25,
    maxLng: 52,
    centerLat: 2,
    centerLng: 37,
  },
  [Region.MIDDLE_EAST]: {
    minLat: 12,
    maxLat: 42,
    minLng: 32,
    maxLng: 60,
    centerLat: 25,
    centerLng: 45,
  },
  [Region.RUSSIA]: {
    minLat: 41,
    maxLat: 82,
    minLng: 19,
    maxLng: 180,
    centerLat: 61,
    centerLng: 99,
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
    normalized.includes('us central') ||
    normalized.includes('chicago') ||
    normalized.includes('texas')
  ) {
    return Region.US_CENTRAL;
  }
  if (
    normalized.includes('canada east') ||
    normalized.includes('montreal') ||
    normalized.includes('toronto')
  ) {
    return Region.CANADA_EAST;
  }
  if (
    normalized.includes('canada west') ||
    normalized.includes('vancouver') ||
    normalized.includes('alberta')
  ) {
    return Region.CANADA_WEST;
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
    normalized.includes('ukraine')
  ) {
    return Region.EUROPE_EAST;
  }
  if (
    normalized.includes('europe north') ||
    normalized.includes('sweden') ||
    normalized.includes('finland') ||
    normalized.includes('norway')
  ) {
    return Region.EUROPE_NORTH;
  }
  if (
    normalized.includes('europe south') ||
    normalized.includes('italy') ||
    normalized.includes('spain') ||
    normalized.includes('greece')
  ) {
    return Region.EUROPE_SOUTH;
  }
  if (normalized.includes('india')) {
    return Region.INDIA;
  }
  if (normalized.includes('japan')) {
    return Region.JAPAN;
  }
  if (normalized.includes('south korea') || normalized.includes('korea')) {
    return Region.SOUTH_KOREA;
  }
  if (normalized.includes('taiwan')) {
    return Region.TAIWAN;
  }
  if (normalized.includes('china') || normalized.includes('mainland')) {
    return Region.CHINA_MAINLAND;
  }
  if (normalized.includes('hong kong') || normalized.includes('hk')) {
    return Region.HONG_KONG;
  }
  if (normalized.includes('singapore')) {
    return Region.SINGAPORE;
  }
  if (
    normalized.includes('southeast asia') ||
    normalized.includes('thailand') ||
    normalized.includes('vietnam') ||
    normalized.includes('malaysia')
  ) {
    return Region.SOUTHEAST_ASIA;
  }
  if (normalized.includes('australia')) {
    return Region.AUSTRALIA;
  }
  if (
    normalized.includes('oceania') ||
    normalized.includes('fiji') ||
    normalized.includes('samoa')
  ) {
    return Region.OCEANIA;
  }
  if (normalized.includes('brazil')) {
    return Region.BRAZIL;
  }
  if (
    normalized.includes('south america west') ||
    normalized.includes('chile') ||
    normalized.includes('peru')
  ) {
    return Region.SOUTH_AMERICA_WEST;
  }
  if (
    normalized.includes('south america east') ||
    normalized.includes('argentina') ||
    normalized.includes('uruguay')
  ) {
    return Region.SOUTH_AMERICA_EAST;
  }
  if (normalized.includes('mexico')) {
    return Region.MEXICO;
  }
  if (
    normalized.includes('central america') ||
    normalized.includes('panama') ||
    normalized.includes('costa rica')
  ) {
    return Region.CENTRAL_AMERICA;
  }
  if (normalized.includes('south africa')) {
    return Region.SOUTH_AFRICA;
  }
  if (
    normalized.includes('africa north') ||
    normalized.includes('egypt') ||
    normalized.includes('morocco')
  ) {
    return Region.AFRICA_NORTH;
  }
  if (
    normalized.includes('africa west') ||
    normalized.includes('nigeria') ||
    normalized.includes('ghana')
  ) {
    return Region.AFRICA_WEST;
  }
  if (
    normalized.includes('africa east') ||
    normalized.includes('kenya') ||
    normalized.includes('ethiopia')
  ) {
    return Region.AFRICA_EAST;
  }
  if (
    normalized.includes('middle east') ||
    normalized.includes('uae') ||
    normalized.includes('israel') ||
    normalized.includes('saudi')
  ) {
    return Region.MIDDLE_EAST;
  }
  if (normalized.includes('russia')) {
    return Region.RUSSIA;
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
