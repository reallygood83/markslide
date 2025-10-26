'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ThemeSelector } from '@/components/ThemeSelector';
import { MetadataForm } from '@/components/MetadataForm';
import { GenerateButton } from '@/components/GenerateButton';
import { Header } from '@/components/Header';
import { Theme } from '@/lib/themes';

export default function Home() {
  const [markdownFile, setMarkdownFile] = useState<File | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [saveFolderHandle, setSaveFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    subtitle: '',
    author: '',
    pageCount: 10,
  });

  const handleFileSelect = async (file: File) => {
    setMarkdownFile(file);
    const content = await file.text();
    setMarkdownContent(content);

    // 첫 번째 H1 제목 자동 추출
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      setMetadata(prev => ({ ...prev, title: titleMatch[1] }));
    }
  };

  const isReady = markdownFile && selectedTheme && metadata.title;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="chanel-hero">
        <div className="chanel-container">
          <h1 className="chanel-hero-title">MarkSlide</h1>
          <p className="chanel-hero-subtitle">Markdown to Slides</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="chanel-container">
        {/* Step 1: 파일 업로드 */}
        <section className="chanel-section">
          <div className="chanel-step-number">1</div>
          <h2 className="chanel-step-title">마크다운 파일 업로드</h2>
          <FileUpload onFileSelect={handleFileSelect} />
          {markdownFile && (
            <div className="chanel-file-info">
              ✓ {markdownFile.name} ({(markdownFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </section>

        {/* Step 2: 테마 선택 */}
        {markdownFile && (
          <section className="chanel-section animate-fade-in-up">
            <div className="chanel-step-number">2</div>
            <h2 className="chanel-step-title">테마 선택</h2>
            <ThemeSelector
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
            />
          </section>
        )}

        {/* Step 3: 메타데이터 입력 */}
        {selectedTheme && (
          <section className="chanel-section animate-fade-in-up">
            <div className="chanel-step-number">3</div>
            <h2 className="chanel-step-title">슬라이드 정보 입력</h2>
            <MetadataForm
              metadata={metadata}
              onMetadataChange={setMetadata}
              markdownContent={markdownContent}
              onSaveFolderChange={setSaveFolderHandle}
            />
          </section>
        )}

        {/* Step 4: 생성 버튼 */}
        {isReady && (
          <section className="chanel-section animate-fade-in-up">
            <div className="chanel-step-number">4</div>
            <h2 className="chanel-step-title">슬라이드 생성</h2>
            <GenerateButton
              markdownContent={markdownContent}
              theme={selectedTheme}
              metadata={metadata}
              saveFolderHandle={saveFolderHandle}
            />
          </section>
        )}
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
            {' '}| MIT License
          </p>
        </div>
      </footer>
    </div>
  );
}
