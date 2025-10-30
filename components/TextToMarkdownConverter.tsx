'use client';

import { useState, useEffect } from 'react';
import { Wand2, Copy, Download, FileText, Code, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ConversionMetadata {
  pageCount: number;
  hasYoutube: boolean;
  hasCode: boolean;
  hasTable: boolean;
}

export function TextToMarkdownConverter() {
  const [inputText, setInputText] = useState('');
  const [outputMarkdown, setOutputMarkdown] = useState('');
  const [metadata, setMetadata] = useState<ConversionMetadata | null>(null);
  const [pageCount, setPageCount] = useState(10);
  const [isConverting, setIsConverting] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // API 키 로드 (클라이언트 사이드에서만)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key');
      console.log('🔍 localStorage에서 API 키 로드:', savedKey ? savedKey.substring(0, 10) + '...' : '없음');
      if (savedKey) {
        setApiKey(savedKey);
        console.log('✅ API 키 state에 설정 완료');
      }
    }
  }, []);

  const handleConvert = async () => {
    if (!inputText.trim()) {
      alert('변환할 텍스트를 입력해주세요.');
      return;
    }

    // localStorage에서 API 키 다시 확인
    const currentApiKey = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null);

    console.log('🔍 변환 시작 - state의 API 키:', apiKey ? apiKey.substring(0, 10) + '...' : '없음');
    console.log('🔍 변환 시작 - localStorage의 API 키:',
      typeof window !== 'undefined' && localStorage.getItem('gemini_api_key')
        ? localStorage.getItem('gemini_api_key')!.substring(0, 10) + '...'
        : '없음'
    );
    console.log('🔍 최종 사용할 API 키:', currentApiKey ? currentApiKey.substring(0, 10) + '...' : '없음');

    if (!currentApiKey) {
      console.error('❌ API 키가 없습니다!');
      alert('API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.');
      return;
    }

    setIsConverting(true);

    try {
      const response = await fetch('/api/convert-to-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          apiKey: currentApiKey,
          pageCount: pageCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '변환 중 오류가 발생했습니다.');
      }

      setOutputMarkdown(data.markdown);
      setMetadata(data.metadata);
    } catch (error) {
      console.error('변환 오류:', error);
      alert(error instanceof Error ? error.message : '변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputMarkdown);
      alert('마크다운이 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('복사 오류:', error);
      alert('복사 중 오류가 발생했습니다.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slides.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const quickSelectPages = [5, 10, 15, 20];

  return (
    <div className="space-y-8">
      {/* 입력 영역 */}
      <div className="space-y-3">
        <Label htmlFor="input-text" className="chanel-label text-sm">
          변환할 텍스트 입력
        </Label>
        <Textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="여기에 텍스트를 입력하거나 붙여넣으세요..."
          className="min-h-[200px] font-mono text-sm chanel-input resize-none"
          style={{ fontFamily: 'Inter, monospace' }}
        />
        <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>
          {inputText.length} 글자
        </p>
      </div>

      {/* 페이지 수 조정 UI - 완전히 재설계된 버전 */}
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="space-y-1">
          <Label className="chanel-label text-sm">슬라이드 페이지 수</Label>
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            빠른 선택 또는 슬라이더로 조정하세요
          </p>
        </div>

        {/* 심플한 페이지 수 디스플레이 + 빠른 선택 */}
        <div className="flex items-center gap-4">
          {/* 현재 페이지 수 - 1.5배 확대로 시각적 균형 개선 */}
          <div className="flex-shrink-0">
            <div className="inline-flex items-baseline gap-3 px-9 py-5 border-2 border-black bg-white">
              <span className="text-6xl font-bold tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                {pageCount}
              </span>
              <span className="text-lg font-medium text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                페이지
              </span>
            </div>
          </div>

          {/* 빠른 선택 버튼 - 컴팩트하고 우아하게 */}
          <div className="flex gap-2 flex-wrap">
            {quickSelectPages.map((count) => (
              <Button
                key={count}
                onClick={() => setPageCount(count)}
                variant={pageCount === count ? 'default' : 'outline'}
                size="sm"
                className={`min-w-[60px] font-medium transition-all ${
                  pageCount === count
                    ? 'chanel-button-primary'
                    : 'chanel-button-outline hover:border-gray-400'
                }`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.01em'
                }}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        {/* 슬라이더 - 미니멀하고 깔끔하게 */}
        <div className="space-y-3 pt-2">
          <Slider
            value={[pageCount]}
            onValueChange={(value) => setPageCount(value[0])}
            min={3}
            max={25}
            step={1}
            className="chanel-slider"
          />
          <div className="flex justify-between text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span>최소 3</span>
            <span>최대 25</span>
          </div>
        </div>
      </div>

      {/* 변환 버튼 - 우아하고 명확하게 */}
      <div className="space-y-3">
        {!inputText.trim() && (
          <p className="text-xs text-center text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            텍스트를 입력하면 변환 버튼이 활성화됩니다
          </p>
        )}
        <Button
          onClick={handleConvert}
          disabled={isConverting || !inputText.trim()}
          className={`w-full h-16 text-lg font-medium transition-all ${
            isConverting || !inputText.trim()
              ? 'opacity-50 cursor-not-allowed'
              : 'chanel-button-primary hover:shadow-lg'
          }`}
          style={{
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em'
          }}
        >
          {isConverting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              <span>변환 중...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-3" />
              <span>MarkSlide 마크다운으로 변환</span>
            </>
          )}
        </Button>
      </div>

      {/* 결과 영역 */}
      {outputMarkdown && (
        <div className="space-y-4 animate-fade-in-up">
          {/* 메타데이터 표시 - 심플하게 */}
          {metadata && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <FileText className="w-4 h-4" />
                <span>{metadata.pageCount}페이지</span>
              </div>
              {metadata.hasYoutube && (
                <div className="flex items-center gap-2 text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Youtube className="w-4 h-4" />
                  <span>YouTube</span>
                </div>
              )}
              {metadata.hasCode && (
                <div className="flex items-center gap-2 text-sm text-blue-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Code className="w-4 h-4" />
                  <span>코드</span>
                </div>
              )}
              {metadata.hasTable && (
                <div className="flex items-center gap-2 text-sm text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <FileText className="w-4 h-4" />
                  <span>표</span>
                </div>
              )}
            </div>
          )}

          {/* 마크다운 출력 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="chanel-label text-sm">변환된 마크다운</Label>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="chanel-button-outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  복사
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="chanel-button-outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </div>
            <Textarea
              value={outputMarkdown}
              readOnly
              className="min-h-[400px] font-mono text-sm chanel-input resize-none"
              style={{ fontFamily: 'Consolas, Monaco, monospace' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
