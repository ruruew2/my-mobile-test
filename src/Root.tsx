import React, { useEffect } from 'react';
import { Compass, Send } from 'lucide-react';
import './Root.css';

// 🚩 props로 targetCourse와 초기화 함수를 받습니다.
const RootPage = ({ targetCourse, setTargetCourse }: any) => {
  const courses = [
    {
      id: 1,
      anchorId: "course-seongsu",
      badge: "힙 & 트렌디",
      title: "성수동 힙한 갤러리 투어",
      desc: "영감과 인생샷을 동시에 잡는 MZ세대 맞춤형 코스입니다.",
      steps: [
        { type: 'EXHIBITION', name: '성수 크리에이티브 스페이스', sub: '네온 드림 전시' },
        { type: 'CAFE', name: '어니언 성수', sub: '인더스트리얼 감성 베이커리' },
        { type: 'RESTAURANT', name: '제스트 성수', sub: '모던 퓨전 다이닝' }
      ]
    },
    {
      id: 2,
      anchorId: "course-jongno",
      badge: "차분함 & 클래식",
      title: "종로의 과거와 현재",
      desc: "전통의 정취와 현대적 감각이 공존하는 깊이 있는 산책 코스입니다.",
      steps: [
        { type: 'EXHIBITION', name: '종로 갤러리', sub: '전통의 메아리 전시' },
        { type: 'CAFE', name: '수사동 커피하우스', sub: '조용한 한옥 감성 카페' },
        { type: 'EXHIBITION', name: '국립현대미술관', sub: '현대 추상 전시' }
      ]
    }
  ];

  // 🚩 페이지 로드 시 스크롤 실행 로직
  useEffect(() => {
    if (targetCourse) {
      const timer = setTimeout(() => {
        const element = document.getElementById(targetCourse);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // 스크롤 후 목적지 초기화 (다시 홈에서 눌렀을 때 작동하기 위함)
        setTargetCourse(null);
      }, 150); // 렌더링 시간을 벌기 위한 약간의 지연
      return () => clearTimeout(timer);
    }
  }, [targetCourse, setTargetCourse]);

  return (
    <div className="course-container">
      <header className="course-header">
        <h2>예술 코스</h2>
        <p>당신의 감성을 채워줄 최적의 경로를 제안합니다.</p>
      </header>

      {courses.map((course) => (
        <div 
          key={course.id} 
          id={course.anchorId}
          className="course-card-main" 
          style={{ marginBottom: '30px' }}
        >
          <div className="course-badge">{course.badge}</div>
          <div className="floating-compass">
            <Compass size={20} color="#adb5bd" />
          </div>
          
          <h3 className="course-main-title">{course.title}</h3>
          <p className="course-main-desc">{course.desc}</p>

          <div className="course-timeline">
            {course.steps.map((step, idx) => (
              <div key={idx} className="timeline-item">
                <div className="step-circle">{idx + 1}</div>
                <div className="step-info">
                  <div className="step-tag-group">
                    <span className="step-type-label">{step.type}</span>
                    <span className="step-name-text">{step.name}</span>
                  </div>
                  <p className="step-sub-desc">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="course-start-btn">
            <Send size={16} /> 코스 시작하기
          </button>
        </div>
      ))}
    </div>
  );
};

export default RootPage;