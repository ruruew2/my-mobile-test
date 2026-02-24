import React, { useEffect } from 'react';
import { Compass, Send } from 'lucide-react';
import './Root.css';

// 🚩 props로 onStart(코스 시작 함수)를 추가로 받습니다.
const RootPage = ({ targetCourse, setTargetCourse, onStart }: any) => {
const courses = [
  {
    id: 1,
    anchorId: "course-seongsu-dmuseum",
    badge: "2025.06.28~2026.09.20",
    title: "성수, 예술이 머무는 집",
    desc: "일상에 깊게 스며든 예술과 숲의 평온을 함께 누리는 시간입니다.",
    steps: [
      {
        type: 'EXHIBITION',
        name: '디뮤지엄 성수',
        duration: '다음 코스 까지 도보 2분',
        sub: '취향가옥 2 : Art in Life',
        comment: `* 찾아가는 길\n> 수인분당선 서울숲역 4번 출구와 연결된 '아크로서울포레스트 D타워' 내부에 위치해 있습니다.\n\n* 전시 관람 Tip\n> 각 공간의 '향기'와 '조명'이 만드는 무드에 집중해 보세요. '홈 라이브러리' 섹션은 이번 전시의 가장 아름다운 포토존입니다.`,
        tip: '전시장 내 홈 라이브러리 섹션에서 인생샷을 남겨보세요!'
      },
      {
        type: 'RESTAURANT',
        name: '소랑호젠',
        duration: '다음 코스 까지 도보 12분',
        sub: '제주 감성 이탈리안 다이닝',
        comment: `* 분위기 & 위치\n> 디뮤지엄에서 서울숲 방향으로 도보 5분 거리입니다. 제주 현무암과 우드톤이 어우러진 아늑한 공간입니다.\n\n* 에디터 메뉴 추천\n> 비린맛 없이 감칠맛을 살린 '제주 멜젓 파스타'와 비주얼이 독특한 '현무암 카츠'를 추천합니다. (캐치테이블 예약 권장)`,
        tip: '시그니처인 제주 멜젓 파스타를 추천드려요.'
      },
      {
        type: 'SPACE',
        name: '서울숲 산책로',
        duration: '다음 코스 까지 도보 25분',
        sub: '도심 속 초록빛 휴식',
        comment: `* 산책 코스\n> 소랑호젠에서 나와 3번 출입구로 진입하세요. 거울연못을 지나 메타세쿼이아 길까지 걷는 20분 코스를 추천합니다.\n\n* 관전 포인트\n> 거울연못에 비치는 나무의 반영을 사진으로 담아보세요.`,
        tip: '거울연못 근처가 사진이 제일 잘 나와요.'
      },
      {
        type: 'CAFE',
        name: '오우도 (OUDO)',
        sub: '아트 갤러리형 카페',
        comment: `* 공간의 특징\n> 넓은 층고와 갤러리 같은 벽면 구성이 특징인 카페입니다. 가끔 작은 전시도 함께 열려요.\n\n* 추천 페어링\n> 직접 로스팅한 원두로 내린 핸드드립 커피와 계절 디저트가 잘 어울립니다.`,
        tip: '조용한 평일 오후에 가면 책 읽기 너무 좋아요.'
      }
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
        { type: 'RESTAURANT',
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