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
 * 마크다운 텍스트를 슬라이드로 분할
 * H1(#), H2(##) 또는 구분선(---)을 기준으로 분할
 * targetSlides가 지정되면 해당 개수에 최대한 맞추도록 조정
 */
export function splitMarkdownIntoSlides(markdown: string, targetSlides: number = 20): string[] {
  const slides: string[] = [];

  // 슬라이드 구분: H1, H2, 또는 --- (구분선)
  const slideDelimiters = /(?=^#\s)|(?=^##\s)|(?=^---$)/gm;

  let parts = markdown.split(slideDelimiters).filter(Boolean);

  // 빈 슬라이드 제거
  parts = parts.filter(part => {
    const trimmed = part.trim();
    return trimmed && trimmed !== '---';
  });

  if (parts.length === 0) {
    return [markdown];
  }

  // 자연스럽게 분할된 슬라이드가 목표 개수와 비슷하면 그대로 사용
  // (±30% 범위 내)
  const lowerBound = Math.floor(targetSlides * 0.7);
  const upperBound = Math.ceil(targetSlides * 1.3);

  if (parts.length >= lowerBound && parts.length <= upperBound) {
    return parts.slice(0, targetSlides);
  }

  // 슬라이드가 너무 많으면 줄이기
  if (parts.length > targetSlides) {
    return parts.slice(0, targetSlides);
  }

  // 슬라이드가 너무 적으면 내용을 더 세밀하게 분할
  // 각 슬라이드를 문단 단위로 더 분할
  if (parts.length < lowerBound) {
    const expandedSlides: string[] = [];
    const slidesNeeded = targetSlides - parts.length;
    const slidesToExpand = Math.min(slidesNeeded, parts.length);

    parts.forEach((part, index) => {
      // 일부 슬라이드만 확장 (길이가 긴 것부터)
      if (index < slidesToExpand && part.length > 200) {
        // 문단 단위로 분할
        const paragraphs = part.split(/\n\n+/).filter(p => p.trim());
        if (paragraphs.length > 1) {
          // 각 문단을 별도 슬라이드로
          paragraphs.forEach(p => expandedSlides.push(p.trim()));
        } else {
          expandedSlides.push(part);
        }
      } else {
        expandedSlides.push(part);
      }
    });

    return expandedSlides.slice(0, targetSlides);
  }

  return parts;
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

  return `
    <section class="slide" data-slide-number="${slideNumber}">
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

  // 마크다운을 슬라이드로 분할
  const slideContents = splitMarkdownIntoSlides(markdown, metadata.pageCount);

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

// 기본 스타일
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
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
}

.slide.active {
  display: flex;
}

.slide-content {
  flex: 1;
  overflow-y: auto;
}

.slide-content h1 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.slide-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.slide-content h3 {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}

.slide-content p {
  font-size: 1.5rem;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.slide-content ul, .slide-content ol {
  font-size: 1.5rem;
  line-height: 2;
  margin-left: 2rem;
  margin-bottom: 1rem;
}

.slide-content li {
  margin-bottom: 0.5rem;
}

.slide-content code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
}

.slide-content pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.slide-content pre code {
  background: transparent;
  color: inherit;
  padding: 0;
}

.slide-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid currentColor;
  opacity: 0.5;
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
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.cover-subtitle {
  font-size: 2rem;
  margin-bottom: 3rem;
  opacity: 0.8;
}

.cover-author {
  font-size: 1.5rem;
  opacity: 0.6;
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
`;

// 테마별 스타일 생성
function getThemeStyles(theme: Theme): string {
  return `
body {
  background: ${theme.colors.background};
  color: ${theme.colors.text};
}

.slide-content h1,
.slide-content h2,
.slide-content h3 {
  color: ${theme.colors.primary};
}

.control-btn {
  color: ${theme.colors.primary};
  border-color: ${theme.colors.primary};
}

.control-btn:hover {
  background: ${theme.colors.primary};
  color: ${theme.colors.background};
}
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
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    prevSlide();
  }
});
`;
