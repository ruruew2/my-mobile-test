# 🎨 ART-LOG: 개인 맞춤형 전시 큐레이션 플랫폼

> **AI 기술을 활용하여 예술적 경험을 데이터로 기록하고, 사용자 취향에 맞는 전시를 추천하는 개인화 플랫폼입니다.**
> MZ세대와 해외 관광객을 타겟으로 하며, AI 도슨트와 인터랙티브 지도를 통해 전시 관람의 문턱을 낮춥니다.

---

## 📅 프로젝트 개요

- **핵심 가치:** AI 큐레이션, 실시간 전시 지도, AI 도슨트 이미지 스캔, 개인화 기록 관리
- **배포 URL:** *(배포 후 링크 추가 예정)*
- **주요 특징:**
  - OpenAI GPT-4o & TTS를 활용한 4개 국어 실시간 AI 도슨트 가이드
  - 라이브러리 없는 순수 JS 드래그/스냅 바텀 시트 구현으로 성능 최적화
  - 프론트엔드-백엔드 데이터 정합성 최적화 및 에러 핸들링

---

## 🛠 기술 스택

### Frontend

- **Framework:** `React`, `TypeScript`, `Vite`
- **Styling:** `Pure CSS (BEM)`, `Lucide-React (Icons)`
- **Interaction:** `Framer-motion` (일부), `Pure JS (Touch Events)`

### Backend & API

- **API:** `Kakao Maps API`, `Portone (결제)`
- **AI Service:** `OpenAI GPT-4o (Vision)`, `TTS-1 (Nova)`
- **Deployment:** `Vercel`

---

## 🧠 핵심 기술 포인트

- AI Vision 기반 작품 분석 시스템
- 모바일 UX 최적화를 위한 Custom Bottom Sheet 구현
- OpenAI TTS 기반 다국어 AI 도슨트
- Vercel 배포 환경에서의 CORS / Mixed Content 해결

---

## 📸 Preview

### 메인 화면
<img src="./assets/main.png" width="700"/>

### AI 작품 스캔
<img src="./assets/scan.png" width="700"/>

### 전시 지도
<img src="./assets/map.png" width="700"/>

### AI 도슨트 플레이어
<img src="./assets/player.png" width="700"/>

---

## 🚀 주요 구현 기능

### 1. 사용자 경험 중심의 UI/UX

- **모바일 최적화:** Viewport 설정 및 폰트 사이즈(16px) 최적화를 통해 입력 시 화면 강제 확대 방지.
- **인터랙티브 지도:**
  - `Geolocation API` 연동 및 카카오맵 기반 위치 서비스 제공.
  - 라이브러리 없이 **순수 JS(Touch Event)**로 드래그 및 스냅 기능의 커스텀 바텀 시트 구현.
- **스마트 내비게이션:** `scrollIntoView`를 활용해 코스 선택 시 해당 섹션으로 자동 스크롤되는 UX 제공.

### 2. AI 도슨트 스캔 (AI Scanner)

- **이미지 분석:** `GPT-4o Vision` 모델을 활용해 작품 사진 분석 후 제목, 작가, 의미 추출.
- **오디오 가이드:** OpenAI `TTS-1` 모델의 'Nova' 보이스를 활용한 고품질 음성 해설 제공.
- **다국어 지원:** 한국어, 영어, 일어, 중어 4개 국어 실시간 번역 및 가이드 생성.
- **UI 최적화:** 해설 페이지 출력 및 하단 고정형 미니 플레이어 구축.

### 3. 커머스 및 관리 시스템

- **결제 시스템:** `Portone` 연동 및 모바일 결제 대응(iOS 카드사 앱 복귀를 위한 `app_scheme` 처리).
- **상태 기반 뷰 전환:** `viewState`를 활용해 프로필, 전시 기록, 친구 관리 등 복잡한 메뉴를 단일 페이지 내에서 매끄럽게 전환.
- **실시간 프리뷰:** `useRef`와 `FileReader`를 활용해 서버 업로드 전 프로필 이미지 실시간 변경 기능 구현.

---

## 🛠 기술적 해결 및 최적화 (Troubleshooting)

### 1. API 통신 및 데이터 정합성 해결

- **문제:** 서버 응답 데이터 형식과 프론트엔드 변수명 불일치로 인한 화면 렌더링 중단.
- **해결:** **Optional Chaining(`?.`)** 및 기본값 할당 로직을 도입하여 데이터 누락 시에도 런타임 에러 방지.
- **백엔드 연동:** `User 엔티티` 구조에 맞춘 파라미터 최적화 및 `accessToken` LocalStorage 저장 로직 구현.

### 2. AI 서비스 안정화 (OpenAI API)

- **인증 오류 해결:** API 키 만료 및 형식 오류 수정 후 `load_dotenv()`를 통한 서버 인식 프로세스 정비.
- **데이터 구조 매핑:** `ai_service.py`와 `main.py` 간의 데이터 참조 경로(`plan["places"]`) 불일치 수정 및 `get()` 메서드를 통한 방어 코드 작성.
- **UX 보강:** `try-catch-finally` 구문을 활용하여 성공/실패 여부와 관계없이 로딩 상태를 해제(`setIsGenerating(false)`)하도록 로직 보강.

### 3. 성능 및 코드 구조 개선

- **컴포넌트 모듈화:** `ExhibitCard`, `NotificationItem` 등 공통 UI 분리를 통해 재사용성 향상.
- **스크롤 UX:** `scrollbar-width: none`을 통해 브라우저 스크롤바를 숨겨 디자인 완성도를 높이되 기능은 유지.
- **상태 유지:** LocalStorage를 활용하여 새로고침 시에도 사용자 알림 설정값 등이 유지되도록 설계.

### 4. API 통신 및 네트워크 최적화

- **엔드포인트 교정:** 서버 로그의 404 Not Found 분석을 통해 API 기본 경로와 요청 파라미터(`?loginId=`) 간의 불일치를 해결하여 데이터베이스 대조 무결성 확보.
- **로컬 개발 환경 동기화:** `net::ERR_CONNECTION_REFUSED` 에러 대응을 위해 Spring Boot 서버 실행 상태 점검 및 포트(8080) 점검 프로세스 수립.
- **안정적인 비동기 처리:** 리액트 컴포넌트 생명주기 밖에서 호출된 `await` 구문을 함수 내부로 캡슐화하여 런타임 안정성 강화.

#### 4-1. AI API 테스트 및 배포 환경 연동 🔧

AI 기능 검증을 위해 Python 기반 AI 서버를 로컬에서 실행하여 프론트엔드와 API 연동 테스트를 진행했습니다.

**로컬 테스트**
- `main.py` 실행을 통한 AI API 서버 구동
- `ai_service.py` 기반 이미지 분석 로직 테스트
- OpenAI Vision API 응답 데이터 구조 확인
- 프론트엔드와 API 통신 검증

**배포 환경 테스트**
- 환경 변수 기반 API 엔드포인트 관리
- Vercel 배포 환경에서 AI API 연동 확인
- 배포 환경에서 발생한 네트워크 및 CORS 이슈 점검

### 5. 배포 및 환경 최적화 (Deployment & Environment)

- **Vercel 기반 클라우드 배포:** 로컬 개발 환경을 넘어 Vercel 플랫폼을 통한 프론트엔드 배포를 완료하고, 실서비스 환경에서의 안정적인 동작 확인.
- **크로스 도메인 DB 연동:** 배포된 Vercel 앱과 원격 데이터베이스 간의 연결 설정을 최적화하여, 환경(Local/Production)에 관계없이 동일한 데이터 정합성 유지.
- **환경 변수 관리:** API 주소 및 민감한 설정 정보를 환경 변수로 분리 관리하여 보안성을 강화하고, 배포 환경별 동적 엔드포인트 할당 구현.
- **CORS 이슈 해결:** 서로 다른 도메인 간의 자원 공유 문제를 해결하여 배포 환경에서도 브라우저 차단 없이 백엔드 API와의 원활한 통신 구조 확보.
- **Mixed Content 대응:** HTTPS 배포 환경에서 HTTP 백엔드 API 호출 시 발생하는 브라우저 차단 이슈를 확인하고, 추후 SSL 인증서 적용을 통한 전 구간 암호화 통신 필요성을 도출.

---

## 💡 향후 계획

- '나들이 코스' 및 '기프트' 탭의 세부 기능 고도화 (현재 레이아웃 단계)
- AI 도슨트의 페르소나 다양화 기능 추가
- SSL 인증서 적용을 통한 전 구간 HTTPS 통신 전환