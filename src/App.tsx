import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import {
    Home, Map, Mic, Compass, Bell, User, Heart, X, Sparkles,
    CheckCircle2, ChevronRight, Gift, Loader2
} from 'lucide-react';

// 컴포넌트 임포트
import MyPage from './MyPage';
import Exhibition from './ExhibitList';
import RootPage from './Root';
import LoginPage from './LoginPage';
import Giftshop from './GiftShop';
import MapPage from './Map';
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

// --- [컴포넌트 2] 전시 카드 ---
const ExhibitCard = ({ title, location, tag, imgUrl, onLikeChange }: any) => {
    const [liked, setLiked] = useState(false);
    const displayTags = Array.isArray(tag) ? tag : [tag];

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newLikedStatus = !liked;
        setLiked(newLikedStatus);
        if (onLikeChange) onLikeChange(newLikedStatus);
    };

    return (
        <div className="exhibit-card">
            <div
                className="exhibit-image"
                style={{ 
                    backgroundColor: '#f5f5f5',
                    backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLikeClick}>
                    <Heart size={20} fill={liked ? '#FF3B30' : 'none'} stroke={liked ? '#FF3B30' : 'white'} />
                </button>
                <div className="tags" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {displayTags.map((t, i) => <span key={i} className="tag">{t}</span>)}
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
    const [isLoading, setIsLoading] = useState(false);
    const [targetCourse, setTargetCourse] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedCourseData, setSelectedCourseData] = useState<any>(null);
    const [guideSubTab, setGuideSubTab] = useState<'human' | 'ai'>('human');
    const [likedCount, setLikedCount] = useState(0);

    const [serverExhibitions, setServerExhibitions] = useState<any[]>([]);
    const [recommendedExhibitions, setRecommendedExhibitions] = useState<any[]>([]);
    const [notifications, setNotifications] = useState([
        { id: 1, icon: <Sparkles size={18} color="#7C4DFF" />, title: '새로운 추천 전시', desc: '성수동 전시가 오픈했어요!', time: '방금 전', isRead: false },
        { id: 2, icon: <CheckCircle2 size={18} color="#4CAF50" />, title: '도슨트 예약 완료', desc: '예약이 확정되었습니다.', time: '2시간 전', isRead: false },
    ]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/events'); 
                if (response.data.status === "success") setServerExhibitions(response.data.data);
            } catch (error) { console.error("❌ 서버 연결 실패:", error); }
        };
        if (step === 'main') fetchInitialData();
    }, [step]);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setStep('login');
        localStorage.removeItem('user_token');
    };

    const handleLikeChange = (isLiked: boolean) => {
        setLikedCount(prev => isLiked ? prev + 1 : (prev > 0 ? prev - 1 : 0));
    };

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

    const markAsRead = (id: number) => {
        setNotifications((prev) => prev.map((noti) => (noti.id === id ? { ...noti, isRead: true } : noti)));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(noti => ({ ...noti, isRead: true })));
    };

    const hasUnread = notifications.some((n) => !n.isRead);

    // 🌟 레이아웃 조건 (헤더/네비 숨김 여부)
    const isFullScreenMode = activeTab === 'exhibits' || isNavigating;

    return (
        <Router>
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
                    {/* 🌟 상단 헤더 (전시 둘러보기 중엔 숨김) */}
                    {!isFullScreenMode && (
                        <header className="main-header" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                            <h1 onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', margin: 0, fontSize: '1.4rem' }}>ArtLog</h1>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsNotifyOpen(true)}>
                                    <Bell size={24} />
                                    {hasUnread && <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#FF3B30', borderRadius: '50%', border: '2px solid #fff' }} />}
                                </div>
                                <div 
                                    style={{ cursor: 'pointer', color: activeTab === 'mypage' ? '#000' : '#666' }} 
                                    onClick={() => setActiveTab('mypage')}
                                >
                                    <User size={24} />
                                </div>
                            </div>
                        </header>
                    )}

                    <main className={isFullScreenMode ? "full-screen-content" : "main-content-scroll"}>
                        {activeTab === 'home' && (
                            <>
                                <p className="subtitle">감각적인 예술 탐험을<br />함께하는 개인 맞춤 큐레이션</p>
                                <section className="ai-banner">
                                    <div className="ai-badge">✨ PERSONAL AI ASSISTANT</div>
                                    <h2 className="ai-title">" 오늘은 종로의 감성에 빠져볼까요? "</h2>
                                    <p className="ai-desc">취향에 딱 맞는 전시와 코스를 준비했어요.</p>
                                    <button className="cta-button" onClick={() => setActiveTab('exhibits')}>
                                        추천 전시 보기 <ChevronRight size={20} className="cta-icon" />
                                    </button>
                                </section>

                                {recommendedExhibitions.length > 0 && (
                                    <section className="section">
                                        <div className="section-header"><h3>당신을 위한 추천 전시</h3></div>
                                        <ExhibitCarousel>
                                            {recommendedExhibitions.map((item, idx) => (
                                                <ExhibitCard key={`rec-${idx}`} tag={item.hashtag || '추천'} title={item.title} location={item.place_name} imgUrl={item.image_url} onLikeChange={handleLikeChange} />
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
                                                <ExhibitCard key={`serv-${idx}`} tag={item.hashtag || '전시'} title={item.title} location={item.place_name} imgUrl={item.image_url} onLikeChange={handleLikeChange} />
                                            ))
                                        ) : (
                                            <div style={{ padding: '20px', color: '#999' }}>전시 데이터를 불러오는 중입니다...</div>
                                        )}
                                    </ExhibitCarousel>
                                </section>

                                {/* 도슨트/코스 섹션 생략 (기존 구조 유지) */}
                            </>
                        )}

                        {activeTab === 'exhibits' && <Exhibition onBack={() => setActiveTab('home')} onLikeChange={handleLikeChange} />}
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
                        {activeTab === 'mypage' && (
                            <MyPage isLoggedIn={isLoggedIn} likedCount={likedCount} setIsLoggedIn={setIsLoggedIn} onTabChange={(tab: string) => setActiveTab(tab)} onLogout={handleLogout} />
                        )}
                    </main>

                    {/* 🌟 하단 네비 (전시 둘러보기 중엔 숨김) */}
                    {!isFullScreenMode && (
                        <nav className="bottom-nav">
                            <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><Home size={24} /><span>홈</span></div>
                            <div className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}><Map size={24} /><span>지도</span></div>
                            <div className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => navigateToGuide('human')}><Mic size={24} /><span>가이드</span></div>
                            <div className={`nav-item ${activeTab === 'course' ? 'active' : ''}`} onClick={() => { setActiveTab('course'); setIsNavigating(false); }}><Compass size={24} /><span>코스</span></div>
                            <div className={`nav-item ${activeTab === 'gift' ? 'active' : ''}`} onClick={() => setActiveTab('gift')}><Gift size={24} /><span>기프트</span></div>
                        </nav>
                    )}

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
            )}
        </Router>
    );
}