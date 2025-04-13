import WebsiteDetails from '@/components/pages/WebsiteDetails';
import { getWebsite } from '@/actions/website';

async function WebsitePage({ params }: { params: Promise<{ id: string }> }) {
  const website = await getWebsite((await params).id);
  return <WebsiteDetails id={website.id} initialData={website} />;
}

export default WebsitePage;
