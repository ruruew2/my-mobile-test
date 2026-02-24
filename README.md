🎨 ART-LOG 프로젝트 작업 로그 (2026-02-24 통합본)
예술적 순간을 데이터로 기록하는 개인 맞춤형 전시 큐레이션 플랫폼 ART-LOG의 개발 기록입니다.

📅 프로젝트 개요
타겟: MZ세대, 해외 관광객 

핵심 가치: AI 큐레이션, 실시간 전시 지도, AI 도슨트 스캐너, 개인화된 기록 관리

🛠 기술 스택
Frontend: React, TypeScript

Build Tool: Vite

Icons: Lucide-React

Styling: Pure CSS (BEM 방식 지향)

API: Kakao Maps API (지도 및 위치 기반 서비스)

Deployment: Vercel

1. 인증 및 온보딩 (Auth & Onboarding)
소셜 로그인 UI: Google, Apple, Kakao, Naver 로그인 페이지 구현.

취향 수집: 사용자 맞춤형 전시 추천을 위한 선호도 선택(Preference Selection) 프로세스 구축.

모바일 최적화: 입력창 클릭 시 화면 강제 확대 방지를 위한 Viewport 및 폰트 사이즈(16px) 대응.

2. 메인 화면 및 네비게이션 (Home & Navigation)
헤더 리모델링: 이탤릭체 로고(좌)와 알림/마이페이지 아이콘(우) 배치를 통한 시각적 균형 확보. CSS margin 보정으로 수평 불균형 해결.

AI 큐레이션 배너: 맞춤형 추천 문구 및 호출 버튼 배치.

전시 슬라이드: ExhibitCarousel 컴포넌트로 "지금 화제인 전시" 가로 스크롤 구현.

스마트 스크롤: 홈 화면의 코스 카드(성수, 종로) 클릭 시 해당 탭으로 이동 및 목적지 위치로 자동 스크롤(scrollIntoView) 기능 구현.

3. 전시 지도 및 위치 기반 서비스 (Map)
카카오 맵 연동: Kakao JS API 기반 지도 렌더링 및 Geolocation을 이용한 내 위치 찾기 기능.

인터랙티브 바텀 시트:

Framer-motion 없이 순수 JS(Touch Event)로 드래그 및 스냅(Snap) 기능 구현.

시트 내 주변 전시 리스트(이미지, 제목, 장소, 태그) 표시.

카테고리 필터: 지도 상단에 '무료전시', '힙플레이스' 등 필터 칩 UI 배치.

4. AI 아티(Arti) 스캐너 및 도슨트 (AI Scanner)
스캔 UI: 카메라 뷰파인더 프레임 및 상하 이동 레이저 애니메이션 구현.

분석 로딩: AI 작품 분석 중임을 나타내는 펄스(Pulse) 애니메이션 연출.

결과 페이지: 작품 정보, AI 한마디 해설, 관람 포인트 제공.

오디오 플레이어: 가이드 음성 재생을 위한 미니/하단 고정형 플레이어 UI 최적화.

5. 쇼핑 및 예약 시스템 (GiftShop & Booking)
장바구니/위시리스트:

2열 그리드 레이아웃 및 3단 가로형 리스트 UI 적용.

가격 합산 정규식 로직 개선 및 중복 아이템 Key 충돌 방지.

예약 모달: 날짜 선택기 및 인원 선택 칩(Chip) UI 고도화.

결제 푸터: 하단 플로팅 스타일로 총액 및 결제 버튼 강조.

카카오페이 간편결제 연동(개발자용 테스트 버전)

6. 마이페이지 및 알림 (MyPage & Notification)
프로필 관리: useRef와 FileReader를 활용한 프로필 이미지 실시간 프리뷰 및 변경 기능.

알림 시스템:

실시간 읽음/미읽음 처리 및 상단 레드 닷(Dot) 표시.

알림 설정값 LocalStorage 유지 로직 추가 (새로고침 대응).

활동 기록: '다녀온 전시', '찜한 목록' 등 통계 섹션 및 후기 작성(ReviewForm) 프로세스 구축.

7. 주요 기술적 최적화 (Optimization)
레이아웃 수정: 하단 내비게이션 바에 콘텐츠가 가려지지 않도록 전체적인 padding-bottom 확보.

UX 개선: scrollbar-width: none을 통한 스크롤바 시각적 제거 (기능은 유지).

컴포넌트화: ExhibitCard, NotificationItem, MapPage 등 모듈화를 통한 코드 재사용성 증대.

버그 수정: Vite 환경의 중괄호/삼항 연산자 구문 오류 및 탭 네비게이션 경로 오타 수정.

Last Updated: 2026-02-24


@@@@@@
dasdfsaf
