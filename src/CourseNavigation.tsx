import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import './Coursenav.css';

const CourseNavigation = ({ courseData, onClose }: any) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!courseData || !courseData.steps) return null;

  const steps = courseData.steps;
  const current = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const formatNum = (n: number) => String(n + 1).padStart(2, '0');

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      onClose();
    }
  };

  return (
    <div className="mag-container">
      {/* 상단 툴바 */}
      <header className="mag-header">
        <button className="mag-back-btn" onClick={onClose}><ChevronLeft size={24} strokeWidth={1.5} /></button>
        <div className="mag-timeline">
          {steps.map((_: any, idx: number) => (
            <div key={idx} className={`mag-node ${idx === currentStep ? 'active' : ''}`} />
          ))}
        </div>
        <span className="mag-count">{formatNum(currentStep)} / {formatNum(steps.length - 1)}</span>
      </header>

      <main className="mag-main-viewport">
        {/* 상단 섹션: 텍스트 */}
        <div className="mag-top-section">
          <div className="mag-meta">
            <span className="mag-num-accent">{formatNum(currentStep)}</span>
            <span className="mag-category-tag">{current.type}</span>
          </div>
          <h1 className="mag-title">{current.name}</h1>
          {/* ❗ 화면 끝에서 끝까지 가는 선 */}
          <div className="mag-full-hairline" />
          <p className="mag-description">{current.sub}</p>
        </div>

        {/* 하단 섹션: 버튼 + 에디터 노트 (바닥 밀착) */}
        <div className="mag-bottom-section">
          <div className="mag-actions">
            <button className="mag-btn-outline">OPEN MAP</button>
            <button className="mag-btn-solid" onClick={handleNext}>
              {isLastStep ? "FINISH" : "NEXT STEP"}
            </button>
          </div>

          <section className="mag-editor-note">
            <h3 className="mag-note-label">EDITOR'S NOTE</h3>
            <p className="mag-note-text">{current.tip || "네온 조명 아래서 실루엣 샷을 찍어보세요!"}</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CourseNavigation;