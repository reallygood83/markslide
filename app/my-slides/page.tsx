'use client';

import { useState, useEffect } from 'react';
import { Globe, Copy, ExternalLink, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';

interface DeployedSlide {
  title: string;
  url: string;
  timestamp: string;
  theme: string;
}

export default function MySlidesPage() {
  const [deployedSlides, setDeployedSlides] = useState<DeployedSlide[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    // LocalStorage에서 배포 기록 불러오기
    const history = localStorage.getItem('deployedSlides');
    if (history) {
      try {
        const slides = JSON.parse(history);
        setDeployedSlides(slides);
      } catch (error) {
        console.error('배포 기록을 불러오는 중 오류 발생:', error);
      }
    }
  }, []);

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('URL 복사 실패:', error);
    }
  };

  const handleDelete = (index: number) => {
    const confirmed = window.confirm('이 배포 기록을 삭제하시겠습니까?');
    if (confirmed) {
      const updatedSlides = deployedSlides.filter((_, i) => i !== index);
      setDeployedSlides(updatedSlides);
      localStorage.setItem('deployedSlides', JSON.stringify(updatedSlides));
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fff',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '3px solid #000',
        padding: '2rem',
        backgroundColor: '#fff',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}>
              내 배포된 슬라이드
            </h1>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              온라인에 배포한 슬라이드 목록을 관리하세요
            </p>
          </div>
          <Link
            href="/platform"
            className="chanel-button-secondary"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            ← 홈으로
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
      }}>
        {deployedSlides.length === 0 ? (
          // Empty State
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#f8f8f8',
            border: '2px solid #000',
          }}>
            <Globe size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}>
              아직 배포된 슬라이드가 없습니다
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              슬라이드를 생성하고 "온라인 배포" 모드를 선택하여 배포해보세요
            </p>
            <Link
              href="/platform"
              className="chanel-button-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              슬라이드 만들기
            </Link>
          </div>
        ) : (
          // Slides Grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
          }}>
            {deployedSlides.map((slide, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  padding: '1.5rem',
                  transition: 'box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '4px 4px 0 #000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Slide Title */}
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  wordBreak: 'break-word',
                }}>
                  {slide.title}
                </h3>

                {/* Theme Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginBottom: '1rem',
                }}>
                  {slide.theme}
                </div>

                {/* Timestamp */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#666',
                  fontSize: '0.75rem',
                  marginBottom: '1rem',
                }}>
                  <Calendar size={14} />
                  <span>{formatDate(slide.timestamp)}</span>
                </div>

                {/* URL Display */}
                <div style={{
                  backgroundColor: '#f8f8f8',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  wordBreak: 'break-all',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#1e40af',
                }}>
                  {slide.url}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.5rem',
                }}>
                  <button
                    onClick={() => handleCopyUrl(slide.url)}
                    className="chanel-button-secondary"
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Copy size={14} />
                    {copiedUrl === slide.url ? '복사됨!' : '복사'}
                  </button>
                  <a
                    href={slide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chanel-button-secondary"
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={14} />
                    열기
                  </a>
                  <button
                    onClick={() => handleDelete(index)}
                    className="chanel-button-secondary"
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      backgroundColor: '#fff',
                      color: '#dc2626',
                      borderColor: '#dc2626',
                    }}
                  >
                    <Trash2 size={14} />
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {deployedSlides.length > 0 && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            border: '2px solid #3b82f6',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          }}>
            <p style={{ color: '#1e40af', marginBottom: '0.5rem' }}>
              💡 <strong>배포 관리 팁</strong>
            </p>
            <ul style={{
              color: '#64748b',
              paddingLeft: '1.5rem',
              margin: 0,
            }}>
              <li>최근 20개의 배포 기록만 저장됩니다</li>
              <li>배포된 슬라이드는 Vercel Blob Storage에 안전하게 보관됩니다</li>
              <li>링크를 삭제해도 실제 파일은 유지됩니다 (나중에 다시 추가 가능)</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
