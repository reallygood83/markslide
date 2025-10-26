// lib/themes.ts
export interface Theme {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    highlight?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  // 테마별 특별한 스타일 속성
  special?: {
    gradient?: string;
    shadow?: string;
    border?: string;
    pattern?: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'chanel-noir',
    name: 'Chanel Noir',
    description: '샤넬 스타일 블랙 & 화이트 럭셔리 디자인',
    thumbnail: '/themes/chanel-noir-thumb.png',
    colors: {
      primary: '#000000',
      secondary: '#C5A572', // Gold accent
      accent: '#FFFFFF',
      background: '#FFFFFF',
      text: '#000000',
      highlight: '#C5A572',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Pretendard, sans-serif',
    },
    special: {
      gradient: 'linear-gradient(135deg, #000000 0%, #2C2C2C 100%)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      border: '3px solid #C5A572',
    },
  },
  {
    id: 'apple-keynote',
    name: 'Apple Keynote',
    description: '애플 스타일 미니멀 & 엘레강스 디자인',
    thumbnail: '/themes/apple-keynote-thumb.png',
    colors: {
      primary: '#1D1D1F',
      secondary: '#0071E3',
      accent: '#06C',
      background: '#F5F5F7',
      text: '#1D1D1F',
      highlight: '#0071E3',
    },
    fonts: {
      heading: 'SF Pro Display, -apple-system, sans-serif',
      body: 'SF Pro Text, -apple-system, sans-serif',
    },
    special: {
      gradient: 'linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 100%)',
      shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: '사이버펑크 네온 스타일 다크 테마',
    thumbnail: '/themes/cyberpunk-neon-thumb.png',
    colors: {
      primary: '#00F5FF',
      secondary: '#FF00FF',
      accent: '#FFD700',
      background: '#0A0E27',
      text: '#E0E0E0',
      highlight: '#00F5FF',
    },
    fonts: {
      heading: 'Orbitron, monospace',
      body: 'Rajdhani, sans-serif',
    },
    special: {
      gradient: 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 50%, #2A1F3D 100%)',
      shadow: '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
      border: '2px solid #00F5FF',
    },
  },
  {
    id: 'gradient-sunset',
    name: 'Gradient Sunset',
    description: '따뜻한 그라데이션 선셋 컬러',
    thumbnail: '/themes/gradient-sunset-thumb.png',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFD93D',
      accent: '#6BCB77',
      background: '#FFF8E1',
      text: '#2C3E50',
      highlight: '#FF6B6B',
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Noto Sans KR, sans-serif',
    },
    special: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #feca57 100%)',
      shadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
    },
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: '반투명 유리 효과의 모던한 디자인',
    thumbnail: '/themes/glassmorphism-thumb.png',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#e0e5ec',
      text: '#2C3E50',
      highlight: '#667eea',
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, sans-serif',
    },
    special: {
      gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
    },
  },
  {
    id: 'retro-vintage',
    name: 'Retro Vintage',
    description: '레트로 빈티지 스타일',
    thumbnail: '/themes/retro-vintage-thumb.png',
    colors: {
      primary: '#D2691E',
      secondary: '#8B4513',
      accent: '#F4A460',
      background: '#FFF8DC',
      text: '#3E2723',
      highlight: '#CD853F',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Merriweather, serif',
    },
    special: {
      gradient: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)',
      shadow: '4px 4px 0px #8B4513',
      border: '4px solid #8B4513',
    },
  },
  {
    id: 'corporate-tech',
    name: 'Corporate Tech',
    description: '기업용 기술 프레젠테이션 스타일',
    thumbnail: '/themes/corporate-tech-thumb.png',
    colors: {
      primary: '#1e3a8a',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#ffffff',
      text: '#1f2937',
      highlight: '#3b82f6',
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Open Sans, sans-serif',
    },
    special: {
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      shadow: '0 4px 15px rgba(30, 58, 138, 0.2)',
    },
  },
  {
    id: 'nature-earth',
    name: 'Nature Earth',
    description: '자연 친화적 어스톤 컬러',
    thumbnail: '/themes/nature-earth-thumb.png',
    colors: {
      primary: '#2d5016',
      secondary: '#56ab2f',
      accent: '#a8e063',
      background: '#f0f4ef',
      text: '#1a2e05',
      highlight: '#56ab2f',
    },
    fonts: {
      heading: 'Nunito, sans-serif',
      body: 'Lato, sans-serif',
    },
    special: {
      gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
      shadow: '0 6px 20px rgba(86, 171, 47, 0.25)',
    },
  },
];

export const getThemeById = (id: string): Theme | undefined => {
  return themes.find((theme) => theme.id === id);
};
