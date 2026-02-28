import React, { useState, useEffect } from 'react';
import './ExhibitList.css';
import { ChevronLeft, Heart, MapPin, Search, X } from 'lucide-react';

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

// 🌟 [수정] Props 인터페이스 정의: onLikeChange 추가
interface ExhibitionProps {
    onBack: () => void;
    onLikeChange?: (isLiked: boolean) => void;
}

// 🌟 [수정] React.FC에 ExhibitionProps 적용
const ExhibitionList: React.FC<ExhibitionProps> = ({ onBack, onLikeChange }) => {
    const [exhibits, setExhibits] = useState<Exhibit[]>([]);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // 찜하기 상태 로드
    const [liked, setLiked] = useState<number[]>(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    // 찜하기 상태 변경 시 로컬스토리지 저장 + 'storage' 이벤트 강제 발생(동기화용)
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(liked));
        window.dispatchEvent(new Event('storage')); 
    }, [liked]);

    const filters = ['전체', '전시', '공연', '인기', '오픈예정', '종료임박'];

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/events');
                const result = await response.json();
                const realData = result.data || result;
                
                if (Array.isArray(realData)) {
                    const mappedData = realData.map((item: any, index: number) => {
                        const rawId = item.id ?? item.event_id ?? (index + 1);
                        const finalId = isNaN(Number(rawId)) ? index + 1 : Number(rawId);

                        return {
                            id: finalId,
                            tag: item.tag || (item.d_day ? 'COMING SOON' : 'TRENDING'),
                            category: item.category || '전시',
                            title: item.title || '제목 없음',
                            location: item.place_name || item.location || '장소 미정',
                            date: item.date || '기간 정보 없음',
                            hashtags: Array.isArray(item.hashtags) 
                                ? item.hashtags 
                                : (item.hashtags ? item.hashtags.split(',') : []),
                            dDay: item.d_day,
                            img_url: item.image_url 
                        };
                    });
                    setExhibits(mappedData);
                }
            } catch (err) {
                console.error("🚨 데이터 로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // 🌟 [수정] 하트 클릭 시 부모(App.tsx)의 상태도 함께 업데이트하도록 변경
    const toggleLike = (id: number) => {
        const isCurrentlyLiked = liked.includes(id);
        const nextLikedStatus = !isCurrentlyLiked;

        setLiked((prev) => 
            nextLikedStatus ? [...prev, id] : prev.filter((i) => i !== id)
        );

        // App.tsx에 정의된 handleLikeChange 실행
        if (onLikeChange) {
            onLikeChange(nextLikedStatus);
        }
    };

    const filteredExhibits = exhibits.filter((item) => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase().replace('#', '');
            const matchesTag = item.hashtags.some((tag) => tag.toLowerCase().includes(lowerQuery));
            const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
            if (!matchesTag && !matchesTitle) return false;
        }
        if (activeFilter === '전체') return true;
        if (activeFilter === '인기') return ['TRENDING', 'POPULAR', 'HOT'].includes(item.tag);
        if (activeFilter === '전시') return item.category === '전시';
        if (activeFilter === '공연') return item.category === '공연';
        if (activeFilter === '오픈예정') return item.dDay !== undefined;
        if (activeFilter === '종료임박') return item.tag === '종료임박';
        return item.category === activeFilter;
    });

    return (
        <div className="exhibit-list-page">
            <header className="list-header">
                <div className="header-side">
                    <button onClick={onBack} className="icon-btn">
                        <ChevronLeft size={28} color="#111" />
                    </button>
                </div>
                <div className="header-center">
                    {isSearching ? (
                        <div className="search-bar">
                            <input
                                autoFocus
                                placeholder="키워드 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && <X size={18} onClick={() => setSearchQuery('')} className="clear-icon" />}
                        </div>
                    ) : (
                        <h2 className="list-title">전시 둘러보기</h2>
                    )}
                </div>
                <div className="header-side right">
                    <button onClick={() => { setIsSearching(!isSearching); if (isSearching) setSearchQuery(''); }} className="icon-btn">
                        {isSearching ? <span className="cancel-txt">취소</span> : <Search size={24} color="#111" />}
                    </button>
                </div>
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
                <div className="list-count-area">
                    {searchQuery ? `'${searchQuery}' 결과 ` : '총 '}
                    <b>{filteredExhibits.length}</b>건
                </div>

                {loading ? (
                    <div className="empty-list">데이터를 불러오는 중...</div>
                ) : filteredExhibits.length > 0 ? (
                    filteredExhibits.map((item) => {
                        const isLiked = liked.includes(item.id);
                        return (
                            <div key={`exhibit-card-${item.id}`} className="exhibit-horizontal-card">
                                <div className="card-thumb">
                                    {item.img_url ? (
                                        <img src={item.img_url} alt={item.title} className="thumb-img-element" />
                                    ) : (
                                        <div className="thumb-placeholder" />
                                    )}
                                    {item.dDay !== undefined && <div className="d-day-badge">D-{item.dDay}</div>}

                                    <button 
                                        type="button"
                                        className="wish-heart-btn-circle" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleLike(item.id);
                                            console.log("실제 서버가 준 ID:", item.id); 
console.log("실제 서버가 준 데이터 전체:", item);
                                        }}
                                    >
                                        <Heart
                                            size={18}
                                            fill={isLiked ? '#ff3b30' : 'none'}
                                            stroke={isLiked ? '#ff3b30' : '#bbb'}
                                            strokeWidth={2.5}
                                        />
                                    </button>
                                </div>

                                <div className="card-info">
                                    <span className="card-tag-red">{item.tag}</span>
                                    <h3 className="card-title-bold">{item.title}</h3>
                                    <div className="hashtag-row">
                                        {item.hashtags.map((tag, idx) => (
                                            <span key={`${item.id}-tag-${idx}`} className="hashtag-item">#{tag.trim()}</span>
                                        ))}
                                    </div>
                                    <div className="info-bottom">
                                        <div className="info-row">
                                            <MapPin size={14} color="#888" />
                                            <span>{item.location}</span>
                                        </div>
                                        <div className="info-date">{item.date}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-list">검색 결과가 없습니다.</div>
                )}
                <div className="scroll-spacer"></div>
            </main>
        </div>
    );
};

export default ExhibitionList;