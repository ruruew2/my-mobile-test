import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, Search } from 'lucide-react';
import './Root.css';

const RootPage = ({ targetCourse, setTargetCourse, onStart }: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiMaker, setShowAiMaker] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  // 1. 각 코스 카드의 DOM 위치를 저장할 Ref 바구니
  const courseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // ✅ 핵심 로직: 외부(홈)에서 targetCourse가 전달되면 해당 카드로 자동 스크롤
  useEffect(() => {
    if (targetCourse) {
      const targetElement = courseRefs.current[targetCourse];
      
      if (targetElement) {
        // 부드럽게 스크롤 이동
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 이동 후 처리 완료를 위해 null로 초기화 (중요: 반복 방지)
        setTargetCourse(null); 
      }
    }
  }, [targetCourse, setTargetCourse]);


  // ✅ 기존 상세 데이터 (모든 코멘트/팁 포함)
  const fixedCourses = [
    {
      id: 1,
      anchorId: 'course-seongsu',
      badge: '2025.06.28~2026.09.20',
      title: '성수, 예술이 머무는 집',
      desc: '일상에 깊게 스며든 예술과 숲의 평온을 함께 누리는 시간입니다.',
      steps: [
        {
          type: 'EXHIBITION',
          name: '디뮤지엄 성수',
          sub: '취향가옥 2 : Art in Life',
          duration: '다음 코스 까지 도보 2분',
          comment: `* 찾아가는 길\n 수인분당선 서울숲역 4번 출구와 연결된 '아크로서울포레스트 D타워' 내부에 위치해 있습니다.\n\n* 전시 관람 Tip\n 각 공간의 '향기'와 '조명'이 만드는 무드에 집중해 보세요.`,
          tip: '전시장 홈 라이브러리 섹션에서 인생샷을 남겨보세요!',
        },
        {
          type: 'RESTAURANT',
          name: '소랑호젠',
          sub: '제주 감성 이탈리안 다이닝',
          duration: '다음 코스 까지 도보 12분',
          comment: `* 분위기 & 위치\n 디뮤지엄에서 서울숲 방향으로 도보 5분 거리입니다. 제주 현무암과 우드톤이 어우러진 아늑한 공간입니다.\n\n* 에디터 메뉴 추천\n 비린맛 없이 감칠맛을 살린 '제주 멜젓 파스타'와 비주얼이 독특한 '현무암 카츠'를 추천합니다. (캐치테이블 예약 권장)`,
          tip: '시그니처인 제주 멜젓 파스타를 추천드려요!',
        },
        {
          type: 'SPACE',
          name: '서울숲 산책로',
          sub: '도심 속 초록빛 휴식',
          duration: '다음 코스 까지 도보 25분',
          comment: `* 산책 코스\n 소랑호젠에서 나와 3번 출입구로 진입하세요. 거울연못을 지나 메타세쿼이아 길까지 걷는 20분 코스를 추천합니다.\n\n* 관전 포인트\n 거울연못에 비치는 나무의 반영을 사진으로 담아보세요.`,
          tip: '거울연못 근처가 사진이 제일 잘 나와요!',
        },
        {
          type: 'CAFE',
          name: '오우도 (OUDO)',
          sub: '아트 갤러리형 카페',
          comment: `* 공간의 특징\n 넓은 층고와 갤러리 같은 벽면 구성이 특징인 카페입니다. 가끔 작은 전시도 함께 열려요.\n\n* 추천 페어링\n 직접 로스팅한 원두로 내린 핸드드립 커피와 계절 디저트가 잘 어울립니다.`,
          tip: '조용한 평일 오후에 가면 책 읽기 너무 좋아요!',
        },
      ],
    },
    {
      id: 2,
      anchorId: 'course-jongno',
      badge: '2025.12.19~2026.6.7',
      title: '구의, 영감의 조각을 줍는 산책',
      desc: '그라운드시소 이스트에서 시작해 브런치 & 에스프레소바에 들러 마무리 할 수 있는 코스입니다.',
      steps: [
        {
          type: 'EXHIBITION',
          name: '그라운드시소 이스트',
          sub: '룸포 원더 : 상상의 문을 열다',
          duration: '다음 코스 까지 도보 11분',
          comment: `🚶💨 도보 시\n구의역 3번 출구 연결 'NC 이스트폴' 2F\n🚗💨 자가용 이용 시\nNC 이스트폴 건물 지하 주차장 이용`,
          tip: '구의역 3번 출구에서 가장 가까워요!',
        },
        {
          type: 'RESTAURANT',
          name: '도치피자 강변',
          sub: '쫄깃한 도우와 신선한 재료의 만남',
          duration: '다음 코스까지 도보 11분 이동',
          comment: `‼️ 파스타와 샐러드, 피자 세트로 먹는 걸 추천해요!\n‼️ 인테리어가 예쁘고 가게가 넓습니다.`,
          tip: '네이버 예약이 가능한 지점 입니다!',
        },
        {
          type: 'CAFE',
          name: '리사르커피 이스트폴점',
          sub: '에스프레소 입문자를 위한 친절한 설명해주는 카페',
          comment: `‼️ 에스프레소바가 처음인 분들도 편하게 방문할 수 있어요!\n‼️ 대화하기에 좋은 카페 입니다.`,
          tip: '에스프레소 외에도 기본 카페 메뉴도 판매해요!',
        },
      ],
    },
  ];

  // AI 코스 생성 로직
  const handleCreateCustomCourse = async (location: string, who: string) => {
    if (!location.trim()) {
      alert("어디로 가실지 지역을 입력해주세요!");
      return;
    }

    setIsGenerating(true);
    setShowAiMaker(false);

    try {
      const response = await fetch('http://localhost:8000/api/ai/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exh_name: location,
          who: who,
          lat: "37.5665",
          lng: "126.9780"
        }),
      });

      if (!response.ok) throw new Error(`서버 에러: ${response.status}`);
      const resData = await response.json();

      if (resData.status === "success") {
        const aiData = resData.data;

        const newAiCourse = {
          id: Date.now(),
          title: `AI 추천: ${location} ${who} 코스`,
          desc: aiData.story.substring(0, 60) + "...",
          aiPlan: aiData,
          steps: [
            { type: 'RESTAURANT', name: aiData.places.restaurant?.name || "근처 맛집", sub: aiData.places.restaurant?.address || "식사" },
            { type: 'EXHIBITION', name: aiData.exhibition?.title || `${location} 전시`, sub: aiData.exhibition?.place_name || "관람" },
            { type: 'CAFE', name: aiData.places.cafe?.name || "근처 카페", sub: aiData.places.cafe?.address || "디저트" }
          ]
        };

        onStart(newAiCourse);
      } else {
        alert("코스 생성 실패: " + resData.message);
      }
    } catch (error) {
      console.error("Fetch 에러:", error);
      alert("서버와 통신 중 문제가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="course-container">
      <header className="course-header">
        <h1>CURATED</h1>
        <p>A journey designed around your taste.</p>
      </header>

      {/* 고정 코스 카드 렌더링 */}
      {fixedCourses.map((course) => (
        <div 
          key={course.id} 
          ref={(el) => (courseRefs.current[course.anchorId] = el)} // Ref 연결
          className="course-card-main" 
          style={{ marginBottom: '30px', scrollMarginTop: '100px' }} // 스크롤 시 상단 여백 보정
        >
          <div className="course-badge">{course.badge}</div>
          <h3 className="course-main-title">{course.title}</h3>
          <p className="course-main-desc">{course.desc}</p>
          <div className="course-timeline">
            {course.steps.map((step, idx) => (
              <div key={idx} className="timeline-item">
                <div className="step-circle">{idx + 1}</div>
                <div className="step-info">
                  <span className="step-name-text">{step.name}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="course-start-btn" onClick={() => onStart(course)}> 
            <Send size={16} /> 코스 시작하기
          </button>
        </div>
      ))}

      {/* AI 설계 카드 - Sparkles 오타 완전 수정 */}
      <div className="course-card-main ai-design-card" style={{ 
        border: '2px dashed #d1d1d1', 
        background: 'linear-gradient(to bottom right, #ffffff, #f0f7ff)',
        cursor: 'pointer'
      }} onClick={() => setShowAiMaker(true)}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ background: '#000', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <Sparkles size={24} /> 
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>나만의 AI 코스 자동 설계</h3>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>원하는 지역과 동행만 알려주세요.</p>
        </div>
      </div>

      {/* AI 설정 모달 */}
      {showAiMaker && (
        <div className="ai-modal-overlay" style={modalOverlayStyle}>
          <div className="ai-modal" style={modalStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>어디로 가시나요?</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', backgroundColor: '#f1f3f5', padding: '12px 16px', borderRadius: '16px' }}>
              <Search size={18} color="#888" />
              <input 
                type="text"
                placeholder="지역 입력 (예: 성수, 잠실)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '15px' }}
              />
            </div>
            
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>누구와 가시나요?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['연인', '친구', '아이', '부모님'].map(who => (
                <button 
                  key={who} 
                  className="who-select-btn"
                  onClick={() => handleCreateCustomCourse(locationInput, who)} 
                  style={whoBtnStyle}
                >
                  {who}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setShowAiMaker(false); setLocationInput(''); }} 
              style={{ marginTop: '20px', width: '100%', color: '#999', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 로딩 인디케이터 */}
      {isGenerating && (
        <div style={{ ...modalOverlayStyle, zIndex: 2000 }}> 
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
            <p style={{ fontSize: '16px' }}>아티가 코스를 설계 중입니다...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .who-select-btn:active { background-color: #e9ecef !important; }
      `}</style>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' };
const modalStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px 20px', borderRadius: '24px', width: '85%', maxWidth: '360px' };
const whoBtnStyle: React.CSSProperties = { padding: '15px', borderRadius: '16px', border: '1px solid #eee', background: '#f8f9fa', fontWeight: '500', cursor: 'pointer' };

export default RootPage;