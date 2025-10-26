'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SlideViewerPage() {
  const params = useParams();
  const slideId = params.slideId as string;
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Proxy endpoint를 통해 슬라이드 접근 (inline 표시를 위한 올바른 헤더)
    const constructProxyUrl = () => {
      try {
        // 로컬 프록시 API를 사용하여 Blob Storage에서 가져오기
        // 이렇게 하면 Content-Disposition: inline 헤더로 표시됨
        const url = `/api/proxy-slide/${slideId}`;

        setBlobUrl(url);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '슬라이드를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    if (slideId) {
      constructProxyUrl();
    }
  }, [slideId]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '1.2rem',
      }}>
        슬라이드를 불러오는 중...
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>😢 슬라이드를 찾을 수 없습니다</h1>
        <p style={{ fontSize: '1rem', color: '#999' }}>{error || '유효하지 않은 슬라이드 ID입니다.'}</p>
        <a href="/" style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#fff',
          color: '#000',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: '600',
        }}>
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
    }}>
      <iframe
        src={blobUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
        title="슬라이드 프레젠테이션"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
