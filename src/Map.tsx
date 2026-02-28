import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ChevronLeft, Search, Navigation } from 'lucide-react';
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
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MapPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const [events, setEvents] = useState<any[]>([]);
  const [myLocation, setMyLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [selectedExhibit, setSelectedExhibit] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState(""); 

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); 
  const markersRef = useRef<any[]>([]); 

  const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];
  const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'http://54.180.234.226:8000';

  const SHEET_HEIGHT = window.innerHeight * 0.7;
  const MAX_Y = SHEET_HEIGHT - 120; 

  const [translateY, setTranslateY] = useState(MAX_Y);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // 1. [필터링 로직] activeFilter에 따라 데이터 필터링
  const filteredEvents = useMemo(() => {
    if (activeFilter === '전체') return events;
    if (activeFilter === '무료전시') {
      return events.filter(e => e.is_free || e.price === 0 || e.fee === "무료");
    }
    return events.filter(e => 
      (e.description && e.description.includes(activeFilter)) || 
      (e.hashtags && e.hashtags.includes(activeFilter))
    );
  }, [events, activeFilter]);

  // 2. [주변 전시] 지도 중심 기준 5km 필터링
  const nearbyEvents = useMemo(() => {
    const ref = mapCenter || myLocation;
    if (!ref) return filteredEvents;

    return filteredEvents
      .map(evt => ({
        ...evt,
        distance: getDistance(ref.lat, ref.lng, Number(evt.lat), Number(evt.lng))
      }))
      .filter(evt => !isNaN(evt.distance) && evt.distance <= 5)
      .sort((a, b) => a.distance - b.distance);
  }, [filteredEvents, myLocation, mapCenter]);

  // 3. [마커 업데이트] 필터 변경 시 지도 마커 갱신
  useEffect(() => {
    if (mapRef.current) {
      updateMarkers(filteredEvents);
    }
  }, [filteredEvents]);

  const updateMarkers = (data: any[]) => {
    const { kakao } = window as any;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    data.forEach((evt) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(Number(evt.lat), Number(evt.lng)),
        map: mapRef.current,
      });
      kakao.maps.event.addListener(marker, 'click', () => handleItemClick(evt));
      markersRef.current.push(marker);
    });
  };

  // 장소 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    const { kakao } = window as any;
    const ps = new kakao.maps.services.Places(); 

    ps.keywordSearch(searchKeyword, (data: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const firstResult = data[0];
        const moveLatLng = new kakao.maps.LatLng(firstResult.y, firstResult.x);
        mapRef.current.setCenter(moveLatLng);
        setMapCenter({ lat: Number(firstResult.y), lng: Number(firstResult.x) });
      } else {
        alert("검색 결과가 없어요! 동네 이름으로 검색해보세요.");
      }
    });
  };

  // ⭐ 내 위치로 이동 함수
  const moveToMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const { kakao } = window as any;
        const locPosition = new kakao.maps.LatLng(latitude, longitude);

        if (mapRef.current) {
          mapRef.current.panTo(locPosition); // 부드러운 이동
          setMapCenter({ lat: latitude, lng: longitude });
        }
      }, () => {
        alert("위치 정보를 가져올 수 없어요. 설정을 확인해주세요.");
      });
    }
  };

  const handleItemClick = (evt: any) => {
    setSelectedExhibit(evt);
    if (mapRef.current) {
      const moveLatLon = new (window as any).kakao.maps.LatLng(Number(evt.lat), Number(evt.lng));
      mapRef.current.panTo(moveLatLon); 
    }
  };

  useEffect(() => {
    setTranslateY(MAX_Y);
    const loadDataAndMap = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
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
      } catch (err) { console.error(err); }
    };
    loadDataAndMap();
  }, [API_BASE_URL]);

  const initMap = (realEvents: any[]) => {
    if (!mapContainerRef.current) return;
    const { kakao } = window as any;
    const options = { center: new kakao.maps.LatLng(37.5665, 126.978), level: 8 };
    const map = new kakao.maps.Map(mapContainerRef.current, options);
    mapRef.current = map; 

    kakao.maps.event.addListener(map, 'idle', () => {
      const center = map.getCenter();
      setMapCenter({ lat: center.getLat(), lng: center.getLng() });
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const locPosition = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        map.setCenter(locPosition);
        new kakao.maps.CustomOverlay({
          position: locPosition,
          content: '<div class="my-location-dot"></div>'
        }).setMap(map);
      });
    }
    updateMarkers(realEvents);
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

      {!selectedExhibit && (
        <>
          <div className="map-top-filter">
            <form className="map-search-bar" onSubmit={handleSearch}>
              <Search size={18} color="#888" />
              <input 
                placeholder="동네나 장소를 검색해보세요" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </form>

            <div className="filter-scroll-container">
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} className={`map-chip ${activeFilter === f ? 'active' : ''}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* ⭐ GPS 내 위치 버튼 */}
          <button className="my-location-btn" onClick={moveToMyLocation}>
            <Navigation size={20} fill="#4285F4" color="#4285F4" />
          </button>
        </>
      )}

      <div className={`map-bottom-sheet ${isDragging ? 'dragging' : ''}`} style={{ transform: `translateY(${translateY}px)` }}>
        <div className="sheet-handle-wrapper" onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} onMouseDown={handleStart}><div className="sheet-handle" /></div>
        <div className="sheet-header">
          <h3 className="sheet-title">{activeFilter === '전체' ? '이 지역 주변 전시' : `${activeFilter} 추천`} <span className="count">{nearbyEvents.length}</span></h3>
          <p className="sheet-subtitle">지도 중심 5km 이내 정보입니다.</p>
        </div>
        <div className="sheet-list-container">
          {nearbyEvents.length > 0 ? (
            nearbyEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="nearby-item" onClick={() => handleItemClick(evt)}>
                <div className="item-thumb" style={{ background: `url(${evt.img_url || evt.image_url}) center/cover` }} />
                <div className="item-info">
                  <h4 className="item-name">{evt.title}</h4>
                  <p className="item-location">{evt.place_name || evt.place} {evt.distance && `· ${evt.distance.toFixed(1)}km`}</p>
                </div>
              </div>
            ))
          ) : (
             <div className="no-data-msg">주변에 전시가 없어요. 다른 지역으로 가볼까요? 🚀</div>
          )}
        </div>
      </div>

      {selectedExhibit && (
        <div className="exhibit-detail-overlay">
          <div className="detail-header-fixed">
            <button className="back-btn-circle" onClick={() => setSelectedExhibit(null)}><ChevronLeft size={24} color="#111" /></button>
          </div>
          <div className="detail-container">
            <div className="detail-img-wrapper">
              <img src={selectedExhibit.img_url || selectedExhibit.image_url} alt="전시" />
            </div>
            <div className="detail-main-info">
              <span className="detail-tag">#{selectedExhibit.hashtags?.[0] || '추천전시'}</span>
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