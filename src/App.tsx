import React, { useState, useRef, useEffect } from 'react';
import './ArtLog.css';
import './Login.css';
import { 
  Home, Map, Mic, Compass, Gift, Bell, User, Heart,
  X, Sparkles, CheckCircle2, ChevronRight 
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
          <a href="#google" className="social-icon-item" title="구글">
            <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" />
          </a>
          <a href="#apple" className="social-icon-item" title="애플">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
          </a>
          <a href="#kakao" className="social-icon-item kakao-bg" title="카카오">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" alt="Kakao" />
          </a>
                    <a href="#naver" className="social-icon-item naver-bg" title="네이버">
                        <span className="naver-text">N</span>
                    </a>
        </div>
        <div className="login-footer">
          <span>회원가입</span><span className="footer-bar">|</span><span>비밀번호 찾기</span>
        </div>
      </div>
    </div>
  );
};

// --- [컴포넌트 1] 취향 선택 화면 ---
const PreferenceSelection = ({ onComplete }: { onComplete: () => void }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const tags = ["#미디어아트", "#추상화", "#사진전", "#미니멀리즘", "#현대미술", "#팝아트", "#서양화", "#동양화", "#설치미술", "#인터랙티브"];
  const toggleTag = (tag: string) => {
    setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: '40%' }}></div>
        </div>
        <span className="skip-text" onClick={onComplete}>건너뛰기</span>
      </div>
      <div className="onboarding-content">
        <h2 className="onboarding-title">어떤 스타일에<br />관심이 있으신가요?</h2>
        <p className="onboarding-sub">관심사를 선택하시면 취향에 맞는 전시를 추천해드려요.</p>
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

// --- [추가된 컴포넌트: ExhibitCarousel] ---
// 🚩 여기에 슬라이드 기능을 담당하는 부품을 정의했습니다.
const ExhibitCarousel = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      // 10px 이상 오른쪽으로 갔을 때만 왼쪽 버튼 노출
      setShowLeftBtn(scrollRef.current.scrollLeft > 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="carousel-wrapper">
      {/* 왼쪽 버튼: 조건부 렌더링 */}
      {showLeftBtn && (
        <button className="nav-btn left" onClick={() => scroll('left')}>
          <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
      
      <div className="horizontal-scroll" ref={scrollRef} onScroll={handleScroll}>
        {children}
      </div>

      <button className="nav-btn right" onClick={() => scroll('right')}>
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

// --- [컴포넌트 2] 전시 카드 ---
const ExhibitCard = ({ title, location, tag }: any) => {
  const [isLiked, setIsLiked] = useState(false);
  return (
    <div className="exhibit-card">
      <div className="exhibit-image">
        <div className="tags"><span className="tag">{tag}</span></div>
        <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={() => setIsLiked(!isLiked)}>
          <Heart size={20} fill={isLiked ? "#FF3B30" : "none"} color={isLiked ? "#FF3B30" : "#fff"} />
        </button>
      </div>
      <div className="exhibit-info">
        <h4>{title}</h4>
        <p className="location">📍 {location}</p>
      </div>
    </div>
  );
};

// --- [컴포넌트 3] 기타 하위 요소들 ---
const NotificationItem = ({ icon, title, desc, time, isRead, onRead }: any) => (
  <div className={`noti-item ${isRead ? 'read' : 'unread'}`} onClick={onRead} style={{ cursor: 'pointer' }}>
    <div className="noti-icon-bg">{icon}</div>
    <div className="noti-text">
      <div className="noti-top"><span className="noti-title">{title}</span><span className="noti-time">{time}</span></div>
      <p className="noti-desc">{desc}</p>
    </div>
  </div>
);

const CourseCard = ({ tag, title, desc }: any) => (
  <div className="course-card">
    <div className="course-content"><span className="course-tag">{tag}</span><h4>{title}</h4><p>{desc}</p></div>
    <div className="course-icon"><ChevronRight size={24} color="#ccc" strokeWidth={1.5} /></div>
  </div>
);

// --- [메인] App 컴포넌트 ---
const App: React.FC = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [showPreference, setShowPreference] = useState(false); 
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, icon: <Sparkles size={18} color="#7C4DFF" />, title: "새로운 추천 전시", desc: "성수동 전시가 오픈했어요!", time: "방금 전", isRead: false },
    { id: 2, icon: <CheckCircle2 size={18} color="#4CAF50" />, title: "도슨트 예약 완료", desc: "예약이 확정되었습니다.", time: "2시간 전", isRead: false },
    { id: 3, icon: <Gift size={18} color="#E91E63" />, title: "쿠폰 도착", desc: "10% 할인 쿠폰이 도착했습니다.", time: "어제", isRead: true }
  ]);

  const hasUnread = notifications.some(n => !n.isRead);
  const handleLoginSuccess = () => { setIsLoginPage(false); setShowPreference(true); };
  const markAllAsRead = () => { setNotifications(notifications.map(n => ({ ...n, isRead: true }))); };
  const markAsRead = (id: number) => { setNotifications(prev => prev.map(noti => noti.id === id ? { ...noti, isRead: true } : noti)); };

  return (
    <div className="App">
      {isLoginPage ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} /> 
      ) : showPreference ? (
        <PreferenceSelection onComplete={() => setShowPreference(false)} />
      ) : (
        <div className="art-log-container">
<header className="header">
  <h1 className="logo">ART-LOG</h1>
  <div className="header-icons">
    <div className="icon-item" onClick={() => setIsNotifyOpen(true)}>
      <Bell size={24} strokeWidth={2} />
      {hasUnread && <span className="notification-dot"></span>}
    </div>
    <div className="icon-item">
      <User size={24} strokeWidth={2} />
    </div>
  </div>
</header>


          <br></br>
          <p className="subtitle">감각적인 예술 탐험을<br></br>함께하는 개인 맞춤 큐레이션</p>

          <section className="ai-banner">
            <div className="ai-badge">✨ PERSONAL AI ASSISTANT</div>
            <h2 className="ai-title">"오늘은 종로의 감성에 빠져볼까요?"</h2>
            <p className="ai-desc">평소 좋아하시는 미니멀리즘 조각 전시를 바탕으로...</p>
            <button className="cta-button">추천 전시 보기 <ChevronRight size={18} /></button>
            <div className="update-time">🕒 JUST UPDATED</div>
          </section>

          <section className="section">
            <div className="section-header">
              <h3>지금 화제인 전시</h3>
              <button className="view-all">VIEW ALL</button>
            </div>
            
            {/* 🚩 적용된 부분: ExhibitCarousel로 감싸서 슬라이드 기능 부여 */}
            <ExhibitCarousel>
              <ExhibitCard tag="추상화" title="현대 추상의 영혼" location="국립현대미술관" />
              <ExhibitCard tag="사진전" title="어제의 기록들" location="세종문화회관" />
              <ExhibitCard tag="미디어" title="빛의 시어터" location="워커힐" />
              <ExhibitCard tag="현대미술" title="보이지 않는 연결" location="리움미술관" />
            </ExhibitCarousel>
          </section>

          <section className="section last-section">
            <div className="section-header"><h3>추천 나들이 코스</h3></div>
            <CourseCard tag="힙 & 트렌디" title="성수동 힙한 갤러리 투어" desc="영감과 인생샷을 동시에 잡는 코스입니다." />
            <CourseCard tag="차분한 감성" title="비 오는 날 갤러리 투어" desc="차분하게 하루를 보낼 수 있는 코스입니다." />
          </section>

          <nav className="bottom-nav">
            <div className="nav-item active"><Home size={24} /><span>홈</span></div>
            <div className="nav-item"><Map size={24} /><span>지도</span></div>
            <div className="nav-item"><Mic size={24} /><span>가이드</span></div>
            <div className="nav-item"><Compass size={24} /><span>코스</span></div>
            <div className="nav-item"><Gift size={24} /><span>기프트</span></div>
          </nav>
        </div>
      )}

      {isNotifyOpen && (
        <div className="modal-overlay" onClick={() => setIsNotifyOpen(false)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>알림</h3><button className="close-btn" onClick={() => setIsNotifyOpen(false)}><X size={20} /></button></div>
            <div className="notification-list">
              {notifications.map(noti => (
                <NotificationItem key={noti.id} {...noti} onRead={() => markAsRead(noti.id)} />
              ))}
            </div>
            <button className="mark-all-btn" onClick={markAllAsRead}>전체 알림 읽음 처리</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;