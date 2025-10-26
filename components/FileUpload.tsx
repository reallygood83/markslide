'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  maxSize?: number; // MB
}

export function FileUpload({ onFileSelect, maxSize = 5 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');

  const validateMarkdown = (file: File): boolean => {
    const validExtensions = ['.md', '.markdown'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const maxSizeBytes = maxSize * 1024 * 1024;

    if (!validExtensions.includes(extension)) {
      setError('마크다운 파일(.md, .markdown)만 업로드 가능합니다.');
      return false;
    }

    if (file.size > maxSizeBytes) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (validateMarkdown(file)) {
        const text = await file.text();
        setPreview(text.slice(0, 200));
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        className={`chanel-upload-area ${isDragging ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".md,.markdown"
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-black flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                마크다운 파일을 드래그하거나 클릭하세요
              </p>
              <p className="text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>
                .md 또는 .markdown 파일 (최대 {maxSize}MB)
              </p>
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 border-2 border-black bg-white flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {preview && !error && (
        <div className="chanel-file-preview">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4" />
            <p className="text-sm font-medium chanel-label">파일 미리보기</p>
          </div>
          <p className="text-xs font-mono whitespace-pre-wrap">
            {preview}
            {preview.length >= 200 && '...'}
          </p>
        </div>
      )}
    </div>
  );
}
