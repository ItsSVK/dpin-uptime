import WebsiteDetails from '@/components/pages/WebsiteDetails';
import { getWebsite } from '@/actions/website';
import { redirect } from 'next/navigation';
import { WebsiteTick } from '@/types/website';
import { Website } from '@/types/website';
async function WebsitePage({ params }: { params: Promise<{ id: string }> }) {
  const response = await getWebsite((await params).id);
  if (!response.success) {
    redirect('/');
  }
  return (
    <WebsiteDetails
      id={(await params).id}
      initialWebsite={response.data as Website & { ticks: WebsiteTick[] }}
    />
  );
}

export default WebsitePage;
