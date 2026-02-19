import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const MapPage = () => {
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false); // 지도 로딩 상태 관리

  const filters = ['전체', '무료전시', '힙플레이스', '조용한', '얼리버드'];

  useEffect(() => {
    const kakao = (window as any).kakao;

    // 만약 카카오 객체가 없다면 스크립트가 아직 안 불려온 것
    if (kakao && kakao.maps) {
      kakao.maps.load(() => setIsLoaded(true));
    } else {
      // 스크립트가 로드될 때까지 잠시 대기하는 로직
      const timer = setInterval(() => {
        if ((window as any).kakao && (window as any).kakao.maps) {
          (window as any).kakao.maps.load(() => setIsLoaded(true));
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    const { kakao } = window as any;
    
    // 지도 생성
    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 3
    };
    const map = new kakao.maps.Map(mapContainerRef.current, options);

    // 내 위치 표시
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentPos = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(currentPos);
        new kakao.maps.Marker({ position: currentPos, map: map });
      });
    }
  }, [isLoaded]);

  return (
    // 지도가 확실히 보이도록 보수적인 스타일 적용
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#f0f0f0' }}>
      
      {/* 🚩 지도 영역: 배경처럼 깔리게 설정 */}
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

      {/* 상단 UI */}
      <div style={{ position: 'relative', zIndex: 10, padding: '15px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
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
                whiteSpace: 'nowrap'
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
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        padding: '20px',
        zIndex: 10,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ width: '40px', height: '4px', background: '#eee', margin: '0 auto 15px' }} />
        <h3 style={{ margin: '0 0 15px 0' }}>내 주변 전시 3</h3>
        {/* 리스트 아이템 생략 (기존 것과 동일) */}
      </div>
    </div>
  );
};

export default MapPage;