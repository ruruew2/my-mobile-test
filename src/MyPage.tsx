import React, { useState, useRef } from 'react';
import { Settings, Heart, BookOpen, CreditCard, Bell, ChevronRight, Camera } from 'lucide-react';

// App.tsx에서 전달받을 함수 타입 정의
interface MyPageProps {
  onLogout?: () => void; // 실제 로그인 페이지(Step)로 이동시키는 함수
}

const MyPage = ({ onLogout }: MyPageProps) => {
  // 🚩 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 이미지 클릭 핸들러 (로그인 시에만 작동)
  const handleImageClick = () => {
    if (isLoggedIn) {
      fileInputRef.current?.click();
    }
  };

  // 2. 파일 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

// 3. 버튼 액션 핸들러 (수정 버전)
  const handleAuthAction = () => {
    if (isLoggedIn) {
      // 🚩 [로그아웃 클릭 시]
      // 페이지 이동은 하지 않고, 상태만 false로 바꿔서 문구와 버튼만 교체합니다.
      setIsLoggedIn(false); 
    } else {
      // 🚩 [로그인하러 가기 클릭 시]
      // 이미 isLoggedIn이 false인 상태에서 한 번 더 누르면 그때 로그인 페이지로 보냅니다.
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <div className="main-content-scroll mypage-container">
      {/* 유저 프로필 섹션 */}
      <div className="user-profile-section">
        <div 
          className="profile-img-wrapper" 
          onClick={handleImageClick} 
          style={{ position: 'relative', cursor: isLoggedIn ? 'pointer' : 'default' }}
        >
          <div className="profile-img">
            {isLoggedIn ? (
              profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-preview-img" />
              ) : (
                "👤"
              )
            ) : (
              "?" // 로그아웃 상태 아이콘
            )}
          </div>
          
          {/* 로그인 상태일 때만 카메라 배지 표시 */}
          {isLoggedIn && (
            <div className="camera-badge">
              <Camera size={14} color="#fff" />
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>

        <div className="profile-info">
          {isLoggedIn ? (
            <>
              <h2>예술가 김아트님</h2>
              <p>미니멀리즘과 현대미술을 사랑하는 탐험가</p>
            </>
          ) : (
            <>
              <h2>로그인이 필요합니다</h2>
              <p>전시 기록을 보려면 로그인을 해주세요.</p>
            </>
          )}
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{isLoggedIn ? "12" : "-"}</span>
          <span className="stat-label">다녀온 전시</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{isLoggedIn ? "24" : "-"}</span>
          <span className="stat-label">보관함</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{isLoggedIn ? "3" : "-"}</span>
          <span className="stat-label">작성 로그</span>
        </div>
      </div>

      {/* 나의 활동 메뉴 */}
      <div className="menu-group">
        <h4>My Activity</h4>
        <div className="menu-item">
          <div className="menu-left"><BookOpen size={18} className="menu-icon" /> 다녀온 전시 목록</div>
          <ChevronRight size={18} color="#ccc" />
        </div>
        <div className="menu-item">
          <div className="menu-left"><Heart size={18} className="menu-icon" /> 찜한 전시</div>
          <ChevronRight size={18} color="#ccc" />
        </div>
        <div className="menu-item">
          <div className="menu-left"><CreditCard size={18} className="menu-icon" /> 결제 내역 / 티켓</div>
          <ChevronRight size={18} color="#ccc" />
        </div>
      </div>

      {/* 서비스 설정 메뉴 */}
      <div className="menu-group">
        <h4>Settings</h4>
        <div className="menu-item">
          <div className="menu-left"><Bell size={18} className="menu-icon" /> 알림 설정</div>
          <ChevronRight size={18} color="#ccc" />
        </div>
        <div className="menu-item">
          <div className="menu-left"><Settings size={18} className="menu-icon" /> 개인정보 수정</div>
          <ChevronRight size={18} color="#ccc" />
        </div>
      </div>

      {/* 하단 인증 버튼 (상태에 따라 클래스명과 텍스트 변경) */}
      <button 
        className={isLoggedIn ? "logout-btn" : "login-move-btn"} 
        onClick={handleAuthAction}
      >
        {isLoggedIn ? "로그아웃" : "로그인하러 가기"}
      </button>
    </div>
  );
};

export default MyPage;