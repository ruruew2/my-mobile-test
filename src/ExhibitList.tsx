import React, { useState } from 'react';
import './ExhibitList.css';
import { ChevronLeft, Heart } from 'lucide-react';

interface Exhibit {
    id: number;
    tag: string;
    title: string;
    location: string;
}

interface ExhibitionProps {
    onBack: () => void;
}

const ExhibitionList: React.FC<ExhibitionProps> = ({ onBack }) => {
    const exhibits: Exhibit[] = [
        { id: 1, tag: '추상화', title: '현대 추상의 영혼', location: '국립현대미술관' },
        { id: 2, tag: '사진전', title: '어제의 기록들', location: '세종문화회관' },
        { id: 3, tag: '설치미술', title: '공간의 재해석', location: 'DDP' },
        { id: 4, tag: '팝아트', title: '색채의 향연', location: '예술의 전당' },
    ];

    const [likedItems, setLikedItems] = useState<number[]>([]);

    const toggleLike = (id: number) => {
        setLikedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    return (
        <div className="exhibit-list-page" style={{ height: '100vh', overflow: 'hidden' }}>
            <div className="mobile-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* 1. 헤더: 상단 고정 */}
                <header className="list-header" style={{ flexShrink: 0 }}>
                    <div className="header-left">
                        <button className="back-btn" onClick={onBack}>
                            <ChevronLeft size={24} color="#111" />
                        </button>
                    </div>
                    <div className="header-center">
                        <h2 className="list-title">지금 화제인 전시</h2>
                    </div>
                </header>

                {/* 2. 스크롤 영역: flex-grow를 주어 남은 공간만 차지하게 함 */}
                <div className="list-scroll-view" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    {exhibits.map((item) => {
                        const isLiked = likedItems.includes(item.id);
                        return (
                            <div key={item.id} className="exhibit-card">
                                {/* 상단 정보 */}
                                <div className="card-text-content">
                                    <span className="card-tag">{item.tag}</span>
                                    <h3 className="card-title">{item.title}</h3>
                                </div>

                                {/* 중간 사진 영역 */}
                                <div className="card-image-box">
                                    <button className="wish-heart-btn" onClick={() => toggleLike(item.id)}>
                                        <Heart
                                            size={22}
                                            fill={isLiked ? '#FF3B30' : 'none'}
                                            stroke={isLiked ? '#FF3B30' : '#fff'}
                                        />
                                    </button>
                                </div>

                                {/* 하단 정보 */}
                                <div className="card-bottom-info">
                                    <p className="card-location">
                                        <span className="loc-icon">📍</span> {item.location}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* 🚩 핵심: 네비게이션 바 높이만큼 빈 공간 추가 (60px ~ 80px 추천) */}
                    <div className="bottom-tab-space" style={{ height: '80px', minHeight: '80px' }} />
                </div>
            </div>
        </div>
    );
};

export default ExhibitionList;