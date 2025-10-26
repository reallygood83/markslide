import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildBlobUrl } from '@/lib/storage/vercelBlob';

export const dynamic = 'force-dynamic';

interface SlideViewPageProps {
  params: {
    slideId: string;
  };
}

async function verifyBlobExists(blobUrl: string) {
  try {
    const response = await fetch(blobUrl, {
      method: 'HEAD',
      cache: 'no-store',
    });

    return response.ok;
  } catch (error) {
    console.error('Blob 존재 여부 확인 중 오류:', error);
    return false;
  }
}

export default async function SlideViewPage({ params }: SlideViewPageProps) {
  const slideId = params.slideId;

  if (!slideId) {
    return (
      <ErrorMessage
        title="슬라이드 ID가 필요합니다."
        description="공유받은 링크가 올바른지 확인해주세요."
      />
    );
  }

  const blobUrl = buildBlobUrl(slideId);

  if (!blobUrl) {
    return (
      <ErrorMessage
        title="Blob Storage 설정을 찾을 수 없습니다."
        description="배포 환경의 BLOB 관련 환경 변수를 확인해주세요."
      />
    );
  }

  const exists = await verifyBlobExists(blobUrl);

  if (exists) {
    redirect(blobUrl);
  }

  return (
    <ErrorMessage
      title="슬라이드를 찾을 수 없습니다."
      description="링크가 만료되었거나 슬라이드가 삭제되었는지 확인해주세요."
    />
  );
}

function ErrorMessage({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        backgroundColor: '#fff',
        color: '#111',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{title}</h1>
      <p style={{ fontSize: '0.95rem', color: '#555', maxWidth: '28rem' }}>{description}</p>
      <Link
        href="/"
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          border: '2px solid #000',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#000',
        }}
      >
        MarkSlide 홈으로 이동
      </Link>
    </div>
  );
}
