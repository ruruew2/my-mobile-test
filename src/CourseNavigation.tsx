import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import './Coursenav.css';

const CourseNavigation = ({ courseData, onClose, onShowMap }: any) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showPopup, setShowPopup] = useState(false);

    if (!courseData || !courseData.steps) return null;

    const steps = courseData.steps;
    const current = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const formatNum = (n: number) => String(n + 1).padStart(2, '0');

    const handleBack = () => {
        if (isFirstStep) {
            onClose();
        } else {
            setCurrentStep((prev) => prev - 1);
            const viewport = document.querySelector('.mag-main-viewport');
            if (viewport) viewport.scrollTo(0, 0);
        }
    };

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep((prev) => prev + 1);
            const viewport = document.querySelector('.mag-main-viewport');
            if (viewport) viewport.scrollTo(0, 0);
        } else {
            setShowPopup(true);
        }
    };

    return (
        <div className="mag-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden' }}>
            {showPopup && (
                <div className="mag-popup-overlay">
                    <div className="mag-popup-content">
                        <h2 className="popup-title">Enjoy your Course!</h2>
                        <p className="popup-text">오늘의 추천 코스 안내를 마칩니다.<br />나만의 특별한 예술 여정을 즐겨보세요.</p>
                        <button className="popup-close-btn" onClick={onClose}>확인</button>
                    </div>
                </div>
            )}

            <header className="mag-header" style={{ flexShrink: 0, padding: '20px 24px' }}>
                <button className="mag-back-btn" onClick={handleBack} style={{ background: 'none', border: 'none', padding: 0 }}>
                    <ChevronLeft size={28} strokeWidth={1.2} color="#000" />
                </button>
                <div className="mag-timeline" style={{ flex: 1, display: 'flex', gap: '4px', margin: '0 20px' }}>
                    {steps.map((_: any, idx: number) => (
                        <div key={idx} className={`mag-node ${idx === currentStep ? 'active' : ''}`} style={{ height: '2px', flex: 1, backgroundColor: idx === currentStep ? '#000' : '#eee', transition: 'all 0.3s' }} />
                    ))}
                </div>
                <span className="mag-count" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>
                    {formatNum(currentStep)} / {formatNum(steps.length)}
                </span>
            </header>
@
            <main className="mag-main-viewport" style={{ flex: 1, overflowY: 'auto', padding: '0 24px', WebkitOverflowScrolling: 'touch' }}>
                <div className="mag-top-section" style={{ paddingTop: '10px' }}>
                    <div style={{ position: 'relative', marginBottom: '40px' }}>
                        <span style={{ fontSize: '6rem', fontWeight: '900', color: '#000', opacity: '0.04', lineHeight: 1, position: 'absolute', top: '-20px', left: '-10px', zIndex: 0 }}>
                            {formatNum(currentStep)}
                        </span>
                        
                        <div style={{ position: 'relative', zIndex: 1, paddingTop: '15px' }}>
                            <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '24px' }}>
                                {current.type}
                            </span>
                            {/* 🚩 h1 스타일에 명조체(Serif)를 적용했습니다. */}
                            <h1 style={{ 
                                fontSize: '2.4rem', 
                                fontWeight: '700', 
                                marginBottom: '12px', 
                                wordBreak: 'keep-all', 
                                lineHeight: '1.2',
                                fontFamily: "'Nanum Myeongjo', serif", // 세리프 폰트 적용
                                letterSpacing: '-0.03rem' // 명조체는 자간을 살짝 줄여야 예쁩니다
                            }}>
                                {current.name}
                            </h1>
                            <p style={{ fontSize: '1rem', color: '#888', marginBottom: '36px' }}>
                                {current.sub}
                            </p>
                        </div>
                    </div>
                    
                    {(current.comment || current.tip || current.duration) && (
                        <section style={{ borderLeft: '2px solid #000', paddingLeft: '20px', marginBottom: '50px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ width: '6px', height: '6px', backgroundColor: '#ff4d00', borderRadius: '50%', marginRight: '10px' }}></span>
                                <span style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1.5px' }}>EDITOR'S NOTE</span>
                            </div>
                            
                            {current.comment && (
                                <div style={{ fontSize: '0.92rem', color: '#444', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '28px' }}>
                                    {current.comment}
                                </div>
                            )}

                            {current.tip && (
                                <div style={{ fontSize: '0.92rem', color: '#000', lineHeight: '1.6', fontWeight: '600', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: (!isLastStep && current.duration) ? '16px' : '0' }}>
                                    <span style={{ color: '#ff4d00', marginRight: '6px' }}>Tip.</span>
                                    {current.tip}
                                </div>
                            )}

                            {!isLastStep && current.duration && (
                                <div style={{ 
                                    fontSize: '0.85rem', 
                                    color: '#888', 
                                    marginTop: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{ color: '#000', fontWeight: '700' }}>·</span>
                                    {current.duration} 이동
                                </div>
                            )}
                        </section>
                    )}
                </div>

                <div className="mag-bottom-section" style={{ paddingBottom: '100px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="mag-btn-outline" style={{ flex: 1, padding: '18px 0', border: '1px solid #e0e0e0', backgroundColor: '#fff', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }} onClick={() => onShowMap && onShowMap(current)}>
                            OPEN MAP
                        </button>
                        <button className="mag-btn-solid" style={{ flex: 2, padding: '18px 0', backgroundColor: '#000', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px' }} onClick={handleNext}>
                            {isLastStep ? 'FINISH' : 'NEXT STEP'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseNavigation;