import { ImageResponse } from 'next/og';

// 사이트 공통 OG 이미지(1200×630) — 브랜드 워드마크. 파일 규약상 전 route 기본 og:image 로 사용.
// (Satori 기본 폰트는 라틴만 안정적이라 텍스트는 영문으로 구성)
export const alt = 'AntsUp — Stock insights for beginner investors';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#101013',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 148, fontWeight: 800, letterSpacing: '-0.04em' }}>
          <span style={{ color: '#ececef' }}>Ants</span>
          <span style={{ color: '#5b8def' }}>Up</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 36, color: '#8e8e98', fontWeight: 500 }}>
          Stock insights for beginner investors
        </div>
        <div style={{ marginTop: 56, display: 'flex', gap: 16 }}>
          {['News', 'Guru 13F', 'Stocks', 'Macro', 'Tools'].map((tag) => (
            <div
              key={tag}
              style={{
                display: 'flex',
                fontSize: 24,
                color: '#b8b8c0',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 999,
                padding: '8px 20px',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
