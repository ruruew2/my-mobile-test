import React, { useState, useRef } from 'react';
import { 
  Settings, Heart, BookOpen, CreditCard, Bell, 
  ChevronRight, Camera, Gift, Package, Ticket, ChevronLeft, PenLine 
} from 'lucide-react';

// 외부 임포트 컴포넌트
import ReviewForm from './ReviewForm';
import SuccessModal from './SuccessModal_review';

// --- 1. 타입 정의 ---
interface MyPageProps {
  isLoggedIn: boolean;       
  setIsLoggedIn: (val: boolean) => void; 
  onLogout?: () => void;     
}

type ViewState = 'main' | 'history' | 'likes' | 'payments' | 'gift' | 'notifSetting' | 'profileEdit' | 'reviews' | 'writeReview';

// --- 2. 하위 공통 UI 컴포넌트 ---

const MenuRow = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '12px', border: '1px solid #f5f5f5', backgroundColor: '#fff', marginBottom: '10px', cursor: 'pointer' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
      <span style={{ color: '#555', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '15px', fontWeight: '500' }}>{label}</span>
    </div>
    <ChevronRight size={16} color="#ccc" style={{ flexShrink: 0 }} />
  </div>
);

const ListCard = ({ icon, title, sub, extra, btnLabel, onBtnClick }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderRadius: '15px', border: '1px solid #f0f0f0', backgroundColor: '#fff', marginBottom: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
      <div style={{ width: '40px', height: '40px', backgroundColor: '#f9f9f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#aaa' }}>{sub}</div>
      </div>
    </div>
    {extra && <span style={{ fontWeight: 'bold', fontSize: '13px', marginLeft: '8px', flexShrink: 0 }}>{extra}</span>}
    {btnLabel && (
      <button 
        onClick={onBtnClick}
        style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#f5f5f5', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px', flexShrink: 0 }}
      >
        {btnLabel}
      </button>
    )}
  </div>
);

const StatCard = ({ val, label, onClick }: { val: string, label: string, onClick: () => void }) => (
  <div onClick={onClick} style={{ padding: '20px 10px', textAlign: 'center', borderRadius: '15px', border: '1px solid #f2f2f2', cursor: 'pointer', backgroundColor: '#fff' }}>
    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{val}</div>
    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{label}</div>
  </div>
);

const ToggleRow = ({ title, desc, checked, onChange }: { title: string, desc: string, checked: boolean, onChange: () => void }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '12px', backgroundColor: '#f9f9f9', marginBottom: '8px' }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{title}</div>
      <div style={{ fontSize: '11px', color: '#999' }}>{desc}</div>
    </div>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }} 
    />
  </div>
);

const InputGroup = ({ label, placeholder, type = "text" }: { label: string, placeholder: string, type?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>{label}</label>
    <input type={type} placeholder={placeholder} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #eee', outline: 'none', fontSize: '14px' }} />
  </div>
);

// --- 3. 메인 MyPage 컴포넌트 ---

const MyPage = ({ isLoggedIn, setIsLoggedIn, onLogout }: MyPageProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewState, setViewState] = useState<ViewState>('main');
  const [giftTab, setGiftTab] = useState<'received' | 'sent'>('received');
  const [selectedExhibition, setSelectedExhibition] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  // 🚩 후기 목록 상태 (테스트를 위해 빈 배열로 두거나 데이터를 넣어보세요)
  const [reviewItems, setReviewItems] = useState<string[]>([]); 

  // 알림 상태 관리
  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem('user_notif_settings');
    return saved ? JSON.parse(saved) : { recommend: true, payment: true, notice: true };
  });

  const handleToggle = (key: string) => {
    const newSettings = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(newSettings);
    localStorage.setItem('user_notif_settings', JSON.stringify(newSettings));
  };

  const handleImageClick = () => {
    if (isLoggedIn) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const SubViewHeader = ({ title, backTo = 'main' as ViewState }: { title: string, backTo?: ViewState }) => (
    <div 
      onClick={() => setViewState(backTo)} 
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
                <div key={i} style={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer' }}>
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
                <div key={i} style={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer' }}>
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
            {reviewItems.length > 0 ? (
              /* 후기가 있을 때 목록 표시 */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviewItems.map((title, i) => (
                  <ListCard 
                    key={i} 
                    icon={<PenLine size={20} color="#10b981" />} 
                    title={title} 
                    sub="관람 완료 • 후기를 남겨주세요" 
                    btnLabel="후기 작성" 
                    onBtnClick={() => {
                      setSelectedExhibition(title);
                      setViewState('writeReview');
                    }}
                  />
                ))}
              </div>
            ) : (
              /* 🚩 후기가 없을 때 보여줄 화면 (수정됨) */
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '60px 20px', 
                textAlign: 'center' 
              }}>
                <div style={{ marginBottom: '25px', color: '#666', lineHeight: '1.6' }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>작성 된 후기가 없습니다.</p>
                  <p style={{ margin: '4px 0 0', fontSize: '15px' }}>후기를 쓰러 가볼까요? ✨</p>
                </div>
                
                <button 
                  onClick={() => {
                    // 실제로는 전시 목록을 가져오겠지만, 여기선 테스트용으로 '전시 제목 1'을 선택
                    setSelectedExhibition('새로운 전시 후기');
                    setViewState('writeReview');
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: '#000', 
                    color: '#fff', 
                    fontWeight: 'bold', 
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  후기 작성하기
                </button>
              </div>
            )}
          </div>
        );

      case 'writeReview':
        return (
          <div className="sub-view">
            <SubViewHeader title="후기 남기기" backTo="reviews" />
            <ReviewForm 
              exhibitionTitle={selectedExhibition} 
              onComplete={() => { setShowModal(true); }} 
            />
          </div>
        );

      case 'notifSetting':
        return (
          <div className="sub-view">
            <SubViewHeader title="알림 설정" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ToggleRow 
                title="전시 추천 알림" 
                desc="내 취향에 맞는 전시 소식을 알려드려요." 
                checked={notifSettings.recommend} 
                onChange={() => handleToggle('recommend')} 
              />
              <ToggleRow 
                title="결제/예매 알림" 
                desc="티켓 예매 및 결제 내역을 보내드립니다." 
                checked={notifSettings.payment} 
                onChange={() => handleToggle('payment')} 
              />
              <ToggleRow 
                title="공지사항 알림" 
                desc="중요한 서비스 소식을 알려드려요." 
                checked={notifSettings.notice} 
                onChange={() => handleToggle('notice')} 
              />
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
              <InputGroup label="비밀번호 변경" placeholder="변경할 비밀번호를 입력하세요" />
              <button 
                onClick={() => { alert('수정되었습니다.'); setViewState('main'); }}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#000', color: '#fff' }}
              >
                저장하기
              </button>
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
        const currentGifts = giftTab === 'received' 
          ? [{ id: 1, title: "한정판 전시 굿즈 패키지", sub: "배송 중 • 2024.03.10", btnLabel: "배송조회" }]
          : [{ id: 101, title: "반 고흐 포스터 세트", sub: "전달 완료 • 2024.02.20", extra: "결제 완료" }];

        return (
          <div className="sub-view">
            <SubViewHeader title="보유한 선물" />
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
              <button onClick={() => setGiftTab('received')} style={{ flex: 1, padding: '12px', border: 'none', background: 'none', fontWeight: giftTab === 'received' ? 'bold' : 'normal', borderBottom: giftTab === 'received' ? '2px solid #000' : 'none', cursor: 'pointer' }}>받은 선물함</button>
              <button onClick={() => setGiftTab('sent')} style={{ flex: 1, padding: '12px', border: 'none', background: 'none', fontWeight: giftTab === 'sent' ? 'bold' : 'normal', borderBottom: giftTab === 'sent' ? '2px solid #000' : 'none', cursor: 'pointer' }}>보낸 선물함</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentGifts.map((gift) => (
                <ListCard key={gift.id} icon={<Package size={20} color={giftTab === 'received' ? "#666" : "#4f46e5"} />} title={gift.title} sub={gift.sub} btnLabel={gift.btnLabel} extra={gift.extra} />
              ))}
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

            <button 
              onClick={() => isLoggedIn ? setIsLoggedIn(false) : onLogout?.()}
              style={{ width: '100%', padding: '16px', marginTop: '20px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLoggedIn ? "로그아웃" : "로그인하러 가기"}
            </button>
          </>
        );
    }
  };

  return (
    <div className="main-content-scroll mypage-container" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100%' }}>
      {/* 프로필 헤더 */}
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
        <StatCard val={isLoggedIn ? "3" : "-"} label="다녀온 전시" onClick={() => setViewState('history')} />
        <StatCard val={isLoggedIn ? "2" : "-"} label="찜한 전시" onClick={() => setViewState('likes')} />
        <StatCard val={isLoggedIn ? "0" : "-"} label="작성 후기" onClick={() => setViewState('reviews')} />
      </div>

      <hr style={{ border: 'none', height: '1px', backgroundColor: '#f5f5f5', marginBottom: '30px' }} />

      {renderContent()}
      
      {showModal && (
        <SuccessModal onClose={() => { setShowModal(false); setViewState('main'); }} />
      )}
      
      <div style={{ height: '120px' }} /> 
    </div>
  );
};

export default MyPage;