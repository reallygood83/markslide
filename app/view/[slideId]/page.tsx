import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slideId: string;
  }>;
}

export default async function SlideViewerPage({ params }: PageProps) {
  const { slideId } = await params;

  // Blob Storage URL로 직접 리다이렉트
  const blobUrl = `https://lxlwj13vlxsg9aod.public.blob.vercel-storage.com/${slideId}.html`;

  redirect(blobUrl);
}
