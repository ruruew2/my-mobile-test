import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ChevronLeft } from 'lucide-react';
import './Map.css';

declare global {
  interface Window {
    kakao: any;
  }
}

// 거리 계산 유틸리티 함수
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const [events, setEvents] = useState<any[]>([]);
  const [myLocation, setMyLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // ⭐ [추가] 지도의 현재 중심 좌표를 관리하는 상태
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  
  const [selectedExhibit, setSelectedExhibit] = useState<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); 
  
  const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];
  const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'http://54.180.234.226:8000';

  // 바텀 시트 높이 설정
  const SHEET_HEIGHT = window.innerHeight * 0.7;
  const MAX_Y = SHEET_HEIGHT - 120; 

  const [translateY, setTranslateY] = useState(MAX_Y);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // 1. 공통 클릭 핸들러 (이동 + 상세정보)
  const handleItemClick = (evt: any) => {
    setSelectedExhibit(evt);
    if (mapRef.current) {
      const { kakao } = window as any;
      const moveLatLon = new kakao.maps.LatLng(Number(evt.lat), Number(evt.lng));
      mapRef.current.panTo(moveLatLon); 
    }
  };

  // 2. ⭐ [수정] 지도 중심(mapCenter) 기준으로 5km 필터링
  const nearbyEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    // 계산 기준점: 지도 중심이 있으면 중심 기준, 없으면 내 위치 기준
    const referencePoint = mapCenter || myLocation;
    if (!referencePoint) return events; 

    return events
      .map(evt => ({
        ...evt,
        distance: getDistance(referencePoint.lat, referencePoint.lng, Number(evt.lat), Number(evt.lng))
      }))
      .filter(evt => !isNaN(evt.distance) && evt.distance <= 5) // 5km 이내만
      .sort((a, b) => a.distance - b.distance);
  }, [events, myLocation, mapCenter]); // mapCenter가 변할 때마다 리스트가 자동 갱신됨

  useEffect(() => {
    setTranslateY(MAX_Y);

    const loadDataAndMap = async () => {
      try {
        // 내 위치 정보 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setMyLocation({ lat, lng });
            // 초기 중심점도 내 위치로 설정
            setMapCenter({ lat, lng });
          });
        }

        const response = await fetch(`${API_BASE_URL}/api/events`);
        const result = await response.json();
        const realData = result.data || result;
        setEvents(realData);

        const { kakao } = window as any;
        if (kakao && kakao.maps) {
          kakao.maps.load(() => initMap(realData));
        }
      } catch (err) {
        console.error("🚨 데이터 로딩 실패:", err);
      }
    };

    loadDataAndMap();
  }, [API_BASE_URL, MAX_Y]);

  const initMap = (realEvents: any[]) => {
    if (!mapContainerRef.current) return;
    const { kakao } = window as any;
    
    // 기본 서울 중심
    const defaultCenter = new kakao.maps.LatLng(37.5665, 126.978);
    const options = { center: defaultCenter, level: 8 };
    const map = new kakao.maps.Map(mapContainerRef.current, options);
    mapRef.current = map; 

    // ⭐ [추가] 지도가 움직이고 멈췄을 때 중심 좌표 갱신하는 이벤트
    kakao.maps.event.addListener(map, 'idle', () => {
      const center = map.getCenter();
      setMapCenter({
        lat: center.getLat(),
        lng: center.getLng()
      });
    });

    // 내 위치 마커 표시
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const locPosition = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        map.setCenter(locPosition);
        
        new kakao.maps.CustomOverlay({
          position: locPosition,
          content: '<div style="width:14px;height:14px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(0,0,0,0.3);z-index:10;"></div>'
        }).setMap(map);
      });
    }

    // 전시 마커 표시
    realEvents.forEach((evt) => {
      const lat = Number(evt.lat);
      const lng = Number(evt.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = new kakao.maps.Marker({
          map: map,
          position: new kakao.maps.LatLng(lat, lng),
        });
        kakao.maps.event.addListener(marker, 'click', () => {
          handleItemClick(evt);
        });
      }
    });
  };

  // 드래그 이벤트 핸들러
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

      {!selectedExhibit && (
        <div className="map-top-filter">
          <div className="filter-scroll-container">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`map-chip ${activeFilter === f ? 'active' : ''}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 바텀 시트 */}
      <div className={`map-bottom-sheet ${isDragging ? 'dragging' : ''}`} 
           style={{ transform: `translateY(${translateY}px)` }}>
        <div className="sheet-handle-wrapper" onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} onMouseDown={handleStart}>
          <div className="sheet-handle" />
        </div>
        <div className="sheet-header">
          {/* ⭐ 문구 수정: "이 지역 주변" */}
          <h3 className="sheet-title">이 지역 주변 전시 <span className="count">{nearbyEvents.length}</span></h3>
          <p className="sheet-subtitle">지도 중심 기준 5km 이내 전시 정보를 확인해보세요.</p>
        </div>
        <div className="sheet-list-container">
          {nearbyEvents.length > 0 ? (
            nearbyEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="nearby-item" onClick={() => handleItemClick(evt)} style={{ cursor: 'pointer' }}>
                <div className="item-thumb" style={{ background: `url(${evt.img_url || evt.image_url}) center/cover`, backgroundColor: '#f0f0f0' }} />
                <div className="item-info">
                  <h4 className="item-name">{evt.title}</h4>
                  <p className="item-location">{evt.place_name || evt.place} {evt.distance && ` · ${evt.distance.toFixed(1)}km`}</p>
                  <div className="item-tags">
                    <span className="mini-tag">#전시</span>
                    {evt.distance && evt.distance < 2 && <span className="mini-tag" style={{color: '#7148fc', fontWeight: 'bold'}}>#매우가까움</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
              이 지역 5km 이내에 진행 중인 전시가 없어요. 😢<br/>지도를 다른 곳으로 옮겨보세요!
            </div>
          )}
        </div>
      </div>

      {/* 상세보기 오버레이 */}
      {selectedExhibit && (
        <div className="exhibit-detail-overlay">
          <div className="detail-header-fixed">
            <button className="back-btn-circle" onClick={() => setSelectedExhibit(null)}>
              <ChevronLeft size={24} color="#111" />
            </button>
          </div>
          <div className="detail-container">
            <div className="detail-img-wrapper">
              <img src={selectedExhibit.img_url || selectedExhibit.image_url} alt="전시" />
            </div>
            <div className="detail-main-info">
              <span className="detail-tag">#{selectedExhibit.hashtag?.[0] || '추천전시'}</span>
              <h2 className="detail-title">{selectedExhibit.title}</h2>
              <div className="info-section">
                <div className="info-row">
                  <div className="info-icon-box"><MapPin size={18} /></div>
                  <span className="info-text">{selectedExhibit.place_name || selectedExhibit.place}</span>
                </div>
                <div className="info-row">
                  <div className="info-icon-box"><Calendar size={18} /></div>
                  <span className="info-text">{selectedExhibit.date_range || '상시전시'}</span>
                </div>
              </div>
              <div className="detail-description">
                <h5 className="description-title">전시 소개</h5>
                <p className="description-text">{selectedExhibit.description || '상세 정보가 업데이트될 예정입니다.'}</p>
              </div>
            </div>
          </div>
          <div className="detail-footer">
             <button className="reserve-btn">티켓 예매하기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;