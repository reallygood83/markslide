import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import type { Theme } from './themes';

interface SlideMetadata {
  title: string;
  subtitle: string;
  author: string;
  pageCount: number;
}

/**
 * YouTube URL에서 Video ID 추출
 * 지원 형식:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * 마크다운에서 YouTube URL을 iframe으로 자동 변환
 * 변환 규칙:
 * 1. 이미 iframe이 있는 경우 → 변환하지 않음 (사용자가 직접 작성한 iframe 존중)
 * 2. 단독 줄에 있는 YouTube URL → iframe 임베딩 (height 400px)
 * 3. 링크 형태 [제목](URL) → iframe + 제목
 * 4. 일반 텍스트 안의 URL은 변환하지 않음
 */
function convertYouTubeLinksToIframe(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 0. 이미 iframe이 있는 줄은 그대로 유지 (사용자가 직접 작성한 경우)
    if (line.includes('<iframe')) {
      result.push(lines[i]);
      continue;
    }

    // 1. 단독 YouTube URL (독립된 줄)
    const standaloneUrlMatch = line.match(/^(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}(?:\S*))$/);
    if (standaloneUrlMatch) {
      const videoId = extractYouTubeVideoId(standaloneUrlMatch[1]);
      if (videoId) {
        result.push(`<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`);
        result.push(''); // 빈 줄 추가로 간격 유지
        continue;
      }
    }

    // 2. 마크다운 링크 형태 [제목](YouTube URL)
    const linkMatch = line.match(/\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}(?:\S*))\)/);
    if (linkMatch) {
      const title = linkMatch[1];
      const videoId = extractYouTubeVideoId(linkMatch[2]);
      if (videoId) {
        // 제목이 있으면 위에 표시
        if (title && title.trim()) {
          result.push(`**${title}**`);
          result.push('');
        }
        result.push(`<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`);
        result.push(''); // 빈 줄 추가
        continue;
      }
    }

    // 3. 변환되지 않은 일반 줄은 그대로 유지
    result.push(lines[i]);
  }

  return result.join('\n');
}

/**
 * 마크다운에서 H2/H3 앞에 "---"를 강제 삽입하여 완벽한 슬라이드 분리 보장
 * v3.0 - Gemini가 누락한 "---"를 자동으로 추가
 */
function enforceSlideBreaksForHeadings(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let previousLineWasEmpty = false;
  let previousLineWasDivider = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // H2 (##) 또는 H3 (###) 감지
    const isH2 = /^##\s/.test(trimmedLine);
    const isH3 = /^###\s/.test(trimmedLine);

    if (isH2 || isH3) {
      // 직전 줄이 "---"가 아니고, 첫 번째 H2도 아니라면 "---" 추가
      const isFirstHeading = i === 0 || result.length === 0;
      const needsDivider = !previousLineWasDivider && !isFirstHeading;

      if (needsDivider) {
        // 이전 줄이 빈 줄이 아니면 빈 줄 하나 추가
        if (!previousLineWasEmpty && result.length > 0) {
          result.push('');
        }
        // "---" 구분자 추가
        result.push('---');
        result.push(''); // "---" 다음 빈 줄
      }

      result.push(line);
      previousLineWasEmpty = false;
      previousLineWasDivider = false;
    } else if (trimmedLine === '---') {
      // 이미 있는 "---"는 그대로 유지
      result.push(line);
      previousLineWasEmpty = false;
      previousLineWasDivider = true;
    } else {
      // 일반 줄
      result.push(line);
      previousLineWasEmpty = trimmedLine === '';
      previousLineWasDivider = false;
    }
  }

  return result.join('\n');
}

/**
 * 마크다운 텍스트를 슬라이드로 분할
 * v3.0 - H2/H3 강제 분리 로직 추가
 */
export function splitMarkdownIntoSlides(markdown: string, targetSlides: number = 20): string[] {
  // 1단계: YouTube URL을 iframe으로 자동 변환
  let processedMarkdown = convertYouTubeLinksToIframe(markdown);

  // 2단계: H2/H3 앞에 "---" 강제 삽입 (누락된 구분자 자동 추가)
  processedMarkdown = enforceSlideBreaksForHeadings(processedMarkdown);

  console.log('🔧 H2/H3 분리 처리 완료');

  // 3단계: "---" 기준으로 슬라이드 분할
  const slideDelimiters = /^---$/gm;
  let parts = processedMarkdown.split(slideDelimiters).filter(Boolean);

  // 빈 슬라이드 제거 및 정리
  parts = parts.filter(part => {
    const trimmed = part.trim();
    return trimmed && trimmed !== '---';
  }).map(part => part.trim());

  if (parts.length === 0) {
    return [markdown];
  }

  console.log(`✅ 총 ${parts.length}개 슬라이드로 분할됨`);

  // 4단계: 목표 페이지 수는 참고용 (자연스러운 분할 우선)
  // 너무 많거나 적으면 조정하지만, H2/H3 분리는 절대 유지
  return parts;
}

/**
 * 슬라이드를 병합하여 목표 개수로 줄임
 */
function mergeSlides(slides: string[], targetCount: number): string[] {
  const result: string[] = [];
  const groupSize = Math.ceil(slides.length / targetCount);

  for (let i = 0; i < slides.length; i += groupSize) {
    const group = slides.slice(i, i + groupSize);
    result.push(group.join('\n\n'));
  }

  return result.slice(0, targetCount);
}

/**
 * 슬라이드를 확장하여 목표 개수로 늘림
 */
function expandSlides(slides: string[], targetCount: number): string[] {
  const result: string[] = [];
  const slidesNeeded = targetCount - slides.length;

  // 긴 슬라이드부터 우선 분할
  const slidesWithLength = slides.map((slide, index) => ({
    content: slide,
    index,
    length: slide.length
  })).sort((a, b) => b.length - a.length);

  const toExpand = slidesWithLength.slice(0, slidesNeeded);
  const expandIndexes = new Set(toExpand.map(s => s.index));

  slides.forEach((slide, index) => {
    if (expandIndexes.has(index) && slide.length > 200) {
      // 문단 단위로 분할 (최대 2개로 분할)
      const paragraphs = slide.split(/\n\n+/).filter(p => p.trim());

      if (paragraphs.length >= 2) {
        const mid = Math.ceil(paragraphs.length / 2);
        result.push(paragraphs.slice(0, mid).join('\n\n'));
        result.push(paragraphs.slice(mid).join('\n\n'));
      } else {
        // 리스트 항목으로 분할 시도
        const items = slide.split(/\n[-*•]\s+/).filter(p => p.trim());
        if (items.length >= 2) {
          const mid = Math.ceil(items.length / 2);
          const firstPart = items[0] + '\n' + items.slice(1, mid).map(i => `- ${i}`).join('\n');
          const secondPart = items[0] + '\n' + items.slice(mid).map(i => `- ${i}`).join('\n');
          result.push(firstPart);
          result.push(secondPart);
        } else {
          result.push(slide);
        }
      }
    } else {
      result.push(slide);
    }
  });

  return result.slice(0, targetCount);
}

/**
 * 마크다운을 HTML로 변환
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);

  return String(result);
}

/**
 * 개별 슬라이드 HTML 생성
 */
export async function generateSlideHtml(
  slideContent: string,
  slideNumber: number,
  totalSlides: number,
  theme: Theme
): Promise<string> {
  const htmlContent = await markdownToHtml(slideContent);

  // 마지막 슬라이드 감지 (감사합니다, 마무리 등)
  const isClosingSlide = slideNumber === totalSlides &&
    (slideContent.includes('감사합니다') ||
     slideContent.includes('감사합니다') ||
     slideContent.includes('Thank you') ||
     slideContent.includes('질문이 있으신가요'));

  return `
    <section class="slide ${isClosingSlide ? 'slide-closing' : ''}" data-slide-number="${slideNumber}">
      <div class="slide-content">
        ${htmlContent}
      </div>
      <div class="slide-footer">
        <span class="slide-number">${slideNumber} / ${totalSlides}</span>
      </div>
    </section>
  `;
}

/**
 * 전체 슬라이드 HTML 문서 생성
 */
export async function generatePresentationHtml(
  markdown: string,
  metadata: SlideMetadata,
  theme: Theme
): Promise<string> {
  // 표지 슬라이드 생성
  const coverSlide = `
    <section class="slide slide-cover">
      <div class="cover-content">
        <h1 class="cover-title">${metadata.title}</h1>
        ${metadata.subtitle ? `<p class="cover-subtitle">${metadata.subtitle}</p>` : ''}
        ${metadata.author ? `<p class="cover-author">${metadata.author}</p>` : ''}
      </div>
    </section>
  `;

  // 마크다운을 슬라이드로 분할 (표지 제외하고 목표 개수 -1)
  const slideContents = splitMarkdownIntoSlides(markdown, metadata.pageCount - 1);

  // 각 슬라이드 HTML 생성
  const slideHtmls = await Promise.all(
    slideContents.map((content, index) =>
      generateSlideHtml(content, index + 1, slideContents.length, theme)
    )
  );

  // 전체 HTML 문서 생성
  return generateFullHtml(
    coverSlide + slideHtmls.join('\n'),
    metadata,
    theme
  );
}

/**
 * 완전한 HTML 문서 생성 (CSS 포함)
 */
function generateFullHtml(
  slidesHtml: string,
  metadata: SlideMetadata,
  theme: Theme
): string {
  const themeStyles = getThemeStyles(theme);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title}</title>
  <style>
    ${baseStyles}
    ${themeStyles}
  </style>
</head>
<body>
  <div class="presentation">
    ${slidesHtml}
  </div>

  <div class="controls">
    <button class="control-btn" id="prevBtn">◀ 이전</button>
    <button class="control-btn" id="nextBtn">다음 ▶</button>
  </div>

  <script>
    ${navigationScript}
  </script>
</body>
</html>`;
}

// 기본 스타일 - 스크롤 제거 및 PPT 스타일 최적화
const baseStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

.presentation {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.slide {
  width: 100%;
  height: 100%;
  padding: 60px 80px;
  display: none;
  flex-direction: column;
  justify-content: flex-start; /* 상단 정렬로 공간 활용 */
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden; /* 스크롤 완전 제거 */
}

.slide.active {
  display: flex;
}

.slide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto; /* 스크롤 허용 */
  max-height: calc(100vh - 180px);
}

.slide-content h1 {
  font-size: 3.2rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.slide-content h2 {
  font-size: 2.8rem;
  margin-bottom: 1.2rem;
  line-height: 1.3;
}

.slide-content h3 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.slide-content p {
  font-size: 1.8rem;
  line-height: 1.8;
  margin-bottom: 1.2rem;
}

.slide-content ul, .slide-content ol {
  font-size: 1.8rem;
  line-height: 2;
  margin-left: 2.5rem;
  margin-bottom: 1.2rem;
}

.slide-content li {
  margin-bottom: 0.4rem;
}

.slide-content code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 1.1rem;
}

.slide-content pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.slide-content pre code {
  background: transparent;
  color: inherit;
  padding: 0;
}

.slide-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid currentColor;
  opacity: 0.5;
  flex-shrink: 0; /* 푸터가 항상 보이도록 */
}

.slide-number {
  font-size: 1rem;
}

/* 표지 슬라이드 */
.slide-cover {
  justify-content: center;
  align-items: center;
  text-align: center;
}

.cover-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.cover-subtitle {
  font-size: 2rem;
  margin-bottom: 2.5rem;
  opacity: 0.8;
}

.cover-author {
  font-size: 1.5rem;
  opacity: 0.6;
}

/* 마지막 슬라이드 (감사합니다 등) - 표지처럼 중앙 정렬 */
.slide-closing {
  justify-content: center;
  align-items: center;
}

.slide-closing .slide-content {
  text-align: center;
  justify-content: center;
  align-items: center;
}

.slide-closing h1,
.slide-closing h2 {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.slide-closing p {
  font-size: 2rem;
  opacity: 0.8;
}

/* 컨트롤 버튼 */
.controls {
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  gap: 10px;
  z-index: 1000;
}

.control-btn {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: 2px solid currentColor;
  background: transparent;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.control-btn:active {
  transform: translateY(0);
}

@media print {
  .controls {
    display: none;
  }

  .slide {
    page-break-after: always;
    position: relative;
    display: flex !important;
  }
}

/* 작은 화면 대응 */
@media (max-height: 800px) {
  .slide {
    padding: 40px 60px;
  }

  .slide-content h1 { font-size: 2.6rem; }
  .slide-content h2 { font-size: 2.2rem; }
  .slide-content h3 { font-size: 1.8rem; }
  .slide-content p, .slide-content ul, .slide-content ol { font-size: 1.5rem; }

  .slide-closing h1,
  .slide-closing h2 { font-size: 3.2rem; }
  .slide-closing p { font-size: 1.6rem; }
}
`;

// 테마별 스타일 생성
function getThemeStyles(theme: Theme): string {
  const hasGradient = theme.special?.gradient;
  const hasShadow = theme.special?.shadow;
  const hasBorder = theme.special?.border;
  const highlight = theme.colors.highlight || theme.colors.secondary;

  // 다크 테마 감지: isDark 플래그 사용
  const isDark = (theme as any).isDark || false;

  // 다크 테마일 때는 텍스트 색상을 밝게, 라이트 테마일 때는 어둡게
  const adaptiveTextColor = isDark ? '#FFFFFF' : theme.colors.text;
  const adaptivePrimaryColor = isDark ? theme.colors.accent : theme.colors.primary;
  const adaptiveSecondaryColor = isDark ? theme.colors.secondary : theme.colors.secondary;

  return `
/* 폰트 불러오기 */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Montserrat:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&family=Merriweather:wght@300;400;700&family=Roboto:wght@300;400;500;700&family=Nunito:wght@300;400;600;700&family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@300;400;500;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&display=swap');

body {
  background: ${theme.colors.background};
  ${hasGradient ? `background-image: ${theme.special?.gradient};` : ''}
  color: ${adaptiveTextColor};
  font-family: ${theme.fonts.body};
}

/* 표지 슬라이드 특별 스타일 */
.slide-cover {
  ${hasGradient ? `background: ${theme.special?.gradient} !important;` : `background: ${theme.colors.primary} !important;`}
  ${hasShadow ? `box-shadow: inset ${theme.special?.shadow};` : ''}
}

.cover-title {
  font-family: ${theme.fonts.heading} !important;
  color: ${theme.colors.background} !important;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  ${hasBorder ? `border-bottom: ${theme.special?.border};` : ''}
  padding-bottom: 0.5rem;
}

.cover-subtitle {
  color: ${theme.colors.accent} !important;
  font-weight: 300;
}

.cover-author {
  color: ${highlight} !important;
  font-style: italic;
}

/* 콘텐츠 슬라이드 */
.slide {
  font-family: ${theme.fonts.body};
}

.slide-content {
  ${hasShadow ? `box-shadow: ${theme.special?.shadow};` : ''}
}

.slide-content h1 {
  font-family: ${theme.fonts.heading};
  color: ${adaptivePrimaryColor};
  ${hasBorder ? `border-left: 8px solid ${adaptiveSecondaryColor};` : ''}
  ${hasBorder ? `padding-left: 1.5rem;` : ''}
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.slide-content h2 {
  font-family: ${theme.fonts.heading};
  color: ${adaptiveSecondaryColor};
  ${hasBorder ? `border-left: 6px solid ${highlight};` : ''}
  ${hasBorder ? `padding-left: 1rem;` : ''}
}

.slide-content h3 {
  font-family: ${theme.fonts.heading};
  color: ${isDark ? highlight : theme.colors.accent};
  ${hasBorder ? `border-left: 4px solid ${theme.colors.accent};` : ''}
  ${hasBorder ? `padding-left: 0.8rem;` : ''}
}

/* 강조 요소 */
.slide-content strong {
  color: ${highlight};
  font-weight: 700;
}

.slide-content em {
  color: ${adaptiveSecondaryColor};
  font-style: italic;
}

/* 리스트 스타일 */
.slide-content ul li::marker {
  color: ${adaptivePrimaryColor};
  font-weight: bold;
}

.slide-content ol li::marker {
  color: ${adaptiveSecondaryColor};
  font-weight: bold;
}

/* 코드 블록 */
.slide-content code {
  background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : theme.colors.primary + '15'};
  color: ${adaptivePrimaryColor};
  border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : theme.colors.primary + '30'};
  ${hasShadow ? `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);` : ''}
}

.slide-content pre {
  background: ${isDark ? 'rgba(0, 0, 0, 0.3)' : theme.colors.primary};
  border-left: 5px solid ${highlight};
  ${hasShadow ? `box-shadow: ${theme.special?.shadow};` : ''}
}

.slide-content pre code {
  color: ${isDark ? adaptiveTextColor : theme.colors.background};
}

/* 인용문 */
.slide-content blockquote {
  border-left: 5px solid ${adaptivePrimaryColor};
  padding-left: 1.5rem;
  margin-left: 0;
  font-style: italic;
  color: ${adaptiveSecondaryColor};
  background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.primary + '08'};
  padding: 1rem 1rem 1rem 1.5rem;
  border-radius: 0 8px 8px 0;
}

/* 테이블 */
.slide-content table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  ${hasShadow ? `box-shadow: ${theme.special?.shadow};` : ''}
}

.slide-content th {
  background: ${adaptivePrimaryColor};
  color: ${isDark ? theme.colors.background : theme.colors.background};
  font-weight: 600;
  padding: 12px 15px;
  text-align: left;
}

.slide-content td {
  padding: 10px 15px;
  border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : theme.colors.primary + '20'};
  color: ${adaptiveTextColor};
}

.slide-content tr:nth-child(even) {
  background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.primary + '05'};
}

.slide-content tr:hover {
  background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : highlight + '15'};
}

/* 슬라이드 푸터 */
.slide-footer {
  border-top-color: ${theme.colors.primary};
  color: ${theme.colors.secondary};
}

/* 컨트롤 버튼 */
.control-btn {
  color: ${theme.colors.primary};
  border-color: ${theme.colors.primary};
  background: ${theme.colors.background};
  font-family: ${theme.fonts.body};
  ${hasShadow ? `box-shadow: ${theme.special?.shadow};` : ''}
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-btn:hover {
  background: ${hasGradient ? theme.special?.gradient : theme.colors.primary};
  color: ${theme.colors.background};
  transform: translateY(-3px);
  ${hasShadow ? `box-shadow: ${theme.special?.shadow}, 0 8px 16px rgba(0, 0, 0, 0.2);` : ''}
}

.control-btn:active {
  transform: translateY(-1px);
}

/* 특별 효과 */
${theme.id === 'glassmorphism' ? `
.slide {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
` : ''}

${theme.id === 'cyberpunk-neon' ? `
.slide-content h1,
.slide-content h2,
.slide-content h3 {
  text-shadow: 0 0 10px ${theme.colors.primary}, 0 0 20px ${theme.colors.primary}, 0 0 30px ${theme.colors.secondary};
  animation: neonGlow 2s ease-in-out infinite alternate;
}

@keyframes neonGlow {
  from {
    text-shadow: 0 0 10px ${theme.colors.primary}, 0 0 20px ${theme.colors.primary}, 0 0 30px ${theme.colors.secondary};
  }
  to {
    text-shadow: 0 0 20px ${theme.colors.primary}, 0 0 30px ${theme.colors.secondary}, 0 0 40px ${theme.colors.accent};
  }
}

.slide-content code {
  background: ${theme.colors.primary}30;
  border: 1px solid ${theme.colors.primary};
  box-shadow: 0 0 5px ${theme.colors.primary};
}
` : ''}

${theme.id === 'chanel-noir' ? `
.slide-content h1::before {
  content: '';
  display: inline-block;
  width: 60px;
  height: 4px;
  background: ${theme.colors.secondary};
  margin-right: 20px;
  vertical-align: middle;
}

.slide-content h1::after {
  content: '';
  display: inline-block;
  width: 60px;
  height: 4px;
  background: ${theme.colors.secondary};
  margin-left: 20px;
  vertical-align: middle;
}
` : ''}

${theme.id === 'retro-vintage' ? `
.slide {
  border: ${theme.special?.border};
  box-shadow: ${theme.special?.shadow};
}

.slide-content h1,
.slide-content h2 {
  text-transform: uppercase;
  letter-spacing: 2px;
}
` : ''}
  `;
}

// 내비게이션 스크립트
const navigationScript = `
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));

  if (index < 0) {
    currentSlide = totalSlides - 1;
  } else if (index >= totalSlides) {
    currentSlide = 0;
  } else {
    currentSlide = index;
  }

  slides[currentSlide].classList.add('active');
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

// 초기 슬라이드 표시
showSlide(0);

// 버튼 이벤트
document.getElementById('prevBtn').addEventListener('click', prevSlide);
document.getElementById('nextBtn').addEventListener('click', nextSlide);

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  }
});

// 터치 스와이프 지원 (모바일)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchEndX < touchStartX - 50) {
    nextSlide(); // 왼쪽 스와이프
  }
  if (touchEndX > touchStartX + 50) {
    prevSlide(); // 오른쪽 스와이프
  }
}
`;
