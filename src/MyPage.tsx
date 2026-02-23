import React, { useState, useRef } from 'react';
import { 
  Settings, Heart, BookOpen, CreditCard, Bell, 
  ChevronRight, Camera, Gift, Package, Ticket, ChevronLeft, PenLine
} from 'lucide-react';

interface MyPageProps {
  isLoggedIn: boolean;       
  setIsLoggedIn: (val: boolean) => void; 
  onLogout?: () => void;     
}

type ViewState = 'main' | 'history' | 'likes' | 'payments' | 'gift' | 'notifSetting' | 'profileEdit' | 'reviews';

const MyPage = ({ isLoggedIn, setIsLoggedIn, onLogout }: MyPageProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewState, setViewState] = useState<ViewState>('main');
  const [giftTab, setGiftTab] = useState<'received' | 'sent'>('received');

  const handleImageClick = () => {
    if (isLoggedIn) fileInputRef.current?.click();
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

  const SubViewHeader = ({ title }: { title: string }) => (
    <div 
      onClick={() => setViewState('main')} 
      style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}
    >
      <ChevronLeft size={24} color="#333" strokeWidth={2.5} />
      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{title}</h4>
    </div>
  );

  const renderContent = () => {
    switch (viewState) {
      case 'history':
        return (
          <div className="sub-view">
            <SubViewHeader title="다녀온 전시 목록" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="list-card-item" style={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer' }}>
                  <div style={{ width: '100%', height: '120px', backgroundColor: '#f5f5f5' }} />
                  <div style={{ padding: '12px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>전시 제목 {i}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>방문 완료</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'likes':
        return (
          <div className="sub-view">
            <SubViewHeader title="보고싶은 전시" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {[1, 2].map(i => (
                <div key={i} className="list-card-item" style={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer' }}>
                  <div style={{ width: '100%', height: '120px', backgroundColor: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={24} color="#ff4d4d" fill="#ff4d4d" />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>찜한 전시 {i}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="sub-view">
            <SubViewHeader title="후기 작성" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map(i => (
                <ListCard 
                  key={i} 
                  icon={<PenLine size={20} color="#10b981" />} 
                  title={`전시 제목 ${i}`} 
                  sub="관람 완료 • 후기를 남겨주세요" 
                  btnLabel="후기 작성" 
                />
              ))}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="sub-view">
            <SubViewHeader title="결제 내역" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map(i => (
                <ListCard key={i} icon={<Ticket size={20} color="#4f46e5" />} title="전시 관람권 (1매)" sub="결제완료 • 2024.03.01" extra="15,000원" />
              ))}
            </div>
          </div>
        );

case 'gift':
        // 🚩 1. 받은 선물 데이터 (received)
        const receivedGifts = [
          { id: 1, title: "한정판 전시 굿즈 패키지", sub: "배송 중 • 2024.03.10", btnLabel: "배송조회" },
          { id: 2, title: "현대미술전 초대권 (2매)", sub: "사용 전 • 2024.03.15", btnLabel: "티켓확인" }
        ];

        // 🚩 2. 보낸 선물 데이터 (sent)
        const sentGifts = [
          { id: 101, title: "반 고흐 포스터 세트", sub: "전달 완료 • 2024.02.20", extra: "결제 완료" },
          { id: 102, title: "뮤지엄 샵 3만원권", sub: "전달 완료 • 2024.02.15", extra: "결제 완료" }
        ];

        // 🚩 3. 현재 탭에 맞는 데이터 선택
        const currentGifts = giftTab === 'received' ? receivedGifts : sentGifts;

        return (
          <div className="sub-view">
            <SubViewHeader title="보유한 선물" />
            
            {/* 탭 버튼 영역 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
              <button 
                onClick={() => setGiftTab('received')} 
                style={{ 
                  flex: 1, padding: '12px', border: 'none', background: 'none', 
                  fontWeight: giftTab === 'received' ? 'bold' : 'normal', 
                  borderBottom: giftTab === 'received' ? '2px solid #000' : 'none', 
                  cursor: 'pointer' 
                }}
              >
                받은 선물함
              </button>
              <button 
                onClick={() => setGiftTab('sent')} 
                style={{ 
                  flex: 1, padding: '12px', border: 'none', background: 'none', 
                  fontWeight: giftTab === 'sent' ? 'bold' : 'normal', 
                  borderBottom: giftTab === 'sent' ? '2px solid #000' : 'none', 
                  cursor: 'pointer' 
                }}
              >
                보낸 선물함
              </button>
            </div>

            {/* 🚩 4. 분리된 데이터를 리스트로 렌더링 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentGifts.map((gift) => (
                <ListCard 
                  key={gift.id} 
                  icon={<Package size={20} color={giftTab === 'received' ? "#666" : "#4f46e5"} />} 
                  title={gift.title} 
                  sub={gift.sub} 
                  btnLabel={gift.btnLabel}
                  extra={gift.extra}
                />
              ))}
              
              {/* 데이터가 아예 없을 때의 처리 (선택사항) */}
              {currentGifts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ccc', fontSize: '14px' }}>
                  선물 내역이 없습니다.
                </div>
              )}
            </div>
          </div>
        );

      case 'notifSetting':
        return (
          <div className="sub-view">
            <SubViewHeader title="알림 설정" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ToggleRow title="전시 추천 알림" desc="내 취향에 맞는 전시 소식을 알려드려요." defaultChecked />
              <ToggleRow title="결제/예매 알림" desc="티켓 예매 및 결제 내역을 보내드립니다." defaultChecked />
              <ToggleRow title="배송 조회 알림" desc="배송이 진행될 때 마다 알림을 보내드립니다." defaultChecked />
            </div>
          </div>
        );

      case 'profileEdit':
        return (
          <div className="sub-view">
            <SubViewHeader title="개인정보 수정" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InputGroup label="닉네임" placeholder="예술가 김아트" />
              <InputGroup label="한 줄 소개" placeholder="미니멀리즘과 현대미술을 사랑하는 탐험가" />
              <InputGroup label="이메일" placeholder="artlover@example.com" />
              <InputGroup label="비밀번호" placeholder="********" type="password" />
              <button 
                className="login-move-btn"
                onClick={() => { alert('수정되었습니다.'); setViewState('main'); }}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#000', color: '#fff' }}
              >
                저장하기
              </button>
            </div>
          </div>
        );

      default:
        return (
          <>
            <div className="menu-group">
              <h4 style={{ fontSize: '12px', color: '#ccc', marginBottom: '15px', letterSpacing: '1px' }}>MY ACTIVITY</h4>
              <MenuRow icon={<BookOpen size={18} />} label="다녀온 전시 목록" onClick={() => setViewState('history')} />
              <MenuRow icon={<Heart size={18} />} label="찜한 전시" onClick={() => setViewState('likes')} />
              <MenuRow icon={<PenLine size={18} />} label="후기 작성" onClick={() => setViewState('reviews')} />
              <MenuRow icon={<CreditCard size={18} />} label="결제 내역" onClick={() => setViewState('payments')} />
              <MenuRow icon={<Gift size={18} />} label="선물함" onClick={() => setViewState('gift')} />
            </div>

            <div className="menu-group" style={{ marginTop: '30px' }}>
              <h4 style={{ fontSize: '12px', color: '#ccc', marginBottom: '15px', letterSpacing: '1px' }}>SETTINGS</h4>
              <MenuRow icon={<Bell size={18} />} label="알림 설정" onClick={() => setViewState('notifSetting')} />
              <MenuRow icon={<Settings size={18} />} label="개인정보 수정" onClick={() => setViewState('profileEdit')} />
            </div>

            <button className={isLoggedIn ? "logout-btn" : "login-move-btn"} onClick={() => isLoggedIn ? setIsLoggedIn(false) : onLogout?.()}>
              {isLoggedIn ? "로그아웃" : "로그인하러 가기"}
            </button>
          </>
        );
    }
  };

  return (
    <div className="main-content-scroll mypage-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <div onClick={handleImageClick} style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #eee' }}>
            {isLoggedIn && profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '30px' }}>👤</span>
            )}
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#444', borderRadius: '50%', padding: '6px', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={14} color="#fff" />
          </div>
          {/* hidden input 위치 보장 */}
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isLoggedIn ? "예술가 김아트님" : "로그인이 필요합니다"}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>미니멀리즘과 현대미술을 사랑하는 탐험가</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '30px' }}>
        <StatCard val={isLoggedIn ? "0" : "-"} label="다녀온 전시" onClick={() => setViewState('history')} />
        <StatCard val={isLoggedIn ? "0" : "-"} label="찜한 전시" onClick={() => setViewState('likes')} />
        <StatCard val={isLoggedIn ? "0" : "-"} label="작성 후기" onClick={() => setViewState('reviews')} />
      </div>

      <hr style={{ border: 'none', height: '1px', backgroundColor: '#f5f5f5', marginBottom: '30px' }} />

      {renderContent()}
      <div style={{ height: '100px' }} />
    </div>
  );
};

// 🚩 아이콘 찌그러짐 방지: flex-shrink: 0 적용
const MenuRow = ({ icon, label, onClick }: any) => (
  <div onClick={onClick} className="menu-row-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '12px', border: '1px solid #f5f5f5', backgroundColor: '#fff', marginBottom: '10px', cursor: 'pointer' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
      <span style={{ color: '#555', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '15px', fontWeight: '500' }}>{label}</span>
    </div>
    <ChevronRight size={16} color="#ccc" style={{ flexShrink: 0 }} />
  </div>
);

const ListCard = ({ icon, title, sub, extra, btnLabel }: any) => (
  <div className="list-card-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderRadius: '15px', border: '1px solid #f0f0f0', backgroundColor: '#fff', marginBottom: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
      <div style={{ width: '40px', height: '40px', backgroundColor: '#f9f9f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#aaa' }}>{sub}</div>
      </div>
    </div>
    {extra && <span style={{ fontWeight: 'bold', fontSize: '13px', marginLeft: '8px', flexShrink: 0 }}>{extra}</span>}
    {btnLabel && <button style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#f5f5f5', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px', flexShrink: 0 }}>{btnLabel}</button>}
  </div>
);

const StatCard = ({ val, label, onClick }: any) => (
  <div onClick={onClick} style={{ padding: '20px 10px', textAlign: 'center', borderRadius: '15px', border: '1px solid #f2f2f2', cursor: 'pointer', backgroundColor: '#fff' }}>
    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{val}</div>
    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{label}</div>
  </div>
);

const ToggleRow = ({ title, desc, defaultChecked }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '12px', backgroundColor: '#f9f9f9', marginBottom: '8px' }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{title}</div>
      <div style={{ fontSize: '11px', color: '#999' }}>{desc}</div>
    </div>
    <input type="checkbox" defaultChecked={defaultChecked} style={{ cursor: 'pointer', flexShrink: 0 }} />
  </div>
);

const InputGroup = ({ label, placeholder, type = "text" }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>{label}</label>
    <input type={type} placeholder={placeholder} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #eee', outline: 'none', fontSize: '14px' }} />
  </div>
);

export default MyPage;