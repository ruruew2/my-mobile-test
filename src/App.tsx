import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import {
    Home, Map, Mic, Compass, Bell, User, Heart, X, Sparkles,
    CheckCircle2, ChevronRight, Gift, Loader2
} from 'lucide-react';

// 컴포넌트 임포트
import MyPage from './MyPage';
import Exhibition from './ExhibitList.tsx';
import RootPage from './Root';
import LoginPage from './LoginPage';
import Giftshop from './GiftShop';
import MapPage from './Map.tsx';
import GuidePage from './GuidePage';
import CourseNavigation from './CourseNavigation';

// 스타일 임포트
import './ArtLog.css';
import './Login.css';
import './GuidePage.css';
import './Wishlist.css';

const API_BASE_URL = '/api_proxy';

// --- [컴포넌트 1] 취향 선택 화면 ---
const PreferenceSelection = ({ onComplete }: { onComplete: (tags: string[]) => void }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const tags = [
        '#화려한', '#몽환적인', '#생생한', '#정갈한', '#트렌디한', '#톡톡튀는',
        '#우아한', '#은은한', '#과감한', '#능동적인', '#웅장한', '#깊이있는',
        '#고전적인', '#자유로운', '#압도적인', '#입체적인', '#다채로운', '#섬세한',
    ];

    const toggleTag = (tag: string) => {
        setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-header">
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: '40%' }}></div>
                </div>
                <span className="skip-text" onClick={() => onComplete([])}>건너뛰기</span>
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
                onClick={() => onComplete(selected)}
            >
                {selected.length > 0 ? `${selected.length}개 선택 완료` : '선택해주세요'}
            </button>
        </div>
    );
};

// --- [컴포넌트 2] 전시 카드 & 캐러셀 ---
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
    const [isLoading, setIsLoading] = useState(false);
    const [targetCourse, setTargetCourse] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedCourseData, setSelectedCourseData] = useState<any>(null);
    const [guideSubTab, setGuideSubTab] = useState<'human' | 'ai'>('human');

    const [serverExhibitions, setServerExhibitions] = useState<any[]>([]);
    const [recommendedExhibitions, setRecommendedExhibitions] = useState<any[]>([]);
    const [notifications, setNotifications] = useState([
        { id: 1, icon: <Sparkles size={18} color="#7C4DFF" />, title: '새로운 추천 전시', desc: '성수동 전시가 오픈했어요!', time: '방금 전', isRead: false },
        { id: 2, icon: <CheckCircle2 size={18} color="#4CAF50" />, title: '도슨트 예약 완료', desc: '예약이 확정되었습니다.', time: '2시간 전', isRead: false },
    ]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/events`);
                /* const response = await axios.get('http://localhost:8000/api/events');*/
                if (response.data.status === "success") {
                    setServerExhibitions(response.data.data);
                }
            } catch (error) {
                console.error("❌ 서버 연결 실패:", error);
            }
        };
        if (step === 'main') { fetchInitialData(); }
    }, [step]);

    const handlePreferenceComplete = async (selectedTags: string[]) => {
        setIsLoading(true);
        try {
            const cleanTags = selectedTags.map(tag => tag.replace('#', ''));
            const response = await axios.post(`${API_BASE_URL}/api/ai/recommend`, { tags: cleanTags });
            if (response.data.status === "success") {
                setRecommendedExhibitions(response.data.data);
            }
        } catch (error) {
            console.error("❌ AI 추천 요청 실패:", error);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
                setStep('main');
            }, 1500);
        }
    };

    const navigateToGuide = (subType: 'human' | 'ai') => {
        setGuideSubTab(subType);
        setActiveTab('guide');
    };

    // --- 알림 관련 함수 ---
    const markAsRead = (id: number) => {
        setNotifications((prev) => prev.map((noti) => (noti.id === id ? { ...noti, isRead: true } : noti)));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(noti => ({ ...noti, isRead: true })));
    };

    const hasUnread = notifications.some((n) => !n.isRead);

    return (
        <Router>
            {/* 로딩 오버레이 */}
            {isLoading && (
                <div className="loading-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)', zIndex: 99999,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                }}>
                    <Loader2 size={50} className="animate-spin" strokeWidth={2.5} color="#333" />
                    <h2 style={{ marginTop: '24px', fontSize: '1.25rem', fontWeight: '700', color: '#111' }}>
                        AI가 당신의 취향을 분석 중입니다
                    </h2>
                </div>
            )}

            {step === 'login' ? (
                <LoginPage onLoginSuccess={() => { setIsLoggedIn(true); setStep('preference'); }} />
            ) : step === 'preference' ? (
                <PreferenceSelection onComplete={handlePreferenceComplete} />
            ) : (
                <div className="art-log-container">
                    {activeTab === 'home' && (
                        <header className="header">
                            <h1 className="logo">ART-LOG</h1>
                            <div className="header-icons">
                                <div className="icon-item" onClick={() => setIsNotifyOpen(true)} style={{ position: 'relative' }}>
                                    <Bell size={24} />
                                    {hasUnread && <span className="notification-dot"></span>}
                                </div>
                                <div className="icon-item" onClick={() => setActiveTab('mypage')}>
                                    <User size={24} />
                                </div>
                            </div>
                        </header>
                    )}

                    <main className="main-content-scroll">
                        {activeTab === 'home' && (
                            <>
                                <p className="subtitle">감각적인 예술 탐험을<br />함께하는 개인 맞춤 큐레이션</p>
                                <section className="ai-banner">
                                    <div className="ai-badge">✨ PERSONAL AI ASSISTANT</div>
                                    <h2 className="ai-title">" 오늘은 종로의 감성에 빠져볼까요? "</h2>
                                    <p className="ai-desc">취향에 딱 맞는 전시와 코스를 준비했어요.<br />오늘 하루도 여유롭게 마음을 채워보세요!</p>
                                    <button className="cta-button" onClick={() => setActiveTab('exhibits')}>
                                        추천 전시 보기 <ChevronRight size={20} className="cta-icon" />
                                    </button>
                                </section>

                                {recommendedExhibitions.length > 0 && (
                                    <section className="section">
                                        <div className="section-header"><h3>당신을 위한 추천 전시</h3></div>
                                        <ExhibitCarousel>
                                            {recommendedExhibitions.map((item, idx) => (
                                                <ExhibitCard key={`rec-${idx}`} tag={item.hashtag || '추천'} title={item.title} location={item.place_name} imgUrl={item.image_url} />
                                            ))}
                                        </ExhibitCarousel>
                                    </section>
                                )}

                                <section className="section">
                                    <div className="section-header">
                                        <h3>지금 화제인 전시</h3>
                                        <button className="view-all" onClick={() => setActiveTab('exhibits')}>전체보기</button>
                                    </div>
                                    <ExhibitCarousel>
                                        {serverExhibitions.length > 0 ? (
                                            serverExhibitions.map((item, idx) => (
                                                <ExhibitCard key={`serv-${idx}`} tag={item.hashtag || '전시'} title={item.title} location={item.place_name} imgUrl={item.image_url} />
                                            ))
                                        ) : (
                                            [
                                                { tag: ['추상화'], title: '현대 추상의 영혼', location: '국립현대미술관' },
                                                { tag: ['사진전'], title: '어제의 기록들', location: '세종문화회관' }
                                            ].map((item, idx) => <ExhibitCard key={idx} tag={item.tag} title={item.title} location={item.location} />)
                                        )}
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
                                        <div className="course-card" onClick={() => setTargetCourse('course-seongsu')}>
                                            <div className="course-content">
                                                <span className="course-tag">2025.06.28~2026.09.20</span>
                                                <h4>취향가옥 2: Art in Life</h4>
                                                <p>예술이 일상이 되는 순간</p>
                                            </div>
                                            <div className="course-icon"><Compass size={20} /></div>
                                        </div>
                                        <div className="course-card" onClick={() => setTargetCourse('course-jongno')}>
                                            <div className="course-content">
                                                <span className="course-tag">2025.12.19~2026.6.7</span>
                                                <h4>구의, 영감의 조각 산책</h4>
                                                <p>그라운드시소에서 시작하는 감성 코스</p>
                                            </div>
                                            <div className="course-icon"><Compass size={20} /></div>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {activeTab === 'exhibits' && <Exhibition onBack={() => setActiveTab('home')} />}
                        {activeTab === 'map' && <MapPage />}
                        {activeTab === 'guide' && <GuidePage initialTab={guideSubTab} />}
                        {activeTab === 'course' && (
                            isNavigating ? (
                                <CourseNavigation courseData={selectedCourseData} onClose={() => setIsNavigating(false)} />
                            ) : (
                                <RootPage targetCourse={targetCourse} setTargetCourse={setTargetCourse} onStart={(data: any) => { setSelectedCourseData(data); setIsNavigating(true); }} />
                            )
                        )}
                        {activeTab === 'gift' && <Giftshop />}
                        {activeTab === 'mypage' && <MyPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} onTabChange={(tab: string) => setActiveTab(tab)} onLogout={() => { setStep('login'); setActiveTab('home'); }} />}
                    </main>

                    <nav className="bottom-nav">
                        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><Home size={24} /><span>홈</span></div>
                        <div className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}><Map size={24} /><span>지도</span></div>
                        <div className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => navigateToGuide('human')}><Mic size={24} /><span>가이드</span></div>
                        <div className={`nav-item ${activeTab === 'course' ? 'active' : ''}`} onClick={() => { setActiveTab('course'); setIsNavigating(false); }}><Compass size={24} /><span>코스</span></div>
                        <div className={`nav-item ${activeTab === 'gift' ? 'active' : ''}`} onClick={() => setActiveTab('gift')}><Gift size={24} /><span>기프트</span></div>
                    </nav>

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
            )}
        </Router>
    );
}