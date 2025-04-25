import { getWebsites } from '@/actions/website';
import { processWebsiteData } from '@/lib/websiteUtils';
import { redirect } from 'next/navigation';
import { ProcessedWebsite } from '@/types/website';
import { WebsiteStatus } from '@prisma/client';
import DashboardPage from '@/components/pages/DashboardPage';
import { hasActiveValidators } from '@/actions/website';
export default async function WebsitesPage() {
  const response = await getWebsites();
  const hasActiveValidator = await hasActiveValidators();

  if (!response.success || !response.data || !hasActiveValidator.success) {
    redirect('/');
  }

  // Process the raw website data to get derived stats
  const websites: ProcessedWebsite[] = response.data.map(website =>
    processWebsiteData(website)
  );

  // Calculate aggregate stats for the WebsiteListStats component
  const stats = {
    total: websites.length,
    online: websites.filter(w => w.status === WebsiteStatus.ONLINE).length,
    issues: websites.filter(
      w =>
        w.status === WebsiteStatus.OFFLINE ||
        w.status === WebsiteStatus.DEGRADED
    ).length,
    avgUptime:
      websites.length > 0
        ? websites.reduce((sum, site) => sum + site.uptimePercentage, 0) /
          websites.length
        : 0,
    avgResponse:
      websites.length > 0
        ? websites.reduce((sum, site) => sum + (site.responseTime || 0), 0) /
            websites.filter(site => site.responseTime !== null).length || 0
        : 0,
    hasActiveValidator: hasActiveValidator.data || false,
  };

  return <DashboardPage websites={websites} stats={stats} />;
}
