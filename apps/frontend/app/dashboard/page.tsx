import { getWebsites } from '@/actions/website';
import DashboardPage from '@/components/pages/DashboardPage';

export default async function DashboardPageWrapper() {
  const websites = await getWebsites();

  return <DashboardPage websites={websites} />;
}
