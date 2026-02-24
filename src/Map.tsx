import React, { useState, useRef, useEffect } from 'react';
import './Map.css'; // 🔥 스타일 파일 연결

// TypeScript 환경을 위한 선언
declare global {
    interface Window {
        kakao: any;
    }
}

const MapPage = () => {
    const [activeFilter, setActiveFilter] = useState<string>('전체');
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];

    useEffect(() => {
        const { kakao } = window;

        // 1. 카카오 객체가 있는지 확인
        if (kakao && kakao.maps) {
            // 2. autoload=false로 설정했을 경우 load 콜백 내에서 실행해야 함
            kakao.maps.load(() => {
                initMap();
            });
        } else {
            console.error('카카오맵 스크립트가 index.html에 없거나 로드되지 않았습니다.');
        }
    }, []);

    const initMap = () => {
        if (!mapContainerRef.current) return;

        const { kakao } = window;
        const options = {
            center: new kakao.maps.LatLng(37.5665, 126.978), // 기본 위치: 서울 시청
            level: 3,
        };

        // 지도 생성
        const map = new kakao.maps.Map(mapContainerRef.current, options);

        // 내 위치 가져오기 (성공 시 마커 표시 및 이동)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const currentPos = new kakao.maps.LatLng(lat, lng);

                    // 내 위치 마커
                    new kakao.maps.Marker({
                        position: currentPos,
                        map: map,
                    });

                    // 내 위치로 지도 중심 이동
                    map.setCenter(currentPos);
                },
                (error) => {
                    console.warn('위치 정보 권한을 거부하셨거나 가져올 수 없습니다.', error);
                },
            );
        }
    };

    return (
        <div className="map-page-wrapper">
            {/* 🚩 지도 영역: height가 0이 되지 않도록 100% 설정 확인 */}
            <div ref={mapContainerRef} className="map-canvas" />

            {/* 상단 필터 UI */}
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
            <div className="map-bottom-sheet">
                {/* 핸들 바 */}
                <div className="sheet-handle" />

                <div className="sheet-header">
                    <h3 className="sheet-title">
                        내 주변 전시 <span className="count">12</span>
                    </h3>
                    <p className="sheet-subtitle">지도를 움직여 다양한 예술 공간을 찾아보세요.</p>
                </div>

                {/* 🚩 전시 리스트 영역 (3번째 사진처럼 가로 배치형) */}
                <div className="sheet-list-container">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="nearby-item">
                            {/* 이미지 썸네일 */}
                            <div className="item-thumb" />

                            {/* 텍스트 정보 */}
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