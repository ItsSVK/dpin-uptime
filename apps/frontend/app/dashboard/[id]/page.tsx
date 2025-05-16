import DashboardDetailPageComponent from '@/components/pages/DashboardDetailPage';

export const metadata = {
  title: 'Dashboard - DPIN Uptime',
  description: 'View your dashboard and manage your websites',
};

export default async function DashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DashboardDetailPageComponent id={id} />;
}
