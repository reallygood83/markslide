import { NextRequest, NextResponse } from 'next/server';

// 짧은 URL: /s/slide-xxx
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  const { slideId } = await params;

  // Blob Storage에서 HTML 파일 가져오기
  const blobUrl = `https://lxlwj13vlxsg9aod.public.blob.vercel-storage.com/${slideId}.html`;

  try {
    // Blob Storage에서 HTML 콘텐츠 fetch
    const response = await fetch(blobUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    const htmlContent = await response.text();

    // HTML을 직접 반환 (다운로드가 아닌 브라우저 렌더링)
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
        // inline으로 설정하여 브라우저에서 바로 열림
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch slide' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
