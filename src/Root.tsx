import React, { useState, useEffect } from 'react';
import { Compass, Send, Loader2, Sparkles, MapPin } from 'lucide-react';
import './Root.css';

const RootPage = ({ targetCourse, setTargetCourse, onStart }: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiMaker, setShowAiMaker] = useState(false); // AI 설계 모달 제어

  // 1, 2번 고정 코스 데이터
  const fixedCourses = [
    {
      id: 1,
      anchorId: "course-seongsu-dmuseum",
      badge: "2025.06.28~2026.09.20",
      title: "성수, 예술이 머무는 집",
      desc: "일상에 깊게 스며든 예술과 숲의 평온을 함께 누리는 시간입니다.",
      steps: [
        { type: 'EXHIBITION', name: '디뮤지엄 성수', sub: '취향가옥 2 : Art in Life' },
        { type: 'RESTAURANT', name: '소랑호젠', sub: '제주 감성 이탈리안 다이닝' },
        { type: 'SPACE', name: '서울숲 산책로', sub: '도심 속 초록빛 휴식' },
        { type: 'CAFE', name: '오우도 (OUDO)', sub: '아트 갤러리형 카페' }
      ]
    },
    {
      id: 2,
      anchorId: "course-jongno",
      badge: "2025.12.19~2026.6.7",
      title: "구의, 영감의 조각을 줍는 산책",
      desc: "그라운드시소 이스트에서 시작해 브런치 & 에스프레소바에 들러 마무리 할 수 있는 코스입니다.",
      steps: [
        { type: 'EXHIBITION', name: '그라운드시소 이스트', sub: '룸포 원더 : 상상의 문을 열다' },
        { type: 'RESTAURANT', name: '도치피자 강변', sub: '쫄깃한 도우' },
        { type: 'CAFE', name: '리사르커피 이스트폴점', sub: '에스프레소 바' }
      ]
    }
  ];

  // 🤖 [핵심 로직] AI에게 완전히 새로운 코스 짜달라고 하기
const handleCreateCustomCourse = async (location: string, who: string) => {
  setIsGenerating(true);
  setShowAiMaker(false);

  try {
    // 🚨 주소가 'http://localhost:8000/api/ai/course' 인지 꼭 확인!
    const response = await fetch('http://localhost:8000/api/ai/course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exh_name: `${location} 근처 전시`,
        lat: "37.5665", // 테스트용 좌표
        lng: "126.9780",
        who: who // "연인", "친구" 등
      }),
    });

    // 서버 에러(500)나 경로 에러(404) 체크
    if (!response.ok) {
      throw new Error(`서버 상태 이상: ${response.status}`);
    }
      
      const resData = await response.json();
      
      if (resData.status === "success") {
        // AI가 생성한 텍스트를 바탕으로 "가상의 3번 코스" 객체를 만듦
        const newAiCourse = {
          id: 999,
          title: `AI 추천: ${location} ${who} 코스`,
          desc: `${who}와(과) 함께하는 완벽한 하루를 설계했습니다.`,
          aiPlan: resData.data,
          steps: [{ type: 'AI_CUSTOM', name: 'AI 맞춤 코스 상세', sub: '아래 설명을 확인하세요' }]
        };
        onStart(newAiCourse);
      }
} catch (error) {
    console.error("상세 에러:", error);
    alert("AI 코스 생성에 실패했습니다."); // 여기서 실패가 뜨는 것!
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

      {/* 1. 기존 고정 코스 리스트 */}
      {fixedCourses.map((course) => (
        <div key={course.id} id={course.anchorId} className="course-card-main" style={{ marginBottom: '30px' }}>
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

      {/* 2. ✨ AI 자동 설계 카드 (리스트 맨 아래에 추가) */}
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
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>원하는 지역과 동행만 알려주세요.<br/>아티가 즉석에서 코스를 짜드립니다.</p>
        </div>
      </div>

{/* --- AI 코스 설정 모달 --- */}
{showAiMaker && (
  <div className="ai-modal-overlay" style={modalOverlayStyle}>
    <div className="ai-modal" style={modalStyle}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>어디로 가시나요?</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['성수', '한남', '종로', '구의'].map(loc => (
          <button 
            key={loc} 
            type="button" // 👈 타입을 지정해서 폼 제출 방지
            style={subBtnStyle}
            onClick={(e) => {
              e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
              console.log(loc + " 선택됨");
            }}
          >
            {loc}
          </button>
        ))}
      </div>
      
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>누구와 가시나요?</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {['연인', '친구', '아이', '부모님'].map(who => (
          <button 
            key={who} 
            type="button"
            className="who-select-btn"
            onClick={(e) => {
              e.stopPropagation();
              console.log(who + " 버튼 눌림!"); // 👈 로그 찍어서 확인
              handleCreateCustomCourse("성수", who);
            }} 
            style={whoBtnStyle}
          >
            {who}
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => setShowAiMaker(false)} 
        style={{ marginTop: '20px', width: '100%', color: '#999', border: 'none', background: 'none' }}
      >
        취소
      </button>
    </div>
  </div>
)}

      {/* 로딩 표시 */}
      {isGenerating && (
        <div className="ai-modal-overlay" style={{ zIndex: 2000 }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <Loader2 className="spinner" size={40} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '10px' }}>아티가 코스를 설계 중입니다...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ai-design-card:hover { border-color: #000 !important; }
      `}</style>
    </div>
  );
};

// 스타일 생략 (이전과 동일)
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' };
const modalStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px 20px', borderRadius: '24px', width: '85%', maxWidth: '360px' };
const whoBtnStyle: React.CSSProperties = { padding: '15px', borderRadius: '16px', border: '1px solid #eee', background: '#f8f9fa', fontWeight: '500' };
const subBtnStyle: React.CSSProperties = { padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '13px' };

export default RootPage;