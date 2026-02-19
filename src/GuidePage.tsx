import React, { useState, useEffect } from 'react';
import { Star, X, Zap, Image as ImageIcon, ChevronLeft, Volume2, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import './GuidePage.css';

const GuidePage = ({ initialTab }: any) => {
  const [activeTab, setActiveTab] = useState<'human' | 'ai'>(initialTab || 'human');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleCapture = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsScannerOpen(false);
      setShowResult(true);
    }, 3500);
  };

  const artData = {
    title: "별이 빛나는 밤",
    artist: "빈센트 반 고흐",
    year: "1889",
    description: "고흐의 가장 유명한 작품 중 하나로, 요양원에서 바라본 밤하늘을 소용돌이치는 역동적인 붓터치로 표현했습니다. 그의 불안한 내면과 예술적 열망이 동시에 담겨 있습니다.",
    points: [
      "꿈동이치는 하늘의 소용돌이 패턴",
      "강렬한 노란색 별과 보랏빛 밤하늘의 대비",
      "정적인 마을과 대조되는 역동적인 자연"
    ]
  };

  return (
    <div className="art-guide-container">
      {/* 1. 메인 가이드 리스트 (결과가 아닐 때만 노출) */}
      {!showResult && (
        <>
          <header className="art-header">
            <h2 className="art-title">아트 가이드</h2>
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
            {(activeTab === 'human' ? 
              [{ id: 1, name: '김사랑 도슨트', job: '현대미술, 미술사학', price: '45,000원', rating: 4.9, review: 320, emoji: '👩‍🎨' }] : 
              [{ id: 1, name: '아티 (AI 가이드)', job: '추상화, 디지털 아트, 빠른 요약', price: '무료 (AI)', rating: 4.8, review: 1250, emoji: '🤖' }]
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
                <button className="art-btn" onClick={() => activeTab === 'ai' ? setIsScannerOpen(true) : alert("준비 중")}>
                  {activeTab === 'human' ? '예약하기' : '해설 시작'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 2. 작품 분석 결과 및 플레이어 */}
      {showResult && (
        <>
          <div className="art-result-container">
            <header className="result-header">
              <button className="back-btn" onClick={() => setShowResult(false)}>
                <ChevronLeft size={24} />
              </button>
              <span className="header-tag"><p></p>　AI 도슨트 리포트</span>
              <div style={{ width: 24 }}></div>
            </header>

            <div className="result-img-box">
              <div className="mock-img">🖼️</div>
              <div className="ai-check-badge">AI 인증</div>
            </div>

            <div className="result-body">
              <h1 className="result-title">{artData.title}</h1>
              <p className="result-artist">{artData.artist}, {artData.year}</p>

              <div className="ai-speech-bubble">
                <div className="ai-label">🤖 아티의 한마디</div>
                <p>{artData.description}</p>
              </div>

              <div className="point-section">
                <h3>💡 감상 포인트</h3>
                <ul className="point-list">
                  {artData.points.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="result-footer">
              <button className="footer-btn secondary" onClick={() => {setShowResult(false); setShowPlayer(false);}}>다시 스캔</button>
              <button 
                className="footer-btn primary" 
                onClick={() => {
                  setShowPlayer(true); 
                  setIsPlaying(true);  
                }}
              >
                <Volume2 size={18} /> 오디오 가이드
              </button>
            </footer>
          </div>

          {/* 🎧 오디오 미니 플레이어 */}
          {showPlayer && (
            <div className="audio-mini-player">
              <div className="player-progress-bar">
                <div className="progress-fill" style={{ width: '35%' }}></div>
              </div>
              
              <div className="player-content">
                <div className="player-art-thumb">🖼️</div>
                <div className="player-info">
                  <span className="player-title">{artData.title} (해설)</span>
                  <span className="player-status">{isPlaying ? '해설 재생 중...' : '일시 정지됨'}</span>
                </div>
                
                <div className="player-controls">
                  <button className="p-btn"><SkipBack size={18} fill="currentColor" /></button>
                  <button className="p-btn play" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                  </button>
                  <button className="p-btn"><SkipForward size={18} fill="currentColor" /></button>
                  
                  <button 
                    className="p-btn close-player"
                    onClick={() => setShowPlayer(false)} 
                    style={{ marginLeft: '12px', opacity: 0.6 }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. 스캐너 모달 */}
      {isScannerOpen && (
        <div className="art-scanner-overlay">
          <div className="scanner-top">
             <button className="close-btn" onClick={() => setIsScannerOpen(false)}><X size={28} /></button>
             <span>작품 스캔</span>
             <div style={{width: 28}}></div>
          </div>
          <div className="scanner-frame-box">
             <div className="frame-corner tl"></div><div className="frame-corner tr"></div>
             <div className="frame-corner bl"></div><div className="frame-corner br"></div>
             <div className="scanner-laser"></div>
          </div>
          <div className="scanner-bottom">
             <p>작품이나 QR코드를 사각형 안에 맞춰주세요</p>
             <div className="scanner-actions">
               <button className="tool-btn"><Zap size={24} /></button>
               <div className="capture-outer" onClick={handleCapture}><div className="capture-inner"></div></div>
               <button className="tool-btn"><ImageIcon size={24} /></button>
             </div>
          </div>

          {isAnalyzing && (
            <div className="analysis-loading-overlay">
              <div className="loading-content">
                <div className="ai-pulse-circle">
                  <div className="pulse-ring"></div>
                  <span className="ai-icon">🤖</span>
                </div>
                <h3 className="loading-title">아티가 분석 중...</h3>
                <div className="loading-bar-bg"><div className="loading-bar-fill"></div></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GuidePage;