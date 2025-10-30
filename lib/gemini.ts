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
 * MarkSlide 화면 균형 최적화를 위한 기본 프롬프트
 */
const basePrompt = `당신은 MarkSlide 슬라이드 최적화 전문가입니다.

# 핵심 원칙
1. **한 슬라이드 한 화면**: 스크롤이 필요 없도록 콘텐츠 조절
2. **화면 균형**: 콘텐츠를 화면에 균형있게 배치
3. **시각적 몰입**: 여백을 활용한 가독성 향상

# 기술적 제약사항 (반드시 준수)
- 슬라이드 안전 영역: 약 600px
- H1 제목: 80px (슬라이드당 1개)
- H2 섹션: 60px (슬라이드당 1-2개)
- H3 소제목: 50px (슬라이드당 2-3개)
- 불릿 포인트: 40px/개 (최대 5-7개)
- 번호 리스트: 40px/개 (최대 5-7개)
- 코드 블록: 300px (최대 10줄)
- 표: 250px (최대 5행)

# 권장 콘텐츠 조합 (600px 이내 유지)
✅ H2 + 5-7개 불릿 = 약 400px
✅ H2 + 코드 블록(10줄) = 약 360px
✅ H2 + 표(5행) + 3개 불릿 = 약 430px
✅ H2 + H3 2개 + 4개 불릿 = 약 380px

# 변환 규칙
1. 주제별로 슬라이드를 나누고, 각 슬라이드는 "---"로 구분
2. 메인 제목은 # (H1) 사용
3. 섹션 제목은 ## (H2) 사용
4. 하위 제목은 ### (H3) 사용
5. 중요한 포인트는 불릿 리스트(- ) 사용 (5-7개 이내)
6. 순서가 있는 내용은 번호 리스트 사용 (5-7개 이내)
7. 코드는 \`\`\` 코드 블록으로 감싸기 (10줄 이내)
8. 강조할 내용은 **굵게** 또는 *기울임* 표시
9. 첫 번째 슬라이드는 제목 슬라이드로 작성
10. 마지막 슬라이드는 감사 슬라이드로 작성

# 화면 균형 체크리스트
- [ ] 각 슬라이드가 600px 이내인가?
- [ ] 불릿 포인트가 7개를 초과하지 않는가?
- [ ] 코드 블록이 10줄을 초과하지 않는가?
- [ ] 표가 5행을 초과하지 않는가?
- [ ] 콘텐츠가 화면에 균형있게 배치되는가?`;

/**
 * YouTube iframe 콘텐츠 최적화 프롬프트
 */
const youtubePrompt = `# YouTube 영상 포함 시 특별 규칙

**YouTube iframe 최적화**:
- iframe 높이는 고정 400px 사용
- iframe + 설명은 최대 5줄 이내로 제한
- 전체 높이를 600px 이내로 유지

**권장 형식**:
\`\`\`markdown
## 영상 제목

<iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>

**핵심 내용**:
- 포인트 1
- 포인트 2
- 포인트 3
\`\`\`

**중요**: 영상이 있는 슬라이드는 다른 콘텐츠를 최소화하여 600px 이내 유지`;

/**
 * 코드 블록 콘텐츠 최적화 프롬프트
 */
const codePrompt = `# 코드 블록 포함 시 특별 규칙

**코드 블록 최적화**:
- 코드는 최대 10줄 이내로 제한
- 긴 코드는 여러 슬라이드로 분할
- 코드 설명은 3줄 이내로 간결하게

**권장 형식**:
\`\`\`markdown
## 코드 예제

\`\`\`javascript
// 10줄 이내의 핵심 코드
function example() {
  // ...
}
\`\`\`

**설명**:
- 핵심 포인트 1
- 핵심 포인트 2
\`\`\`

**중요**: 코드 블록(300px) + 설명(120px) = 약 420px로 유지`;

/**
 * 표 콘텐츠 최적화 프롬프트
 */
const tablePrompt = `# 표 포함 시 특별 규칙

**표 최적화**:
- 표는 최대 5행 이내로 제한
- 큰 표는 여러 슬라이드로 분할
- 표 설명은 2줄 이내로 간결하게

**권장 형식**:
\`\`\`markdown
## 데이터 요약

| 항목 | 값 | 비고 |
|------|-----|------|
| 항목1 | 값1 | 설명1 |
| 항목2 | 값2 | 설명2 |
| 항목3 | 값3 | 설명3 |
| 항목4 | 값4 | 설명4 |

**요약**:
- 핵심 포인트 1
- 핵심 포인트 2
\`\`\`

**중요**: 표(250px) + 요약(80px) = 약 330px로 유지`;

/**
 * 특수 콘텐츠 감지 인터페이스
 */
interface SpecialContentDetection {
  hasYoutube: boolean;
  hasCode: boolean;
  hasTable: boolean;
}

/**
 * 특수 콘텐츠 감지 함수
 */
function detectSpecialContent(text: string): SpecialContentDetection {
  return {
    hasYoutube: /youtube\.com|youtu\.be/i.test(text),
    hasCode: /```|function|class|def |public |private |const |let |var /i.test(text),
    hasTable: /\|.*\|.*\|/m.test(text)
  };
}

/**
 * 마크다운 품질 검증 함수 (개발용)
 */
function validateMarkdownQuality(markdown: string): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const slides = markdown.split('---');

  slides.forEach((slide, index) => {
    const slideNum = index + 1;

    // 불릿 포인트 개수 체크
    const bullets = slide.match(/^- /gm);
    if (bullets && bullets.length > 7) {
      warnings.push(`슬라이드 ${slideNum}: 불릿 포인트가 ${bullets.length}개로 권장 개수(5-7개)를 초과합니다.`);
    }

    // 코드 블록 줄 수 체크
    const codeBlocks = slide.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      codeBlocks.forEach((block, blockIndex) => {
        const lines = block.split('\n').length - 2; // ``` 제외
        if (lines > 10) {
          warnings.push(`슬라이드 ${slideNum}: 코드 블록 ${blockIndex + 1}이 ${lines}줄로 권장 크기(10줄)를 초과합니다.`);
        }
      });
    }

    // 표 행 수 체크
    const tableRows = slide.match(/^\|.*\|$/gm);
    if (tableRows && tableRows.length > 6) { // 헤더 + 5행
      warnings.push(`슬라이드 ${slideNum}: 표가 ${tableRows.length - 1}행으로 권장 크기(5행)를 초과합니다.`);
    }

    // YouTube iframe 체크
    if (slide.includes('<iframe') && slide.includes('youtube')) {
      const linesAfterIframe = slide.split('<iframe')[1]?.split('\n').length || 0;
      if (linesAfterIframe > 10) {
        warnings.push(`슬라이드 ${slideNum}: YouTube iframe 이후 콘텐츠가 너무 많습니다 (권장: 5줄 이내).`);
      }
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * 일반 텍스트를 MarkSlide 최적화 마크다운으로 변환하는 함수
 * @param text - 변환할 일반 텍스트
 * @param apiKey - Gemini API 키 (선택사항, 없으면 환경 변수 사용)
 * @param pageCount - 목표 슬라이드 페이지 수 (선택사항, 자동 계산)
 * @returns 마크다운 형식으로 변환된 텍스트와 메타데이터
 */
export async function convertTextToMarkdown(
  text: string,
  apiKey?: string,
  pageCount?: number
): Promise<{
  markdown: string;
  metadata: {
    pageCount: number;
    hasYoutube: boolean;
    hasCode: boolean;
    hasTable: boolean;
  };
}> {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 페이지 수 자동 계산 (텍스트 길이 기반)
    // 평균 한글 800자 = 슬라이드 1페이지
    const targetPages = pageCount || Math.max(3, Math.min(25, Math.ceil(text.length / 800)));

    // 특수 콘텐츠 감지
    const specialContent = detectSpecialContent(text);

    // 동적 프롬프트 구성
    let fullPrompt = basePrompt;

    if (specialContent.hasYoutube) {
      fullPrompt = youtubePrompt + '\n\n' + fullPrompt;
    }

    if (specialContent.hasCode) {
      fullPrompt = codePrompt + '\n\n' + fullPrompt;
    }

    if (specialContent.hasTable) {
      fullPrompt = tablePrompt + '\n\n' + fullPrompt;
    }

    // 최종 프롬프트에 텍스트와 목표 페이지 수 추가
    fullPrompt += `\n\n# 목표 슬라이드 수
약 ${targetPages}개의 슬라이드로 구성해주세요.

# 변환할 텍스트
${text}

위 텍스트를 MarkSlide 최적화 마크다운 슬라이드로 변환해주세요.
**중요**: 각 슬라이드가 600px 이내가 되도록 콘텐츠를 적절히 분할하고 조절해주세요.
마크다운 코드만 반환하고, 다른 설명은 하지 마세요.`;

    // Gemini API 호출
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const markdown = response.text();

    // 마크다운 코드 블록 제거
    const cleanedMarkdown = markdown
      .replace(/^```markdown\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    // 품질 검증 (개발 환경에서만 로그 출력)
    if (process.env.NODE_ENV === 'development') {
      const validation = validateMarkdownQuality(cleanedMarkdown);
      if (!validation.isValid) {
        console.warn('⚠️  마크다운 품질 경고:', validation.warnings);
      }
    }

    return {
      markdown: cleanedMarkdown,
      metadata: {
        pageCount: targetPages,
        hasYoutube: specialContent.hasYoutube,
        hasCode: specialContent.hasCode,
        hasTable: specialContent.hasTable
      }
    };
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
