import WebsiteDetails from '@/components/pages/WebsiteDetails';
import { getWebsite } from '@/actions/website';

async function WebsitePage({ params }: { params: Promise<{ id: string }> }) {
  const initialWebsite = await getWebsite((await params).id);
  return (
    <WebsiteDetails id={(await params).id} initialWebsite={initialWebsite} />
  );
}

export default WebsitePage;
