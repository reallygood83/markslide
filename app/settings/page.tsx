'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [text, setText] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);

  // API 키 테스트
  const handleTestApi = async () => {
    if (!apiKey.trim()) {
      alert('API 키를 입력해주세요.');
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      // 임시로 localStorage에 저장하여 테스트
      const previousKey = localStorage.getItem('gemini_api_key');
      localStorage.setItem('gemini_api_key', apiKey);

      const response = await fetch('/api/convert-to-markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: '안녕하세요! 이것은 API 테스트입니다.',
        }),
      });

      if (response.ok) {
        setApiTestResult('✅ API 키가 정상 작동합니다!');
      } else {
        setApiTestResult('❌ API 키가 유효하지 않습니다.');
        if (previousKey) {
          localStorage.setItem('gemini_api_key', previousKey);
        } else {
          localStorage.removeItem('gemini_api_key');
        }
      }
    } catch (error) {
      setApiTestResult('❌ API 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsTestingApi(false);
    }
  };

  // API 키 저장
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      alert('API 키를 입력해주세요.');
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey);
    alert('API 키가 저장되었습니다!');
  };

  // 텍스트를 마크다운으로 변환
  const handleConvert = async () => {
    if (!text.trim()) {
      alert('변환할 텍스트를 입력해주세요.');
      return;
    }

    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (!savedApiKey) {
      alert('먼저 API 키를 저장해주세요.');
      return;
    }

    setIsConverting(true);
    setMarkdown('');

    try {
      const response = await fetch('/api/convert-to-markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '변환에 실패했습니다.');
      }

      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (error) {
      console.error('변환 중 오류:', error);
      alert(error instanceof Error ? error.message : '변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
    }
  };

  // 마크다운 복사
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    alert('마크다운이 클립보드에 복사되었습니다!');
  };

  // 마크다운 다운로드
  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-slides.md';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="chanel-header">
        <div className="chanel-container">
          <Link href="/" className="chanel-logo">
            <div className="chanel-logo-icon">M</div>
            <div>
              <h1 className="chanel-logo-text">MarkSlide</h1>
              <p className="chanel-logo-subtitle">Markdown to Slides</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="chanel-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="space-y-8">
          {/* Page Title */}
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              설정
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#666' }}>
              Gemini API 설정 및 텍스트→마크다운 변환
            </p>
          </div>

          {/* API 키 설정 섹션 */}
          <div className="chanel-card">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Gemini API 설정
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="chanel-label">
                  API 키
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Google AI Studio에서 발급받은 API 키를 입력하세요"
                  className="chanel-input"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleTestApi}
                  disabled={isTestingApi}
                  className="chanel-button-secondary"
                  style={{ flex: 1 }}
                >
                  {isTestingApi ? '테스트 중...' : 'API 키 테스트'}
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="chanel-button"
                  style={{ flex: 1 }}
                >
                  저장
                </button>
              </div>

              {apiTestResult && (
                <div
                  className="p-4"
                  style={{
                    backgroundColor: apiTestResult.startsWith('✅') ? '#d4edda' : '#f8d7da',
                    border: `2px solid ${apiTestResult.startsWith('✅') ? '#28a745' : '#dc3545'}`,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {apiTestResult}
                </div>
              )}

              <div
                className="p-4"
                style={{
                  backgroundColor: '#f8f8f8',
                  border: '2px solid #000',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                }}
              >
                <p className="mb-2">
                  <strong>💡 API 키 발급 방법:</strong>
                </p>
                <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Google AI Studio
                    </a>
                    에 접속하세요
                  </li>
                  <li>Google 계정으로 로그인합니다</li>
                  <li>"Create API Key" 버튼을 클릭하여 새 API 키를 생성합니다</li>
                  <li>생성된 API 키를 복사하여 위 입력란에 붙여넣으세요</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 텍스트→마크다운 변환 섹션 */}
          <div className="chanel-card">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              텍스트 → 마크다운 변환
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="text" className="chanel-label">
                  일반 텍스트 입력
                </label>
                <textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="슬라이드로 만들고 싶은 내용을 입력하세요..."
                  rows={10}
                  className="chanel-input"
                  style={{ resize: 'vertical', fontFamily: 'Inter, monospace' }}
                />
              </div>

              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="chanel-button w-full"
              >
                {isConverting ? '변환 중...' : '🎯 마크다운으로 변환'}
              </button>

              {markdown && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="chanel-label">변환된 마크다운</label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyMarkdown}
                        className="chanel-button-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        📋 복사
                      </button>
                      <button
                        onClick={handleDownloadMarkdown}
                        className="chanel-button-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        💾 다운로드
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={markdown}
                    readOnly
                    rows={15}
                    className="chanel-input"
                    style={{ resize: 'vertical', fontFamily: 'Fira Code, monospace', backgroundColor: '#f5f5f5' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 홈으로 돌아가기 */}
          <div className="text-center">
            <Link href="/" className="chanel-button-secondary">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>

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
