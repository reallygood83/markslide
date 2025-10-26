import { NextRequest, NextResponse } from 'next/server';
import { generatePresentationHtml } from '@/lib/slideGenerator';
import type { Theme } from '@/lib/themes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { markdown, metadata, theme } = body;

    // 입력 검증
    if (!markdown || !metadata || !theme) {
      return NextResponse.json(
        { error: '필수 매개변수가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 슬라이드 HTML 생성
    const html = await generatePresentationHtml(
      markdown,
      metadata,
      theme as Theme
    );

    // HTML 파일을 Blob으로 변환하여 응답으로 반환 (한글 인코딩 처리)
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(html);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.title || 'presentation')}.html"`,
      },
    });
  } catch (error) {
    console.error('슬라이드 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '슬라이드 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
