import React from 'react';
import { useNavigate } from 'react-router-dom'; // 🚩 이동을 위해 추가

declare global {
  interface Window {
    IMP: any;
  }
}

const PaymentPage = () => {
  const navigate = useNavigate(); // 🚩 네비게이트 함수 생성

  const handlePayment = () => {
    const { IMP } = window as any;
    if (!IMP) return;

    IMP.init('imp03310872'); 

    const data = {
      pg: 'kakaopay.TC0ONETIME', 
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      name: '서울 시립 미술관 도슨트 투어',
      amount: 15000,
      buyer_email: 'user@example.com',
      buyer_name: '홍길동',
    };

    IMP.request_pay(data, async (response: any) => {
      if (response.success) {
        // 🚩 1. DB에 저장할 데이터 준비
        const paymentInfo = {
          orderId: response.merchant_uid,
          amount: response.paid_amount,
          buyer: response.buyer_name,
          status: 'success',
          date: new Date().toLocaleString()
        };
        
        console.log("DB에 저장될 데이터:", paymentInfo);
        // 여기서 axios.post('/api/save-payment', paymentInfo) 처럼 서버로 보내면 됩니다!

        alert('결제가 완료되었습니다! 즐거운 관람 되세요. ✨');
        
        // 🚩 2. 메인 페이지로 이동
        navigate('/'); 
      } else {
        alert(`결제 실패: ${response.error_msg}`);
      }
    });
  };

  return (
    <div className="art-log-container payment-view">
      {/* ... 기존 UI 동일 ... */}
      <header className="header">
        <div className="logo">ArtLog</div>
      </header>
      
      <div className="section payment-info">
        <div className="section-header">
          <h3>결제하기 <span className="eng-sub">CHECKOUT</span></h3>
        </div>
        
        <div className="course-card">
          <div className="course-content">
            <span className="course-tag">Premium Docent</span>
            <h4>서울 시립 미술관 도슨트 투어</h4>
            <p>성인 1인권 · 15,000원</p>
          </div>
        </div>

        <div className="menu-group" style={{marginTop: '30px'}}>
          <h4>결제 상세</h4>
          <div className="menu-item">
            <span className="menu-left">주문 금액</span>
            <span className="docent-price">15,000원</span>
          </div>
        </div>
      </div>

      <button className="cta-button" onClick={handlePayment} style={{marginTop: 'auto', marginBottom: '20px'}}>
        15,000원 결제하기 <span className="cta-icon">→</span>
      </button>
    </div>
  );
};

export default PaymentPage;