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
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'professional-business',
    name: 'Professional Business',
    description: '비즈니스 프레젠테이션에 최적화된 정제된 디자인',
    thumbnail: '/themes/professional-business-thumb.png',
    colors: {
      primary: '#1e3a8a',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Pretendard, sans-serif',
      body: 'Pretendard, sans-serif',
    },
  },
  {
    id: 'developer-education',
    name: 'Developer Education',
    description: '개발자 교육에 최적화된 모던한 디자인',
    thumbnail: '/themes/developer-education-thumb.png',
    colors: {
      primary: '#2563eb',
      secondary: '#1f2937',
      accent: '#10b981',
      background: '#ffffff',
      text: '#111827',
    },
    fonts: {
      heading: 'Pretendard, sans-serif',
      body: 'Pretendard, sans-serif',
    },
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: '심플하고 현대적인 미니멀 디자인',
    thumbnail: '/themes/modern-minimalist-thumb.png',
    colors: {
      primary: '#000000',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#111827',
    },
    fonts: {
      heading: 'Pretendard, sans-serif',
      body: 'Pretendard, sans-serif',
    },
  },
  {
    id: 'creative-workshop',
    name: 'Creative Workshop',
    description: '창의적인 워크샵과 브레인스토밍에 적합',
    thumbnail: '/themes/creative-workshop-thumb.png',
    colors: {
      primary: '#7c3aed',
      secondary: '#f97316',
      accent: '#ec4899',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Pretendard, sans-serif',
      body: 'Pretendard, sans-serif',
    },
  },
  {
    id: 'academic-research',
    name: 'Academic Research',
    description: '학술 발표와 연구 논문에 최적화',
    thumbnail: '/themes/academic-research-thumb.png',
    colors: {
      primary: '#1e40af',
      secondary: '#059669',
      accent: '#d97706',
      background: '#fef3c7',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Pretendard, sans-serif',
      body: 'Pretendard, sans-serif',
    },
  },
];

export const getThemeById = (id: string): Theme | undefined => {
  return themes.find((theme) => theme.id === id);
};
