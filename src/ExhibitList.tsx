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
    dDay?: number; // 선택적 프로퍼티로 추가
}

const ExhibitionList: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [exhibits, setExhibits] = useState<Exhibit[]>([]);
    const [liked, setLiked] = useState<number[]>([]);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filters = ['전체', '전시', '공연', '인기', '오픈예정', '종료임박'];

    useEffect(() => {
        // 데이터가 없으면 '오픈예정' 탭에서 아무것도 안 보이므로,
        // 테스트를 위해 dDay가 포함된 4번째 데이터를 추가했습니다.
        const mockData: Exhibit[] = [
            {
                id: 1,
                tag: 'TRENDING',
                category: '전시',
                title: '현대 추상의 영혼:\n선과 색의 조화',
                location: '국립현대미술관',
                date: '2024.03.01 - 05.20',
                hashtags: ['몽환적인', '추상화', '현대미술', '서울'],
            },
            {
                id: 2,
                tag: 'POPULAR',
                category: '전시',
                title: '어제의 기록들:\n우리가 놓친 순간들',
                location: '세종문화회관',
                date: '2024.02.15 - 04.10',
                hashtags: ['감성적인', '사진전', '기록', '평일데이트'],
            },
            {
                id: 3,
                tag: 'NEW',
                category: '공연',
                title: '공간의 재해석',
                location: 'DDP',
                date: '2024.04.01 - 06.30',
                hashtags: ['힙한', '체험형', '공간디자인', '주말'],
            },
            {
                id: 4,
                tag: 'COMING SOON',
                category: '전시',
                title: '미래를 향한 발걸음:\n인터랙티브 아트전',
                location: '예술의 전당',
                date: '2024.08.01 - 10.31',
                hashtags: ['디지털아트', '신규전시'],
                dDay: 30, // 오픈예정 탭에서 보일 데이터
            },
        ];
        setExhibits(mockData);
    }, []);

    const handleTagClick = (tag: string) => {
        setIsSearching(true);
        setSearchQuery(tag);
    };

    const toggleLike = (id: number) => {
        setLiked((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
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
        if (activeFilter === '전시') return item.category === '전시' || item.tag === 'TRENDING';

        // '오픈예정' 클릭 시 dDay가 있는 데이터만 반환하도록 설정
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
                                placeholder="키워드 검색 (예: 몽환적인)"
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
                    <button
                        onClick={() => {
                            setIsSearching(!isSearching);
                            if (isSearching) setSearchQuery('');
                        }}
                        className="icon-btn"
                    >
                        {isSearching ? <span className="cancel-txt">취소</span> : <Search size={24} color="#111" />}
                    </button>
                </div>
            </header>

            <nav className="category-nav">
                <div className="filter-chip-container">
                    {filters.map((f) => (
                        <button
                            key={f}
                            className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
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

                {filteredExhibits.length > 0 ? (
                    filteredExhibits.map((item) => {
                        const isLiked = liked.includes(item.id);
                        return (
                            <div key={item.id} className="exhibit-horizontal-card">
                                <div className="card-thumb">
                                    <div className="thumb-placeholder"></div>

                                    {/* D-Day 배지 표시 부분 */}
                                    {item.dDay !== undefined && <div className="d-day-badge">D-{item.dDay}</div>}

                                    <button className="wish-heart-btn-circle" onClick={() => toggleLike(item.id)}>
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
                                        {item.hashtags.map((tag) => (
                                            <span
                                                key={tag}
                                                onClick={() => handleTagClick(tag)}
                                                className="hashtag-item"
                                            >
                                                #{tag}
                                            </span>
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
