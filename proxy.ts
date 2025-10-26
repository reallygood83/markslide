import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /view/:slideId 경로 처리
  if (pathname.startsWith('/view/')) {
    const slideId = pathname.replace('/view/', '');

    // Blob Storage URL로 리다이렉트
    const blobUrl = `https://lxlwj13vlxsg9aod.public.blob.vercel-storage.com/${slideId}.html`;

    return NextResponse.redirect(blobUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/view/:path*',
};
