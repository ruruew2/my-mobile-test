import React, { useState } from 'react';
import { Send, Loader2, Sparkles, Search } from 'lucide-react';
import './Root.css';

const RootPage = ({ targetCourse, setTargetCourse, onStart }: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiMaker, setShowAiMaker] = useState(false);
  const [locationInput, setLocationInput] = useState('');

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
          exh_name: location, // 백엔드에서 이 값을 검색어로 사용함
          who: who,
          lat: "37.5665",
          lng: "126.9780"
        }),
      });

      if (!response.ok) throw new Error(`서버 에러: ${response.status}`);
      const resData = await response.json();

      if (resData.status === "success") {
        const aiData = resData.data;

        // 🚨 중요: 상세페이지가 인식할 수 있는 데이터 구조로 변환
        const newAiCourse = {
          id: Date.now(), // 고유 ID
          title: `AI 추천: ${location} ${who} 코스`,
          desc: aiData.story.substring(0, 60) + "...", // GPT가 만든 스토리 요약
          aiPlan: aiData, // 전체 원본 데이터 저장
          steps: [
            // 백엔드에서 검색해준 실제 장소들로 타임라인 구성
            { 
              type: 'RESTAURANT', 
              name: aiData.places.restaurant?.name || "근처 맛집", 
              sub: aiData.places.restaurant?.address || "식사" 
            },
            { 
              type: 'EXHIBITION', 
              name: aiData.exhibition?.title || `${location} 전시`, 
              sub: aiData.exhibition?.place_name || "관람" 
            },
            { 
              type: 'CAFE', 
              name: aiData.places.cafe?.name || "근처 카페", 
              sub: aiData.places.cafe?.address || "디저트" 
            }
          ]
        };

        // 코스 시작 (부모 컴포넌트의 상태를 변경하여 화면 전환)
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

      {fixedCourses.map((course) => (
        <div key={course.id} className="course-card-main" style={{ marginBottom: '30px' }}>
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