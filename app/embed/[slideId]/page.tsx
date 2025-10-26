'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * 노션 임베드 전용 슬라이드 뷰어
 *
 * 특징:
 * - 노션의 /embed 블록에 최적화
 * - 최소한의 UI로 슬라이드에 집중
 * - 반응형 크기 조절
 * - 빠른 로딩 속도
 */
export default function NotionEmbedPage() {
  const params = useParams();
  const slideId = params.slideId as string;
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlobUrl = async () => {
      if (!slideId) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/get-slide-url?slideId=${slideId}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || '슬라이드 정보를 불러오지 못했습니다.');
        }

        const data = await response.json();
        setBlobUrl(data.url);
      } catch (err) {
        console.error('슬라이드 URL을 불러오는 중 오류:', err);
        setError(err instanceof Error ? err.message : '슬라이드 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlobUrl();
  }, [slideId]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#fff',
        color: '#666',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
      }}>
        로딩 중...
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
        backgroundColor: '#fff',
        color: '#b91c1c',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        textAlign: 'center',
        padding: '1rem',
      }}>
        <p style={{ marginBottom: '0.5rem' }}>슬라이드를 불러오지 못했습니다.</p>
        <p style={{ color: '#6b7280' }}>{error || '잠시 후 다시 시도해주세요.'}</p>
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
      backgroundColor: '#fff',
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
        loading="lazy"
      />
    </div>
  );
}
