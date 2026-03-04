import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, Heart, BookOpen, CreditCard, Bell, 
  ChevronRight, Camera, Gift, Package, Ticket, ChevronLeft, PenLine, Users,
  Eye, EyeOff, Mic, MessageCircle, Medal, Send, Trash2, Star, X 
} from 'lucide-react';
import { dummyUser } from './ProfileData';

const API_BASE_URL = 'http://54.180.234.226:8080/api';// 👈 실제 백엔드 IP 주소

type FriendDto = { 
  friendUserId: number; 
  email: string; 
  friendName: string; 
};

// 닉네임 미선택시 자동 랜덤 닉네임
const getRandomNickname = () => {
  const adjectives = ["행복한", "고독한", "예리한", "빛나는", "신비로운"];
  const nouns = ["예술가", "탐험가", "관람객", "큐레이터", "수집가"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}${Math.floor(Math.random() * 100)}`;
};

// --- 4. 후기 등록 성공 모달 (추가 코드) ---
const SuccessModal = ({ onClose }: { onClose: () => void }) => (
  <div style={{ 
    position: 'fixed', top: 0, left: -30, width: '100%', height: '100%', 
    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', zIndex: 3000, padding: '20px' 
  }}>
    <div style={{ 
      backgroundColor: '#fff', width: '100%', maxWidth: '320px', 
      borderRadius: '24px', padding: '30px', textAlign: 'center',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    }}>
      <div style={{ 
        width: '60px', height: '60px', backgroundColor: '#f0fdf4', 
        borderRadius: '50%', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', margin: '0 auto 20px' 
      }}>
        <Medal size={30} color="#22c55e" />
      </div>
      <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 'bold' }}>후기 등록 완료!</h3>
      <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '25px' }}>
        소중한 감상평을 남겨주셔서 감사합니다.<br/>작성하신 후기는 다른 분들께 큰 도움이 돼요.
      </p>
      <button 
        onClick={onClose}
        style={{ 
          width: '100%', padding: '15px', backgroundColor: '#000', 
          color: '#fff', border: 'none', borderRadius: '12px', 
          fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' 
        }}
      >
        확인
      </button>
    </div>
  </div>
);

// --- 사용자님이 만드신 진짜 리뷰 폼 ---
const ReviewForm = ({ exhibitionTitle, onComplete }: { exhibitionTitle: string; onComplete: () => void }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_CHARS = 500;
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      alert("사진은 최대 5장까지 가능합니다.");
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ padding: '5px' }}>
      <div style={{ marginBottom: '25px' }}>
        <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>전시 정보</p>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{exhibitionTitle}</h3>
      </div>

      <div style={{ marginBottom: '25px', padding: '24px', backgroundColor: '#fcfcfc', borderRadius: '18px', border: '1px solid #f0f0f0', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600' }}>전시는 어떠셨나요?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <Star 
              key={num} size={35} 
              onClick={() => setRating(num)}
              onMouseEnter={() => setHoverRating(num)}
              onMouseLeave={() => setHoverRating(0)}
              color={(hoverRating || rating) >= num ? "#FFD700" : "#ddd"} 
              fill={(hoverRating || rating) >= num ? "#FFD700" : "none"}
              style={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: (hoverRating || rating) >= num ? 'scale(1.2)' : 'scale(1)' 
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>감상평</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder="작품을 통해 느낀 감동이나 전시 분위기를 자유롭게 적어주세요."
          style={{ 
            width: '100%', height: '160px', padding: '15px', borderRadius: '12px', 
            border: '1px solid #eee', outline: 'none', fontSize: '14px', resize: 'none',
            lineHeight: '1.6', backgroundColor: '#fafafa'
          }}
        />
        <div style={{ textAlign: 'right', fontSize: '12px', color: content.length >= MAX_CHARS ? '#ff4d4d' : '#aaa', marginTop: '5px' }}>
          {content.length} / {MAX_CHARS}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>사진 첨부</label>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed #ccc',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, backgroundColor: '#fff'
            }}
          >
            <Camera size={24} color="#aaa" />
            <span style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{images.length}/5</span>
            <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleFileChange} />
          </div>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <img src={img} alt="preview" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
              <X 
                size={16} 
                style={{ position: 'absolute', top: -5, right: -5, backgroundColor: '#333', color: '#fff', borderRadius: '50%', padding: '2px', cursor: 'pointer' }} 
                onClick={() => setImages(images.filter((_, i) => i !== idx))}
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onComplete}
        disabled={!rating || !content}
        style={{ 
          width: '100%', padding: '18px', borderRadius: '15px', border: 'none', 
          backgroundColor: (!rating || !content) ? '#ccc' : '#000', 
          color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
        }}
      >
        등록 완료
      </button>
    </div>
  );
};
// --- 1. 타입 정의 ---
interface MyPageProps {
  isLoggedIn: boolean;       
  setIsLoggedIn: (val: boolean) => void; 
  onLogout?: () => void;     
  onTabChange?: (tabName: string) => void; 
}

type ViewState = 'main' | 'history' | 'likes' | 'payments' | 'gift' | 'notifSetting' | 'profileEdit' | 'reviews' | 'writeReview' | 'friend' | 'docent' | 'partner' | 'inquiry';

interface FriendItem {
  friendUserId: number; // id 대신 friendUserId를 추가하거나 함께 정의
  id: number;           
  email: string;
  name: string;
  friendName?: string;  // 백엔드 필드명 대비용
  memo: string;
}

const BADGE_DETAILS = [
  { 
    id: 1, 
    icon: '🎨', 
    name: '현대미술 탐험가', 
    condition: '현대미술 전시 3회 관람', 
    isLocked: false, 
    reward: '현대 미술관 도슨트 50% 할인권' // 👈 이 줄을 꼭 추가해주세요!
  },
      {
        id: 2,
        icon: '🏛️',
        name: '박물관 매니아',
        condition: '국립 박물관 5회 방문',
        isLocked: false,
        reward: '국립 박물관 특별 전시 무료 입장권',
    }, // 💡 이 부분이 팝업에 표시됩니다.

    
    { id: 3, icon: '📸', name: '전시회 헌터', condition: '오픈 1주 이내 전시 방문', isLocked: true },
    { id: 4, icon: '✍️', name: '리뷰 마스터', condition: '후기 3회 작성', isLocked: true },
    { id: 5, icon: '🌿', name: '힐링 큐레이터', condition: '자연 테마 전시 3회 관람', isLocked: true },
    { id: 6, icon: '🔍', name: '디테일러', condition: '관람 시간 2시간 이상 3회', isLocked: true },
    { id: 7, icon: '💎', name: '미니멀리스트', condition: '미니멀리즘 전시 2회 관람', isLocked: true },

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
  const [userInfo, setUserInfo] = useState<any>(null); // 👈 실제 유저 정보를 담을 곳
  const [isLoading, setIsLoading] = useState(false);
  
  // 찜한 전시 상세 정보 상태
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);



  

// 335번대: 찜 목록 불러오기
const loadWishlist = async () => {
  if (!isLoggedIn) return;
  setIsLoading(true);
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`http://54.180.234.226:8080/api/favorites`, { // 8080 명시
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) { setWishlistItems([]); return; }
    
    const result = await res.json();
    // 백엔드 응답이 { data: [...] } 형태인지, 아니면 바로 [...] 형태인지 확인 필요
    const actualData = result.data || result; 
    setWishlistItems(Array.isArray(actualData) ? actualData : []);
  } catch (e) {
    console.error('찜 목록 통신 오류:', e);
    setWishlistItems([]);
  } finally { setIsLoading(false); }
};




// 3. 친구 목록 불러오기
const loadFriends = async () => {
  if (!isLoggedIn) return;
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_BASE_URL}/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { setFriends([]); return; }
    const data = await res.json();
    setFriends(Array.isArray(data) ? data : []);
  } catch (e) { console.error(e); setFriends([]); }
};




// MyPage.tsx 내의 useEffect 수정

useEffect(() => {
  if (isLoggedIn) {
    loadWishlist(); 
    loadFriends();
  }
}, [isLoggedIn, viewState]); // viewState를 추가하여 탭을 이동할 때마다 최신화





// 364번대: 찜 삭제 수정
const handleRemoveWishlist = async (e: React.MouseEvent, item: any) => {
  e.stopPropagation();
  if (!isLoggedIn) return;
  const token = localStorage.getItem('accessToken');
  
  // item 구조에 따라 eventId를 가져오는 경로가 다를 수 있음
  const eventId = item?.eventId || item?.id; 
  if (!eventId) return;

  try {
    const res = await fetch(`http://54.180.234.226:8080/api/favorites?eventId=${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (res.ok) {
      // 갱신 방법 1: 서버에서 다시 불러오기
      await loadWishlist();
      // 갱신 방법 2: (더 빠름) 로컬 상태에서 즉시 제거
      // setWishlistItems(prev => prev.filter(i => (i.eventId || i.id) !== eventId));
    }
  } catch (err) { console.error(err); }
};


useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 유저 정보를 가져옴
    const savedUser = localStorage.getItem('artLogUser');
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
    }
  }, [isLoggedIn]); // 로그인 상태가 변할 때마다 확인
  
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [myProfileBadge, setMyProfileBadge] = useState<any>(null); // 👈 이거 한 줄 추가!
  const [friendEmail, setFriendEmail] = useState('');
  const [managingFriend, setManagingFriend] = useState<FriendDto | null>(null);
  const [friends, setFriends] = useState<FriendDto[]>([]);

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

// 4. 친구 추가 (기존 handleAddFriend 교체)
const handleAddFriend = async () => {
  const email = friendEmail.trim();
  if (!email) return alert('이메일을 입력해주세요.');
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_BASE_URL}/friends`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return alert('친구 추가 실패');
    setFriendEmail('');
    await loadFriends();
    alert(`${email} 님이 추가되었습니다.`);
  } catch (e) { console.error(e); }
};



// 5. 친구 수정/삭제
const renameFriend = async (friendUserId: number, friendName: string) => {
  const token = localStorage.getItem('accessToken');
  await fetch(`${API_BASE_URL}/friends/${friendUserId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ friendName }),
  });
};

const deleteFriend = async (friendUserId: number) => {
  const token = localStorage.getItem('accessToken');
  await fetch(`${API_BASE_URL}/friends/${friendUserId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};


// 405번대: 친구 삭제
const handleDeleteFriend = async (friendUserId: number) => {
  if (!window.confirm("정말 친구를 삭제하시겠습니까?")) return;
  try {
    const token = localStorage.getItem('accessToken');
    // 백엔드 API 명세에 따라 URL 확인 필요 (예: /friends/${friendUserId})
    await fetch(`${API_BASE_URL}/friends/${friendUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setManagingFriend(null);
    await loadFriends(); // 삭제 후 목록 갱신
  } catch (e) { console.error(e); }
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


  // 310라인 부근 상태 선언부
const [historyEvents, setHistoryEvents] = useState<any[]>([]); // DB에서 가져온 전시 저장

// 페이지가 열릴 때 DB에서 전시 목록을 가져옵니다.
useEffect(() => {
  fetch("http://localhost:8000/api/events") // 서버 주소에 맞게 수정하세요!
    .then(res => res.json())
    .then(res => {
      if (res.status === "success") {
        // 가져온 전체 데이터 중 랜덤으로 3개만 뽑아서 저장
        const shuffled = res.data.sort(() => 0.5 - Math.random());
        setHistoryEvents(shuffled.slice(0, 3));
      }
    })
    .catch(err => console.error("데이터 로딩 실패:", err));
}, []);

  const renderContent = () => {
    switch (viewState) {
case 'history':
        return (
          <div className="sub-view">
            <SubViewHeader title="다녀온 전시 목록" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {historyEvents.length > 0 ? (
                historyEvents.map((evt, i) => (
                  <div key={i} style={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', backgroundColor: '#fff' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '120px', 
                      backgroundColor: '#f5f5f5',
                      backgroundImage: `url(${evt.image_url || 'https://via.placeholder.com/150'})`, // DB의 이미지 URL 사용
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />
                    <div style={{ padding: '12px' }}>
                      <p style={{ 
                        margin: 0, fontSize: '14px', fontWeight: 'bold',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                      }}>
                        {evt.title}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999' }}>
                        {evt.place_name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ gridColumn: 'span 2', textAlign: 'center', color: '#999', padding: '20px' }}>
                  불러올 전시 데이터가 없습니다.
                </p>
              )}
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
                    setSelectedExhibition('예풍 신작 낭독쇼케이스, 기억 I'); 
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

        

case 'writeReview': // 👈 "후기 작성하기" 버튼을 누르면 이리로 옵니다!
        return (
          <div className="sub-view">
            <SubViewHeader title="후기 남기기" backTo="reviews" />
            <ReviewForm 
              exhibitionTitle={selectedExhibition} 
              onComplete={() => { 
                setShowModal(true); 
              }} 
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
        {/* placeholder 대신 defaultValue를 사용해 기존 데이터를 보여줍니다 */}
{/* MyPage.tsx의 profileEdit 섹션 */}
<InputGroup 
          label="닉네임" 
          // 서버에서 온 실제 닉네임, 데이터가 없으면 '닉네임 없음' 표시
          placeholder={userInfo?.nickname || "닉네임을 입력하세요"} 
        />
        
        <InputGroup 
          label="한 줄 소개" 
          // 서버 데이터 필드명에 따라 bio 또는 message 등으로 수정하세요
          placeholder={userInfo?.bio || "한 줄 소개를 입력하세요"} 
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>대표 뱃지 설정</label>
          <div 
            style={{ position: 'relative' }}
            onClick={(e) => e.stopPropagation()} 
          >
            <select 
              value={myProfileBadge?.id || ""} 
              onChange={(e) => {
                const badgeId = parseInt(e.target.value);
                const badge = BADGE_DETAILS.find(b => b.id === badgeId);
                
                if (badge && !badge.isLocked) {
                  setMyProfileBadge(badge); // 👈 여기만 변경 (모달용 상태는 건드리지 않음!)
                } else if (badge?.isLocked) {
                  alert("획득하지 못한 뱃지는 대표 뱃지로 설정할 수 없습니다.");
                }
              }}
              style={{ 
                width: '100%', padding: '14px', borderRadius: '10px', 
                border: '1px solid #eee', outline: 'none', fontSize: '14px',
                backgroundColor: '#fff', cursor: 'pointer',
                appearance: 'none'
              }}
            >
              <option value="" disabled>대표 뱃지를 선택해주세요</option>
              {BADGE_DETAILS.map(badge => (
                <option key={badge.id} value={badge.id} disabled={badge.isLocked}>
                  {badge.isLocked ? `🔒 ${badge.name}` : `${badge.icon} ${badge.name}`}
                </option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <ChevronRight size={18} color="#999" style={{ transform: 'rotate(90deg)' }} />
            </div>
          </div>
          
          {myProfileBadge && (
            <p style={{ fontSize: '11px', color: '#007aff', marginTop: '2px' }}>
              ✨ 현재 <b>{myProfileBadge.name}</b>가 선택되었습니다.
            </p>
          )}
        </div>
        
        <button 
          onClick={() => {
            // 🚨 중요: 여기서 setSelectedBadge(myProfileBadge)를 지웠습니다!
            // 대신 나중에 메인 프로필 화면에서 뱃지를 보여줄 때 myProfileBadge를 쓰도록 하면 됩니다.
            alert("개인정보가 수정되었습니다.");
            setViewState('main');
          }}
          style={{ 
            marginTop: '10px', width: '100%', padding: '16px', borderRadius: '12px', 
            border: 'none', backgroundColor: '#000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' 
          }}
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
    key={friend.friendUserId} // id 대신 friendUserId
    title={friend.friendName || friend.email} // name 대신 friendName
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
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                      <b>{managingFriend.friendName || managingFriend.email}</b>님 관리
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* 1. 이름 수정 버튼 */}
                    <button
                      onClick={async () => {
                        const currentName = managingFriend.friendName || managingFriend.email || '';
                        const newName = prompt('수정할 이름을 입력하세요', currentName);

                        if (managingFriend && newName && newName.trim()) {
                          try {
                            await renameFriend(managingFriend.friendUserId, newName.trim());
                            setManagingFriend(null);
                            await loadFriends();
                          } catch (e) {
                            alert('이름 수정 실패');
                          }
                        }
                      }} 
                      style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff', color: '#333', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                    >
                      ✏️ 이름 수정하기
                    </button>

                    {/* 2. 초대권 보내기 */}
                    <button 
                      onClick={() => handleSendTicket(managingFriend as any)} 
                      style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#f0f7ff', color: '#007aff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                    >
                      🎁 전시 초대권 · 굿즈 보내기
                    </button>

                    {/* 3. 삭제하기 버튼 */}
                    <button
                      onClick={async () => {
                        if (!managingFriend) return;
                        if (!window.confirm('정말 친구를 삭제하시겠습니까?')) return;

                        try {
                          await deleteFriend(managingFriend.friendUserId);
                          setManagingFriend(null);
                          await loadFriends();
                        } catch (e) {
                          alert('삭제 실패');
                        }
                      }}
                      style={{ padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#fff0f0', color: '#ff4d4d', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                    >
                      친구 삭제하기
                    </button>

                    {/* 4. 취소 버튼 */}
                    <button 
                      onClick={() => setManagingFriend(null)} 
                      style={{ padding: '16px', marginTop: '5px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff', fontSize: '15px', cursor: 'pointer', color: '#999' }}
                    >
                      취소
                    </button>
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
  onClick={() => {
    // 1. 저장된 로그인 정보 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('artLogUser');
    
    // 2. 로그인 상태 해제
    setIsLoggedIn(false);
    
    // 3. 로그아웃 후 로그인 화면이 바로 나오도록 새로고침 (가장 확실한 방법)
    alert("로그아웃 되었습니다.");
    window.location.reload(); 
  }}
  style={{ 
    width: '100%', 
    padding: '16px', 
    marginTop: '20px', 
    borderRadius: '12px', 
    border: '1px solid #eee', 
    backgroundColor: '#ffffff', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    color: '#ff4d4d' // 로그아웃 느낌이 나도록 빨간색 강조 (선택사항)
  }}
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
  {/* 1️⃣ 칭호/뱃지 디자인 (추가 및 수정) */}
  {myProfileBadge && (
    <div style={{ 
      display: 'inline-flex', // 글자 크기에 딱 맞게
      alignItems: 'center', 
      gap: '4px', // 아이콘과 글자 사이 간격
      marginBottom: '10px', // 이름과의 간격
      
      // 디자인 핵심: 테두리와 배경, 둥근 모서리
      border: '1px solid #7C4DFF', // 보라색 테두리
      backgroundColor: 'rgb(255, 240, 245)', // 아주 연한 보라색 배경
      padding: '3px 8px', // 안쪽 여백
      borderRadius: '20px', // 완전 둥글게 (캡슐 모양)
      
      // 폰트 크기를 확 줄여서 아기자기하게
      fontSize: '10px', 
      fontWeight: 'bold', 
      color: '#7265ff', 
      
      // 입체감을 위한 미세한 그림자
      boxShadow: '0 1px 2px rgba(124, 77, 255, 0.1)',
      
      // 움직이는 효과 유지 (원하시면 빼셔도 됩니다)
      animation: 'bounce 2s infinite' 
    }}>
      {/* 아이콘 크기 살짝만 크게 */}
      <span style={{ fontSize: '12px' }}>{myProfileBadge.icon}</span>
      {/* 뱃지 이름 표시 */}
      <span>{myProfileBadge.name}</span>
    </div>
  )}



<h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
  {isLoggedIn 
    ? (userInfo?.nickname || userInfo?.loginId || "예술가님") // 👈 dummyUser 대신 userInfo 사용!
    : "로그인이 필요합니다"}
</h2>
  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
    {dummyUser.bio}
  </p>
        </div>
      </div>

      

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '30px' }}>
        <StatCard val={isLoggedIn ? "3" : "-"} label="다녀온 전시" onClick={() => setViewState('history')} />
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
                onClick={() => {
  // 최신 BADGE_DETAILS에서 해당 뱃지의 정보를 다시 찾아와서 넣어줍니다.
  const latestBadgeInfo = BADGE_DETAILS.find(b => b.id === badge.id);
  setSelectedBadge(latestBadgeInfo || badge);
}}
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




      {/* 🚀 여기서부터 [뱃지 상세 팝업] 교체 시작 */}
      {selectedBadge && viewState === 'main' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              width: '320px',
              borderRadius: '35px',
              padding: '40px 30px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              animation: 'popupShow 0.3s ease-out',
            }}
          >
            <div
              style={{
                fontSize: '70px',
                marginBottom: '15px',
                filter: selectedBadge.isLocked ? 'grayscale(1) opacity(0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedBadge.isLocked ? '🔒' : selectedBadge.icon}
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', color: '#111' }}>
              {selectedBadge.name}
            </h3>

            <p style={{ fontSize: '15px', color: '#777', marginBottom: '25px', lineHeight: '1.4' }}>
              {selectedBadge.condition}
            </p>

            

            {/* 💡 [혜택 표시] 뱃지 데이터에 reward가 있을 경우만 표시 */}
            {!selectedBadge.isLocked && selectedBadge.reward && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
                  color: '#006064',
                  padding: '20px 15px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '30px',
                  border: '2px dashed #00bcd4',
                  lineHeight: '1.5',
                }}
              >
                <span style={{ fontSize: '18px', marginRight: '5px' }}>🎁</span>
                <span style={{ color: '#ff5722', fontSize: '15px' }}>혜택 지급 완료!</span>
                <br />
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#00838f' }}>
                  '{selectedBadge.reward}'
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              {!selectedBadge.isLocked && (
                <button
                  onClick={() => {
                    setMyProfileBadge(selectedBadge); // 👈 프로필 뱃지로 설정
                    setSelectedBadge(null);
                    alert(`${selectedBadge.name}가 대표 뱃지로 설정되었습니다!`);
                  }}
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: '#111',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '18px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  대표 설정
                </button>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  color: '#555',
                  border: 'none',
                  borderRadius: '18px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                닫기
              </button>
            </div>
          </div>

          {/* 애니메이션 정의 */}
          <style>
            {`
              @keyframes popupShow {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
              }
            `}
          </style>
        </div>
      )}
      {/* 🚀 여기까지 교체 끝 */}
      
      {showModal && (
        <SuccessModal onClose={() => { setShowModal(false); setViewState('main'); }} />
      )}
      
      <div style={{ height: '120px' }} /> 
    </div>
  );
};

export default MyPage;