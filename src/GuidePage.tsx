import React, { useState, useRef, useEffect } from 'react';
import { Star, X, Zap, Image as ImageIcon, ChevronLeft, Volume2, Play, Pause, Calendar, Users, Check } from 'lucide-react';
import './GuidePage.css';

const GuidePage = ({ initialTab }: any) => {
  const [activeTab, setActiveTab] = useState<'human' | 'ai'>(initialTab || 'human');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); 
  const [personCount, setPersonCount] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("카메라 접근 에러:", err);
      setIsScannerOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isScannerOpen) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isScannerOpen]);

  const handleCapture = () => {
    setIsAnalyzing(true);
    if (videoRef.current) videoRef.current.pause();
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsScannerOpen(false);
      setShowResult(true);
      stopCamera();
    }, 3500);
  };

  const artData = {
    title: "별이 빛나는 밤",
    artist: "빈센트 반 고흐",
    year: "1889",
    description: "고흐의 가장 유명한 작품 중 하나로, 요양원에서 바라본 밤하늘을 소용돌이치는 역동적인 붓터치로 표현했습니다.",
  };

  const handleBooking = () => {
    setBookingStep(2);
    setTimeout(() => {
      setIsBookingOpen(false);
      setBookingStep(1);
    }, 2000);
  };

  return (
    <div className="art-guide-container">
      {/* 1. 분석 애니메이션 */}
      {isAnalyzing && (
        <div className="analysis-loading-overlay">
          <div className="loading-content">
            <div className="ai-pulse-circle">
              <div className="pulse-ring"></div>
              <span className="ai-icon">🤖</span>
            </div>
            <h3 className="loading-title">아티가 작품을 분석 중입니다...</h3>
            <div className="loading-bar-bg"><div className="loading-bar-fill"></div></div>
          </div>
        </div>
      )}

      {/* 2. 메인 리스트 */}
      {!showResult && (
        <>
          <header className="art-header">
            <h2 className="art-title">아트 가이드</h2>
            <p className="art-desc">전문 큐레이터부터 AI 가이드까지.</p>
          </header>
          <nav className="art-tab-nav">
            <button className={`art-tab-item ${activeTab === 'human' ? 'is-active' : ''}`} onClick={() => setActiveTab('human')}>인간 도슨트</button>
            <button className={`art-tab-item ${activeTab === 'ai' ? 'is-active' : ''}`} onClick={() => setActiveTab('ai')}>AI 가이드</button>
          </nav>
          <div className="art-list">
            {(activeTab === 'human' ? 
              [{ id: 1, name: '김사랑 도슨트', job: '현대미술, 미술사학', price: '45,000원', rating: 4.9, emoji: '👩‍🎨' }] : 
              [{ id: 1, name: '아티 (AI 가이드)', job: '추상화, 디지털 아트', price: '무료 (AI)', rating: 4.8, emoji: '🤖' }]
            ).map((guide) => (
              <div key={guide.id} className={`art-card ${activeTab === 'ai' ? 'ai-special' : ''}`}>
                <div className="art-avatar">{guide.emoji}</div>
                <div className="art-info">
                  <div className="art-name-row">
                    <span className="art-name">{guide.name}</span>
                    <span className="art-rating"><Star size={12} fill="#ffcc00" color="#ffcc00" /> {guide.rating}</span>
                  </div>
                  <p className="art-job">{guide.job}</p>
                  <p className="art-price">{guide.price}</p>
                </div>
                <button className="art-btn" onClick={() => activeTab === 'ai' ? setIsScannerOpen(true) : setIsBookingOpen(true)}>
                  {activeTab === 'human' ? '예약하기' : '해설 시작'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 3. 분석 결과 화면 */}
      {showResult && (
        <div className="art-result-container">
          <header className="result-header">
            <button className="back-btn" onClick={() => setShowResult(false)}><ChevronLeft size={24} /></button>
            <span className="header-tag">🤖 AI 도슨트 리포트</span>
            <div style={{ width: 24 }}></div>
          </header>
          <div className="result-body">
            <h1 className="result-title">{artData.title}</h1>
            <p className="result-artist">{artData.artist}, {artData.year}</p>
            <div className="ai-speech-bubble">
              <div className="ai-label">🤖 아티의 한마디</div>
              <p>{artData.description}</p>
            </div>
          </div>
          <footer className="result-footer">
            <button className="footer-btn secondary" onClick={() => {setShowResult(false); setIsScannerOpen(true);}}>다시 스캔</button>
            <button className="footer-btn primary" onClick={() => setShowPlayer(true)}>
              <Volume2 size={18} /> 오디오 가이드
            </button>
          </footer>
        </div>
      )}

      {/* 🚩 4. 미니 오디오 플레이어 (심플 버전) */}
      {showPlayer && (
        <div className="mini-player">
          <div className="mini-player-info">
            <div className="mini-icon">🎵</div>
            <div>
              <div className="mini-title">{artData.title} 해설</div>
              <div className="mini-status">AI 아티가 읽어주는 중...</div>
            </div>
          </div>
          <div className="mini-controls">
            <button onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
            </button>
            <button onClick={() => setShowPlayer(false)}><X size={20} /></button>
          </div>
        </div>
      )}

      {/* 5. 스캐너 */}
      {isScannerOpen && (
        <div className="art-scanner-overlay">
            <div className="scanner-top">
                <button className="close-btn" onClick={() => setIsScannerOpen(false)}><X size={28} /></button>
                <span>작품 스캔</span>
                <div style={{width: 28}}></div>
            </div>
            <div className="scanner-frame-box">
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover'}} />
                <div className="scanner-laser"></div>
            </div>
            <div className="scanner-bottom">
                <div className="capture-outer" onClick={handleCapture}><div className="capture-inner"></div></div>
            </div>
        </div>
      )}

      {/* 6. 예약 모달 */}
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
                    <div><p className="summary-name">김사랑 도슨트</p><p className="summary-info">45,000원 / 회</p></div>
                  </div>
                  <div className="input-group">
                    <label><Calendar size={16} /> 예약 날짜</label>
                    <input type="date" className="custom-date-input" defaultValue="2026-05-20" />
                  </div>
                  <div className="input-group">
                    <label><Users size={16} /> 인원 선택</label>
                    <div className="person-selector">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className={`person-chip ${personCount === num ? 'active' : ''}`} onClick={() => setPersonCount(num)}>
                          {num === 3 ? '3명+' : `${num}명`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="booking-submit-btn" onClick={handleBooking}>결제 및 예약 확정</button>
              </>
            ) : (
              <div className="booking-success">
                <div className="success-icon"><Check size={40} color="white" /></div>
                <h3>예약이 완료되었습니다!</h3>
                <p>도슨트가 곧 연락드릴 예정입니다.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidePage;