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

  useEffect(() => {
    const constructBlobUrl = () => {
      const storeId = process.env.NEXT_PUBLIC_BLOB_STORE_ID || 'LXLWj13VLXSG9AOD';
      const url = `https://${storeId}.public.blob.vercel-storage.com/${slideId}.html`;
      setBlobUrl(url);
      setIsLoading(false);
    };

    if (slideId) {
      constructBlobUrl();
    }
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
