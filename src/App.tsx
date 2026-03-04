import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
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
    Gift,
    Loader2,
    Calendar,
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
import ReservationPage from './ReservationPage'; // ⭐ 꼭 파일이 있는지 확인!
import Banner from './Banner'; // ⭐ 광고 배너 추가

// 스타일 임포트
import './ArtLog.css';
import './Login.css';
import './GuidePage.css';
import './Wishlist.css';

// API 주소
const LOCAL_API_URL = 'http://localhost:8000';   // local
const AI_API_URL = 'http://54.180.234.226:8000'; // vercel

// --- 컴포넌트: 취향 선택 ---
const PreferenceSelection = ({ onComplete }: { onComplete: (tags: string[]) => void }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const tags = [
        '화려한',
        '몽환적인',
        '생생한',
        '정갈한',
        '트렌디한',
        '톡톡튀는',
        '우아한',
        '은은한',
        '과감한',
        '능동적인',
        '웅장한',
        '깊이있는',
        '고전적인',
        '자유로운',
        '압도적인',
        '입체적인',
        '다채로운',
        '섬세한',
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
                <span className="skip-text" onClick={() => onComplete([])}>
                    건너뛰기
                </span>
            </div>
            <div className="onboarding-content">
                <h2 className="onboarding-title">
                    어떤 스타일에
                    <br />
                    관심이 있으신가요?
                </h2>
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

// --- 컴포넌트: 전시 카드 ---
const ExhibitCard = ({ title, location, tag, imgUrl, onLikeChange, onClick }: any) => {
    const [liked, setLiked] = useState(false);
    const displayTags = Array.isArray(tag) ? tag : [tag];

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newLikedStatus = !liked;
        setLiked(newLikedStatus);
        if (onLikeChange) onLikeChange(newLikedStatus);
    };

    return (
        <div className="exhibit-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div
                className="exhibit-image"
                style={{
                    backgroundColor: '#f5f5f5',
                    backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLikeClick}>
                    <Heart size={20} fill={liked ? '#FF3B30' : 'none'} stroke={liked ? '#FF3B30' : 'white'} />
                </button>
                <div className="tags" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {displayTags.map((t, i) => (
                        <span key={i} className="tag">
                            {t}
                        </span>
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

// --- 컴포넌트: 가로 스크롤 캐러셀 ---
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

// --- 메인 App 컴포넌트 ---
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

    // 예매 관련 상태 추가
    const [selectedExhibit, setSelectedExhibit] = useState<any>(null);

    const [serverExhibitions, setServerExhibitions] = useState<any[]>([]);
    const [recommendedExhibitions, setRecommendedExhibitions] = useState<any[]>([]);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            icon: <Sparkles size={18} color="#7C4DFF" />,
            title: '새로운 추천 전시',
            desc: '성수동 전시가 오픈했어요!',
            time: '방금 전',
            isRead: false,
        },
        {
            id: 2,
            icon: <CheckCircle2 size={18} color="#4CAF50" />,
            title: '도슨트 예약 완료',
            desc: '예약이 확정되었습니다.',
            time: '2시간 전',
            isRead: false,
        },
    ]);

    const handleLikeChange = (isLiked: boolean) => {
        setLikedCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setStep('login');
        setActiveTab('home');
    };

    // 1. 기존 전체 목록 로드
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axios.get(`${AI_API_URL}/api/events`);
                if (response.data && response.data.status === 'success') {
                    setServerExhibitions(response.data.data || []);
                }
            } catch (error) {
                console.error('❌ [전체보기] 에러:', error.message);
            }
        };
        if (step === 'main' && activeTab === 'home') fetchInitialData();
    }, [step, activeTab]);


// 2. AI 추천 로드
const handlePreferenceComplete = async (selectedTags: string[]) => {
    setIsLoading(true);
    try {
        // 1. 태그 가공 (axios 호출보다 반드시 위에 있어야 함)
        const cleanTags = selectedTags.map(tag => tag.replace('#', ''));

        // 2. 주소를 LOCAL_API_URL로 통일하고 POST 방식으로 호출
        // 만약 LOCAL_API_URL이 정의되지 않았다면 'http://localhost:8000'를 직접 넣으셔도 됩니다.
        const response = await axios.post(`${AI_API_URL}/api/ai/recommend`, { 
            tags: cleanTags 
        });

        console.log("🔥 서버에서 받은 진짜 결과:", response.data.data);

        if (response.data && response.data.status === "success") {
            const allResults = response.data.data; 

            // 3. 랜덤 섞기 없이 서버가 준 순서대로 상위 3개만 선택
            const finalThree = allResults.slice(0, 10);
            
            setRecommendedExhibitions(finalThree);
        }
    } catch (error) {
        console.error('추천 로딩 에러:', error);
    } finally {
        setTimeout(() => {
            setIsLoading(false);
            setStep('main');
        }, 800);
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
        setNotifications((prev) => prev.map((noti) => ({ ...noti, isRead: true })));
    };

    const hasUnread = notifications.some((n) => !n.isRead);
    // 전시목록, 코스네비게이션, 예매페이지는 전체화면(탭바 숨김) 처리
    const isFullScreenMode = activeTab === 'exhibits' || isNavigating || activeTab === 'reserve';

    return (
        <Router>
            {isLoading && (
                <div
                    className="loading-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        zIndex: 99999,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Loader2 size={50} className="animate-spin" strokeWidth={2.5} color="#333" />
                    <h2 style={{ marginTop: '24px', fontSize: '1.25rem', fontWeight: '700', color: '#111' }}>
                        AI가 당신의 취향을 분석 중입니다
                    </h2>
                </div>
            )}

{step === 'login' ? (
    <LoginPage
        onLoginSuccess={() => {
            setIsLoggedIn(true);
            setStep('preference');
        }}
    />
) : step === 'preference' ? (
    <PreferenceSelection onComplete={handlePreferenceComplete} />
) : (
    <div className="art-log-container">
        
                    {!isFullScreenMode && (
                        <header
                            className="main-header"
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#fff',
                                zIndex: 100,
                            }}
                        >
                            <h1
                                onClick={() => setActiveTab('home')}
                                style={{
                                    cursor: 'pointer',
                                    margin: 0,
                                    fontSize: '1.4rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                <i>Art-Log</i>
                            </h1>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={() => setIsNotifyOpen(true)}
                                >
                                    <Bell size={24} />
                                    {hasUnread && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: -2,
                                                right: -2,
                                                width: 8,
                                                height: 8,
                                                background: '#FF3B30',
                                                borderRadius: '50%',
                                                border: '2px solid #fff',
                                            }}
                                        />
                                    )}
                                </div>
                                <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('mypage')}>
                                    <User size={24} />
                                </div>
                            </div>
                        </header>
                    )}

                    <main className={isFullScreenMode ? 'full-screen-content' : 'main-content-scroll'}>
                        {activeTab === 'home' && (
                            <>
                                <p className="subtitle">
                                    감각적인 예술 탐험을
                                    <br />
                                    함께하는 개인 맞춤 큐레이션
                                </p>

                                <section className="ai-banner">
                                    <div className="ai-badge">✨ PERSONAL AI ASSISTANT</div>
                                    <h2 className="ai-title">" 오늘은 종로의 감성에 빠져볼까요? "</h2>
                                    <p className="ai-desc">취향에 딱 맞는 전시와 코스를 준비했어요.</p>
                                    <button className="cta-button" onClick={() => setActiveTab('exhibits')}>
                                        추천 전시 보기 <ChevronRight size={20} className="cta-icon" />
                                    </button>
                                </section>

                                <section className="section" style={{ padding: '20px 0' }}>
                                    <div className="section-header" style={{ padding: '0 20px', marginBottom: '16px' }}>
                                        <div className="title-group">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Sparkles size={18} color="#7C4DFF" fill="#7C4DFF" />
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                                                    AI가 분석한 오늘의 추천
                                                </h3>
                                            </div>
                                            <span className="sub-title" style={{ fontSize: '0.7rem', color: '#999' }}>
                                                FOR YOUR CURATED TASTE
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="horizontal-scroll"
                                        style={{
                                            display: 'flex',
                                            gap: '16px',
                                            padding: '0 20px',
                                            overflowX: 'auto',
                                            scrollbarWidth: 'none',
                                        }}
                                    >
                                        {recommendedExhibitions && recommendedExhibitions.length > 0 ? (
    recommendedExhibitions.map((item, idx) => (
        <div
            key={`ai-rec-${idx}`}
            className="pref-card"
            onClick={() => {
                setSelectedExhibit(item);
                setActiveTab('reserve');
            }}
            style={{ minWidth: '180px', width: '180px', cursor: 'pointer' }}
        >
                <div className="pref-image-wrapper" style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', backgroundColor: '#f0f0f0' }}>
                <img 
                    src={item.image_url || 'https://via.placeholder.com/180x240?text=No+Image'} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/180x240?text=No+Image'; }}
                />
            </div>
                                                    <div className="pref-info">
                <div style={{ fontSize: '0.75rem', color: '#7C4DFF', fontWeight: '600', marginBottom: '4px' }}>
                    {/* hashtag가 문자열로 오면 #을 붙여서 표시 */}
                    {item.hashtag ? `#${item.hashtag.split(',')[0]}` : '#추천전시'}
                </div>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 4px 0', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                    📍 {item.place_name || '장소 정보 없음'}
                </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'center',
                                                    padding: '40px 0',
                                                    background: '#f8f8f8',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    color: '#888',
                                                }}
                                            >
                                                취향 분석 결과에 맞는 전시를 불러오고 있어요..
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="section">
                                    <div className="section-header">
                                        <h3>지금 화제인 전시</h3>
                                        <button className="view-all" onClick={() => setActiveTab('exhibits')}>
                                            전체보기
                                        </button>
                                    </div>
                                    <ExhibitCarousel>
                                        {serverExhibitions.length > 0 ? (
                                            serverExhibitions.map((item, idx) => (
                                                <ExhibitCard
                                                    key={`serv-${idx}`}
                                                    tag={item.hashtag || '전시'}
                                                    title={item.title}
                                                    location={item.place_name}
                                                    imgUrl={item.image_url}
                                                    onLikeChange={handleLikeChange}
                                                    onClick={() => {
                                                        setSelectedExhibit(item);
                                                        setActiveTab('reserve');
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            <div className="empty-state" style={{ padding: '20px', color: '#999' }}>
                                                전시 데이터를 불러오는 중입니다...
                                            </div>
                                        )}
                                    </ExhibitCarousel>
                                </section>

                                {/* ⭐⭐⭐ 여기에 광고 배너를 배치 (화제의 전시와 도슨트 사이) ⭐⭐⭐ */}
                                <div style={{ margin: '-40px 0' }}>
                                    <Banner />
                                </div>

                                <section className="section">
                                    <div className="section-header">
                                        <div className="title-group">
                                            <h3>프리미엄 도슨트</h3>
                                            <span className="sub-title">EXPERT CURATION GUIDES</span>
                                        </div>
                                        <button className="view-all" onClick={() => navigateToGuide('human')}>
                                            전체보기
                                        </button>
                                    </div>
                                    <div className="docent-list">
                                        <div className="docent-card active-guide" onClick={() => navigateToGuide('ai')}>
                                            <div className="docent-profile ai-bot">🤖</div>
                                            <div className="docent-info">
                                                <div className="docent-name">
                                                    아티 (AI 가이드) <span className="ai-tag">AI</span>
                                                </div>
                                                <p className="docent-desc">추상화, 디지털 아트, 빠른 요약</p>
                                                <div className="docent-price">무료 (AI)</div>
                                            </div>
                                            <div className="docent-action">
                                                <div className="rating">
                                                    ⭐ 4.8 <span className="count">(1250)</span>
                                                </div>
                                                <button
                                                    className="action-btn black"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigateToGuide('ai');
                                                    }}
                                                >
                                                    해설 시작
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            className="docent-card active-guide"
                                            onClick={() => navigateToGuide('human')}
                                        >
                                            <div className="docent-profile">👩‍🎨</div>
                                            <div className="docent-info">
                                                <div className="docent-name">김사랑 도슨트</div>
                                                <p className="docent-desc">현대미술, 미술사학</p>
                                                <div className="docent-price">45,000원</div>
                                            </div>
                                            <div className="docent-action">
                                                <div className="rating">
                                                    ⭐ 4.9 <span className="count">(320)</span>
                                                </div>
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
                                        <button className="view-all" onClick={() => setActiveTab('course')}>
                                            전체보기
                                        </button>
                                    </div>
                                    <div className="course-list">
                                        <div
                                            className="course-card"
                                            onClick={() => {
                                                setTargetCourse('course-seongsu');
                                                setActiveTab('course');
                                            }}
                                        >
                                            <div className="course-content">
                                                <span className="course-tag">2025.06.28~2026.09.20</span>
                                                <h4>취향가옥 2: Art in Life, Life in Art 2</h4>
                                                <p>성수동의 감각적인 공간과 예술이 만나는 특별한 일상 코스</p>
                                            </div>
                                            <div className="course-icon">
                                                <Compass size={20} />
                                            </div>
                                        </div>
                                        <div
                                            className="course-card"
                                            onClick={() => {
                                                setTargetCourse('course-jongno');
                                                setActiveTab('course');
                                            }}
                                        >
                                            <div className="course-content">
                                                <span className="course-tag">2025.12.19~2026.06.07</span>
                                                <h4>구의, 영감의 조각을 줍는 산책</h4>
                                                <p>
                                                    그라운드시소 이스트에서 시작해 에스프레소바로 마무리하는 영감 코스
                                                </p>
                                            </div>
                                            <div className="course-icon">
                                                <Compass size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {/* 각 페이지 연결 */}
                        {activeTab === 'exhibits' && (
                            <Exhibition
                                onBack={() => setActiveTab('home')}
                                onLikeChange={handleLikeChange}
                                // ⭐ 아래 두 줄을 추가해 주세요!
                                onReserve={(item: any) => {
                                    setSelectedExhibit(item);
                                    setActiveTab('reserve');
                                }}
                            />
                        )}

                        {activeTab === 'reserve' && (
                            <ReservationPage exhibit={selectedExhibit} onBack={() => setActiveTab('exhibits')} />
                        )}

                        {activeTab === 'map' && <MapPage />}
                        {activeTab === 'guide' && <GuidePage initialTab={guideSubTab} />}
                        {activeTab === 'course' &&
                            (isNavigating ? (
                                <CourseNavigation
                                    courseData={selectedCourseData}
                                    onClose={() => setIsNavigating(false)}
                                />
                            ) : (
                                <RootPage
                                    targetCourse={targetCourse}
                                    setTargetCourse={setTargetCourse}
                                    onStart={(data: any) => {
                                        setSelectedCourseData(data);
                                        setIsNavigating(true);
                                    }}
                                />
                            ))}
                        {activeTab === 'gift' && <Giftshop />}
                        {activeTab === 'mypage' && (
                            <MyPage
                                isLoggedIn={isLoggedIn}
                                likedCount={likedCount}
                                setIsLoggedIn={setIsLoggedIn}
                                onTabChange={(tab: string) => setActiveTab(tab)}
                                onLogout={handleLogout}
                            />
                        )}
                    </main>

                    {!isFullScreenMode && (
                        <nav className="bottom-nav">
                            <div
                                className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                                onClick={() => setActiveTab('home')}
                            >
                                <Home size={24} />
                                <span>홈</span>
                            </div>
                            <div
                                className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
                                onClick={() => setActiveTab('map')}
                            >
                                <Map size={24} />
                                <span>지도</span>
                            </div>
                            <div
                                className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`}
                                onClick={() => navigateToGuide('human')}
                            >
                                <Mic size={24} />
                                <span>가이드</span>
                            </div>
                            <div
                                className={`nav-item ${activeTab === 'course' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('course');
                                    setIsNavigating(false);
                                }}
                            >
                                <Compass size={24} />
                                <span>코스</span>
                            </div>
                            <div
                                className={`nav-item ${activeTab === 'gift' ? 'active' : ''}`}
                                onClick={() => setActiveTab('gift')}
                            >
                                <Gift size={24} />
                                <span>기프트</span>
                            </div>
                        </nav>
                    )}

                    {isNotifyOpen && (
                        <div className="modal-overlay" onClick={() => setIsNotifyOpen(false)}>
                            <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>알림</h3>
                                    <button className="close-btn" onClick={() => setIsNotifyOpen(false)}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="notification-list">
                                    {notifications.map((noti) => (
                                        <div
                                            key={noti.id}
                                            className={`noti-item ${noti.isRead ? 'read' : 'unread'}`}
                                            onClick={() => markAsRead(noti.id)}
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
                                <button className="mark-all-btn" onClick={markAllAsRead}>
                                    전체 알림 읽음 처리
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Router>
    );
}
