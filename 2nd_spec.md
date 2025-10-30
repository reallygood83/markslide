# 📊 MarkSlide v2.0 - 텍스트→최적화 마크다운 변환 시스템

## 🎯 핵심 목표

### 프로젝트 비전
**"MarkSlide의 슬라이드 생성 엔진에 최적화된 마크다운을 자동 생성한다"**

### 문제 정의
현재 `convert-to-markdown` 기능의 문제점:
1. **화면 균형 부족**: 스크롤이 필요한 긴 슬라이드 생성
2. **몰입감 저하**: 콘텐츠가 상단에만 몰림, 화면 활용도 낮음
3. **특수 콘텐츠 미처리**: YouTube iframe, 이미지 등 최적화 미흡
4. **수정 불가 HTML**: 생성 후 편집 불가능하므로 **1차 생성이 완벽해야 함**

### 해결 방향
- ❌ **템플릿 정형화** (8가지 고정 템플릿)
- ✅ **MarkSlide 최적 형식** (화면 균형, 몰입감, 특수 콘텐츠)

---

## 📐 MarkSlide 슬라이드 엔진 분석

### 현재 렌더링 방식 (slideGenerator.ts)

```typescript
// 각 슬라이드는 100vh (전체 화면 높이) 사용
.slide {
  width: 100%;
  height: 100%;
  padding: 60px 80px;
  overflow: hidden; // 스크롤 막힘
}

.slide-content {
  overflow-y: auto; // 내용이 많으면 스크롤 발생
  max-height: calc(100vh - 180px);
  justify-content: flex-start; // 상단 정렬
}
```

### 핵심 제약사항
1. **고정 높이**: 100vh - 180px (패딩 포함)
2. **스크롤 발생**: 내용이 화면 높이 초과 시 스크롤
3. **상단 정렬**: 콘텐츠가 위쪽에만 배치
4. **HTML 수정 불가**: 생성 후 편집 불가능

### 최적화 원칙
✅ **한 화면에 모든 내용이 보이도록** 마크다운 생성
✅ **화면 중앙 배치**를 위한 적절한 콘텐츠 양
✅ **시각적 균형**을 위한 요소 분배

---

## 🎨 최적 마크다운 생성 원칙

### 1. 슬라이드당 콘텐츠 밀도 제어

#### ✅ 좋은 예시 (화면에 딱 맞음)
```markdown
## 핵심 개념

- 포인트 1: 간결한 설명
- 포인트 2: 간결한 설명
- 포인트 3: 간결한 설명
- 포인트 4: 간결한 설명
- 포인트 5: 간결한 설명
```
**예상 높이**: ~400px (화면의 50% 활용)

#### ❌ 나쁜 예시 (스크롤 발생)
```markdown
## 상세 설명

- 포인트 1: 매우 긴 설명이 여러 줄에 걸쳐 있고, 추가로 부연 설명까지 포함되어 있어서 화면을 넘어감
- 포인트 2: 또 다른 긴 설명...
- 포인트 3: ...
- 포인트 4: ...
- 포인트 5: ...
- 포인트 6: ...
- 포인트 7: ...
- 포인트 8: ...
```
**예상 높이**: ~900px → **스크롤 발생**

### 2. 콘텐츠 타입별 최적 분량

| 요소 | 최대 개수 | 예상 높이 |
|------|----------|----------|
| H1 제목 | 1개 | 80px |
| H2 섹션 | 1-2개 | 60px/개 |
| H3 소제목 | 2-3개 | 50px/개 |
| 불릿 포인트 | 5-7개 | 40px/개 |
| 번호 리스트 | 5-7개 | 40px/개 |
| 코드 블록 | 10줄 이내 | 300px |
| 표 (테이블) | 5행 이내 | 250px |
| 인용구 | 2-3줄 | 100px |

### 3. 화면 균형을 위한 공식

**안전 영역**: `100vh - 180px - 100px(여유) = 약 600px`

**권장 조합**:
- H2 + 5-7개 불릿 = 약 400px ✅
- H2 + 코드 블록(10줄) = 약 360px ✅
- H2 + 표(5행) + 3개 불릿 = 약 430px ✅
- H1 + H3 2개 + 5개 불릿 = 약 380px ✅

### 4. 특수 콘텐츠 처리

#### YouTube iframe 최적화
```markdown
## 영상 설명

<iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>

**핵심 내용**:
- 포인트 1
- 포인트 2
```
**원칙**:
- iframe 높이는 고정 400px
- iframe + 설명은 최대 5줄 이내
- 전체 높이를 600px 이내로 유지

#### 이미지 최적화
```markdown
## 비주얼 설명

![이미지 설명](이미지URL)

- 캡션 1
- 캡션 2
- 캡션 3
```
**원칙**:
- 이미지는 마크다운 기본 크기 사용
- 이미지 + 캡션 5줄 이내
- 이미지가 크면 다른 콘텐츠 최소화

#### 표 (테이블) 최적화
```markdown
## 데이터 비교

| 항목 | 값1 | 값2 | 값3 |
|------|-----|-----|-----|
| A    | X   | Y   | Z   |
| B    | X   | Y   | Z   |
| C    | X   | Y   | Z   |

**분석 결과**: 간략한 요약 1-2줄
```
**원칙**:
- 최대 5행 (헤더 포함 6줄)
- 컬럼 수는 3-5개
- 표 아래 설명은 2줄 이내

### 5. 코드 블록 최적화

```markdown
## 코드 예시

\`\`\`python
# 주석으로 설명 추가
def hello():
    print("Hello")
    return True
\`\`\`

**설명**:
- 포인트 1
- 포인트 2
```
**원칙**:
- 코드 최대 10줄
- 주석 포함해서 설명
- 코드 아래 설명은 3줄 이내

---

## 🤖 AI 프롬프트 전략

### 기본 프롬프트 구조

```typescript
const basePrompt = `당신은 MarkSlide 슬라이드 최적화 전문가입니다.

# 핵심 원칙
1. **한 슬라이드 한 화면**: 스크롤이 필요 없도록 콘텐츠 조절
2. **화면 균형**: 콘텐츠를 화면 중앙에 배치되도록 적절한 분량
3. **시각적 몰입**: 여백을 활용한 가독성 향상

# 기술적 제약사항
- 슬라이드 높이: 약 600px (안전 영역)
- H1 제목: 80px
- H2 섹션: 60px
- 불릿 포인트: 40px/개 (최대 7개)
- 코드 블록: 300px (최대 10줄)
- 표: 250px (최대 5행)
- YouTube iframe: 400px

# 슬라이드 분할 규칙
- **자연스러운 구분**: H1, H2, --- 기준
- **목표 페이지 수**: ${pageCount}개
- **콘텐츠 밸런스**: 각 슬라이드가 비슷한 정보 밀도

# 특수 콘텐츠 처리
- YouTube 링크 발견 시: iframe 임베드 + 설명 5줄 이내
- 이미지 링크: 마크다운 이미지 + 캡션 5줄 이내
- 표 데이터: 최대 5행 + 요약 2줄 이내
- 코드: 최대 10줄 + 설명 3줄 이내

# 마크다운 형식
1. 슬라이드 구분: "---" (3개 하이픈)
2. 메인 제목: # (H1) - 표지 슬라이드만
3. 섹션 제목: ## (H2) - 각 슬라이드 시작
4. 하위 제목: ### (H3)
5. 불릿 리스트: - (하이픈)
6. 번호 리스트: 1. 2. 3.
7. 강조: **굵게**, *기울임*
8. 코드: \`인라인\` 또는 \`\`\`코드 블록\`\`\`
9. 인용구: > (꺽쇠)
10. 표: 마크다운 테이블 형식
11. YouTube: <iframe> 태그
12. 이미지: ![alt](url)

# 화면 균형 최적화 체크리스트
- [ ] 각 슬라이드가 600px 이내인가?
- [ ] 콘텐츠가 상단에만 몰려있지 않은가?
- [ ] 불릿 포인트가 7개를 초과하지 않는가?
- [ ] 코드 블록이 10줄을 초과하지 않는가?
- [ ] 표가 5행을 초과하지 않는가?
- [ ] YouTube iframe과 함께 설명이 5줄 이내인가?

# 입력 텍스트
${text}

# 출력 형식
마크다운 코드만 반환하고, 설명은 하지 마세요. \`\`\`markdown으로 감싸지 마세요.
표지 슬라이드는 # 제목으로 시작하고, 나머지는 ## 섹션 제목으로 시작하세요.
각 슬라이드 사이에 반드시 "---"를 넣어주세요.
`;
```

### 콘텐츠 타입별 특화 프롬프트

#### YouTube 영상 포함 시
```typescript
const youtubePrompt = `
# YouTube 영상 처리 특별 규칙
- YouTube URL 발견 시 iframe으로 임베드
- iframe 형식: <iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>
- iframe 아래 설명은 최대 5줄 (불릿 포인트 형식)
- 영상 슬라이드는 다른 콘텐츠 최소화 (제목 + iframe + 설명만)

예시:
## 영상으로 보는 핵심 개념

<iframe width="100%" height="400" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>

**핵심 내용**:
- 포인트 1
- 포인트 2
- 포인트 3
`;
```

#### 코드 중심 콘텐츠
```typescript
const codePrompt = `
# 코드 블록 처리 특별 규칙
- 코드는 최대 10줄로 압축
- 핵심 로직만 보여주고 나머지는 주석으로 설명
- 코드 아래 설명은 최대 3줄
- 긴 코드는 여러 슬라이드로 분할

예시:
## 코드 예제: 함수 정의

\`\`\`python
# 간단한 함수 예시
def calculate(a, b):
    result = a + b
    return result
\`\`\`

**설명**:
- 두 숫자를 더하는 함수
- 결과를 반환
`;
```

#### 데이터/표 중심 콘텐츠
```typescript
const tablePrompt = `
# 표 처리 특별 규칙
- 최대 5행 (헤더 제외)
- 컬럼은 3-5개로 제한
- 표 아래 요약/분석 2줄 이내
- 큰 데이터는 여러 슬라이드로 분할

예시:
## 실적 비교

| 분기 | 매출 | 성장률 |
|------|------|--------|
| Q1   | 100억 | +10%   |
| Q2   | 110억 | +10%   |
| Q3   | 130억 | +18%   |

**분석**: 지속적인 성장세 유지
`;
```

---

## 🛠️ 기술 구현

### 1. Gemini 함수 개선

```typescript
// lib/gemini.ts (기존 함수 수정)

export async function convertTextToMarkdown(
  text: string,
  apiKey?: string,
  pageCount?: number
): Promise<string> {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 자동 페이지 수 계산 (제공되지 않은 경우)
    const targetPages = pageCount || Math.max(3, Math.min(25, Math.ceil(text.length / 800)));

    // 특수 콘텐츠 감지
    const hasYoutube = /youtube\.com|youtu\.be/i.test(text);
    const hasCode = /```|function|class|def |public |private /i.test(text);
    const hasTable = /\|.*\|.*\|/m.test(text);

    // 기본 프롬프트
    let prompt = basePrompt
      .replace('${text}', text)
      .replace('${pageCount}', targetPages.toString());

    // 특화 프롬프트 추가
    if (hasYoutube) {
      prompt = youtubePrompt + '\n\n' + prompt;
    }
    if (hasCode) {
      prompt = codePrompt + '\n\n' + prompt;
    }
    if (hasTable) {
      prompt = tablePrompt + '\n\n' + prompt;
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const markdown = response.text();

    // 마크다운 정제
    const cleanedMarkdown = markdown
      .replace(/^```markdown\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    // 품질 검증 (선택적)
    validateMarkdownQuality(cleanedMarkdown);

    return cleanedMarkdown;
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('텍스트를 마크다운으로 변환하는 중 오류가 발생했습니다.');
  }
}

/**
 * 마크다운 품질 검증 (경고만 출력)
 */
function validateMarkdownQuality(markdown: string): void {
  const slides = markdown.split('---');

  slides.forEach((slide, index) => {
    const lines = slide.split('\n');
    const bulletPoints = lines.filter(l => l.trim().startsWith('-')).length;

    if (bulletPoints > 7) {
      console.warn(`슬라이드 ${index + 1}: 불릿 포인트가 ${bulletPoints}개로 너무 많습니다 (권장: 5-7개)`);
    }

    // 코드 블록 줄 수 체크
    const codeBlockMatch = slide.match(/```[\s\S]*?```/g);
    if (codeBlockMatch) {
      codeBlockMatch.forEach(block => {
        const codeLines = block.split('\n').length - 2; // ``` 제외
        if (codeLines > 10) {
          console.warn(`슬라이드 ${index + 1}: 코드 블록이 ${codeLines}줄로 너무 깁니다 (권장: 10줄 이내)`);
        }
      });
    }

    // 표 행 수 체크
    const tableRows = lines.filter(l => l.trim().startsWith('|')).length - 2; // 헤더, 구분선 제외
    if (tableRows > 5) {
      console.warn(`슬라이드 ${index + 1}: 표가 ${tableRows}행으로 너무 많습니다 (권장: 5행 이내)`);
    }
  });
}
```

### 2. API 라우트 업데이트

```typescript
// app/api/convert-to-markdown/route.ts (기존 파일 수정)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, pageCount, apiKey } = body;

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

    // API 키 검증
    if (!apiKey && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 401 }
      );
    }

    // 최적화된 마크다운 변환 (페이지 수 전달)
    const markdown = await convertTextToMarkdown(text, apiKey, pageCount);

    // 실제 생성된 슬라이드 수 계산
    const actualSlideCount = markdown.split('---').length;

    return NextResponse.json({
      success: true,
      markdown,
      metadata: {
        requestedPages: pageCount,
        actualPages: actualSlideCount,
        hasYoutube: /iframe.*youtube/i.test(markdown),
        hasCode: /```/g.test(markdown),
        hasTable: /\|.*\|/m.test(markdown)
      }
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
```

### 3. 프론트엔드 UI 개선

```tsx
// components/TextToMarkdownConverter.tsx

'use client';

import { useState } from 'react';

export default function TextToMarkdownConverter() {
  const [text, setText] = useState('');
  const [pageCount, setPageCount] = useState(10);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  // 자동 페이지 수 계산
  const recommendedPages = Math.max(3, Math.min(25, Math.ceil(text.length / 800)));

  const handleConvert = async () => {
    setIsConverting(true);

    try {
      const response = await fetch('/api/convert-to-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, pageCount })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.markdown);
        setMetadata(data.metadata);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="converter-container">
      {/* Step 1: 텍스트 입력 */}
      <div className="input-section">
        <label>텍스트 입력</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="프레젠테이션으로 만들 내용을 입력하세요..."
          rows={10}
          className="text-input"
        />
        <div className="stats">
          <span>글자 수: {text.length}</span>
          <span>권장 페이지: {recommendedPages}개</span>
        </div>
      </div>

      {/* Step 2: 페이지 수 조정 */}
      <div className="page-count-section">
        <label>슬라이드 페이지 수</label>
        <div className="page-display">{pageCount}페이지</div>
        <input
          type="range"
          min="3"
          max="25"
          value={pageCount}
          onChange={(e) => setPageCount(Number(e.target.value))}
          className="slider"
        />
        <div className="quick-buttons">
          <button onClick={() => setPageCount(5)}>5</button>
          <button onClick={() => setPageCount(10)}>10</button>
          <button onClick={() => setPageCount(recommendedPages)} className="recommended">
            추천 ({recommendedPages})
          </button>
          <button onClick={() => setPageCount(20)}>20</button>
        </div>
      </div>

      {/* Step 3: 변환 버튼 */}
      <button
        onClick={handleConvert}
        disabled={!text || isConverting}
        className="convert-btn"
      >
        {isConverting ? '변환 중...' : '✨ 최적화된 마크다운 생성'}
      </button>

      {/* Step 4: 결과 표시 */}
      {result && (
        <div className="result-section">
          <h3>✅ 변환 완료!</h3>

          {/* 메타데이터 표시 */}
          {metadata && (
            <div className="metadata">
              <span>생성된 슬라이드: {metadata.actualPages}개</span>
              {metadata.hasYoutube && <span className="badge">YouTube 포함</span>}
              {metadata.hasCode && <span className="badge">코드 포함</span>}
              {metadata.hasTable && <span className="badge">표 포함</span>}
            </div>
          )}

          {/* 마크다운 미리보기 */}
          <pre className="markdown-preview">
            {result.substring(0, 500)}...
          </pre>

          {/* 액션 버튼 */}
          <div className="actions">
            <button onClick={() => {
              const blob = new Blob([result], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'presentation.md';
              a.click();
            }}>
              💾 다운로드
            </button>

            <button onClick={() => {
              navigator.clipboard.writeText(result);
              alert('클립보드에 복사되었습니다!');
            }}>
              📋 복사
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 최적화 전략 요약

### 핵심 원칙
1. **한 화면 원칙**: 모든 슬라이드가 스크롤 없이 보이도록
2. **균형 배치**: 콘텐츠를 화면 중앙에 배치되도록 분량 조절
3. **특수 처리**: YouTube, 코드, 표 등은 별도 최적화

### 콘텐츠 밀도 가이드
- **최소**: H2 + 3개 불릿 (약 200px)
- **최적**: H2 + 5-7개 불릿 (약 400px)
- **최대**: H2 + 코드 10줄 or 표 5행 (약 600px)

### AI 프롬프트 전략
1. **기본 프롬프트**: 화면 균형 원칙 명시
2. **특화 프롬프트**: YouTube, 코드, 표 감지 시 추가
3. **품질 검증**: 생성 후 자동 경고 (선택적)

### 기대 효과
- ✅ 스크롤 없는 깔끔한 슬라이드
- ✅ 화면 중앙 배치로 몰입감 향상
- ✅ YouTube/코드/표 최적 처리
- ✅ 수정 없이도 완성도 높은 결과

---

## 🎯 개발 우선순위

### Phase 1: 핵심 최적화 (1주)
- [ ] 기본 프롬프트 작성 (화면 균형 원칙)
- [ ] `convertTextToMarkdown` 함수 개선
- [ ] 특수 콘텐츠 감지 로직 (YouTube, 코드, 표)
- [ ] 품질 검증 함수 추가

### Phase 2: UI 개선 (3일)
- [ ] 페이지 수 조정 UI
- [ ] 메타데이터 표시 (YouTube/코드/표 포함 여부)
- [ ] 다운로드/복사 기능

### Phase 3: 테스트 및 개선 (3일)
- [ ] 다양한 콘텐츠 타입 테스트
- [ ] 화면 균형 검증
- [ ] 프롬프트 미세 조정
- [ ] 배포 및 모니터링

---

## 📝 테스트 시나리오

### 시나리오 1: 일반 텍스트
**입력**: 회의록 형식의 일반 텍스트
**기대 결과**: 5-7개 불릿 포인트로 정리된 슬라이드 (스크롤 없음)

### 시나리오 2: YouTube 링크 포함
**입력**: YouTube URL이 포함된 설명
**기대 결과**: iframe 임베드 + 설명 5줄 이내 (스크롤 없음)

### 시나리오 3: 코드 샘플 포함
**입력**: 프로그래밍 튜토리얼 텍스트
**기대 결과**: 코드 10줄 이내 + 설명 3줄 (스크롤 없음)

### 시나리오 4: 데이터 표 포함
**입력**: 실적 보고서 형식
**기대 결과**: 표 5행 이내 + 분석 2줄 (스크롤 없음)

---

## 🔮 향후 개선 계획

### v3.0 아이디어
- [ ] 실시간 미리보기 (마크다운 → HTML 즉시 렌더링)
- [ ] 슬라이드별 높이 측정 및 자동 조정
- [ ] 이미지 자동 리사이징
- [ ] 다국어 지원
- [ ] 사용자 피드백 기반 프롬프트 개선

---

**문서 버전**: v2.0 (최적화 중심 개선)
**작성일**: 2025-10-30
**핵심 변경**: 템플릿 시스템 제거 → MarkSlide 최적 형식 집중
