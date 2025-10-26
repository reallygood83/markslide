'use client';

import { useState } from 'react';
import { Download, Sparkles, Loader2, CheckCircle2, Globe, Copy, ExternalLink } from 'lucide-react';
import { Theme } from '@/lib/themes';

interface GenerateButtonProps {
  markdownContent: string;
  theme: Theme;
  metadata: {
    title: string;
    subtitle: string;
    author: string;
    pageCount: number;
  };
  saveFolderHandle?: FileSystemDirectoryHandle | null;
}

export function GenerateButton({
  markdownContent,
  theme,
  metadata,
  saveFolderHandle,
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [deployMode, setDeployMode] = useState<'download' | 'deploy'>('download');
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsComplete(false);
    setProgress(0);
    setDeployedUrl(null);

    try {
      // 진행률 애니메이션
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 150);

      // API 호출하여 슬라이드 생성
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown: markdownContent,
          metadata,
          theme,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('슬라이드 생성에 실패했습니다.');
      }

      // HTML 파일 다운로드 또는 저장
      const blob = await response.blob();
      const fileName = `${metadata.title || 'presentation'}.html`;

      // 배포 모드 선택에 따라 처리
      if (deployMode === 'deploy') {
        // Vercel Blob Storage에 업로드
        const formData = new FormData();
        formData.append('file', blob, fileName);
        formData.append('filename', fileName);

        const uploadResponse = await fetch('/api/upload-slide', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('슬라이드 배포에 실패했습니다.');
        }

        const uploadData = await uploadResponse.json();
        setDeployedUrl(uploadData.url);

        // LocalStorage에 배포 기록 저장
        const deployHistory = JSON.parse(localStorage.getItem('deployedSlides') || '[]');
        deployHistory.unshift({
          title: metadata.title,
          url: uploadData.url,
          timestamp: new Date().toISOString(),
          theme: theme.name,
        });
        localStorage.setItem('deployedSlides', JSON.stringify(deployHistory.slice(0, 20))); // 최근 20개만 저장
      } else {
        // 다운로드 모드: File System Access API를 사용하여 사용자가 선택한 폴더에 저장
        if (saveFolderHandle) {
          try {
            const fileHandle = await saveFolderHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            console.log('파일이 선택한 폴더에 저장되었습니다:', fileName);
          } catch (error) {
            console.error('폴더에 저장 실패, 다운로드로 대체:', error);
            // 폴더 저장 실패 시 기본 다운로드로 대체
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
        } else {
          // 폴더 선택 안 한 경우 기본 다운로드
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }

      setProgress(100);
      setIsComplete(true);

      // 배포 모드가 아닌 경우에만 자동 초기화
      if (deployMode !== 'deploy') {
        setTimeout(() => {
          setIsGenerating(false);
          setProgress(0);
          setIsComplete(false);
        }, 2000);
      } else {
        // 배포 모드는 URL을 보여주기 위해 초기화하지 않음
        setIsGenerating(false);
        setProgress(0);
      }
    } catch (error) {
      console.error('슬라이드 생성 중 오류:', error);
      alert(error instanceof Error ? error.message : '슬라이드 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsGenerating(false);
      setProgress(0);
      setIsComplete(false);
    }
  };

  const handleCopyUrl = async () => {
    if (deployedUrl) {
      await navigator.clipboard.writeText(deployedUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* 다운로드 / 배포 모드 선택 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        padding: '0.5rem',
        backgroundColor: '#f8f8f8',
        border: '2px solid #000',
      }}>
        <button
          type="button"
          onClick={() => setDeployMode('download')}
          className={deployMode === 'download' ? 'chanel-button-primary' : 'chanel-button-secondary'}
          style={{
            padding: '0.75rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <Download className="w-4 h-4" />
          다운로드
        </button>
        <button
          type="button"
          onClick={() => setDeployMode('deploy')}
          className={deployMode === 'deploy' ? 'chanel-button-primary' : 'chanel-button-secondary'}
          style={{
            padding: '0.75rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <Globe className="w-4 h-4" />
          온라인 배포
        </button>
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="chanel-button w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            {deployMode === 'deploy' ? '배포 중...' : '생성 중...'} {progress}%
          </>
        ) : isComplete ? (
          <>
            <CheckCircle2 className="w-6 h-6" />
            {deployMode === 'deploy' ? '배포 완료!' : '생성 완료!'}
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            {deployMode === 'deploy' ? '온라인에 배포하기' : '슬라이드 생성하기'}
          </>
        )}
      </button>

      {/* 진행률 표시 */}
      {isGenerating && (
        <div className="chanel-progress-container">
          <div
            className="chanel-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 배포 URL 표시 */}
      {deployedUrl && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          border: '2px solid #22c55e',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#16a34a' }}>
            🎉 슬라이드가 온라인에 배포되었습니다!
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
          }}>
            <input
              type="text"
              value={deployedUrl}
              readOnly
              style={{
                flex: 1,
                fontSize: '0.75rem',
                border: 'none',
                outline: 'none',
                fontFamily: 'monospace',
                color: '#1e40af',
              }}
            />
            <button
              onClick={handleCopyUrl}
              className="chanel-button-secondary"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Copy className="w-3 h-3" />
              {isCopied ? '복사됨!' : '복사'}
            </button>
          </div>

          {/* 슬라이드 바로보기 버튼 */}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <a
              href={deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="chanel-button-primary"
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
              }}
            >
              <ExternalLink className="w-4 h-4" />
              슬라이드 바로보기
            </a>
          </div>

          {/* 노션 임베드 URL */}
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}>
              📄 노션 임베드용 URL
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fff',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
            }}>
              <code style={{
                flex: 1,
                fontSize: '0.75rem',
                color: '#1f2937',
                overflow: 'auto',
                whiteSpace: 'nowrap',
              }}>
                {deployedUrl.replace('/view/', '/embed/')}
              </code>
              <button
                onClick={async () => {
                  const embedUrl = deployedUrl.replace('/view/', '/embed/');
                  await navigator.clipboard.writeText(embedUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <Copy className="w-3 h-3" />
                복사
              </button>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem' }}>
              노션에서 <code style={{ fontSize: '0.7rem', backgroundColor: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '2px' }}>/embed</code> 명령어로 이 URL을 붙여넣으세요
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            💡 이 링크를 공유하면 누구나 슬라이드를 볼 수 있습니다
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {!isGenerating && !isComplete && !deployedUrl && (
        <p className="text-center text-sm" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em', color: '#666' }}>
          {deployMode === 'download' ? (
            <>
              <Download className="w-4 h-4 inline mr-1" />
              생성된 슬라이드는 다운로드 폴더에 저장됩니다
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 inline mr-1" />
              슬라이드가 온라인에 배포되어 공유 가능한 링크가 생성됩니다
            </>
          )}
        </p>
      )}
    </div>
  );
}
