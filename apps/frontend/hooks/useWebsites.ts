'use client';
import { useEffect, useState } from 'react';
import type { Website, WebsiteTick } from '@prisma/client';
import { getWebsite, getWebsites } from '../actions/website';

export function useWebsites(id?: string) {
  const [websites, setWebsites] = useState<
    (Website & { ticks: WebsiteTick[] })[]
  >([]);

  async function refreshWebsites() {
    try {
      // const token = await getToken();
      // const response = await fetch('/api/websites', {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      // setWebsites(data.websites);

      if (id) {
        const website = await getWebsite(id);
        setWebsites([website]);
      } else {
        const websites = await getWebsites();
        setWebsites(websites);
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error);
    }
  }

  useEffect(() => {
    refreshWebsites();

    const interval = setInterval(
      () => {
        refreshWebsites();
      },
      1000 * 60 * 1 // Refresh every minute
    );

    return () => clearInterval(interval);
  }, []);

  return { websites, refreshWebsites };
}
