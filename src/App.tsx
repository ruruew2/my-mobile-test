import React, { useState, useRef, useEffect } from 'react';
import './ArtLog.css';
import './Login.css';
import './GuidePage.css';
import './Wishlist.css';
import MyPage from './MyPage';
import Exhibition from './ExhibitList.tsx';
import RootPage from './Root';
import LoginPage from './LoginPage';
import Giftshop from './GiftShop';
import MapPage from './Map.tsx';
import GuidePage from './GuidePage';
import CourseNavigation from './CourseNavigation';
import PaymentPage from './PaymentPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cart from './Cart';

import {
    Home,
    Map,
    Mic,
    Compass,
    Bell,
    User,
    Heart,
    X,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    MapPin,
    Gift,
} from 'lucide-react';

// --- [컴포넌트 1] 취향 선택 화면 ---
const PreferenceSelection = ({ onComplete }: { onComplete: () => void }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [selectedCourseData, setSelectedCourseData] = useState<any>(null);
    const [toast, setToast] = useState(false);

    const tags = [
        '#화려한', '#몽환적인', '#생생한', '#정갈한', '#트렌디한', '#톡톡튀는',
        '#우아한', '#은은한', '#과감한', '#능동적인', '#웅장한', '#깊이있는',
        '#고전적인', '#자유로운', '#압도적인', '#입체적인', '#다채로운', '#섬세한',
    ];

    useEffect(() => {
        setToast(true);
        const timer = setTimeout(() => {
            setToast(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const toggleTag = (tag: string) => {
        setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
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
                    {tags.map((tag) => (
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
    const displayTags = Array.isArray(tag) ? tag : [tag];

    return (
        <div className="exhibit-card">
            <div
                className="exhibit-image"
                style={{ backgroundImage: `url(${imgUrl || 'https://api.placeholder.com/280/380'})` }}
            >
                <button
                    className={`like-btn ${liked ? 'liked' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setLiked(!liked);
                    }}
                >
                    <Heart size={20} fill={liked ? '#FF3B30' : 'none'} stroke={liked ? '#FF3B30' : 'white'} />
                </button>
                <div className="tags" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {displayTags.map((t, i) => (
                        <span key={i} className="tag">{t}</span>
                    ))}
                </div>
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
    const handleScroll = () => {
        if (scrollRef.current) setShowLeftBtn(scrollRef.current.scrollLeft > 10);
    };
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
            <div className="horizontal-scroll" ref={scrollRef} onScroll={handleScroll}>
                {children}
            </div>
            <button className="nav-btn right" onClick={() => scroll('right')}>
                <ChevronRight size={24} />
            </button>
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
    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedCourseData, setSelectedCourseData] = useState<any>(null);
    const [guideSubTab, setGuideSubTab] = useState<'human' | 'ai'>('human');

    const [notifications, setNotifications] = useState([
        { id: 1, icon: <Sparkles size={18} color="#7C4DFF" />, title: '새로운 추천 전시', desc: '성수동 전시가 오픈했어요!', time: '방금 전', isRead: false },
        { id: 2, icon: <CheckCircle2 size={18} color="#4CAF50" />, title: '도슨트 예약 완료', desc: '예약이 확정되었습니다.', time: '2시간 전', isRead: false },
    ]);

    const navigateToGuide = (subType: 'human' | 'ai') => {
        setGuideSubTab(subType);
        setActiveTab('guide');
    };

    const handleCourseClick = (courseId: string) => {
        setTargetCourse(courseId);
        setActiveTab('course');
    };

    const markAsRead = (id: number) => {
        setNotifications((prev) => prev.map((noti) => (noti.id === id ? { ...noti, isRead: true } : noti)));
    };
    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((noti) => ({ ...noti, isRead: true })));
    };
    const hasUnread = notifications.some((n) => !n.isRead);

    // 🚩 [수정 포인트] 전체 리턴문을 Router로 감쌉니다.
    return (
        <Router>
            {step === 'login' ? (
                <LoginPage
                    onLoginSuccess={() => {
                        setIsLoggedIn(true);
                        setStep('preference');
                    }}
                />
            ) : step === 'preference' ? (
                <PreferenceSelection onComplete={() => setStep('main')} />
            ) : (
                <div className="art-log-container">
                    
                    {activeTab === 'home' ? (
                        <>
                            <header className="header">
                                <h1 className="logo">ART-LOG</h1>
                                <div className="header-icons">
                                    <div
                                        className="icon-item"
                                        onClick={() => setIsNotifyOpen(true)}
                                        style={{ position: 'relative' }}
                                    >
                                        <Bell size={24} />
                                        {hasUnread && <span className="notification-dot"></span>}
                                    </div>
                                    <div className="icon-item" onClick={() => setActiveTab('mypage')}>
                                        <User size={24} />
                                    </div>
                                </div>
                            </header>

                            <div className="main-content-scroll">
                                <p className="subtitle">감각적인 예술 탐험을<br />함께하는 개인 맞춤 큐레이션</p>
                                <section className="ai-banner">
                                    <div className="ai-badge">✨ PERSONAL AI ASSISTANT</div>
                                    <h2 className="ai-title">" 오늘은 종로의 감성에 빠져볼까요? "</h2>
                                    <p className="ai-desc">
                                        당신이 평소 좋아하시는 미니멀리즘 조각 전시를 바탕으로 산책 코스를 준비했어요!
                                        오늘 하루도 좋은 하루 되세요!
                                    </p>
                                    <button className="cta-button" onClick={() => setActiveTab('exhibits')}>
                                        추천 전시 보기 <ChevronRight size={20} className="cta-icon" />
                                    </button>
                                </section>

                                <section className="section">
                                    <div className="section-header">
                                        <h3>지금 화제인 전시</h3>
                                        <button className="view-all" onClick={() => setActiveTab('exhibits')}>전체보기</button>
                                    </div>
                                    <ExhibitCarousel>
                                        {[
                                            { tag: ['추상화', '국립현대미술관'], title: '현대 추상의 영혼', location: '국립현대미술관' },
                                            { tag: ['사진전', '세종문화회관'], title: '어제의 기록들', location: '세종문화회관' },
                                            { tag: '설치미술', title: '공간의 재해석', location: 'DDP' },
                                        ].map((item, idx) => (
                                            <ExhibitCard key={idx} tag={item.tag} title={item.title} location={item.location} />
                                        ))}
                                    </ExhibitCarousel>
                                </section>

                                <section className="section">
                                    <div className="section-header">
                                        <div className="title-group">
                                            <h3>프리미엄 도슨트</h3>
                                            <span className="sub-title">EXPERT CURATION GUIDES</span>
                                        </div>
                                        <button className="view-all" onClick={() => navigateToGuide('human')}>전체보기</button>
                                    </div>
                                    <div className="docent-list">
                                        <div className="docent-card active-guide" onClick={() => navigateToGuide('ai')}>
                                            <div className="docent-profile ai-bot">🤖</div>
                                            <div className="docent-info">
                                                <div className="docent-name">아티 (AI 가이드) <span className="ai-tag">AI</span></div>
                                                <p className="docent-desc">추상화, 디지털 아트, 빠른 요약</p>
                                                <div className="docent-price">무료 (AI)</div>
                                            </div>
                                            <div className="docent-action">
                                                <div className="rating">⭐ 4.8 <span className="count">(1250)</span></div>
                                                <button className="action-btn black" onClick={(e) => { e.stopPropagation(); navigateToGuide('ai'); }}>해설 시작</button>
                                            </div>
                                        </div>
                                        <div className="docent-card active-guide" onClick={() => navigateToGuide('human')}>
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
                                                <span className="course-tag">2025.06.28~2026.09.20</span>
                                                <h4>취향가옥 2: Art in Life, Life in Art 2</h4>
                                                <p>코스 설명 </p>
                                            </div>
                                            <div className="course-icon"><Compass size={20} /></div>
                                        </div>
                                        <div className="course-card" onClick={() => handleCourseClick('course-jongno')}>
                                            <div className="course-content">
                                                <span className="course-tag">2025.12.19~2026.6.7</span>
                                                <h4>구의, 영감의 조각을 줍는 산책</h4>
                                                <p>그라운드시소 이스트에서 시작해 브런치 & 에스프레소바에 들러 마무리 할 수 있는 코스입니다.</p>
                                            </div>
                                            <div className="course-icon"><Compass size={20} /></div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </>
                    ) : activeTab === 'exhibits' ? (
                        <Exhibition onBack={() => setActiveTab('home')} />
                    ) : activeTab === 'map' ? (
                        <MapPage />
                    ) : activeTab === 'guide' ? (
                        <GuidePage initialTab={guideSubTab} />
                    ) : activeTab === 'course' ? (
                        isNavigating ? (
                            <CourseNavigation courseData={selectedCourseData} onClose={() => setIsNavigating(false)} />
                        ) : (
                            <RootPage
                                targetCourse={targetCourse}
                                setTargetCourse={setTargetCourse}
                                onStart={(data: any) => {
                                    setSelectedCourseData(data);
                                    setIsNavigating(true);
                                }}
                            />
                        )
) : activeTab === 'gift' ? (
    <Giftshop />
) : activeTab === 'mypage' ? (
    <MyPage
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        // 💡 이 부분이 추가되었습니다! MyPage 안에서 탭을 바꿀 수 있게 해줍니다.
        onTabChange={(tab: string) => setActiveTab(tab)} 
        onLogout={() => {
            setStep('login');
            setActiveTab('home');
        }}
    />
) : (
                        <div style={{ padding: '100px 20px', textAlign: 'center' }}>준비 중인 페이지입니다.</div>
                    )}

                    <nav className="bottom-nav">
                        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                            <Home size={24} /><span>홈</span>
                        </div>
                        <div className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
                            <Map size={24} /><span>지도</span>
                        </div>
                        <div className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => navigateToGuide('human')}>
                            <Mic size={24} /><span>가이드</span>
                        </div>
                        <div
                            className={`nav-item ${activeTab === 'course' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('course');
                                setIsNavigating(false);
                            }}
                        >
                            <Compass size={24} /><span>코스</span>
                        </div>
                        <div
                            className={`nav-item ${activeTab === 'gift' ? 'active' : ''}`}
                            onClick={() => {
                                if (activeTab === 'gift') {
                                    setActiveTab('');
                                    setTimeout(() => setActiveTab('gift'), 10);
                                } else {
                                    setActiveTab('gift');
                                }
                            }}
                        >
                            <Gift size={24} /><span>기프트</span>
                        </div>
                    </nav>

                    {isNotifyOpen && (
                        <div
                            className="modal-overlay"
                            onClick={() => setIsNotifyOpen(false)}
                            style={{
                                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                zIndex: 9999, padding: '20px', boxSizing: 'border-box',
                            }}
                        >
                            <div
                                className="notification-modal"
                                onClick={(e) => e.stopPropagation()}
                                style={{ width: '100%', maxWidth: '360px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}
                            >
                                <div className="modal-header">
                                    <h3>알림</h3>
                                    <button className="close-btn" onClick={() => setIsNotifyOpen(false)}><X size={20} /></button>
                                </div>
                                <div className="notification-list" style={{ width: '100%', boxSizing: 'border-box' }}>
                                    {notifications.map((noti) => (
                                        <div
                                            key={noti.id}
                                            className={`noti-item ${noti.isRead ? 'read' : 'unread'}`}
                                            onClick={() => markAsRead(noti.id)}
                                            style={{ width: '100%', boxSizing: 'border-box' }}
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
            )}
        </Router>
    );
}