import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MarkSlide - Markdown to Slides';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          fontSize: 60,
          fontWeight: 700,
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            gap: '40px',
            padding: '60px',
            opacity: 0.03,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '80px',
                height: '100%',
                background: 'black',
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: '140px',
              height: '140px',
              background: 'black',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 45V19L28 32L48 19V45"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 45H56"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#000',
              }}
            >
              MarkSlide
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 400,
                letterSpacing: '0.1em',
                color: '#666',
                textTransform: 'uppercase',
              }}
            >
              Markdown to Slides
            </div>
          </div>

          {/* Bottom Line */}
          <div
            style={{
              width: '600px',
              height: '4px',
              background: 'black',
              marginTop: '20px',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
