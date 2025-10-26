import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  try {
    const { slideId } = await params;

    // Blob Storage URL 구성 (소문자로 고정)
    const blobUrl = `https://lxlwj13vlxsg9aod.public.blob.vercel-storage.com/${slideId}.html`;

    // Blob Storage에서 HTML 가져오기
    const response = await fetch(blobUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: '슬라이드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const htmlContent = await response.text();

    // HTML을 inline으로 표시하도록 헤더 설정
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline', // 다운로드가 아닌 표시
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('슬라이드 프록시 중 오류:', error);
    return NextResponse.json(
      { error: '슬라이드를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
