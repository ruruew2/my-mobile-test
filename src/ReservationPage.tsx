import React, { useState } from 'react';
import { ChevronLeft, Share2, MapPin, Calendar, Minus, Plus, X } from 'lucide-react';

interface ReservationPageProps {
  exhibit: any;
  onBack: () => void;
}

const ReservationPage = ({ exhibit, onBack }: ReservationPageProps) => {
  const [count, setCount] = useState(1);
  const [showPayModal, setShowPayModal] = useState(false); // 결제 모달 상태
  const pricePerTicket = 15000;

  if (!exhibit) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('페이지 링크가 복사되었습니다! ✨');
  };

  // 결제 버튼 클릭 시 실행
  const handlePaymentClick = () => {
    setShowPayModal(true);
  };

  const increment = () => { if (count < 10) setCount(prev => prev + 1); };
  const decrement = () => { if (count > 1) setCount(prev => prev - 1); };

  return (
    <div className="reservation-wrapper" style={{ 
      display: 'flex', justifyContent: 'center', background: '#f8f8f8', height: '100vh', overflow: 'hidden' 
    }}>
      <div className="reservation-container" style={{ 
        width: '100%', maxWidth: '450px', background: '#fff', height: '100vh', 
        display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.05)'
      }}>
        
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#fff', borderBottom: '1px solid #f5f5f5', zIndex: 10 }}>
          <ChevronLeft onClick={onBack} style={{ cursor: 'pointer' }} /> 
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>전시 예매</div>
          <Share2 size={20} style={{ cursor: 'pointer' }} onClick={handleShare} />
        </div>

        {/* 메인 내용 (스크롤 영역) */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ width: '100%', height: '350px', overflow: 'hidden' }}>
            <img src={exhibit.image_url || exhibit.img_url || "/api/placeholder/400/350"} alt={exhibit.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ color: '#7C4DFF', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>#전시추천</div>
            <h2 style={{ fontSize: '1.4rem', lineHeight: '1.4', marginBottom: '16px', fontWeight: '700' }}>{exhibit.title}</h2>
            
            {/* 수량 조절 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#f8f4ff', padding: '12px 16px', borderRadius: '12px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: '#7C4DFF', fontSize: '0.75rem', fontWeight: '800' }}>TRENDING</span>
                  <span style={{ color: '#333', fontSize: '0.9rem', fontWeight: '600' }}>성인 1인 {pricePerTicket.toLocaleString()}원</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #eee' }}>
                  <button onClick={decrement} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><Minus size={16} color={count > 1 ? "#000" : "#ccc"} strokeWidth={3} /></button>
                  <span style={{ fontWeight: '800', minWidth: '18px', textAlign: 'center' }}>{count}</span>
                  <button onClick={increment} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><Plus size={16} color={count < 10 ? "#000" : "#ccc"} strokeWidth={3} /></button>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', background: '#f9f9f9', padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={18} color="#666" />
                <span style={{ fontSize: '0.95rem' }}>{exhibit.place_name || exhibit.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} color="#666" />
                <span style={{ fontSize: '0.95rem' }}>{exhibit.date || "2026.03.13 ~ 2026.03.15"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 결제 버튼 */}
        <div style={{ padding: '16px 20px 30px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>총 {count}매 합계</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#000' }}>{(pricePerTicket * count).toLocaleString()}원</span>
          </div>
          
          <button 
            onClick={handlePaymentClick}
            style={{ width: '100%', padding: '16px', background: '#000000', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
          >
            결제하기
          </button>
        </div>

        {/* 🌟 카카오페이 개발자 QR 모달 */}
        {showPayModal && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#fff', width: '100%', borderRadius: '20px', padding: '30px', position: 'relative', textAlign: 'center' }}>
              <X onClick={() => setShowPayModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} />
              
              <div style={{ background: '#FEE500', display: 'inline-block', padding: '5px 12px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>kakaopay</span>
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>테스트 결제 (개발자용)</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '25px' }}>QR코드를 스캔하여 결제를 진행해주세요.</p>
              
              {/* QR 코드 영역 (임시 이미지) */}
              <div style={{ width: '180px', height: '180px', background: '#eee', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KakaopayTest" alt="QR Code" style={{ width: '150px' }} />
              </div>

              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '12px', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>상품명</span>
                  <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{exhibit.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>결제금액</span>
                  <span style={{ fontWeight: '700', color: '#7C4DFF' }}>{(pricePerTicket * count).toLocaleString()}원</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  alert('결제가 완료되었습니다! 목록으로 돌아갑니다.');
                  setShowPayModal(false);
                  onBack();
                }}
                style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                결제 완료 확인
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReservationPage;