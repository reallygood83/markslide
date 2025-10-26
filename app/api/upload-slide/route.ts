import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 확인
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: 'BLOB_READ_WRITE_TOKEN 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 Blob Storage를 생성하고 토큰을 설정해주세요.'
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일명을 짧고 간단하게 변경 (타임스탬프 기반)
    const timestamp = Date.now();
    const shortFilename = `slide-${timestamp}.html`;

    // Vercel Blob Storage에 업로드
    const blob = await put(shortFilename, file, {
      access: 'public', // 공개 URL 생성
      addRandomSuffix: false, // 타임스탬프로 이미 고유성 보장
      contentType: 'text/html; charset=utf-8', // HTML로 브라우저에서 열리도록
      cacheControlMaxAge: 31536000, // 1년 캐시
    });

    // 뷰어 페이지 URL 생성 (iframe으로 슬라이드를 표시)
    const slideId = `slide-${timestamp}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (request.headers.get('host')?.includes('localhost')
                      ? 'http://localhost:3000'
                      : 'https://markslide.vercel.app');
    const viewerUrl = `${baseUrl}/view/${slideId}`;

    return NextResponse.json({
      success: true,
      url: viewerUrl, // 뷰어 페이지 URL (iframe으로 슬라이드 표시)
      blobUrl: blob.url, // 원본 Blob URL
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error('슬라이드 업로드 중 오류 발생:', error);

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
