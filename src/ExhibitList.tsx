import React, { useState, useEffect } from 'react';
import './ExhibitList.css';
import { ChevronLeft, Heart, MapPin } from 'lucide-react';

interface Exhibit {
    id: number;
    tag: string;
    title: string;
    location: string;
    date: string;
    category: string; // 필터링을 위한 카테고리 필드 추가
}

const ExhibitionList: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [exhibits, setExhibits] = useState<Exhibit[]>([]);
    const [liked, setLiked] = useState<number[]>([]);
    const [activeFilter, setActiveFilter] = useState('전체');

    const filters = ['전체', '전시', '공연', '인기', '종료임박'];

    useEffect(() => {
        // 실제 API 호출이 필요한 경우 여기에 fetch 로직을 작성하면 됩니다.
        const mockData: Exhibit[] = [
            {
                id: 1,
                tag: 'TRENDING',
                category: '전시', // ← 여기를 '전시'로 적어주어야 '전시' 탭에 나옵니다!
                title: '현대 추상의 영혼:\n선과 색의 조화',
                location: '국립현대미술관',
                date: '2024.03.01 - 05.20',
            },
            {
                id: 2,
                tag: 'POPULAR',
                category: '전시', // ← 이 데이터도 '전시' 탭에 나오게 수정
                title: '어제의 기록들:\n우리가 놓친 순간들',
                location: '세종문화회관',
                date: '2024.02.15 - 04.10',
            },
            {
                id: 3,
                tag: 'NEW',
                category: '공연',
                title: '공간의 재해석',
                location: 'DDP',
                date: '2024.04.01 - 06.30',
            },
            {
                id: 4,
                tag: 'HOT',
                category: '인기',
                title: '색채의 향연',
                location: '예술의 전당',
                date: '2024.03.10 - 05.15',
            },
        ];
        setExhibits(mockData); // 데이터만 깔끔하게 전달!
    }, []);

    const toggleLike = (id: number) => {
        setLiked((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
    };

    // 필터링 핵심 로직: 선택된 필터에 따라 리스트를 거름
    const filteredExhibits = exhibits.filter((item) => {
        // 1. '전체'일 때는 무조건 다 보여줌
        if (activeFilter === '전체') return true;

        // 2. '인기' 탭: 태그가 TRENDING, POPULAR, HOT인 것들을 모아서 보여줌
        if (activeFilter === '인기') {
            return ['TRENDING', 'POPULAR', 'HOT'].includes(item.tag);
        }

        // 3. '전시' 탭: 카테고리가 '전시'이거나 태그에 관련 정보가 있는 경우
        // (데이터의 category와 activeFilter가 정확히 일치하는지 확인)
        if (activeFilter === '전시') {
            return item.category === '전시' || item.tag === 'TRENDING';
        }

        // 4. 나머지 (공연, 종료임박 등)
        return item.category === activeFilter;
    });

    return (
        <div className="exhibit-list-page">
            <header className="list-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={28} color="#111" />
                </button>
                <h2 className="list-title">전시 둘러보기</h2>
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
                    총 <b>{filteredExhibits.length}</b>건
                </div>

                {filteredExhibits.length > 0 ? (
                    filteredExhibits.map((item) => {
                        const isLiked = liked.includes(item.id);
                        return (
                            <div key={item.id} className="exhibit-horizontal-card">
                                <div className="card-thumb">
                                    <div className="thumb-placeholder"></div>
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
                    <div className="empty-list">해당하는 정보가 없습니다.</div>
                )}
                <div className="scroll-spacer"></div>
            </main>
        </div>
    );
};

export default ExhibitionList;
