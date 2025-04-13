import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { Website } from '@/types/website';

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const { getToken } = useAuth();

  const fetchWebsites = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/websites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setWebsites(data.websites);
    } catch (error) {
      console.error('Failed to fetch websites:', error);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  return {
    websites,
    refreshWebsites: fetchWebsites,
  };
}
