'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface MetadataFormProps {
  metadata: {
    title: string;
    subtitle: string;
    author: string;
    pageCount: number;
  };
  onMetadataChange: (metadata: MetadataFormProps['metadata']) => void;
  markdownContent: string;
  onSaveFolderChange?: (handle: FileSystemDirectoryHandle | null) => void;
}

export function MetadataForm({
  metadata,
  onMetadataChange,
  markdownContent,
  onSaveFolderChange,
}: MetadataFormProps) {
  const [saveFolderName, setSaveFolderName] = useState<string>('Downloads 폴더 (기본)');
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);
  const estimatedPages = Math.ceil(markdownContent.split('\n').length / 15);

  const handleChange = (field: keyof typeof metadata, value: string | number) => {
    onMetadataChange({
      ...metadata,
      [field]: value,
    });
  };

  const handleSelectFolder = async () => {
    try {
      setIsSelectingFolder(true);

      // File System Access API 지원 확인
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });

        setSaveFolderName(dirHandle.name);
        if (onSaveFolderChange) {
          onSaveFolderChange(dirHandle);
        }
      } else {
        alert('이 브라우저는 폴더 선택 기능을 지원하지 않습니다.\n최신 Chrome, Edge 브라우저를 사용해주세요.');
      }
    } catch (error) {
      // 사용자가 취소한 경우
      console.log('폴더 선택 취소됨');
    } finally {
      setIsSelectingFolder(false);
    }
  };

  return (
    <div className="chanel-card">
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="chanel-label">
            제목 *
          </label>
          <input
            id="title"
            type="text"
            value={metadata.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="슬라이드 제목을 입력하세요"
            className="chanel-input"
            required
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <label htmlFor="subtitle" className="chanel-label">
            부제목
          </label>
          <input
            id="subtitle"
            type="text"
            value={metadata.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="부제목을 입력하세요 (선택사항)"
            className="chanel-input"
          />
        </div>

        {/* Author */}
        <div className="space-y-2">
          <label htmlFor="author" className="chanel-label">
            작성자
          </label>
          <input
            id="author"
            type="text"
            value={metadata.author}
            onChange={(e) => handleChange('author', e.target.value)}
            placeholder="작성자 이름을 입력하세요"
            className="chanel-input"
          />
        </div>

        {/* Page Count Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="pageCount" className="chanel-label">
              슬라이드 페이지 수
            </label>
            <span className="text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              {metadata.pageCount}페이지
            </span>
          </div>
          <Slider
            id="pageCount"
            min={5}
            max={50}
            step={1}
            value={[metadata.pageCount]}
            onValueChange={([value]) => handleChange('pageCount', value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#666' }}>
            <span>5페이지</span>
            <span style={{ color: '#000', fontWeight: '500' }}>
              추천: {estimatedPages}페이지
            </span>
            <span>50페이지</span>
          </div>
        </div>

        {/* Save Folder Selection */}
        <div className="space-y-3">
          <label className="chanel-label">
            📁 저장 위치
          </label>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f8f8',
            border: '2px solid #000',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                현재 저장 폴더
              </p>
              <p style={{ color: '#666', fontSize: '0.75rem' }}>
                {saveFolderName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSelectFolder}
              disabled={isSelectingFolder}
              className="chanel-button-secondary"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}
            >
              {isSelectingFolder ? '선택 중...' : '폴더 선택'}
            </button>
          </div>
          <p style={{
            color: '#666',
            fontSize: '0.75rem',
            fontFamily: 'Inter, sans-serif'
          }}>
            💡 폴더를 선택하지 않으면 브라우저의 Downloads 폴더에 자동으로 저장됩니다.
          </p>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f8f8',
          border: '2px solid #000',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem'
        }}>
          <p style={{ color: '#000' }}>
            💡 마크다운 내용을 기준으로 자동으로 <strong>{estimatedPages}페이지</strong>를 권장합니다.
            슬라이더로 원하는 페이지 수를 조정할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
