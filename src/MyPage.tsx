import React, { useState, useRef } from 'react';
import { Settings, Heart, BookOpen, CreditCard, Bell, ChevronRight, LogOut, Camera } from 'lucide-react';

// App.tsx에서 전달받을 로그아웃 함수 타입 정의
interface MyPageProps {
  onLogout?: () => void;
}

const MyPage = ({ onLogout }: MyPageProps) => {
  // 🚩 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 실제 앱에서는 전역 상태나 서버 데이터로 관리
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 영역 클릭 시 이미지 업로드 (로그인 상태일 때만)
  const handleImageClick = () => {
    if (isLoggedIn) {
      fileInputRef.current?.click();
    }
  };

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

  // 로그아웃 버튼 클릭 시 실행
  const handleLogoutAction = () => {
    setIsLoggedIn(false); // 화면을 "로그인이 필요합니다" 상태로 전환
    if (onLogout) {
      // 0.5초 뒤에 실제 로그인 페이지로 이동 (사용자가 바뀐 화면을 잠시 볼 수 있게)
      setTimeout(() => {
        onLogout();
      }, 500);
    }
  };

  return (
    <div className="main-content-scroll mypage-container">
      {/* 유저 프로필 섹션 */}
      <div className="user-profile-section">
        <div className="profile-img-wrapper" onClick={handleImageClick} style={{ position: 'relative', cursor: 'pointer' }}>
          <div className="profile-img">
            {isLoggedIn ? (
              profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-preview-img" />
              ) : (
                "👤"
              )
            ) : (
              "?" // 로그아웃 시 물음표나 기본 아이콘
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

      {/* 나의 활동 메뉴 (순서 변경 적용) */}
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

      {/* 로그아웃 버튼 */}
      {isLoggedIn && (
        <button className="logout-btn" onClick={handleLogoutAction}>
          로그아웃
        </button>
      )}
    </div>
  );
};

export default MyPage;