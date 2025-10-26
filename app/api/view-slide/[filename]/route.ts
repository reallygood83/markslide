import { head } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Vercel Blob에서 파일 메타데이터 확인
    const blob = await head(filename);

    if (!blob) {
      return NextResponse.json(
        { error: '슬라이드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Blob Storage에서 파일 가져오기
    const response = await fetch(blob.url);

    if (!response.ok) {
      return NextResponse.json(
        { error: '슬라이드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const htmlContent = await response.text();

    // HTML로 응답 (다운로드 방지)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline', // 다운로드가 아닌 브라우저 표시
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('슬라이드 조회 오류:', error);
    return NextResponse.json(
      { error: '슬라이드를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
