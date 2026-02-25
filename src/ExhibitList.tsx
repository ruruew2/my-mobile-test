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
}

const ExhibitionList: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [exhibits, setExhibits] = useState<Exhibit[]>([]);
    const [liked, setLiked] = useState<number[]>([]);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filters = ['전체', '전시', '공연', '인기', '종료임박'];

    useEffect(() => {
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
                    <button onClick={() => { setIsSearching(!isSearching); if (isSearching) setSearchQuery(''); }} className="icon-btn">
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
                    {searchQuery ? `'${searchQuery}' 결과 ` : '총 '}<b>{filteredExhibits.length}</b>건
                </div>

                {filteredExhibits.length > 0 ? (
                    filteredExhibits.map((item) => {
                        const isLiked = liked.includes(item.id);
                        return (
                            <div key={item.id} className="exhibit-horizontal-card">
                                <div className="card-thumb">
                                    <div className="thumb-placeholder"></div>
                                    <button className="wish-heart-btn-circle" onClick={() => toggleLike(item.id)}>
                                        <Heart size={18} fill={isLiked ? '#ff3b30' : 'none'} stroke={isLiked ? '#ff3b30' : '#bbb'} strokeWidth={2.5} />
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