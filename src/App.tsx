import React, { useState, useRef, useEffect } from 'react';
import './ArtLog.css';
import './Login.css';
import './GuidePage.css'; 
import './Wishlist.css'; 
import MyPage from './MyPage';
import RootPage from './Root';
import LoginPage from "./LoginPage";
import Giftshop from './GiftShop';
import MapPage from "./Map.tsx"; 
import GuidePage from "./GuidePage"; 


import { 
  Home, Map, Mic, Compass, Bell, User, Heart,
  X, Sparkles, CheckCircle2, ChevronRight, MapPin,
  Gift
} from 'lucide-react';

// --- [컴포넌트 1] 취향 선택 화면 ---
const PreferenceSelection = ({ onComplete }: { onComplete: () => void }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState(false);

const tags = [
  "#화려한", "#몽환적인", "#생생한", "#정갈한", 
  "#트렌디한", "#톡톡튀는", "#우아한", "#은은한", 
  "#과감한", "#능동적인", "#웅장한", "#깊이있는", 
  "#고전적인", "#자유로운", "#압도적인", "#입체적인", 
  "#다채로운", "#섬세한"
];

  useEffect(() => {
    setToast(true);
    const timer = setTimeout(() => {
      setToast(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTag = (tag: string) => {
    setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="onboarding-container" style={{ position: 'relative' }}>
      {toast && <div className="welcome-toast">환영합니다!</div>}
      <div className="onboarding-header">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: '40%' }}></div>
        </div>
        <span className="skip-text" onClick={onComplete}>건너뛰기</span>
      </div>
      <div className="onboarding-content">
        <h2 className="onboarding-title">어떤 스타일에<br />관심이 있으신가요?</h2>
        <div className="tag-grid">
          {tags.map(tag => (
            <button 
              key={tag} 
              className={`tag-item ${selected.includes(tag) ? 'active' : ''}`} 
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <button 
        className={`submit-btn ${selected.length > 0 ? 'active' : ''}`} 
        disabled={selected.length === 0} 
        onClick={onComplete}
      >
        {selected.length > 0 ? `${selected.length}개 선택 완료` : '선택해주세요'}
      </button>
    </div>
  );
};

// --- [컴포넌트 3] 화제 전시 카드 ---
const ExhibitCard = ({ title, location, tag, imgUrl }: any) => {
  const [liked, setLiked] = useState(false);
  return (
    <div className="exhibit-card">
      <div className="exhibit-image" style={{ backgroundImage: `url(${imgUrl || 'https://api.placeholder.com/280/380'})` }}>
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}>
          <Heart size={20} fill={liked ? "#FF3B30" : "none"} stroke={liked ? "#FF3B30" : "white"} />
        </button>
        <div className="tags"><span className="tag">{tag}</span></div>
      </div>
      <div className="exhibit-info">
        <h4>{title}</h4>
        <p className="location">📍 {location}</p>
      </div>
    </div>
  );
};

const ExhibitCarousel = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const handleScroll = () => { if (scrollRef.current) setShowLeftBtn(scrollRef.current.scrollLeft > 10); };
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };
  return (
    <div className="carousel-wrapper">
      {showLeftBtn && (
        <button className="nav-btn left" onClick={() => scroll('left')}>
          <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
      <div className="horizontal-scroll" ref={scrollRef} onScroll={handleScroll}>{children}</div>
      <button className="nav-btn right" onClick={() => scroll('right')}><ChevronRight size={24} /></button>
    </div>
  );
};

// --- [메인 App] ---
export default function App() {
  const [step, setStep] = useState('login'); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [targetCourse, setTargetCourse] = useState<string | null>(null);

  // 🚩 [추가] 가이드 페이지 진입 시 서브 탭 상태 (기본 'human')
  const [guideSubTab, setGuideSubTab] = useState<'human' | 'ai'>('human');

  const [notifications, setNotifications] = useState([
    { id: 1, icon: <Sparkles size={18} color="#7C4DFF" />, title: "새로운 추천 전시", desc: "성수동 전시가 오픈했어요!", time: "방금 전", isRead: false },
    { id: 2, icon: <CheckCircle2 size={18} color="#4CAF50" />, title: "도슨트 예약 완료", desc: "예약이 확정되었습니다.", time: "2시간 전", isRead: false }
  ]);

  // 🚩 [추가] 가이드 탭으로 이동하면서 서브 탭을 설정하는 함수
const navigateToGuide = (subType: 'human' | 'ai') => {
  setGuideSubTab(subType);
  setActiveTab('guide'); 
};

  const handleCourseClick = (courseId: string) => {
    setTargetCourse(courseId);
    setActiveTab('course');
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(noti => noti.id === id ? { ...noti, isRead: true } : noti));
  };
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(noti => ({ ...noti, isRead: true })));
  };
  const hasUnread = notifications.some(n => !n.isRead);

  if (step === 'login') return <LoginPage onLoginSuccess={() => { setIsLoggedIn(true); setStep('preference'); }} />;
  if (step === 'preference') return <PreferenceSelection onComplete={() => setStep('main')} />;

  return (
    <div className="art-log-container">
      {activeTab === 'home' ? (
        <>
          <header className="header">
            <h1 className="logo">ART-LOG</h1>
            <div className="header-icons">
              <div className="icon-item" onClick={() => setIsNotifyOpen(true)} style={{position: 'relative'}}>
                <Bell size={24} />
                {hasUnread && <span className="notification-dot"></span>}
              </div>
              <div className="icon-item" onClick={() => setActiveTab('mypage')}><User size={24} /></div>
            </div>
          </header>
            
          <div className="main-content-scroll">
            <p className="subtitle">감각적인 예술 탐험을<br/>함께하는 개인 맞춤 큐레이션</p>
            <section className="ai-banner">
              <div className="ai-badge">✨ PERSONAL AI ASSISTANT</div>
              <h2 className="ai-title">" 오늘은 종로의 감성에 빠져볼까요? "</h2>
              <p className="ai-desc">평소 좋아하시는 미니멀리즘 조각 전시를 바탕으로<br></br> 산책 코스를 준비했어요. user 님, 오늘 하루도 좋은 하루 되세요!</p>
              <button className="cta-button">추천 전시 보기 <ChevronRight size={20} className="cta-icon" /></button>
            </section>
              
            <section className="section">
              <div className="section-header">
                <h3>지금 화제인 전시</h3>
                <button className="view-all">전체보기</button>
              </div>
              <ExhibitCarousel>
                <ExhibitCard tag="추상화" title="현대 추상의 영혼" location="국립현대미술관" />
                <ExhibitCard tag="사진전" title="어제의 기록들" location="세종문화회관" />
                <ExhibitCard tag="설치미술" title="공간의 재해석" location="DDP" />
              </ExhibitCarousel>
            </section>

            {/* --- 🚩 프리미엄 도슨트 섹션 연결 --- */}
            <section className="section">
              <div className="section-header">
                <div className="title-group">
                  <h3>프리미엄 도슨트</h3>
                  <span className="sub-title">EXPERT CURATION GUIDES</span>
                </div>
                {/* 🚩 수정: navigateToGuide('human') 연결 */}
                <button className="view-all" onClick={() => navigateToGuide('human')}>
                  전체보기
                </button>
              </div>
              <div className="docent-list">
              {/* 🚩 아티 카드: 클릭 시 'ai' 탭으로 바로 이동 */}
              <div className="docent-card active-guide" onClick={() => navigateToGuide('ai')}>
                <div className="docent-profile ai-bot">🤖</div>
                <div className="docent-info">
                  <div className="docent-name">아티 (AI 가이드) <span className="ai-tag">AI</span></div>
                  <p className="docent-desc">추상화, 디지털 아트, 빠른 요약</p>
                  <div className="docent-price">무료 (AI)</div>
                </div>
                  <div className="docent-action">
                  <div className="rating">⭐ 4.8 <span className="count">(1250)</span></div>
                  {/* 🚩 수정: navigateToGuide('ai') 연결 */}
                  <button className="action-btn black" onClick={(e) => { e.stopPropagation(); navigateToGuide('ai'); }}>
                    해설 시작
                  </button>
                </div>
              </div>
                {/* 🚩 수정: navigateToGuide('human') 연결 */}
{/* 🚩 김사랑 도슨트 카드 부분 */}
<div className="docent-card active-guide" onClick={() => navigateToGuide('human')}>
  <div className="docent-profile">👩‍🎨</div>
  <div className="docent-info">
    <div className="docent-name">김사랑 도슨트</div>
    <p className="docent-desc">현대미술, 미술사학</p>
    <div className="docent-price">45,000원</div>
  </div>
  <div className="docent-action">
    <div className="rating">⭐ 4.9 <span className="count">(320)</span></div>
    {/* 버튼 색상도 아티처럼 강조하고 싶다면 'gray' 대신 'black'을 쓸 수 있습니다 */}
    <button className="action-btn gray">예약하기</button>
  </div>
</div>
              </div>
            </section>

            <section className="section">
              <div className="section-header">
                <div className="title-group">
                  <h3>추천 나들이 코스</h3>
                  <span className="sub-title">CURATED DAILY ROUTES</span>
                </div>
                <button className="view-all" onClick={() => setActiveTab('course')}>전체보기</button>
              </div>

              <div className="course-list">
                <div className="course-card" onClick={() => handleCourseClick('course-seongsu')}>
                  <div className="course-content">
                    <span className="course-tag">힙 & 트렌디</span>
                    <h4>성수동 힙한 갤러리 투어</h4>
                    <p>영감과 인생샷을 동시에 잡는 MZ세대 맞춤형 코스입니다.</p>
                  </div>
                  <div className="course-icon"><Compass size={20} /></div>
                </div>

                <div className="course-card" onClick={() => handleCourseClick('course-jongno')}>
                  <div className="course-content">
                    <span className="course-tag">차분함 & 클래식</span>
                    <h4>종로의 과거와 현재</h4>
                    <p>전통의 정취와 현대적 감각이 공존하는 깊이 있는 산책 코스입니다.</p>
                  </div>
                  <div className="course-icon"><Compass size={20} /></div>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : activeTab === 'map' ? (
        <MapPage />
      ) : activeTab === 'guide' ? (
        // 🚩 수정: GuidePage에 initialTab 전달
        <GuidePage initialTab={guideSubTab} />
      ) : activeTab === 'course' ? (
        <RootPage targetCourse={targetCourse} setTargetCourse={setTargetCourse} />
      ) : activeTab === 'gift' ? (
        <Giftshop />
      ) : activeTab === 'mypage' ? (
        <MyPage 
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          onLogout={() => {
            setStep('login');      
            setActiveTab('home');  
          }} 
        />  
      ) : (
        <div style={{padding: '100px 20px', textAlign: 'center'}}>준비 중인 페이지입니다.</div>
      )}

{/* --- 🚩 하단 내비게이션 (오타 완전 수정) --- */}
      <nav className="bottom-nav">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><Home size={24} /><span>홈</span></div>
        <div className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}><Map size={24} /><span>지도</span></div>
        <div className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => navigateToGuide('human')}><Mic size={24} /><span>가이드</span></div>
        <div className={`nav-item ${activeTab === 'course' ? 'active' : ''}`} onClick={() => setActiveTab('course')}><Compass size={24} /><span>코스</span></div>
<div 
  className={`nav-item ${activeTab === 'gift' ? 'active' : ''}`} 
  onClick={() => {
    // 이미 기프트 탭일 때 또 누르면 강제로 새로고침 효과 주기
    if (activeTab === 'gift') {
      setActiveTab(''); // 잠시 비웠다가
      setTimeout(() => setActiveTab('gift'), 10); // 다시 기프트로 설정
    } else {
      setActiveTab('gift');
    }
  }}
>
  <Gift size={24} />
  <span>기프트</span>
</div>
      </nav>

{/* --- 알림 모달 --- */}
      {isNotifyOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsNotifyOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center', // 가로 중앙
            alignItems: 'center',     // 세로 중앙
            zIndex: 9999,
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="notification-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '360px',
              margin: '0 auto',        // 다시 한번 중앙 확인
              boxSizing: 'border-box', // 패딩 때문에 삐져나가는 것 방지
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="modal-header">
              <h3>알림</h3>
              <button className="close-btn" onClick={() => setIsNotifyOpen(false)}><X size={20} /></button>
            </div>
            <div className="notification-list" style={{ width: '100%', boxSizing: 'border-box' }}>
              {notifications.map(noti => (
                <div 
                  key={noti.id} 
                  className={`noti-item ${noti.isRead ? 'read' : 'unread'}`} 
                  onClick={() => markAsRead(noti.id)}
                  style={{ width: '100%', boxSizing: 'border-box' }} // 아이템도 너비 고정
                >
                  <div className="noti-icon-bg">{noti.icon}</div>
                  <div className="noti-text">
                    <div className="noti-top">
                      <span className="noti-title">{noti.title}</span>
                      <span className="noti-time">{noti.time}</span>
                    </div>
                    <p className="noti-desc">{noti.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mark-all-btn" onClick={markAllAsRead}>전체 알림 읽음 처리</button>
          </div>
        </div>
      )}
    </div>
  );
}