import React, { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react'; // X 아이콘 추가
import './Coursenav.css';

const CourseNavigation = ({ courseData, onClose, onShowMap }: any) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showPopup, setShowPopup] = useState(false); // 팝업 상태 추가

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
            window.scrollTo(0, 0);
        }
    };

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo(0, 0);
        } else {
            setShowPopup(true); // 마지막 단계에서 팝업 띄우기
        }
    };

    return (
        <div className="mag-container">
            {/* 팝업 레이어 */}
            {showPopup && (
                <div className="mag-popup-overlay">
                    <div className="mag-popup-content">
                        <h2 className="popup-title">Enjoy your Course!</h2>
                        <p className="popup-text">
                            오늘의 추천 코스 안내를 마칩니다.
                            <br />
                            나만의 특별한 예술 여정을 즐겨보세요.
                        </p>
                        <button className="popup-close-btn" onClick={onClose}>
                            확인
                        </button>
                    </div>
                </div>
            )}

            <header className="mag-header">
                <button className="mag-back-btn" onClick={handleBack}>
                    <ChevronLeft size={28} strokeWidth={1.2} color="#000" />
                </button>

                <div className="mag-timeline">
                    {steps.map((_: any, idx: number) => (
                        <div key={idx} className={`mag-node ${idx === currentStep ? 'active' : ''}`} />
                    ))}
                </div>
                <span className="mag-count">
                    {formatNum(currentStep)} / {formatNum(steps.length)}
                </span>
            </header>

            <main className="mag-main-viewport">
                <div className="mag-top-section">
                    {/* 숫자가 왼쪽, 카테고리가 그 옆에 오도록 배치 */}
                    <div className="mag-meta-group">
                        <span className="mag-num-accent">{formatNum(currentStep)}</span>
                        <div className="mag-meta-text">
                            <span className="mag-category-tag">{current.type}</span>
                            <div className="mag-full-hairline" />
                        </div>
                    </div>
                    <h1 className="mag-title">{current.name}</h1>
                    <p className="mag-description">{current.sub}</p>
                </div>

                <div className="mag-spacer" />

                <div className="mag-bottom-section">
                    <div className="mag-actions">
                        <button className="mag-btn-outline" onClick={() => onShowMap && onShowMap(current)}>
                            OPEN MAP
                        </button>
                        <button className="mag-btn-solid" onClick={handleNext}>
                            {isLastStep ? 'FINISH' : 'NEXT STEP'}
                        </button>
                    </div>

                    <section className="mag-editor-note">
                        <div className="note-header">
                            <span className="note-dot"></span>
                            <h3 className="mag-note-label">EDITOR'S NOTE</h3>
                        </div>
                        <p className="mag-note-text">{current.tip || '네온 조명 아래서 실루엣 샷을 찍어보세요!'}</p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default CourseNavigation;
