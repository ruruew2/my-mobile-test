import React, { useState, useRef, useEffect } from 'react';

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
      console.error("카카오맵 스크립트가 index.html에 없거나 로드되지 않았습니다.");
    }
  }, []);

  const initMap = () => {
    if (!mapContainerRef.current) return;

    const { kakao } = window;
    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.9780), // 기본 위치: 서울 시청
      level: 3
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
            map: map
          });

          // 내 위치로 지도 중심 이동
          map.setCenter(currentPos);
        },
        (error) => {
          console.warn("위치 정보 권한을 거부하셨거나 가져올 수 없습니다.", error);
        }
      );
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#eee' }}>
      
      {/* 🚩 지도 영역: height가 0이 되지 않도록 100% 설정 확인 */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0,
          left: 0,
          zIndex: 0 
        }} 
      />

      {/* 상단 필터 UI */}
      <div style={{ position: 'relative', zIndex: 10, padding: '15px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
          {filters.map((f) => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: activeFilter === f ? 'black' : 'white',
                color: activeFilter === f ? 'white' : 'black',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 바텀 시트 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '20px',
        zIndex: 10,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ width: '40px', height: '4px', background: '#e5e5e5', borderRadius: '2px', margin: '0 auto 16px' }} />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>내 주변 전시</h3>
        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>지도를 움직여 다양한 예술 공간을 찾아보세요.</p>
      </div>
    </div>
  );
};

export default MapPage;