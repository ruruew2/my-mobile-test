import React, { useState, useEffect } from 'react';
import './ExhibitList.css';
import { ChevronLeft, Heart, MapPin, Search, X, ShoppingBag } from 'lucide-react';

// API 설정 - 포트 번호를 백엔드 개발자에게 다시 확인해보세요.
const LIST_API = 'http://54.180.234.226:8000/api/events';     
const LIKE_API = 'http://54.180.234.226:8080/api/favorites'; 

interface Exhibit {
    id: number;
    tag: string;
    title: string;
    location: string;
    date: string;
    category: string;
    hashtags: string[];
    dDay?: number;
    img_url?: string;
}

interface ExhibitionProps {
    onBack: () => void;
    onLikeChange?: (isLiked: boolean) => void;
    onReserve: (item: any) => void;
}

const ExhibitionList: React.FC<ExhibitionProps> = ({ onBack, onLikeChange, onReserve }) => {
    const [exhibits, setExhibits] = useState<Exhibit[]>([]);
    const [liked, setLiked] = useState<number[]>([]);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const filters = ['전체', '전시', '공연', '오픈예정', '종료임박'];

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            try {
                // 1. 전시 데이터 로드
                const res = await fetch(LIST_API);
                const result = await res.json();
                const realData = result.data || result;

                if (Array.isArray(realData)) {
                    const mappedData = realData.map((item: any, index: number) => {
                        // ⭐️ 핵심: 서버의 어떤 필드에서든 ID를 찾아내고, 없으면 index를 씁니다.
                        const rawId = item.id ?? item.eventId ?? item.event_id ?? item.ID;
                        const finalId = (rawId !== undefined && !isNaN(Number(rawId))) ? Number(rawId) : (index + 1);

                        return {
                            id: finalId,
                            tag: item.tag || (item.d_day ? 'COMING SOON' : 'TRENDING'),
                            category: item.category || '전시',
                            title: item.title || '제목 없음',
                            location: item.place_name || item.location || '장소 미정',
                            date: item.date || '기간 정보 없음',
                            hashtags: Array.isArray(item.hashtags) 
                                ? item.hashtags 
                                : (typeof item.hashtag === 'string' ? item.hashtag.split(',').map((s:any)=>s.trim()) : []),
                            dDay: item.d_day,
                            img_url: item.image_url 
                        };
                    });
                    setExhibits(mappedData);
                }

                // 2. 찜 목록 로드
                if (token) {
                    const favRes = await fetch(LIKE_API, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (favRes.ok) {
                        const favData = await favRes.json();
                        const actualFavs = favData.data || favData;
                        if (Array.isArray(actualFavs)) {
                            // 찜 목록 ID도 숫자로 안전하게 변환
                            setLiked(actualFavs.map((f: any) => Number(f.eventId || f.id || f.event_id)));
                        }
                    }
                }
            } catch (err) {
                console.error("로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

const toggleLike = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('로그인이 필요한 기능입니다.');

    const isCurrentlyLiked = liked.includes(id);
    
    // 8080 포트 사용
    const url = `http://54.180.234.226:8080/api/favorites`;

    try {
        // ⭐️ 서버가 가장 흔하게 사용하는 방식으로 재구성
        const res = await fetch(isCurrentlyLiked ? `${url}/${id}` : url, {
            method: isCurrentlyLiked ? 'DELETE' : 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            // POST일 때만 Body를 실어 보냄
            body: isCurrentlyLiked ? undefined : JSON.stringify({ eventId: id })
        });

        if (res.ok) {
            setLiked(prev => isCurrentlyLiked ? prev.filter(i => i !== id) : [...prev, id]);
            console.log("✅ 찜하기 처리 완료");
        } else {
            // 실패 시 서버가 준 에러 메시지 상세 확인
            const errorText = await res.text();
            console.error(`❌ 서버 에러 (${res.status}):`, errorText);
            
            // 만약 Body 방식이 실패(400)하면 파라미터 방식으로 마지막 시도
            if (res.status === 400 || res.status === 405) {
                const retryRes = await fetch(`${url}?eventId=${id}`, {
                    method: isCurrentlyLiked ? 'DELETE' : 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (retryRes.ok) {
                    setLiked(prev => isCurrentlyLiked ? prev.filter(i => i !== id) : [...prev, id]);
                }
            }
        }
    } catch (err) {
        console.error("🌐 네트워크 에러:", err);
    }
};

    // 필터링 로직 (사용자 롤백 버전 유지)
    const filteredExhibits = exhibits.filter((item) => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase().replace('#', '');
            const matchesTag = item.hashtags.some((tag) => tag.toLowerCase().includes(lowerQuery));
            const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
            if (!matchesTag && !matchesTitle) return false;
        }
        if (activeFilter === '전체') return true;
        if (activeFilter === '전시') return item.category === '전시' || item.title.includes('전시');
        if (activeFilter === '공연') return item.category === '공연' || /공연|뮤지컬|콘서트|연극/.test(item.title);
        if (activeFilter === '오픈예정') return item.dDay !== undefined || item.title.includes('4월');
        if (activeFilter === '종료임박') return item.tag === '종료임박' || item.title.includes('2월');
        return item.category === activeFilter;
    });

    return (
        <div className="exhibit-list-page">
            <header className="list-header">
                <button onClick={onBack} className="icon-btn"><ChevronLeft size={28} /></button>
                <div className="header-center">
                    {isSearching ? (
                        <div className="search-bar">
                            <input autoFocus placeholder="검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            {searchQuery && <X size={18} onClick={() => setSearchQuery('')} className="clear-icon" />}
                        </div>
                    ) : <h2 className="list-title">전시 둘러보기</h2>}
                </div>
                <button onClick={() => { setIsSearching(!isSearching); if (isSearching) setSearchQuery(''); }} className="icon-btn">
                    {isSearching ? <span className="cancel-txt">취소</span> : <Search size={24} />}
                </button>
            </header>

            <nav className="category-nav">
                <div className="filter-chip-container">
                    {filters.map((f) => (
                        <button key={f} className={`filter-chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
                            {f}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="list-scroll-view">
                <div className="list-count-area">총 <b>{filteredExhibits.length}</b>건</div>
                {loading ? (
                    <div className="empty-list">데이터를 불러오는 중...</div>
                ) : filteredExhibits.length > 0 ? (
                    filteredExhibits.map((item) => (
                        <div key={`ex-card-${item.id}`} className="exhibit-horizontal-card">
                            <div className="card-thumb">
                                {item.img_url ? (
                                    <img src={item.img_url} alt="" className="thumb-img-element" />
                                ) : <div className="thumb-placeholder" />}
                                {item.dDay !== undefined && <div className="d-day-badge">D-{item.dDay}</div>}
                                <button className="wish-heart-btn-circle" onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}>
                                    <Heart 
                                        size={18} 
                                        fill={liked.includes(item.id) ? '#ff3b30' : 'none'} 
                                        stroke={liked.includes(item.id) ? '#ff3b30' : '#bbb'} 
                                        strokeWidth={2.5} 
                                    />
                                </button>
                            </div>
                            <div className="card-info">
                                <span className="card-tag-red">{item.tag}</span>
                                <h3 className="card-title-bold">{item.title}</h3>
                                <div className="hashtag-row">
                                    {item.hashtags.map((tag, idx) => (
                                        <span key={`${item.id}-t-${idx}`} className="hashtag-item">#{tag}</span>
                                    ))}
                                </div>
                                <div className="info-bottom-flex">
                                    <div className="info-text-group">
                                        <div className="info-row"><MapPin size={14} color="#888" /><span>{item.location}</span></div>
                                        <div className="info-date">{item.date}</div>
                                    </div>
                                    <button className="direct-reserve-btn" onClick={() => onReserve(item)}>
                                        <ShoppingBag size={18} /><span>예매</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : <div className="empty-list">결과가 없습니다.</div>}
            </main>
        </div>
    );
};

export default ExhibitionList;