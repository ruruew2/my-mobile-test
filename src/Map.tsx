import React, { useState, useRef, useEffect } from 'react';
import './Map.css';

declare global {
    interface window {
        kakao: any;
    }
}

const MapPage = () => {
    const [activeFilter, setActiveFilter] = useState<string>('전체');
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];

    // --- 📌 바텀 시트 드래그 로직 ---
    const SHEET_HEIGHT = window.innerHeight * 0.7; 
    const MIN_Y = 0; 
    const MAX_Y = SHEET_HEIGHT - 100; 
    
    const [translateY, setTranslateY] = useState(MAX_Y);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        startY.current = clientY - translateY;
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return;
        const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        let nextY = clientY - startY.current;

        if (nextY < MIN_Y) nextY = MIN_Y;
        if (nextY > MAX_Y) nextY = MAX_Y;

        setTranslateY(nextY);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (translateY < MAX_Y / 2) {
            setTranslateY(MIN_Y);
        } else {
            setTranslateY(MAX_Y);
        }
    };

    // --- 📌 지도 및 현위치 로직 ---
    useEffect(() => {
        const { kakao } = window as any;
        if (kakao && kakao.maps) {
            kakao.maps.load(() => initMap());
        }
    }, []);

    const initMap = () => {
        if (!mapContainerRef.current) return;
        const { kakao } = window as any;

        // 1. 기본 중심 설정 (서울시청)
        const defaultCenter = new kakao.maps.LatLng(37.5665, 126.978);
        const options = {
            center: defaultCenter,
            level: 3,
        };
        const map = new kakao.maps.Map(mapContainerRef.current, options);

        // 2. 내 위치 가져오기 및 마커 표시
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const locPosition = new kakao.maps.LatLng(lat, lon);

                    // 내 위치에 마커 생성
                    const marker = new kakao.maps.Marker({
                        map: map,
                        position: locPosition,
                    });

                    // 지도 중심을 내 위치로 이동
                    map.setCenter(locPosition);
                },
                (error) => {
                    console.error("위치 정보를 가져오는데 실패했습니다.", error);
                }
            );
        } else {
            alert("이 브라우저에서는 현위치 기능을 사용할 수 없습니다.");
        }
    };

    return (
        <div 
            className="map-page-wrapper"
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
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