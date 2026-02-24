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
      badge: "2025.12.19~2026.6.7",
      title: "룸포 원더 : 상상의 문을 열다",
      desc: "그라운드시소 이스트에서 시작해 브런치 & 에스프레소바에 들러 마무리 할 수 있는 코스입니다.",
      steps: [
        { type: 'EXHIBITION', name: '그라운드시소 이스트', 
          duration: '다음 코스 까지 도보 11분', // 🚩 다음 장소까지 걸리는 시간 추가
          sub: '룸포 원더 : 상상의 문을 열다', 
          comment: `
🚶💨 도보 시
지하철 : 구의역 3번 출구 구름다리와 연결된 'NC 이스트폴' 2F　 (전시장 입구 근처 매장 : 폴햄/가배도/네모네[소품샵])


🚗💨 자가용 이용 시
NC 이스트폴 건물 지하 주차장 이용(주차 가능) `, // 🚩 새로 추가
          tip: '구의역 3번 출구에서 가장 가까워요!' },
        { type: 'RESTRANT',
          name: '도치피자 강변',
          sub: '쫄깃한 도우와 신선한 재료의 만남',
          duration: '다음 코스까지 도보 11분', // 🚩 다음 장소까지 걸리는 시간 추가
          comment:`
‼️ 파스타와 샐러드, 피자 세트로 먹는 걸 추천해요! 
‼️ 인테리어가 예쁘고 가게가 넓습니다. `,
          tip: '네이버 예약이 가능한 지점 입니다!' },


        { type: 'CAFE', name: '리사르커피 이스트폴점', 
          sub: '에스프레소 입문자를 위한 친절한 설명해주는 카페', 
          comment:`
‼️ 에스프레소바가 처음인 분들도 편하게 방문할 수 있어요!
‼️ 대화하기에 좋은 카페 입니다.`,
          tip: '에스프레소 외에도 기본 카페 메뉴도 판매해요!' }
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