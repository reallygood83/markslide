'use client';

import { Header } from '@/components/Header';
import { TextToMarkdownConverter } from '@/components/TextToMarkdownConverter';

export default function ConvertPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="chanel-hero">
        <div className="chanel-container">
          <h1 className="chanel-hero-title">텍스트 → 마크다운 변환</h1>
          <p className="chanel-hero-subtitle">AI로 슬라이드 최적화된 마크다운 생성</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="chanel-container">
        <section className="chanel-section">
          <TextToMarkdownConverter />
        </section>
      </div>

      {/* Footer */}
      <footer className="chanel-footer">
        <div className="chanel-container">
          <p>
            &copy; 2025 Moon-Jung Kim |{' '}
            <a
              href="https://www.youtube.com/@%EB%B0%B0%EC%9B%80%EC%9D%98%EB%8B%AC%EC%9D%B8-p5v"
              target="_blank"
              rel="noopener noreferrer"
              className="chanel-footer-link"
            >
              배움의 달인
            </a>
            {' '}|{' '}
            <a
              href="https://open.kakao.com/o/gubGYQ7g"
              target="_blank"
              rel="noopener noreferrer"
              className="chanel-footer-link"
            >
              개발자에게 연락하기
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
