import { NextRequest, NextResponse } from 'next/server';

// Route Segment Config - Vercel 최적화
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  const { slideId } = await params;

  // Blob Storage URL로 307 리다이렉트
  const blobUrl = `https://lxlwj13vlxsg9aod.public.blob.vercel-storage.com/${slideId}.html`;

  return NextResponse.redirect(blobUrl, 307);
}
