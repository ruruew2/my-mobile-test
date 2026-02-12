import React, { useState, useRef } from 'react';
import './ArtLog.css';
import './Login.css';
import MyPage from './MyPage';
import { 
  Home, Map, Mic, Compass, Gift, Bell, User, Heart,
  X, Sparkles, CheckCircle2, ChevronRight, MapPin
} from 'lucide-react';

// --- [컴포넌트 0] 로그인 페이지 ---
const LoginPage = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo">ART-LOG</h1>
        <p className="slogan">당신의 모든 예술적 순간을 데이터로 기록하다</p>
        <div className="input-group">
          <input type="text" placeholder="아이디" className="login-input" />
          <input type="password" placeholder="비밀번호" className="login-input" />
          <button className="btn-main-login" onClick={onLoginSuccess}>로그인</button>
        </div>
        <div className="divider"><span>소셜 로그인</span></div>
        <div className="social-icon-wrapper">
          <a href="#google" className="social-icon-item"><img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="G" /></a>
          <a href="#kakao" className="social-icon-item kakao-bg"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" alt="K" /></a>
          <a href="#naver" className="social-icon-item naver-bg"><span className="naver-text">N</span></a>
        </div>
        <div className="login-footer">
          <span>회원가입</span><span className="footer-bar">|</span><span>비밀번호 찾기</span>
        </div>
      </div>
    </div>
  );
};

// --- [컴포넌트 1] 취향 선택 화면 --- // 추가
const PreferenceSelection = ({ onComplete }: { onComplete: () => void }) => {
  const [selected, setSelected] = useState<string[]>([]);
    const tags = [
    "#미디어아트", "#추상화", "#사진전", "#미니멀리즘", 
    "#현대미술", "#팝아트", "#서양화", "#동양화", 
    "#설치미술", "#인터랙티브", "#뮤지컬", "#연극", 
    "#클래식", "#재즈", "#몰입형전시", "#건축전", 
    "#아트페어", "#오브제", "#한국화"
  ];
  const toggleTag = (tag: string) => {
    setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: '40%' }}></div></div>
        <span className="skip-text" onClick={onComplete}>건너뛰기</span>
      </div>
      <div className="onboarding-content">
        <h2 className="onboarding-title">어떤 스타일에<br />관심이 있으신가요?</h2>
        <div className="tag-grid">
          {tags.map(tag => (
            <button key={tag} className={`tag-item ${selected.includes(tag) ? 'active' : ''}`} onClick={() => toggleTag(tag)}>{tag}</button>
          ))}
        </div>
      </div>
      <button className={`submit-btn ${selected.length > 0 ? 'active' : ''}`} disabled={selected.length === 0} onClick={onComplete}>
        {selected.length > 0 ? `${selected.length}개 선택 완료` : '선택해주세요'}
      </button>
    </div>
  );
};

// --- [컴포넌트 2] 지도 페이지 ---
const MapPage = () => {
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [startX, setStartX] = useState(0);

  const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];

  const onDragStart = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDrag(true);
    setStartX(e.pageX + scrollRef.current.scrollLeft);
  };
  const onDragEnd = () => setIsDrag(false);
  const onDragMove = (e: React.MouseEvent) => {
    if (!isDrag || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft = startX - e.pageX;
  };

  return (
    <div className="map-view-container">
      <div className="map-bg">
        <div className="top-filter-wrapper">
          <div 
            className="filter-chips" 
            ref={scrollRef}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            style={{ cursor: isDrag ? 'grabbing' : 'grab', userSelect: 'none' }}
          >
            {filters.map((filter) => (
              <span
                key={filter}
                className={`chip ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
                style={{ flexShrink: 0 }}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
        <div className="floating-pin pin1"><MapPin size={14} /> 현대 추상: 내면의 울림</div>
        <div className="floating-pin pin2"><MapPin size={14} /> 네온 드림: 디지털 아트</div>
        <div className="floating-pin pin3"><MapPin size={14} /> 공백의 조각</div>
      </div>
      <div className="map-bottom-sheet">
        <div className="sheet-handle"></div>
        <h3 className="sheet-title">내 주변 전시 <span className="count">3</span></h3>
        <div className="mini-list-container">
          <div className="mini-item">
            <div className="mini-thumb" style={{backgroundColor: '#eee'}}></div>
            <div className="mini-desc"><h4>현대 추상의 영혼</h4><p>📍 국립현대미술관</p></div>
          </div>
          <div className="mini-item">
            <div className="mini-thumb" style={{backgroundColor: '#ddd'}}></div>
            <div className="mini-desc"><h4>네온 드림: 디지털 아트</h4><p>📍 워커힐 빛의 시어터</p></div>
          </div>
        </div>
      </div>
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
  
  const [notifications, setNotifications] = useState([
    { id: 1, icon: <Sparkles size={18} color="#7C4DFF" />, title: "새로운 추천 전시", desc: "성수동 전시가 오픈했어요!", time: "방금 전", isRead: false },
    { id: 2, icon: <CheckCircle2 size={18} color="#4CAF50" />, title: "도슨트 예약 완료", desc: "예약이 확정되었습니다.", time: "2시간 전", isRead: false }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(noti => noti.id === id ? { ...noti, isRead: true } : noti));
  };
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(noti => ({ ...noti, isRead: true })));
  };
  const hasUnread = notifications.some(n => !n.isRead);

  if (step === 'login') return <LoginPage onLoginSuccess={() => setStep('preference')} />;
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
              <h2 className="ai-title">"오늘은 종로의 감성에 빠져볼까요?"</h2>
              <p className="ai-desc">평소 좋아하시는 미니멀리즘 조각 전시를 바탕으로 산책 코스를 준비했어요.</p>
              <button className="cta-button">추천 전시 보기 <ChevronRight size={20} className="cta-icon" /></button>
            </section>
              
            {/* 화제 전시 섹션 */}
            <section className="section">
              <div className="section-header">
                <h3>지금 화제인 전시</h3>
                <button className="view-all">VIEW ALL</button>
              </div>
              <ExhibitCarousel>
                <ExhibitCard tag="추상화" title="현대 추상의 영혼" location="국립현대미술관" />
                <ExhibitCard tag="사진전" title="어제의 기록들" location="세종문화회관" />
                <ExhibitCard tag="설치미술" title="공간의 재해석" location="DDP" />
              </ExhibitCarousel>
            </section>

            {/* 프리미엄 도슨트 섹션 */}
            <section className="section">
              <div className="section-header">
                <div className="title-group">
                  <h3>프리미엄 도슨트</h3>
                  <span className="sub-title">EXPERT CURATION GUIDES</span>
                </div>
                <button className="view-all">전체보기</button>
              </div>
              <div className="docent-list">
                <div className="docent-card active-guide">
                  <div className="docent-profile ai-bot">🤖</div>
                  <div className="docent-info">
                    <div className="docent-name">아티 (AI 가이드) <span className="ai-tag">AI</span></div>
                    <p className="docent-desc">추상화, 디지털 아트, 빠른 요약</p>
                    <div className="docent-price">무료 (AI)</div>
                  </div>
                  <div className="docent-action">
                    <div className="rating">⭐ 4.8 <span className="count">(1250)</span></div>
                    <button className="action-btn black">해설 시작</button>
                  </div>
                </div>
                <div className="docent-card">
                  <div className="docent-profile">👩‍🎨</div>
                  <div className="docent-info">
                    <div className="docent-name">김사랑 도슨트</div>
                    <p className="docent-desc">현대미술, 미술사학</p>
                    <div className="docent-price">45,000원</div>
                  </div>
                  <div className="docent-action">
                    <div className="rating">⭐ 4.9 <span className="count">(320)</span></div>
                    <button className="action-btn gray">예약하기</button>
                  </div>
                </div>
              </div>
            </section>

            {/* 추천 나들이 코스 섹션 */}
            <section className="section">
              <div className="section-header">
                <div className="title-group">
                  <h3>추천 나들이 코스</h3>
                  <span className="sub-title">CURATED DAILY ROUTES</span>
                </div>
                <button className="view-all">전체보기</button>
              </div>
              <div className="course-list">
                <div className="course-card">
                  <div className="course-content">
                    <span className="course-tag">힙 & 트렌디</span>
                    <h4>성수동 힙한 갤러리 투어</h4>
                    <p>영감과 인생샷을 동시에 잡는 MZ세대 맞춤형 코스입니다.</p>
                  </div>
                  <div className="course-icon"><Compass size={20} /></div>
                </div>
                <div className="course-card">
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
      ) : activeTab === 'mypage' ? (
<MyPage 
          onLogout={() => {
            setStep('login');      // 1. 로그인 페이지(step)로 이동
            setActiveTab('home');  // 2. 탭은 다시 '홈'으로 초기화 (다음에 로그인했을 때 첫 화면)
          }} 
        />  
      ) : (
        <div style={{padding: '100px 20px', textAlign: 'center'}}>준비 중인 페이지입니다.</div>
      )}

      {/* 하단 내비게이션 바 */}
      <nav className="bottom-nav">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={24} /><span>홈</span>
        </div>
        <div className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          <Map size={24} /><span>지도</span>
        </div>
        <div className="nav-item"><Mic size={24} /><span>가이드</span></div>
        <div className="nav-item"><Compass size={24} /><span>코스</span></div>
        <div className={`nav-item ${activeTab === 'mypage' ? 'active' : ''}`} onClick={() => setActiveTab('mypage')}>
          <User size={24} /><span>마이</span>
        </div>
      </nav>

      {/* 알림 모달 */}
      {isNotifyOpen && (
        <div className="modal-overlay" onClick={() => setIsNotifyOpen(false)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>알림</h3>
              <button className="close-btn" onClick={() => setIsNotifyOpen(false)}><X size={20} /></button>
            </div>
            <div className="notification-list">
              {notifications.map(noti => (
                <div key={noti.id} className={`noti-item ${noti.isRead ? 'read' : 'unread'}`} onClick={() => markAsRead(noti.id)}>
                  <div className="noti-icon-bg">{noti.icon}</div>
                  <div className="noti-text">
                    <div className="noti-top"><span className="noti-title">{noti.title}</span><span className="noti-time">{noti.time}</span></div>
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

