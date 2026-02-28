import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, Heart, BookOpen, CreditCard, Bell, 
  ChevronRight, Camera, Gift, Package, Ticket, ChevronLeft, PenLine, Users,
  Eye, EyeOff, Mic, MessageCircle, Medal, Send, Trash2 
} from 'lucide-react';

// --- 가상의 하위 컴포넌트 ---
const ReviewForm = ({ exhibitionTitle, onComplete }: any) => (
  <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px' }}>
    <p><b>{exhibitionTitle}</b>에 대한 후기를 작성 중...</p>
    <button onClick={onComplete} style={{ width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px' }}>작성 완료</button>
  </div>
);

const SuccessModal = ({ onClose }: any) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
      <h3>🎉 후기 등록 완료!</h3>
      <button onClick={onClose} style={{ marginTop: '20px', padding: '10px 20px' }}>닫기</button>
    </div>
  </div>
);

// --- 1. 타입 정의 ---
interface MyPageProps {
  isLoggedIn: boolean;       
  setIsLoggedIn: (val: boolean) => void; 
  onLogout?: () => void;     
  onTabChange?: (tabName: string) => void; 
}

type ViewState = 'main' | 'history' | 'likes' | 'payments' | 'gift' | 'notifSetting' | 'profileEdit' | 'reviews' | 'writeReview' | 'friend' | 'docent' | 'partner' | 'inquiry';

interface FriendItem {
  id: number;
  email: string;
  name: string;
  memo: string;
}

const BADGE_DETAILS = [
  { id: 1, icon: '🎨', name: '현대미술 탐험가', condition: '현대미술 전시 3회 관람', isLocked: false },
  { id: 2, icon: '🏛️', name: '박물관 매니아', condition: '국립 박물관 5회 방문', isLocked: true },
  { id: 3, icon: '📸', name: '전시회 헌터', condition: '오픈 1주 이내 전시 방문', isLocked: true },
  { id: 4, icon: '💎', name: '미니멀리스트', condition: '미니멀리즘 전시 2회 관람', isLocked: true },
  { id: 5, icon: '🌿', name: '힐링 큐레이터', condition: '자연 테마 전시 3회 관람', isLocked: true },
  { id: 6, icon: '🔍', name: '디테일러', condition: '관람 시간 2시간 이상 3회', isLocked: true },
];

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

const StatCard = ({ val, label, onClick }: any) => (
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

const InputGroup = ({ label, placeholder, type = "text", rightElement }: { label: string, placeholder: string, type?: string, rightElement?: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>{label}</label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input 
        type={type} 
        placeholder={placeholder} 
        style={{ width: '100%', padding: '14px', paddingRight: rightElement ? '45px' : '14px', borderRadius: '10px', border: '1px solid #eee', outline: 'none', fontSize: '14px' }} 
      />
      {rightElement && (
        <div style={{ position: 'absolute', right: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

// --- 3. 메인 MyPage 컴포넌트 ---
const MyPage = ({ isLoggedIn, setIsLoggedIn, onLogout, onTabChange }: MyPageProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewState, setViewState] = useState<ViewState>('main');
  const [giftTab, setGiftTab] = useState<'received' | 'sent'>('received');
  const [selectedExhibition, setSelectedExhibition] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 찜한 전시 상세 정보 상태
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  // 1️⃣ 찜 데이터 불러오기 함수
  const loadWishlist = async () => {
    const savedIds = localStorage.getItem('wishlist');
    const likedIds = savedIds ? JSON.parse(savedIds).map(String) : [];

    if (likedIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/events');
      const result = await response.json();
      const allEvents = result.data || (Array.isArray(result) ? result : []);

      const filtered = allEvents.filter((evt: any, index: number) => {
        const sId = String(evt.id || "");
        const sEventId = String(evt.event_id || "");
        const sIndexId = String(index + 1);
        return likedIds.includes(sId) || likedIds.includes(sEventId) || likedIds.includes(sIndexId);
      });

      setWishlistItems(filtered);
    } catch (err) {
      console.error("로딩 실패", err);
    }
  };

  // 2️⃣ 찜 해제 함수 (e 파라미터 추가해서 에러 해결!)
  const handleRemoveWishlist = (e: React.MouseEvent, id: any) => {
    e.stopPropagation();
    const savedIds = localStorage.getItem('wishlist');
    if (!savedIds) return;

    const likedIds: any[] = JSON.parse(savedIds);
    const updatedIds = likedIds.filter(itemId => String(itemId) !== String(id));
    
    localStorage.setItem('wishlist', JSON.stringify(updatedIds));
    loadWishlist(); // 즉시 리로딩
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener('storage', loadWishlist);
    return () => window.removeEventListener('storage', loadWishlist);
  }, []);
  
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [friendEmail, setFriendEmail] = useState('');
  const [managingFriend, setManagingFriend] = useState<FriendItem | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>([
    { id: 1, email: 'friend1@test.com', name: '친구1', memo: '전시 메이트' },
    { id: 2, email: 'friend2@test.com', name: '친구2', memo: '대학 동기' },
  ]);

  const [reviewItems, setReviewItems] = useState<string[]>([]); 
  
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

  const handleAddFriend = () => {
    if (!friendEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }
    const newFriend: FriendItem = {
      id: Date.now(),
      email: friendEmail,
      name: friendEmail.split('@')[0],
      memo: ''
    };
    setFriends([newFriend, ...friends]);
    setFriendEmail('');
    alert(`${friendEmail} 님이 친구로 추가되었습니다.`);
  };

  const handleDeleteFriend = (id: number) => {
    if (window.confirm("정말 친구를 삭제하시겠습니까?")) {
      setFriends(friends.filter(f => f.id !== id));
      setManagingFriend(null);
    }
  };

  const handleSendTicket = (friend: FriendItem) => {
    setManagingFriend(null);
    setViewState('gift');
    if (onTabChange) onTabChange('gift'); 
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
            {wishlistItems.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '15px',
                padding: '10px 0' 
              }}>
                {wishlistItems.map((item) => (
                  <div key={item.id || item.event_id} style={{ 
                    borderRadius: '15px', 
                    overflow: 'hidden', 
                    border: '1px solid #eee', 
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      width: '100%', 
                      height: '140px', 
                      backgroundImage: `url(${item.image_url || item.main_img || item.img_url})`,
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      <div 
                        onClick={(e) => handleRemoveWishlist(e, item.id || item.event_id)} 
                        style={{ 
                          position: 'absolute', 
                          top: '8px', 
                          right: '8px', 
                          backgroundColor: 'rgba(255,255,255,0.9)', 
                          borderRadius: '50%', 
                          padding: '4px',
                          display: 'flex',
                          cursor: 'pointer',
                          zIndex: 10
                        }}
                      >
                        <Heart size={16} color="#ff4d4d" fill="#ff4d4d" />
                      </div>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        fontWeight: 'bold', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {item.title}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999' }}>
                        {item.place_name || item.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#bbb' }}>
                <Heart size={48} color="#eee" style={{ marginBottom: '15px' }} />
                <p style={{ fontSize: '14px' }}>아직 보고 싶은 전시가 없어요.</p>
              </div>
            )}
          </div>
        );

      case 'reviews':
        return (
          <div className="sub-view">
            <SubViewHeader title="후기 작성" />
            {reviewItems.length > 0 ? (
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '25px', color: '#666', lineHeight: '1.6' }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>작성 된 후기가 없습니다.</p>
                  <p style={{ margin: '4px 0 0', fontSize: '15px' }}>후기를 쓰러 가볼까요? ✨</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedExhibition('새로운 전시 후기');
                    setViewState('writeReview');
                  }}
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#000', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
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
              <ToggleRow title="전시 추천 알림" desc="내 취향에 맞는 전시 소식을 알려드려요." checked={notifSettings.recommend} onChange={() => handleToggle('recommend')} />
              <ToggleRow title="결제/예매 알림" desc="티켓 예매 및 결제 내역을 보내드립니다." checked={notifSettings.payment} onChange={() => handleToggle('payment')} />
              <ToggleRow title="공지사항 알림" desc="중요한 서비스 소식을 알려드려요." checked={notifSettings.notice} onChange={() => handleToggle('notice')} />
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>대표 뱃지 설정</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={selectedBadge?.id || ""} 
                    onChange={(e) => {
                      const badgeId = parseInt(e.target.value);
                      const badge = BADGE_DETAILS.find(b => b.id === badgeId);
                      if (badge && !badge.isLocked) {
                        setSelectedBadge(badge);
                      } else if (badge?.isLocked) {
                        alert("획득하지 못한 뱃지는 대표 뱃지로 설정할 수 없습니다.");
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: '10px', 
                      border: '1px solid #eee', 
                      outline: 'none', 
                      fontSize: '14px',
                      appearance: 'none',
                      backgroundColor: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>대표 뱃지를 선택해주세요</option>
                    {BADGE_DETAILS.map(badge => (
                      <option key={badge.id} value={badge.id} disabled={badge.isLocked}>
                        {badge.isLocked ? `🔒 ${badge.name} (잠김)` : `${badge.icon} ${badge.name}`}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <ChevronRight size={18} color="#999" style={{ transform: 'rotate(90deg)' }} />
                  </div>
                </div>
                {selectedBadge && (
                  <p style={{ fontSize: '11px', color: '#007aff', marginTop: '2px' }}>
                    ✨ 현재 <b>{selectedBadge.name}</b>가 대표 뱃지로 설정되어 있습니다.
                  </p>
                )}
              </div>
              <InputGroup 
                label="비밀번호 변경" 
                placeholder="변경할 비밀번호를 입력하세요" 
                type={showPassword ? "text" : "password"} 
                rightElement={
                  <div onClick={() => setShowPassword(!showPassword)} style={{ display: 'flex', color: '#999' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                }
              /> 
              <button 
                onClick={() => { 
                  alert('개인정보와 대표 뱃지가 수정되었습니다.'); 
                  setViewState('main'); 
                }}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#000', color: '#fff', marginTop: '10px' }}
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

      case 'friend':
        return (
          <div className="sub-view" style={{ position: 'relative', minHeight: '600px' }}>
            <SubViewHeader title="친구" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>친구 추가</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="email" 
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                  placeholder="친구의 이메일을 입력하세요" 
                  style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #eee', outline: 'none', fontSize: '14px' }} 
                />
                <button 
                  onClick={handleAddFriend}
                  style={{ padding: '0 20px', borderRadius: '10px', border: 'none', backgroundColor: '#000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  추가
                </button>
              </div>
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>내 친구 {friends.length}명</p>
                {friends.map(friend => (
                  <ListCard 
                    key={friend.id} 
                    icon={<span>👤</span>} 
                    title={friend.name} 
                    sub={friend.email} 
                    btnLabel="관리" 
                    onBtnClick={() => setManagingFriend(friend)}
                  />
                ))}
              </div>
            </div>
            {managingFriend && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '20px', boxSizing: 'border-box' }}>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '4px', backgroundColor: '#eee', borderRadius: '2px', margin: '0 auto 15px' }} />
                    <h3 style={{ margin: 0, fontSize: '16px' }}><b>{managingFriend.name}</b>님 관리</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => {
                        const newName = prompt('수정할 이름을 입력하세요', managingFriend.name);
                        if (newName && newName.trim()) {
                          setFriends(friends.map(f => f.id === managingFriend.id ? { ...f, name: newName } : f));
                          setManagingFriend(null);
                        }
                      }} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff', color: '#333', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>✏️ 이름 수정하기</button>
                    <button onClick={() => handleSendTicket(managingFriend)} style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#f0f7ff', color: '#007aff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>🎁 전시 초대권 · 굿즈 보내기</button>
                    <button onClick={() => handleDeleteFriend(managingFriend.id)} style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#fff0f0', color: '#ff4d4d', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>삭제하기</button>
                    <button onClick={() => setManagingFriend(null)} style={{ padding: '16px', marginTop: '5px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff', fontSize: '15px', cursor: 'pointer', color: '#999' }}>취소</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'docent':
        return (
          <div className="sub-view">
            <SubViewHeader title="도슨트 권한 신청" />
            <div style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: '#f8fbff', borderRadius: '20px', border: '1px solid #e0eefe', marginBottom: '25px' }}>
              <Mic size={28} color="#007aff" style={{ marginBottom: '15px' }} />
              <p style={{ margin: 0, fontSize: '17px', fontWeight: 'bold' }}>특별한 전시 해설가가 되어보세요!</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InputGroup label="활동명 (닉네임)" placeholder="도슨트로 활동할 이름을 입력해주세요" />
              <InputGroup label="주요 활동 분야" placeholder="예: 현대미술, 서양화, 조각 등" />
              <button 
                onClick={() => { alert('신청되었습니다.'); setViewState('main'); }}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#007aff', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                권한 신청하기
              </button>
            </div>
          </div>
        );

      case 'partner':
        return (
          <div className="sub-view">
            <SubViewHeader title="제휴 및 단체 신청" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><InputGroup label="단체명" placeholder="회사/학교명" /></div>
                <div style={{ flex: 1 }}><InputGroup label="방문 예정 날짜" placeholder="YYYY-MM-DD" type="date" /></div>
              </div>
              <InputGroup label="전시/공연명" placeholder="관람을 희망하는 전시 이름을 입력해주세요" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>도슨트 신청 인원</label>
                <input type="number" placeholder="인원 수를 입력해주세요 (숫자)" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #eee', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <InputGroup label="전달할 사항" placeholder="추가 요청 사항이나 문의 내용을 입력해주세요" />
              <button 
                onClick={() => { alert('제휴 및 단체 신청이 완료되었습니다.'); setViewState('main'); }}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                신청하기
              </button>
            </div>
          </div>
        );

      case 'inquiry':
        return (
          <div className="sub-view">
            <SubViewHeader title="1:1 문의하기" />
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
              <MessageCircle size={40} color="#ccc" style={{ marginBottom: '15px' }} />
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>문의사항이 있으신가요?</p>
              <button 
                style={{ marginTop: '20px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => alert('문의 폼으로 이동합니다.')}
              >
                문의글 작성하기
              </button>
            </div>
          </div>
        );

      case 'gift':
        const gifts = giftTab === 'received' 
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
              {gifts.map((gift) => (
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
              <MenuRow icon={<Users size={18} />} label="친구" onClick={() => setViewState('friend')} />
              <MenuRow icon={<Gift size={18} />} label="선물함" onClick={() => setViewState('gift')} />
            </div>
            <div className="menu-group" style={{ marginTop: '30px' }}>
              <h4 style={{ fontSize: '12px', color: '#ccc', marginBottom: '15px', letterSpacing: '1px' }}>SERVICE</h4>
              <MenuRow icon={<Mic size={18} />} label="도슨트 신청" onClick={() => setViewState('docent')} />
              <MenuRow icon={<Ticket size={18} />} label="제휴 및 단체 신청" onClick={() => setViewState('partner')} />
              <MenuRow icon={<MessageCircle size={18} />} label="1:1 문의" onClick={() => setViewState('inquiry')} />
            </div>
            <div className="menu-group" style={{ marginTop: '30px' }}>
              <h4 style={{ fontSize: '12px', color: '#ccc', marginBottom: '15px', letterSpacing: '1px' }}>SETTINGS</h4>
              <MenuRow icon={<Bell size={18} />} label="알림 설정" onClick={() => setViewState('notifSetting')} />
              <MenuRow icon={<Settings size={18} />} label="개인정보 수정" onClick={() => setViewState('profileEdit')} />
            </div>
            <button 
              onClick={() => isLoggedIn ? setIsLoggedIn(false) : onLogout?.()}
              style={{ width: '100%', padding: '16px', marginTop: '20px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLoggedIn ? "로그아웃" : "로그인하러 가기"}
            </button>
          </>
        );
    }
  };

  return (
    <div className="main-content-scroll mypage-container" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', boxSizing: 'border-box' }}>
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
        <StatCard val={isLoggedIn ? "0" : "-"} label="다녀온 전시" onClick={() => setViewState('history')} />
        <StatCard 
          val={isLoggedIn ? wishlistItems.length.toString() : "-"} 
          label="찜한 전시" 
          onClick={() => setViewState('likes')} 
        />
        <StatCard val={isLoggedIn ? "0" : "-"} label="작성 후기" onClick={() => setViewState('reviews')} />
      </div>

      {viewState === 'main' && (
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ fontSize: '12px', color: '#ccc', marginBottom: '15px', letterSpacing: '1px' }}>MY BADGES</h4>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
            {BADGE_DETAILS.map(badge => (
              <div 
                key={badge.id} 
                onClick={() => setSelectedBadge(badge)}
                style={{ flexShrink: 0, width: '60px', textAlign: 'center', cursor: 'pointer' }}
              >
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f9f9f9', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', 
                  marginBottom: '6px', border: '1px solid #eee',
                  filter: badge.isLocked ? 'grayscale(1) opacity(0.5)' : 'none'
                }}>
                  {badge.isLocked ? '🔒' : badge.icon}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {badge.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <hr style={{ border: 'none', height: '1px', backgroundColor: '#f5f5f5', marginBottom: '30px' }} />

      {renderContent()}

      {selectedBadge && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#fff', width: '280px', borderRadius: '25px', padding: '25px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>{selectedBadge.isLocked ? '🔒' : selectedBadge.icon}</div>
            <h3 style={{ margin: '0 0 8px' }}>{selectedBadge.name}</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>{selectedBadge.condition}</p>
            <button onClick={() => setSelectedBadge(null)} style={{ width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>확인</button>
          </div>
        </div>
      )}
      
      {showModal && (
        <SuccessModal onClose={() => { setShowModal(false); setViewState('main'); }} />
      )}
      
      <div style={{ height: '120px' }} /> 
    </div>
  );
};

export default MyPage;