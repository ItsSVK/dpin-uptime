import DashboardDetailPageComponent from '@/components/pages/DashboardDetailPage';

export default async function DashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DashboardDetailPageComponent id={id} />;
}
