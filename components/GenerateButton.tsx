'use client';

import { useState } from 'react';
import { Download, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsComplete(false);
    setProgress(0);

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

      // File System Access API를 사용하여 사용자가 선택한 폴더에 저장
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

      setProgress(100);
      setIsComplete(true);

      // 완료 상태 표시 후 초기화
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setIsComplete(false);
      }, 2000);
    } catch (error) {
      console.error('슬라이드 생성 중 오류:', error);
      alert('슬라이드 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsGenerating(false);
      setProgress(0);
      setIsComplete(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="chanel-button w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            슬라이드 생성 중... {progress}%
          </>
        ) : isComplete ? (
          <>
            <CheckCircle2 className="w-6 h-6" />
            생성 완료!
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            슬라이드 생성하기
          </>
        )}
      </button>

      {isGenerating && (
        <div className="chanel-progress-container">
          <div
            className="chanel-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {!isGenerating && !isComplete && (
        <p className="text-center text-sm" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>
          <Download className="w-4 h-4 inline mr-1" />
          생성된 슬라이드는 다운로드 폴더에 저장됩니다
        </p>
      )}
    </div>
  );
}
