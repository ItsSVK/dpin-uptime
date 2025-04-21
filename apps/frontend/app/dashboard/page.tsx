import { getWebsites } from '@/actions/website';
import DashboardPage from '@/components/pages/DashboardPage';
import { Website } from '@/types/website';
import { WebsiteTick } from '@/types/website';
import { redirect } from 'next/navigation';
export default async function DashboardPageWrapper() {
  const websites = await getWebsites();
  if (!websites.success) {
    // redirect to login
    redirect('/');
  }
  return (
    <DashboardPage
      websites={websites.data as (Website & { ticks: WebsiteTick[] })[]}
    />
  );
}
