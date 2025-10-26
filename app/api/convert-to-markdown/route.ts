import { NextRequest, NextResponse } from 'next/server';
import { convertTextToMarkdown } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, apiKey } = body;

    // 입력 검증
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: '빈 텍스트는 변환할 수 없습니다.' },
        { status: 400 }
      );
    }

    // API 키 검증 (클라이언트에서 전달하거나 환경 변수 사용)
    if (!apiKey && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.' },
        { status: 401 }
      );
    }

    // Gemini API를 사용하여 텍스트를 마크다운으로 변환
    const markdown = await convertTextToMarkdown(text, apiKey);

    return NextResponse.json({
      success: true,
      markdown,
    });
  } catch (error) {
    console.error('텍스트→마크다운 변환 중 오류 발생:', error);

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
