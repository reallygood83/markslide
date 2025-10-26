'use client';

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
}

// 데스크톱 저장 경로 (사용자 홈 디렉토리의 Desktop)
const getDesktopPath = () => {
  if (typeof window !== 'undefined') {
    // 브라우저에서는 Downloads 폴더로 자동 저장됨
    return 'Downloads 폴더';
  }
  return 'Desktop';
};

export function MetadataForm({
  metadata,
  onMetadataChange,
  markdownContent,
}: MetadataFormProps) {
  const estimatedPages = Math.ceil(markdownContent.split('\n').length / 15);

  const handleChange = (field: keyof typeof metadata, value: string | number) => {
    onMetadataChange({
      ...metadata,
      [field]: value,
    });
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

        {/* Save Location Info */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f8f8',
          border: '2px solid #000',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem'
        }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
            📁 저장 위치
          </p>
          <p style={{ color: '#666' }}>
            생성된 슬라이드는 브라우저의 <strong style={{ color: '#000' }}>{getDesktopPath()}</strong>에 자동으로 저장됩니다.
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
