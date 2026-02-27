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
  const [events, setEvents] = useState<any[]>([]);
  const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];

  // --- [수정] Vercel 환경과 로컬 환경 주소 자동 전환 ---
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'http://54.180.234.226:8000';

  // 바텀 시트 상태
  const SHEET_HEIGHT = window.innerHeight * 0.7;
  const MAX_Y = SHEET_HEIGHT - 100;
  const [translateY, setTranslateY] = useState(MAX_Y);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // 1. 데이터 가져오기 및 지도 로드
  useEffect(() => {
    const loadDataAndMap = async () => {
      try {
        console.log("1. 데이터 요청 시작...");
        // [수정] 배포 환경에서도 작동하도록 API_BASE_URL 사용
        const response = await fetch(`${API_BASE_URL}/api/events`);
        const result = await response.json();
        
        if (result.status === "success" || result.data) {
          const realData = result.data || result;
          console.log("2. 데이터 수신 완료:", realData.length, "개");
          setEvents(realData);

          const { kakao } = window as any;
          if (kakao && kakao.maps) {
            console.log("3. 카카오맵 객체 확인, 지도 초기화 시작");
            kakao.maps.load(() => initMap(realData));
          } else {
            console.error("🚨 카카오맵 SDK가 로드되지 않았습니다. index.html을 확인하세요.");
          }
        }
      } catch (err) {
        console.error("🚨 데이터 로딩 실패:", err);
      }
    };

    loadDataAndMap();
  }, [API_BASE_URL]);

  const initMap = (realEvents: any[]) => {
    if (!mapContainerRef.current) {
      console.error("🚨 지도 컨테이너(ref)를 찾을 수 없습니다.");
      return;
    }

    const { kakao } = window as any;
    
    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 8,
    };

    const map = new kakao.maps.Map(mapContainerRef.current, options);
    console.log("4. 지도 객체 생성 완료");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const locPosition = new kakao.maps.LatLng(lat, lng);
          map.setCenter(locPosition);
          console.log("📍 현위치 이동 완료");
        },
        () => console.warn("현위치를 가져올 수 없어 기본 위치를 사용합니다.")
      );
    }

    realEvents.forEach((evt, idx) => {
      const lat = Number(evt.lat);
      const lng = Number(evt.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        new kakao.maps.Marker({
          map: map,
          position: new kakao.maps.LatLng(lat, lng),
          title: evt.title,
        });
      }
    });
  };

  const handleStart = (e: any) => {
    setIsDragging(true);
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startY.current = clientY - translateY;
  };

  const handleMove = (e: any) => {
    if (!isDragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let nextY = clientY - startY.current;
    if (nextY < 0) nextY = 0;
    if (nextY > MAX_Y) nextY = MAX_Y;
    setTranslateY(nextY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setTranslateY(translateY < MAX_Y / 2 ? 0 : MAX_Y);
  };

  return (
    <div className="map-page-wrapper" onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}>
      <div ref={mapContainerRef} className="map-canvas" />

      <div className="map-top-filter">
        <div className="filter-scroll-container">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`map-chip ${activeFilter === f ? 'active' : ''}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={`map-bottom-sheet ${isDragging ? 'dragging' : ''}`} style={{ transform: `translateY(${translateY}px)` }}>
        <div className="sheet-handle-wrapper" onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} onMouseDown={handleStart}>
          <div className="sheet-handle" />
        </div>
        <div className="sheet-header">
          <h3 className="sheet-title">내 주변 전시 <span className="count">{events.length}</span></h3>
          <p className="sheet-subtitle">지도를 움직여 다양한 예술 공간을 찾아보세요.</p>
        </div>
        <div className="sheet-list-container">
          {events.map((evt, idx) => (
            <div key={idx} className="nearby-item">
              {/* [수정] img_url 또는 image_url 둘 다 대응 */}
              <div 
                className="item-thumb" 
                style={{ 
                  background: `url(${evt.img_url || evt.image_url}) center/cover`, 
                  backgroundColor: '#f0f0f0' 
                }} 
              />
              <div className="item-info">
                <h4 className="item-name">{evt.title}</h4>
                <p className="item-location">{evt.place_name || evt.place}</p>
                <div className="item-tags">
                  <span className="mini-tag">#전시</span>
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