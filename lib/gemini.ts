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
 * v3.0 - H2/H3 강제 분리 및 자동 슬라이드 생성 규칙 강화
 */
const basePrompt = `당신은 전문 프레젠테이션 슬라이드 제작 전문가입니다.

# 🎯 핵심 미션: 모든 H2와 H3를 독립 슬라이드로 분리

**절대 규칙 - 예외 없음!**:
1. ✅ **각 H2 제목은 무조건 새 슬라이드** ("---" 앞에 배치)
2. ✅ **각 H3 소제목도 무조건 새 슬라이드** ("---" 앞에 배치)
3. ✅ **한 슬라이드 = 한 제목(H2 또는 H3) + 본문 5-7줄**
4. ❌ **절대로 H2나 H3를 같은 슬라이드에 2개 이상 넣지 마세요!**

---

# 📋 STEP 1: 텍스트 구조 완전 분석

**필수 작업**:
1. 원본 텍스트에서 **모든 H2 제목**을 찾으세요
2. 원본 텍스트에서 **모든 H3 소제목**을 찾으세요
3. 예상 슬라이드 수 계산: \`1(표지) + H2개수 + H3개수 + 1(마무리) = 총 X개\`

**예시**:
- 원본에 H2가 3개, 각 H2마다 H3가 2개씩 있다면
- → 슬라이드 수 = 1 + 3 + 6 + 1 = **11개 슬라이드**

---

# ⚙️ STEP 2: 슬라이드 생성 (엄격한 순서!)

## 🔹 규칙 A: H2 제목은 항상 독립 슬라이드

**잘못된 예시** (절대 금지!):
\`\`\`markdown
## 섹션 1

- 내용 1
- 내용 2

### 섹션 1의 세부사항

- 세부 1
---
\`\`\`
❌ **한 슬라이드에 H2와 H3가 함께 있음!**

**올바른 예시**:
\`\`\`markdown
## 섹션 1

- 내용 1
- 내용 2
- 내용 3
---

### 섹션 1의 세부사항

- 세부 1
- 세부 2
---
\`\`\`
✅ **H2와 H3가 별도 슬라이드로 분리됨!**

## 🔹 규칙 B: H3 소제목도 항상 독립 슬라이드

**잘못된 예시** (절대 금지!):
\`\`\`markdown
### 세부사항 1

- 내용 1

### 세부사항 2

- 내용 2
---
\`\`\`
❌ **한 슬라이드에 H3가 2개!**

**올바른 예시**:
\`\`\`markdown
### 세부사항 1

- 내용 1
- 내용 2
---

### 세부사항 2

- 내용 3
- 내용 4
---
\`\`\`
✅ **각 H3가 별도 슬라이드!**

## 🔹 규칙 C: "---" 배치 규칙

**절대 원칙**:
- 모든 H2 제목 **앞**에는 "---" (단, 문서 첫 H2는 제외)
- 모든 H3 소제목 **앞**에는 "---"
- 각 슬라이드 **끝**에도 "---" (마지막 슬라이드 제외)

**정확한 패턴**:
\`\`\`markdown
# 표지
...
---
## 첫 번째 H2
...
---
### 첫 번째 H3
...
---
### 두 번째 H3
...
---
## 두 번째 H2
...
---
### 세 번째 H3
...
---
# 감사합니다
\`\`\`

---

# ✅ STEP 3: 출력 전 엄격한 자가 검증

**필수 체크리스트** (모두 통과해야 출력!):

1. ✅ **"---" 카운트**: 예상 슬라이드 수 - 1 = "---" 개수가 맞는가?
2. ✅ **H2 독립성**: 모든 H2 뒤에 곧바로 H3가 나오지 않는가?
3. ✅ **H3 독립성**: "---" 없이 연속된 H3가 있는가? (있으면 안됨!)
4. ✅ **슬라이드 밀도**: 각 슬라이드 본문이 5-7줄 이내인가?
5. ✅ **슬라이드 수**: STEP 1에서 계산한 개수와 일치하는가?

**검증 실패 시**:
→ STEP 2로 돌아가서 **H2와 H3를 완전히 분리**하세요!

---

# 🎯 생성 템플릿 (이 순서를 정확히 따르세요!)

\`\`\`markdown
# [메인 제목]

작성자: [이름]
날짜: [YYYY년 MM월]

---

## [첫 번째 H2 제목]

- H2 관련 핵심 내용 1
- H2 관련 핵심 내용 2
- H2 관련 핵심 내용 3

---

### [H2의 첫 번째 H3 소제목]

- H3 세부 내용 1
- H3 세부 내용 2
- H3 세부 내용 3

---

### [H2의 두 번째 H3 소제목]

- H3 세부 내용 1
- H3 세부 내용 2

---

## [두 번째 H2 제목]

- H2 관련 핵심 내용 1
- H2 관련 핵심 내용 2

---

### [두 번째 H2의 H3 소제목]

- H3 세부 내용 1
- H3 세부 내용 2

---

# 감사합니다

질문이 있으신가요?
\`\`\`

---

# ⛔ 절대 금지 패턴 (이것들은 절대 안됨!)

❌ **패턴 1**: H2 뒤에 바로 H3 (분리 안됨)
\`\`\`markdown
## 섹션
### 소제목  ← 잘못됨!
---
\`\`\`

❌ **패턴 2**: 한 슬라이드에 여러 H3
\`\`\`markdown
### 소제목1
### 소제목2  ← 잘못됨!
---
\`\`\`

❌ **패턴 3**: "---" 없이 H2/H3 시작
\`\`\`markdown
...
## 섹션  ← "---" 없음! 잘못됨!
\`\`\`

✅ **올바른 패턴**: 각 제목마다 독립 슬라이드
\`\`\`markdown
## 섹션
...
---
### 소제목
...
---
\`\`\`

---

# 📐 슬라이드 밀도 가이드

- **H2 슬라이드**: 5-7개 불릿으로 핵심 요약
- **H3 슬라이드**: 3-5개 불릿으로 세부 설명
- **긴 내용**: 여러 H3로 분할하여 별도 슬라이드 생성

---

# 🎯 출력 형식

**중요**:
1. 마크다운 코드**만** 출력 (설명 금지)
2. 모든 H2/H3를 **완전히 분리**
3. "---" 위치를 **정확히** 지킴

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
