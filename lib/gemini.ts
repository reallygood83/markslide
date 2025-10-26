import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini API 클라이언트를 생성하는 함수
 * 서버사이드에서만 사용 가능 (API 키는 서버사이드 환경 변수 또는 요청 헤더에서 읽음)
 */
function getGeminiClient(apiKeyFromRequest?: string): GoogleGenerativeAI {
  // 1. 요청에서 전달된 API 키 우선
  // 2. 서버 환경 변수에서 읽기
  const apiKey = apiKeyFromRequest || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not set. Please configure your API key in Settings or set GEMINI_API_KEY environment variable.');
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * 일반 텍스트를 마크다운으로 변환하는 함수
 * @param text - 변환할 일반 텍스트
 * @param apiKey - Gemini API 키 (선택사항, 없으면 환경 변수 사용)
 * @returns 마크다운 형식으로 변환된 텍스트
 */
export async function convertTextToMarkdown(text: string, apiKey?: string): Promise<string> {
  try {
    const genAI = getGeminiClient(apiKey);
    // gemini-2.0-flash-exp 모델 사용
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `당신은 일반 텍스트를 마크다운 형식으로 변환하는 전문가입니다.

아래의 텍스트를 마크다운 슬라이드 형식으로 변환해주세요:

변환 규칙:
1. 주제별로 슬라이드를 나누고, 각 슬라이드는 "---"로 구분합니다
2. 메인 제목은 # (H1)을 사용합니다
3. 섹션 제목은 ## (H2)를 사용합니다
4. 하위 제목은 ### (H3)를 사용합니다
5. 중요한 포인트는 불릿 리스트(- )로 작성합니다
6. 순서가 있는 내용은 번호 리스트(1. 2. 3.)로 작성합니다
7. 코드는 \`\`\` 코드 블록으로 감싸주세요
8. 강조할 내용은 **굵게** 또는 *기울임*으로 표시합니다
9. 첫 번째 슬라이드는 제목 슬라이드로 만들어주세요
10. 마지막 슬라이드는 감사 슬라이드로 만들어주세요

텍스트:
${text}

위 텍스트를 마크다운 슬라이드 형식으로 변환해주세요. 마크다운 코드만 반환하고, 다른 설명은 하지 마세요.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const markdown = response.text();

    // 마크다운 코드 블록 제거 (만약 AI가 ```markdown ```로 감쌌다면)
    const cleanedMarkdown = markdown
      .replace(/^```markdown\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    return cleanedMarkdown;
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('텍스트를 마크다운으로 변환하는 중 오류가 발생했습니다.');
  }
}

/**
 * 마크다운을 향상시키는 함수 (슬라이드 형식에 최적화)
 * @param markdown - 기존 마크다운 텍스트
 * @param apiKey - Gemini API 키 (선택사항, 없으면 환경 변수 사용)
 * @returns 향상된 마크다운 텍스트
 */
export async function enhanceMarkdownForSlides(markdown: string, apiKey?: string): Promise<string> {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `당신은 마크다운 슬라이드를 최적화하는 전문가입니다.

아래의 마크다운을 슬라이드 발표용으로 최적화해주세요:

최적화 규칙:
1. 각 슬라이드의 내용을 간결하게 정리합니다 (한 슬라이드당 5-7개 포인트)
2. 너무 긴 슬라이드는 여러 슬라이드로 분할합니다
3. 제목과 내용의 계층 구조를 명확히 합니다
4. 시각적 요소(리스트, 표, 코드 블록)를 효과적으로 배치합니다
5. 슬라이드 간 논리적 흐름을 유지합니다

기존 마크다운:
${markdown}

위 마크다운을 슬라이드 발표용으로 최적화해주세요. 마크다운 코드만 반환하고, 다른 설명은 하지 마세요.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const enhancedMarkdown = response.text();

    const cleanedMarkdown = enhancedMarkdown
      .replace(/^```markdown\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    return cleanedMarkdown;
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('마크다운을 향상시키는 중 오류가 발생했습니다.');
  }
}
