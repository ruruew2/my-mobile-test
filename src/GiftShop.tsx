import React, { useState, useRef } from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';

const GiftShop = () => {
  const [activeTab, setActiveTab] = useState('전체');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 🚩 [데이터] '도서' 아이템을 삭제했습니다.
  const allProducts = [
    { id: 1, category: '포스터', title: '정물화 시리즈 - 꽃다발', price: '25,000원', image: 'https://picsum.photos/id/24/500/350' },
    { id: 3, category: '스티커', title: '뮤지엄 에디션 스티커', price: '5,500원', image: 'https://picsum.photos/id/445/500/350' },
    { id: 4, category: '포스터', title: '미니멀 라인 아트', price: '22,000원', image: 'https://picsum.photos/id/250/500/350' },
    { id: 5, category: '스티커', title: '빈티지 레터링 팩', price: '4,000원', image: 'https://picsum.photos/id/452/500/350' },
    { id: 6, category: '엽서', title: '여행의 기억 엽서 세트', price: '8,000원', image: 'https://picsum.photos/id/312/500/350' },
  ];

  // 🚩 [카테고리] '도서' 탭을 삭제했습니다.
  const categories = ['전체', '포스터', '스티커', '엽서', '키링', '에코백'];

  const filteredProducts = activeTab === '전체' 
    ? allProducts 
    : allProducts.filter(item => item.category === activeTab);

  const onDragStart = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDrag(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onDragEnd = () => setIsDrag(false);

  const onDragMove = (e: React.MouseEvent) => {
    if (!isDrag || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="main-content-scroll" style={{ padding: '20px', backgroundColor: '#fcfcfc' }}>
      <div style={{ marginBottom: '30px', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShoppingBag size={24} strokeWidth={2.5} />
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>아트 기프트 숍</h2>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>전시의 감동을 특별한 굿즈로 간직하세요.</p>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
        <div 
          ref={scrollRef}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          className="hide-scrollbar"
          style={{ display: 'flex', gap: '10px', overflowX: 'auto', flex: 1, cursor: isDrag ? 'grabbing' : 'grab' }}
        >
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => { if(!isDrag) setActiveTab(tab); }}
              style={{
                padding: '10px 24px', borderRadius: '25px', border: 'none',
                backgroundColor: activeTab === tab ? '#000' : '#fff',
                color: activeTab === tab ? '#fff' : '#888',
                fontWeight: 'bold', fontSize: '14px', flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <div key={item.id} style={{ borderRadius: '24px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ position: 'relative', height: '350px' }}>
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  {item.category}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>{item.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.price}</span>
                  <button style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#f5f5f5', border: 'none', fontSize: '12px', fontWeight: 'bold' }}>상세보기</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#888' }}>해당 카테고리 상품은 준비중입니다.</div>
        )}
      </div>
      <div style={{ height: '100px' }} />
    </div>
  );
};

export default GiftShop;