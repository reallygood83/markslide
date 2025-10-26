import { NextRequest, NextResponse } from 'next/server';
import { buildBlobUrl } from '@/lib/storage/vercelBlob';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slideId = searchParams.get('slideId');

    if (!slideId) {
      return NextResponse.json(
        { error: '슬라이드 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const blobUrl = buildBlobUrl(slideId);
    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Blob Storage 설정이 없습니다.' },
        { status: 500 }
      );
    }

    // Blob URL이 존재하는지 확인
    const checkResponse = await fetch(blobUrl, { method: 'HEAD' });

    if (!checkResponse.ok) {
      return NextResponse.json(
        { error: '슬라이드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      url: blobUrl,
    });
  } catch (error) {
    console.error('슬라이드 URL 조회 오류:', error);
    return NextResponse.json(
      { error: '슬라이드 URL을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
