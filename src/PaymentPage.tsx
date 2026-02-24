import React from 'react';

declare global {
  interface Window {
    IMP: any;
  }
}

const PaymentPage = () => {
  const handlePayment = () => {
    const { IMP } = window;
    if (!IMP) {
      alert("결제 모듈을 불러오고 있어요. 잠시만 기다려 주세요!");
      return;
    }

    // 1. ✅ 포트원 공용 테스트 식별코드
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

    
    IMP.request_pay(data, (response: any) => {
      if (response.success) {
        // 여기는 성공 모달 대신 알림창으로 되어 있어요. 
        // 장바구니처럼 모달을 띄우고 싶다면 setShowSuccess(true)를 쓰면 됩니다!
        alert('결제가 완료되었습니다! 즐거운 관람 되세요. ✨');
      } else {
        alert(`결제 실패: ${response.error_msg}`);
      }
    });
  };

  return (
    <div className="art-log-container payment-view">
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
          <div className="menu-item">
            <span className="menu-left">포인트 할인</span>
            <span className="menu-icon" style={{color: '#ccc'}}>- 0원</span>
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