import WebsiteDetails from '@/components/pages/WebsiteDetails';

async function WebsitePage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  return <WebsiteDetails id={id} />;
}

export default WebsitePage;
