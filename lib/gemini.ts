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
 * v2.0 - 단계별 명령형 프롬프트로 슬라이드 분리 강제
 */
const basePrompt = `당신은 전문 프레젠테이션 슬라이드 제작 전문가입니다.

# 🎯 핵심 미션: 완벽한 PPT 표준 마크다운 생성

당신은 반드시 아래의 **3단계 프로세스**를 순서대로 따라야 합니다.

---

# 📋 STEP 1: 텍스트 구조 파악 (먼저 분석부터!)

**작업**: 주어진 텍스트를 읽고 다음을 식별하세요:
1. **메인 섹션 개수**: ## (H2) 제목이 몇 개인가?
2. **서브 섹션 개수**: ### (H3) 소제목이 몇 개인가?
3. **예상 슬라이드 수**: 메인 섹션 + 서브 섹션 + 표지 + 마무리 = 총 X개

**중요**: 각 H2와 H3는 **반드시 별도의 슬라이드**가 되어야 합니다!

---

# ⚙️ STEP 2: 슬라이드별 내용 배분 (섹션마다 슬라이드 만들기!)

**절대 규칙**:
- ✅ **각 H2 앞에는 반드시 "---" 추가**
- ✅ **각 H3 앞에는 반드시 "---" 추가**
- ✅ 한 슬라이드 = 한 H2 또는 한 H3 + 불릿 5-7개

**슬라이드 생성 순서**:

### 1단계: 표지 슬라이드 만들기
\`\`\`markdown
# [메인 제목]

작성자: [이름]
날짜: [YYYY년 MM월]
---
\`\`\`
→ **반드시 "---"로 끝내기!**

### 2단계: 첫 번째 H2 섹션 슬라이드 만들기
\`\`\`markdown
## [첫 번째 H2 제목]

- 포인트 1
- 포인트 2
- 포인트 3
- 포인트 4
- 포인트 5
---
\`\`\`
→ **슬라이드 끝에 반드시 "---" 추가!**

### 3단계: 해당 H2의 첫 번째 H3 소제목 슬라이드 만들기
\`\`\`markdown
### [첫 번째 H3 소제목]

- 세부 내용 1
- 세부 내용 2
- 세부 내용 3
- 세부 내용 4
---
\`\`\`
→ **슬라이드 끝에 반드시 "---" 추가!**

### 4단계: 해당 H2의 두 번째 H3 소제목 슬라이드 만들기
\`\`\`markdown
### [두 번째 H3 소제목]

- 세부 내용 1
- 세부 내용 2
- 세부 내용 3
---
\`\`\`
→ **슬라이드 끝에 반드시 "---" 추가!**

### 5단계: 두 번째 H2 섹션 슬라이드 만들기
\`\`\`markdown
## [두 번째 H2 제목]

- 포인트 1
- 포인트 2
- 포인트 3
---
\`\`\`
→ **절대로! H2 앞에 "---" 없이 쓰지 말 것!**

### 6단계: 위 과정을 모든 H2, H3에 반복

### 7단계: 마무리 슬라이드 만들기
\`\`\`markdown
# 감사합니다

질문이 있으신가요?
\`\`\`
→ **마지막 슬라이드는 "---" 없이 끝내도 됨**

---

# ✅ STEP 3: 자가 검증 (출력 전 필수 체크!)

**마크다운을 출력하기 전에 스스로 확인하세요**:

1. ✅ **슬라이드 구분자 체크**: 모든 H2와 H3 앞에 "---"가 있는가?
2. ✅ **섹션 혼합 체크**: 한 슬라이드에 H2가 2개 이상 있는가? (있으면 안됨!)
3. ✅ **소제목 분리 체크**: 한 슬라이드에 H3가 3개 이상 있는가? (있으면 안됨!)
4. ✅ **불릿 개수 체크**: 한 슬라이드에 불릿이 7개를 넘는가? (넘으면 안됨!)
5. ✅ **슬라이드 수 체크**: 예상한 슬라이드 수만큼 생성되었는가?

**검증 실패 시**: 위 단계로 돌아가서 다시 생성하세요!

---

# 📐 기술 사양 (참고용)

- 슬라이드 안전 영역: 600px
- H1 제목: 80px
- H2 섹션: 60px
- H3 소제목: 50px
- 불릿 포인트: 40px/개 (최대 5-7개)
- 코드 블록: 최대 10줄
- 표: 최대 5행

---

# ⛔ 절대 금지!

❌ **절대로 "---" 없이 H2나 H3를 시작하지 마세요!**
❌ **절대로 한 슬라이드에 여러 H2를 넣지 마세요!**
❌ **절대로 한 슬라이드에 H3를 3개 이상 넣지 마세요!**

---

# 🎯 출력 형식

**중요**: 마크다운 코드**만** 출력하세요. 설명이나 주석은 넣지 마세요.

**올바른 출력 예시**:
\`\`\`markdown
# 제목

작성자: 김철수
날짜: 2025년 1월
---
## 섹션 1

- 내용 1
- 내용 2
---
### 섹션 1의 세부사항

- 세부 1
- 세부 2
---
## 섹션 2

- 내용 1
---
# 감사합니다
\`\`\`

이제 위의 **3단계 프로세스**를 엄격히 따라서 마크다운을 생성하세요!`;

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
 * @param modelName - 사용할 Gemini 모델명 (선택사항, 기본값: gemini-2.0-flash-exp)
 * @returns 마크다운 형식으로 변환된 텍스트와 메타데이터
 */
export async function convertTextToMarkdown(
  text: string,
  apiKey?: string,
  pageCount?: number,
  modelName?: string
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
    const selectedModel = modelName || 'gemini-2.0-flash-exp';
    const model = genAI.getGenerativeModel({ model: selectedModel });

    console.log('🚀 사용 중인 Gemini 모델:', selectedModel);

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
