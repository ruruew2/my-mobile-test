import React, { useState, useRef, useEffect } from 'react';
import { Star, X, ChevronLeft, Volume2, Play, Pause, Calendar, Users, CheckCircle, Image as ImageIcon, Camera } from 'lucide-react'; 
import axios from 'axios';
import './GuidePage.css';

// [필독] 모바일/PC 공통: 서버 연결을 위해 사이트 설정에서 '보안되지 않은 콘텐츠' 허용이 필요할 수 있습니다.
const API_BASE_URL = 'http://54.180.234.226:8000'; 

const GuidePage = ({ initialTab }: any) => {
  const [activeTab, setActiveTab] = useState<'human' | 'ai'>(initialTab || 'human');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); 
  const [personCount, setPersonCount] = useState(1);
  const [scannedArt, setScannedArt] = useState<any>({
    title: "", artist: "", year: "", description: "", audio_url: ""
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // 모바일 카메라 호출용
  const [stream, setStream] = useState<MediaStream | null>(null);

  // --- 1. API 통신 공통 로직 ---
  const sendImageToApi = async (imageBlob: Blob) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', imageBlob, 'scan.jpg');
    formData.append('lang', 'ko');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/analyze-scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 20000 // 분석 시간이 걸릴 수 있으므로 20초 설정
      });

      if (response.data.status === "success") {
        setScannedArt(response.data.data); 
        setIsAnalyzing(false);
        setIsScannerOpen(false);
        setShowResult(true);
      }
    } catch (error: any) {
      console.error("분석 실패:", error);
      alert("서버 연결에 실패했습니다. AWS 보안 그룹(8000번 포트)과 브라우저의 '보안되지 않은 콘텐츠 허용' 설정을 확인해주세요.");
      setIsAnalyzing(false);
    }
  };

  // --- 2. 실시간 카메라 로직 (모바일/PC 겸용) ---
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      }
    } catch (err) {
      console.error("카메라 시작 실패:", err);
      // 실시간 카메라 실패 시 파일 업로드로 유도
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
    if (!videoRef.current || !stream) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) sendImageToApi(blob);
    }, 'image/jpeg');
  };

  // --- 3. 모바일 전용 사진 촬영/선택 로직 ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendImageToApi(file);
    }
  };

  // --- 4. 오디오 및 기타 기능 ---
  const toggleAudio = () => {
    if (!scannedArt.audio_url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(scannedArt.audio_url);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => alert("오디오 재생에 실패했습니다."));
      setShowPlayer(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleBooking = () => {
    setBookingStep(2);
    setTimeout(() => { setIsBookingOpen(false); setBookingStep(1); }, 2000);
  };

  return (
    <div className="art-guide-container">
      {/* 모바일 카메라/갤러리 호출용 숨겨진 input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {/* 1. 분석 로딩 오버레이 */}
      {isAnalyzing && (
        <div className="analysis-loading-overlay">
          <div className="loading-content">
            <div className="ai-pulse-circle">
              <div className="pulse-ring"></div>
              <span className="ai-icon">🤖</span>
            </div>
            <h3 className="loading-title">아티가 분석 중입니다...</h3>
            <div className="loading-bar-bg"><div className="loading-bar-fill"></div></div>
          </div>
        </div>
      )}

      {/* 2. 메인 화면 */}
      {!showResult ? (
        <>
          <header className="art-header">
            <h1 className="art-title"><br/>전문 도슨트 서비스</h1>
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
                <button 
                  className="art-btn" 
                  onClick={() => activeTab === 'ai' ? fileInputRef.current?.click() : setIsBookingOpen(true)}
                >
                  {activeTab === 'human' ? '예약하기' : '사진 찍어 분석'}
                </button>
              </div>
            ))}
            {activeTab === 'ai' && (
              <p className="scanner-alt-link" onClick={() => setIsScannerOpen(true)}>
                실시간 스캐너 모드 실행 {">"}
              </p>
            )}
          </div>
        </>
      ) : (
        /* 3. 분석 결과 화면 */
        <div className="art-result-container">
          <header className="result-header">
            <button className="back-btn-inner" onClick={() => setShowResult(false)}><ChevronLeft size={24} /></button>
            <span className="header-tag">🤖 AI 도슨트 리포트</span>
            <div style={{ width: 24 }}></div>
          </header>

          <div className="result-body">
            <div className="result-info-group">
              <h1 className="result-title">{scannedArt.title}</h1>
              <p className="result-artist">{scannedArt.artist}, {scannedArt.year}</p>
            </div>
            <div className="result-image-placeholder">
              <ImageIcon size={40} color="#ddd" />
              <span>작품 분석 완료</span>
            </div>
            <div className="ai-speech-bubble">
              <div className="ai-label">🤖 아티의 한마디</div>
              <p>{scannedArt.description}</p>
            </div>
          </div>

          <footer className="result-footer-simple">
            <button className="footer-btn secondary" onClick={() => fileInputRef.current?.click()}>다시 촬영</button>
            <button className="footer-btn primary" onClick={toggleAudio}>
              <Volume2 size={18} /> {isPlaying ? '중단' : '오디오 가이드'}
            </button>
          </footer>
        </div>
      )}

      {/* 4. 실시간 스캐너 오버레이 */}
      {isScannerOpen && (
        <div className="art-scanner-overlay">
            <div className="scanner-top">
                <button className="close-btn" onClick={() => setIsScannerOpen(false)}><X size={28} /></button>
                <span>실시간 작품 스캔</span>
                <div style={{width: 28}}></div>
            </div>
            <div className="scanner-frame-box">
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover'}} />
                <div className="scanner-laser"></div>
            </div>
            <div className="scanner-bottom">
                <div className="capture-outer" onClick={handleCapture}><div className="capture-inner"></div></div>
            </div>
        </div>
      )}

      {/* 5. 예약 모달 (기존 유지) */}
      {isBookingOpen && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            {bookingStep === 1 ? (
              <>
                <div className="modal-header"><h3>도슨트 예약</h3><button onClick={() => setIsBookingOpen(false)}><X size={20} /></button></div>
                <div className="modal-content">
                  <div className="guide-summary"><span className="summary-emoji">👩‍🎨</span><div><p className="summary-name">김사랑 도슨트</p></div></div>
                  <div className="input-group"><label><Calendar size={16} /> 예약 날짜</label><input type="date" className="custom-date-input" defaultValue="2026-05-20" /></div>
                </div>
                <button className="booking-submit-btn" onClick={handleBooking}>예약 확정</button>
              </>
            ) : (
              <div className="booking-success"><CheckCircle size={65} color="#22c55e" /><h3 className="success-title">완료되었습니다!</h3></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidePage;