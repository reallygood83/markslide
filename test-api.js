// MarkSlide API 테스트 스크립트
const fs = require('fs');
const path = require('path');

async function testSlideGeneration() {
  console.log('🧪 MarkSlide API 테스트 시작...\n');

  // 테스트 마크다운 파일 읽기 (다크 테마 테스트용)
  const markdownPath = path.join(__dirname, 'test-slide.md');
  const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

  console.log('📄 마크다운 파일 로드 완료');
  console.log(`📏 파일 크기: ${markdownContent.length} bytes\n`);

  // 완전한 Chanel Noir 테마 객체 (다크 테마 텍스트 가시성 테스트용)
  const chanelNoirTheme = {
    id: 'chanel-noir',
    name: 'Chanel Noir',
    description: '샤넬 스타일 블랙 & 화이트 럭셔리 디자인',
    thumbnail: '/themes/chanel-noir-thumb.png',
    colors: {
      primary: '#000000',
      secondary: '#C5A572',
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
    isDark: true,
  };

  // API 요청 데이터
  const requestData = {
    markdown: markdownContent,
    metadata: {
      title: '다크 테마 텍스트 가시성 테스트',
      subtitle: 'Chanel Noir 테마 흰색 텍스트 검증',
      author: '김문정',
      pageCount: 5
    },
    theme: chanelNoirTheme
  };

  console.log('📤 API 요청 데이터:', JSON.stringify(requestData, null, 2));
  console.log('\n🚀 API 호출 중...\n');

  try {
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }

    // HTML 파일 저장
    const html = await response.text();
    const outputPath = path.join(__dirname, 'output-test-slides.html');
    fs.writeFileSync(outputPath, html, 'utf-8');

    console.log('✅ 슬라이드 생성 성공!');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log(`📏 HTML 크기: ${html.length} bytes`);
    console.log('\n🎉 테스트 완료! 생성된 HTML 파일을 브라우저에서 열어보세요.\n');

    return true;
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('\n상세 오류:', error);
    return false;
  }
}

// 테스트 실행
testSlideGeneration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ 예상치 못한 오류:', err);
    process.exit(1);
  });
