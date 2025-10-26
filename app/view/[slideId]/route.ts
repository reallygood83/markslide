import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  const { slideId } = await params;

  // Blob Storage URL로 리다이렉트
  const blobUrl = `https://lxlwj13vlxsg9aod.public.blob.vercel-storage.com/${slideId}.html`;

  return NextResponse.redirect(blobUrl, 307);
}

export const runtime = 'edge';
