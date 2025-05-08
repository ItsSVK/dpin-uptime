import { Region } from '@prisma/client';
import { isLocalhost, mapToRegion } from '@/utils/region';

export async function getGeoData(ip: string) {
  // For localhost/development environments, return a default region
  if (isLocalhost(ip)) {
    return {
      country: 'Development',
      city: 'Local',
      region: Region.INDIA,
      latitude: 0,
      longitude: 0,
      ip: ip,
    };
  }

  // Try primary provider (ipapi.co)
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (!data.error) {
      return {
        country: data.country_name,
        city: data.city,
        region: mapToRegion(data.region, data.latitude, data.longitude),
        latitude: data.latitude,
        longitude: data.longitude,
        ip: ip,
      };
    }
    throw new Error('Failed to get location data from primary provider');
  } catch (primaryError) {
    console.log((primaryError as Error).message);

    // Try secondary provider (geojs.io)
    try {
      const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
      const data = await response.json();

      if (data.latitude === 'nil') {
        throw new Error('Failed to get location data from secondary provider');
      }

      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);

      return {
        country: data.country,
        city: data.city,
        region: mapToRegion(data.region, lat, lng),
        latitude: lat,
        longitude: lng,
        ip: ip,
      };
    } catch (secondaryError) {
      console.log((secondaryError as Error).message);

      // Return default values if both providers fail
      return {
        country: 'Unknown',
        city: 'Unknown',
        region: Region.INDIA,
        latitude: 0,
        longitude: 0,
        ip: ip,
      };
    }
  }
}
