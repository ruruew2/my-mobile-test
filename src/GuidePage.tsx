import React, { useState, useRef, useEffect } from 'react';
import { Star, X, ChevronLeft, Volume2, Play, Pause, Calendar, Users, CheckCircle, Image as ImageIcon } from 'lucide-react'; 
import axios from 'axios';
import './GuidePage.css';

const isDev = import.meta.env.MODE === 'development';
// 배포 환경에서 Mixed Content 에러 방지를 위해 가변 주소 사용
const API_BASE_URL = 'http://54.180.234.226:8000'; // 프록시 쓰지 말고 직접 입력

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
  const [stream, setStream] = useState<MediaStream | null>(null);

  // --- 카메라 로직 보완 ---
  const startCamera = async () => {
    try {
      // 1. 기존 스트림이 있다면 정리
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // 2. 카메라 제약 조건 설정 (ideal 값을 주어 유연하게 대응)
      const constraints = {
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // 3. 상태 업데이트 및 비디오 태그 연결
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // 중요: iOS 및 일부 브라우저에서 play()가 명시적으로 호출되어야 함
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
          } catch (playError) {
            console.error("자동 재생 실패:", playError);
          }
        };
      }
    } catch (err) {
      console.error("카메라 상세 에러:", err);
      alert("카메라를 시작할 수 없습니다. 브라우저 설정에서 카메라 권한과 '안전하지 않은 콘텐츠' 허용을 확인해주세요.");
      setIsScannerOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // 스캐너가 열릴 때만 카메라 작동
  useEffect(() => {
    if (isScannerOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isScannerOpen]);

  // --- API 통신 로직 ---
  const handleCapture = async () => {
    if (!videoRef.current || !stream) return;
    setIsAnalyzing(true);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');
      formData.append('lang', 'ko');

      try {
        const response = await axios.post(`${API_BASE_URL}/api/ai/analyze-scan`, formData);
        if (response.data.status === "success") {
          setScannedArt(response.data.data); 
          setIsAnalyzing(false);
          setIsScannerOpen(false);
          setShowResult(true);
        }
      } catch (error) {
        console.error("분석 실패:", error);
        alert("분석 서버(AWS) 연결에 실패했습니다.");
        setIsAnalyzing(false);
      }
    }, 'image/jpeg');
  };

  const toggleAudio = () => {
    if (!scannedArt.audio_url) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(scannedArt.audio_url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      setShowPlayer(true);
    }
    setIsPlaying(!isPlaying);
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
      {/* 1. 분석 로딩 오버레이 */}
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
                <button className="art-btn" onClick={() => activeTab === 'ai' ? setIsScannerOpen(true) : setIsBookingOpen(true)}>
                  {activeTab === 'human' ? '예약하기' : '해설 시작'}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 3. 분석 결과 화면 */
        <div className="art-result-container">
          <header className="result-header">
            <button className="back-btn-inner" onClick={() => {setShowResult(false); if(audioRef.current) audioRef.current.pause(); setIsPlaying(false);}}><ChevronLeft size={24} /></button>
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
              <span>분석 완료된 이미지입니다</span>
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
                    <div className="mini-status">{isPlaying ? '재생 중' : '일시 정지'}</div>
                  </div>
                </div>
                <div className="mini-controls">
                  <button onClick={toggleAudio}>
                    {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
                  </button>
                  <button onClick={() => setShowPlayer(false)} style={{marginLeft: '12px', opacity: 0.6}}>
                    <X size={18} color="white" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <footer className="result-footer-simple">
            <button className="footer-btn secondary" onClick={() => {setShowResult(false); setIsScannerOpen(true);}}>다시 스캔</button>
            <button className="footer-btn primary" onClick={toggleAudio}>
              <Volume2 size={18} /> {isPlaying ? '가이드 중단' : '오디오 가이드'}
            </button>
          </footer>
        </div>
      )}

      {/* 4. 스캐너 오버레이 (보완된 Video 태그) */}
      {isScannerOpen && (
        <div className="art-scanner-overlay">
            <div className="scanner-top">
                <button className="close-btn" onClick={() => setIsScannerOpen(false)}><X size={28} /></button>
                <span>작품 스캔</span>
                <div style={{width: 28}}></div>
            </div>
            <div className="scanner-frame-box">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted // 정책상 muted가 있어야 자동재생 확률이 높음
                  style={{ width: '100%', height: '100%', objectFit: 'cover'}} 
                />
                <div className="scanner-laser"></div>
            </div>
            <div className="scanner-bottom">
                <div className="capture-outer" onClick={handleCapture}><div className="capture-inner"></div></div>
            </div>
        </div>
      )}

      {/* 5. 예약 모달 (기존 UI 유지) */}
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
                <div className="success-icon-container">
                  <CheckCircle size={65} color="#000" fill="#22c55e" strokeWidth={3} />
                </div>
                <h3 className="success-title">예약이 완료되었습니다!</h3>
                <p className="success-desc">도슨트가 곧 확인 연락을 드릴 예정입니다.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidePage;