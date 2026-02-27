import React, { useState, useEffect } from 'react';
import {
    Star,
    X,
    ChevronLeft,
    Volume2,
    Play,
    Pause,
    Calendar,
    Users,
    CheckCircle,
    Image as ImageIcon,
    Clock,
    Upload,
} from 'lucide-react';
import './GuidePage.css';

const VerifiedBadge = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '4px' }}>
        <path d="M10.5213 2.62368C11.3147 1.75217 12.6853 1.75217 13.4787 2.62368L14.4827 3.72658C14.8035 4.07886 15.2555 4.26596 15.7281 4.24227L17.2069 4.16813C18.3741 4.10961 19.3555 5.03928 19.349 6.20735L19.3407 7.68798C19.338 8.16128 19.5541 8.60432 19.9363 8.88241L21.1325 9.75271C22.0772 10.4399 22.2198 11.7663 21.4354 12.6369L20.4404 13.7411C20.1226 14.0936 20.0152 14.5714 20.1444 15.013L20.5488 16.3949C20.8681 17.4857 20.1481 18.6111 19.0191 18.7844L17.588 19.0041C17.1305 19.0743 16.7328 19.3475 16.4913 19.7441L15.7358 20.9849C15.1394 21.9644 13.824 22.2965 12.8258 21.72L11.5606 20.9897C11.1561 20.7563 10.6661 20.7563 10.2616 20.9897L8.99645 21.72C7.99818 22.2965 6.6828 21.9644 6.08638 20.9849L5.33091 19.7441C5.08945 19.3475 4.6917 19.0743 4.2342 19.0041L2.8031 18.7844C1.67406 18.6111 0.954056 17.4857 1.27338 16.3949L1.67781 15.013C1.80698 14.5714 1.69963 14.0936 1.38178 13.7411L0.386801 12.6369C-0.397633 11.7663 -0.254992 10.4399 0.689679 9.75271L1.88588 8.88241C2.26811 8.60432 2.48417 8.16128 2.48152 7.68798L2.47321 6.20735C2.46671 5.03928 3.44812 4.10961 4.61529 4.16813L6.09409 4.24227C6.56667 4.26596 7.01869 4.07886 7.3395 3.72658L8.3435 2.62368C9.13689 1.75217 10.5101 1.75217 11.3035 2.62368H10.5213Z" fill="#3897f0" />
        <path d="M8 12L11 15L16 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const GuidePage = ({ initialTab }: any) => {
    const [activeTab, setActiveTab] = useState<'human' | 'ai'>(initialTab || 'human');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingStep, setBookingStep] = useState(1);
    const [personCount, setPersonCount] = useState(1);

    const [selectedTime, setSelectedTime] = useState<string>('14:00');
    const [selectedDate, setSelectedDate] = useState<string>('2026-05-20');

    const [scannedArt, setScannedArt] = useState({
        title: '',
        artist: '',
        year: '',
        description: '',
        audioPath: '',
        imagePreview: ''
    });

    const sendToAIApi = async (fileOrBlob: Blob | File, previewUrl: string) => {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('file', fileOrBlob, 'image.jpg'); 
        formData.append('lang', 'ko');

        try {
            const response = await fetch('http://54.180.234.226:8000/api/ai/docent', { 
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error(`서버 응답 에러: ${response.status}`);
            const result = await response.json();

            if (result.status === "success" && result.data) {
                const [audioUrl, script] = result.data;
                setScannedArt({
                    title: '분석된 작품',
                    artist: 'AI 도슨트',
                    year: '2024',
                    description: script,
                    audioPath: `http://54.180.234.226:8000/${audioUrl}`,
                    imagePreview: previewUrl
                });
                setIsAnalyzing(false);
                setShowResult(true);
            } else {
                throw new Error(result.message || "분석 실패");
            }
        } catch (error) {
            console.error('분석 실패 상세:', error);
            setIsAnalyzing(false);
            alert('분석에 실패했습니다.');
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        sendToAIApi(file, previewUrl);
        event.target.value = '';
    };

    const handleAudioGuide = async () => {
        if (showPlayer) {
            audioElement?.pause();
            setShowPlayer(false);
            return;
        }
        if (!scannedArt.audioPath) {
            alert("재생할 오디오 파일이 없습니다.");
            return;
        }
        const audio = new Audio(scannedArt.audioPath);
        audio.play();
        setAudioElement(audio);
        setShowPlayer(true);
        setIsPlaying(true);
        audio.onended = () => {
            setShowPlayer(false);
            setIsPlaying(false);
        };
    };

    useEffect(() => {
        if (!audioElement) return;
        if (isPlaying) audioElement.play();
        else audioElement.pause();
    }, [isPlaying, audioElement]);

    const handleBooking = () => {
        setBookingStep(2);
        setTimeout(() => {
            setIsBookingOpen(false);
            setBookingStep(1);
        }, 2000);
    };

    return (
        <div className="art-guide-container" style={{ 
            height: 'calc(100vh - 75px)', 
            overflowY: showResult ? 'hidden' : 'auto', // 결과창일 때는 부모 스크롤 잠금
            position: 'relative' 
        }}>
            
            {/* --- 1. 로딩 오버레이 (Fixed로 완전히 독립) --- */}
            {isAnalyzing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    zIndex: 10000, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <div className="ai-loading-container" style={{ textAlign: 'center' }}>
                        <div className="ai-avatar-pulse" style={{ position: 'relative', display: 'inline-block' }}>
                            <span style={{ fontSize: '60px' }}>🤖</span>
                        </div>
                        <h3 style={{ marginTop: '24px', fontSize: '1.2rem', fontWeight: '700', color: '#222' }}>
                            아티가 작품을 분석 중입니다...
                        </h3>
                        <div className="progress-track" style={{ width: '200px', height: '6px', backgroundColor: '#f0f0f0', borderRadius: '10px', marginTop: '30px', overflow: 'hidden', position: 'relative', margin: '30px auto 0' }}>
                            <div className="progress-fill" style={{ position: 'absolute', height: '100%', backgroundColor: '#7148fc', borderRadius: '10px' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. 메인 리스트 화면 --- */}
            {!showResult ? (
                <>
                    <header className="art-header">
                        <h1 className="art-title">전문 도슨트 서비스</h1>
                        <p className="art-desc">전문 큐레이터부터 AI 가이드까지.</p>
                    </header>
                    <nav className="art-tab-nav">
                        <button className={`art-tab-item ${activeTab === 'human' ? 'is-active' : ''}`} onClick={() => setActiveTab('human')}>
                            인간 도슨트
                        </button>
                        <button className={`art-tab-item ${activeTab === 'ai' ? 'is-active' : ''}`} onClick={() => setActiveTab('ai')}>
                            AI 가이드
                        </button>
                    </nav>
                    <div className="art-list">
                        {(activeTab === 'human'
                            ? [
                                { id: 1, name: '김사랑 도슨트', subtitle: '현대미술, 미술사학', price: '45,000원', rating: 4.9, emoji: '👩‍🎨', isVerified: true, tags: ['전문가', '주말가능'] },
                                { id: 2, name: '최아트 도슨트', subtitle: '조각미술, 설치미술', price: '38,000원', rating: 4.7, emoji: '👨‍🎨', isVerified: false, tags: ['인기', '평일가능'] },
                            ]
                            : [
                                { id: 1, name: '아티 (AI 가이드)', subtitle: '실시간 작품 분석 및 해설', price: '무료 (AI)', rating: 4.8, emoji: '🤖', isVerified: false, tags: ['실시간', '무료'] },
                            ]
                        ).map((guide) => (
                            <div key={guide.id} className={`art-card ${activeTab === 'ai' ? 'ai-special' : ''}`}>
                                <div className="art-avatar">{guide.emoji}</div>
                                <div className="art-info">
                                    <div className="art-name-row" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span className="art-name">{guide.name}</span>
                                        {guide.isVerified && <VerifiedBadge />}
                                        <span className="art-rating" style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '6px' }}>
                                            <Star size={12} fill="#ffcc00" color="#ffcc00" />
                                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffcc00' }}>{guide.rating}</span>
                                        </span>
                                    </div>
                                    <p className="art-subtitle" style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{guide.subtitle}</p>
                                    <div className="art-tags">
                                        {guide.tags.map((tag) => <span key={tag} className="art-tag">{tag}</span>)}
                                    </div>
                                    <p className="art-price">{guide.price}</p>
                                </div>
                                {activeTab === 'ai' ? (
                                    <label className="art-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                        <Upload size={16} /> 사진 업로드
                                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                    </label>
                                ) : (
                                    <button className="art-btn" onClick={() => setIsBookingOpen(true)}>
                                        예약하기
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                /* --- 3. 분석 결과 화면 (전체 화면을 덮는 독립 레이어) --- */
                <div className="art-result-page-wrapper" style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column', backgroundColor: '#fff', zIndex: 50
                }}>
                    <header className="result-header" style={{ flexShrink: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                        <button className="back-btn-inner" onClick={() => setShowResult(false)} style={{ background: 'none', border: 'none', padding: 0 }}>
                            <ChevronLeft size={24} />
                        </button>
                        <span className="header-tag" style={{ fontWeight: 'bold', color: '#7148fc' }}>🤖 AI 도슨트 리포트</span>
                        <div style={{ width: 24 }}></div>
                    </header>

                    <div className="result-body-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '180px', WebkitOverflowScrolling: 'touch' }}>
                        <div className="result-info-group">
                            <h1 className="result-title" style={{ fontSize: '22px', marginBottom: '4px', fontWeight: '800' }}>{scannedArt.title}</h1>
                            <p className="result-artist" style={{ color: '#666', marginBottom: '20px' }}>{scannedArt.artist}, {scannedArt.year}</p>
                        </div>

                        <div className="result-image-card" style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            {scannedArt.imagePreview ? (
                                <img src={scannedArt.imagePreview} alt="Scanned Art" style={{ width: '100%', display: 'block' }} />
                            ) : (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                                    <ImageIcon size={40} color="#ddd" />
                                </div>
                            )}
                        </div>

                        <div className="ai-speech-bubble" style={{ backgroundColor: '#f8f7ff', padding: '20px', borderRadius: '16px', borderTopLeftRadius: '4px', lineHeight: '1.6' }}>
                            <div className="ai-label" style={{ fontWeight: 'bold', color: '#7148fc', marginBottom: '8px', fontSize: '14px' }}>🤖 아티의 한마디</div>
                            <p style={{ margin: 0, wordBreak: 'keep-all', fontSize: '15px' }}>{scannedArt.description}</p>
                        </div>
                    </div>

                    {/* 하단 고정 조작 영역 */}
                    <div className="result-fixed-bottom" style={{ position: 'fixed', bottom: '85px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100 }}>
                        {showPlayer && (
                            <div className="audio-inline-player" style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="music-icon-ani">🎵</div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>작품 해설 재생 중</div>
                                        <div style={{ color: '#aaa', fontSize: '11px' }}>AI 아티</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                                        {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                                    </button>
                                    <button onClick={() => { audioElement?.pause(); setShowPlayer(false); }} style={{ background: 'none', border: 'none', opacity: 0.5 }}>
                                        <X size={18} color="white" />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <label className="footer-btn secondary" style={{ cursor: 'pointer', flex: 1, backgroundColor: '#eee', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontWeight: '600' }}>
                                다시 선택
                                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                            <button className="footer-btn primary" onClick={handleAudioGuide} style={{ flex: 1.8, backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}>
                                <Volume2 size={18} /> {showPlayer ? '가이드 중단' : '오디오 가이드'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 4. 예약 모달 --- */}
            {isBookingOpen && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal">
                        {bookingStep === 1 ? (
                            <>
                                <div className="modal-header">
                                    <h3>도슨트 예약하기</h3>
                                    <button onClick={() => setIsBookingOpen(false)}><X size={20} /></button>
                                </div>
                                <div className="modal-content">
                                    <div className="guide-summary">
                                        <span className="summary-emoji">👩‍🎨</span>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <p className="summary-name">김사랑 도슨트</p>
                                                <VerifiedBadge />
                                            </div>
                                            <p className="summary-tags">현대미술, 미술사학</p>
                                            <p className="summary-info">45,000원 / 회</p>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label><Calendar size={16} /> 예약 날짜</label>
                                        <input type="date" className="custom-date-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label><Clock size={16} /> 예약 시간</label>
                                        <input type="time" className="custom-time-input" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label><Users size={16} /> 인원 선택</label>
                                        <div className="person-selector">
                                            {[1, 2, 3, 4].map((num) => (
                                                <div key={num} className={`person-chip ${personCount === num ? 'active' : ''}`} onClick={() => setPersonCount(num)}>
                                                    {num === 4 ? '4명+' : `${num}명`}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button className="booking-submit-btn" onClick={handleBooking}>결제 및 예약 확정</button>
                            </>
                        ) : (
                            <div className="booking-success">
                                <div className="success-icon-container">
                                    <CheckCircle size={65} color="#000" fill="#22c55e" strokeWidth={3} />
                                </div>
                                <h3 className="success-title">예약이 완료되었습니다!</h3>
                                <p className="success-desc">
                                    <strong>{selectedDate} {selectedTime}</strong><br />
                                    예약이 확정되었습니다.<br />
                                    도슨트가 곧 확인 연락을 드릴 예정입니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuidePage;