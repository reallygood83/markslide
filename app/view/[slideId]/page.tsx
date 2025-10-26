import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slideId: string;
  }>;
}

export default async function SlideViewerPage({ params }: PageProps) {
  const { slideId } = await params;

  // Blob Storage URL로 직접 리다이렉트 (308 Permanent Redirect)
  const blobUrl = `https://lxlwj13vlxsg9aod.public.blob.vercel-storage.com/${slideId}.html`;

  permanentRedirect(blobUrl);
}
