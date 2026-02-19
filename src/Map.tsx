import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const MapPage = () => {
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const mapContainerRef = useRef<HTMLDivElement>(null); // 지도가 담길 공간
  const [kakaoMap, setKakaoMap] = useState<any>(null);

  const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];

  // --- 🚩 [로직 1] 지도 초기화 및 내 위치 찾기 ---
  useEffect(() => {
    const { kakao } = window as any;
    if (!kakao || !mapContainerRef.current) return;

    // 기본 위치 (서울시청)
    const initialPos = new kakao.maps.LatLng(37.5665, 126.9780);
    const options = {
      center: initialPos,
      level: 3
    };

    const map = new kakao.maps.Map(mapContainerRef.current, options);
    setKakaoMap(map);

    // 내 위치 찾기 (Geolocation)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const currentPos = new kakao.maps.LatLng(lat, lng);

          // 지도의 중심을 내 위치로 부드럽게 이동
          map.panTo(currentPos);

          // 내 위치에 마커 표시
          new kakao.maps.Marker({
            position: currentPos,
            map: map
          });
        },
        (error) => {
          console.error("위치 정보를 가져오지 못했습니다.", error);
        }
      );
    }
  }, []);

  return (
    <div className="map-view-container" style={{ position: 'relative', height: '100%' }}>
      {/* --- 🚩 [로직 2] 실제 카카오맵이 그려지는 영역 --- */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
      />

      {/* 상단 필터 (지도 위에 떠 있어야 하므로 zIndex 추가) */}
      <div className="top-filter-wrapper" style={{ zIndex: 10, position: 'relative' }}>
        <div className="filter-chips">
          {filters.map((filter) => (
            <span
              key={filter}
              className={`chip ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </span>
          ))}
        </div>
      </div>

      {/* 가상 핀들 (실제 마커를 찍기 전까지 UI 확인용) */}
      <div style={{ position: 'relative', zIndex: 5, pointerEvents: 'auto' }}>
        <div className="floating-pin pin1"><MapPin size={14} /> 현대 추상: 내면의 울림</div>
        <div className="floating-pin pin2"><MapPin size={14} /> 네온 드림: 디지털 아트</div>
        <div className="floating-pin pin3"><MapPin size={14} /> 공백의 조각</div>
      </div>

      {/* 바텀 시트 */}
      <div className="map-bottom-sheet" style={{ zIndex: 10 }}>
        <div className="sheet-handle"></div>
        <h3 className="sheet-title">내 주변 전시 <span className="count">3</span></h3>
        <div className="mini-list-container">
          <div className="mini-item">
            <div className="mini-thumb" style={{backgroundColor: '#eee'}}></div>
            <div className="mini-desc"><h4>현대 추상의 영혼</h4><p>📍 국립현대미술관</p></div>
          </div>
          <div className="mini-item">
            <div className="mini-thumb" style={{backgroundColor: '#ddd'}}></div>
            <div className="mini-desc"><h4>네온 드림: 디지털 아트</h4><p>📍 워커힐 빛의 시어터</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;