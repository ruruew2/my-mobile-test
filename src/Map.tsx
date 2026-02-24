import React, { useState, useRef, useEffect } from 'react';
import './Map.css';

declare global {
    interface Window {
        kakao: any;
    }
}

const MapPage = () => {
    const [activeFilter, setActiveFilter] = useState<string>('전체');
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];

    // --- 📌 바텀 시트 드래그 로직 시작 ---
    const SHEET_HEIGHT = window.innerHeight * 0.7; // CSS에서 설정한 70vh와 맞춤
    const MIN_Y = 0; // 완전히 펼쳐졌을 때
    const MAX_Y = SHEET_HEIGHT - 100; // 접혔을 때 (헤더 약 100px만 남김)
    
    const [translateY, setTranslateY] = useState(MAX_Y); // 처음엔 접힌 상태로 시작
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startY.current = clientY - translateY;
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        let nextY = clientY - startY.current;

        // 범위 제한
        if (nextY < MIN_Y) nextY = MIN_Y;
        if (nextY > MAX_Y) nextY = MAX_Y;

        setTranslateY(nextY);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // 절반 기준으로 스냅 (자석 효과)
        if (translateY < MAX_Y / 2) {
            setTranslateY(MIN_Y); // 완전히 펴기
        } else {
            setTranslateY(MAX_Y); // 완전히 접기
        }
    };
    // --- 📌 바텀 시트 드래그 로직 끝 ---

    useEffect(() => {
        const { kakao } = window;
        if (kakao && kakao.maps) {
            kakao.maps.load(() => initMap());
        }
    }, []);

    const initMap = () => {
        if (!mapContainerRef.current) return;
        const { kakao } = window;
        const options = {
            center: new kakao.maps.LatLng(37.5665, 126.978),
            level: 3,
        };
        const map = new kakao.maps.Map(mapContainerRef.current, options);
    };

    return (
        <div 
            className="map-page-wrapper"
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd} // 마우스가 화면 나갈 때 대비
        >
            <div ref={mapContainerRef} className="map-canvas" />

            {/* 필터 UI */}
            <div className="map-top-filter">
                <div className="filter-scroll-container">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`map-chip ${activeFilter === f ? 'active' : ''}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* 바텀 시트 */}
            <div 
                className={`map-bottom-sheet ${isDragging ? 'dragging' : ''}`}
                style={{ transform: `translateY(${translateY}px)` }}
            >
                {/* 핸들 바 영역 (터치/마우스 이벤트 연결) */}
                <div 
                    className="sheet-handle-wrapper"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleTouchStart}
                >
                    <div className="sheet-handle" />
                </div>

                <div className="sheet-header">
                    <h3 className="sheet-title">
                        내 주변 전시 <span className="count">12</span>
                    </h3>
                    <p className="sheet-subtitle">지도를 움직여 다양한 예술 공간을 찾아보세요.</p>
                </div>

                <div className="sheet-list-container">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="nearby-item">
                            <div className="item-thumb" />
                            <div className="item-info">
                                <h4 className="item-name">전시회 제목 {item}</h4>
                                <p className="item-location">장소 정보 · 1.5km</p>
                                <div className="item-tags">
                                    <span className="mini-tag">#무료</span>
                                    <span className="mini-tag">#힙플레이스</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapPage;