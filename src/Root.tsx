import React, { useEffect } from 'react';
import { Compass, Send } from 'lucide-react';
import './Root.css';

// 🚩 props로 onStart(코스 시작 함수)를 추가로 받습니다.
const RootPage = ({ targetCourse, setTargetCourse, onStart }: any) => {
  const courses = [
    {
      id: 1,
      anchorId: "course-seongsu",
      badge: "힙 & 트렌디",
      title: "성수동 힙한 갤러리 투어",
      desc: "영감과 인생샷을 동시에 잡는 MZ세대 맞춤형 코스입니다.",
      steps: [
        { type: 'EXHIBITION', name: '성수 크리에이티브 스페이스', sub: '네온 드림 전시', tip: '네온 조명 아래서 실루엣 샷을 찍어보세요!' },
        { type: 'CAFE', name: '어니언 성수', sub: '인더스트리얼 감성 베이커리', tip: '팡도르 빵은 꼭 드셔보세요.' },
        { type: 'RESTAURANT', name: '제스트 성수', sub: '모던 퓨전 다이닝', tip: '예약 없이 가면 웨이팅이 있을 수 있어요.' }
      ]
    },
    {
      id: 2,
      anchorId: "course-jongno",
      badge: "차분함 & 클래식",
      title: "종로의 과거와 현재",
      desc: "전통의 정취와 현대적 감각이 공존하는 깊이 있는 산책 코스입니다.",
      steps: [
        { type: 'EXHIBITION', name: '종로 갤러리', sub: '전통의 메아리 전시', tip: '입구의 빨간 포스터 앞에서 인증샷을 찍어보세요!' },
        { type: 'CAFE', name: '수사동 커피하우스', sub: '조용한 한옥 감성 카페', tip: '시그니처인 흑임자 라떼를 추천해요.' },
        { type: 'EXHIBITION', name: '국립현대미술관', sub: '현대 추상 전시', tip: '3층 테라스에서 경복궁이 한눈에 보여요.' }
      ]
    }
  ];

  useEffect(() => {
    if (targetCourse) {
      const timer = setTimeout(() => {
        const element = document.getElementById(targetCourse);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setTargetCourse(null);
      }, 150);
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

{/* 🚩 클릭 시 현재 보고 있는 course 정보를 통째로 넘겨줍니다. */}
<button className="course-start-btn" onClick={() => onStart(course)}> 
  <Send size={16} /> 코스 시작하기
</button>
        </div>
      ))}
    </div>
  );
};

export default RootPage;