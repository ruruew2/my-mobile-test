import React, { useState, useRef, useEffect } from 'react';
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
    const [isScannerOpen, setIsScannerOpen] = useState(false);
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
        imagePreview: '' // 이미지 미리보기 추가
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // 카메라 시작
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            console.error('카메라 접근 에러:', err);
            alert('카메라 권한을 허용해주세요.');
            setIsScannerOpen(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        if (isScannerOpen) startCamera();
        else stopCamera();
        return () => stopCamera();
    }, [isScannerOpen]);

    // 공통 분석 요청 함수
    const sendToAIApi = async (blob: Blob, previewUrl: string) => {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');
        formData.append('lang', 'ko');

        try {
            const response = await fetch('http://localhost:8000/api/ai/docent', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (result.status === "success") {
                const [audioUrl, script] = result.data;
                setScannedArt({
                    title: '분석된 작품',
                    artist: 'AI 도슨트',
                    year: '2024',
                    description: script,
                    audioPath: `http://localhost:8000/${audioUrl}`,
                    imagePreview: previewUrl
                });
                setIsAnalyzing(false);
                setIsScannerOpen(false);
                setShowResult(true);
            } else {
                throw new Error("분석 실패");
            }
        } catch (error) {
            console.error('분석 실패:', error);
            setIsAnalyzing(false);
            alert('AI 도슨트 서버 분석에 실패했습니다.');
        }
    };

    // 카메라 캡처 처리
    const handleCapture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
            if (blob) {
                const previewUrl = URL.createObjectURL(blob);
                sendToAIApi(blob, previewUrl);
            }
        }, 'image/jpeg');
    };

    // 사진 파일 업로드 처리
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        sendToAIApi(file, previewUrl);
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
        <div className="art-guide-container">
            {isAnalyzing && (
                <div className="analysis-loading-overlay">
                    <div className="loading-content">
                        <div className="ai-pulse-circle">
                            <div className="pulse-ring"></div>
                            <span className="ai-icon">🤖</span>
                        </div>
                        <h3 className="loading-title">아티가 작품을 분석 중입니다...</h3>
                        <div className="loading-bar-bg">
                            <div className="loading-bar-fill"></div>
                        </div>
                    </div>
                </div>
            )}

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
                                <button className="art-btn" onClick={() => activeTab === 'ai' ? setIsScannerOpen(true) : setIsBookingOpen(true)}>
                                    {activeTab === 'human' ? '예약하기' : '해설 시작'}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="art-result-container">
                    <header className="result-header">
                        <button className="back-btn-inner" onClick={() => setShowResult(false)}>
                            <ChevronLeft size={24} />
                        </button>
                        <span className="header-tag">🤖 AI 도슨트 리포트</span>
                        <div style={{ width: 24 }}></div>
                    </header>

                    <div className="result-body">
                        <div className="result-info-group">
                            <h1 className="result-title">{scannedArt.title}</h1>
                            <p className="result-artist">{scannedArt.artist}, {scannedArt.year}</p>
                        </div>

                        <div className="result-image-placeholder" style={{ padding: 0, overflow: 'hidden' }}>
                            {scannedArt.imagePreview ? (
                                <img src={scannedArt.imagePreview} alt="Scanned Art" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <><ImageIcon size={40} color="#ddd" /><span>분석 완료</span></>
                            )}
                        </div>

                        <div className="ai-speech-bubble">
                            <div className="ai-label">🤖 아티의 한마디</div>
                            <p>{scannedArt.description}</p>
                        </div>

                        {showPlayer && (
                            <div className="audio-mini-player">
                                <div className="mini-player-info">
                                    <div className="mini-icon">🎵</div>
                                    <div>
                                        <div className="mini-title">{scannedArt.title}</div>
                                        <div className="mini-status">AI 해설 재생 중</div>
                                    </div>
                                </div>
                                <div className="mini-controls">
                                    <button onClick={() => setIsPlaying(!isPlaying)}>
                                        {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
                                    </button>
                                    <button onClick={() => { audioElement?.pause(); setShowPlayer(false); }} style={{ marginLeft: '12px', opacity: 0.6 }}>
                                        <X size={18} color="white" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <footer className="result-footer-simple">
                        <button className="footer-btn secondary" onClick={() => { setShowResult(false); setIsScannerOpen(true); }}>
                            다시 스캔
                        </button>
                        <button className="footer-btn primary" onClick={handleAudioGuide}>
                            <Volume2 size={18} /> {showPlayer ? '가이드 중단' : '오디오 가이드'}
                        </button>
                    </footer>
                </div>
            )}

            {isScannerOpen && (
                <div className="art-scanner-overlay">
                    <div className="scanner-top">
                        <button className="close-btn" onClick={() => setIsScannerOpen(false)}>
                            <X size={28} />
                        </button>
                        <span>작품 스캔</span>
                        <div style={{ width: 28 }}></div>
                    </div>
                    <div className="scanner-frame-box">
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="scanner-laser"></div>
                    </div>
                    <div className="scanner-bottom">
                        {/* ✅ 사진 업로드 버튼 추가 */}
                        <label className="scanner-gallery-btn" style={{ cursor: 'pointer' }}>
                            <ImageIcon size={28} color="white" />
                            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>

                        <div className="capture-outer" onClick={handleCapture}>
                            <div className="capture-inner"></div>
                        </div>
                        
                        <div style={{ width: 28 }}></div> {/* 레이아웃 밸런스용 */}
                    </div>
                </div>
            )}

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