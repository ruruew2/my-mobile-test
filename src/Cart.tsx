import React, { useState } from 'react';
import { ArrowLeft, Trash2, Minus, Plus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import './Cart.css';

// 장바구니 아이템 타입 정의
interface CartItem {
  id: string | number;
  title: string;
  price: string | number;
  image: string;
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  onBack: () => void;
  onRemove: (id: any) => void;
  onUpdateQuantity: (id: any, newQty: number) => void;
  onClearCart: () => void;
}

const Cart = ({ cartItems, onBack, onRemove, onUpdateQuantity, onClearCart }: CartProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate(); 

  // 가격 계산 로직
  const totalPrice = cartItems.reduce((acc, item) => {
    const priceNum = typeof item.price === 'string' 
      ? parseInt(item.price.replace(/[^0-9]/g, '')) 
      : item.price;
    return acc + priceNum * item.quantity;
  }, 0);

  // 결제하기 핸들러
  const handleOrder = () => {
    // 🚩 window를 any로 타입 캐스팅하여 IMP 호출 (가장 확실한 방법)
    const { IMP } = window as any;
    if (!IMP) {
      alert("결제 모듈을 불러올 수 없습니다.");
      return;
    }

    IMP.init('imp03310872'); 

    const paymentData = {
        pg: 'kakaopay.TC0ONETIME',
        pay_method: 'card',
        merchant_uid: `mid_${new Date().getTime()}`,
        name: cartItems.length > 1 
            ? `${cartItems[0].title} 외 ${cartItems.length - 1}건` 
            : cartItems.length === 1 ? cartItems[0].title : "상품 주문",
        amount: totalPrice,
        buyer_name: '테스터',
    };

    IMP.request_pay(paymentData, (response: any) => {
        if (response.success) {
            console.log("결제 성공:", response);
            setShowSuccess(true); 
        } else {
            alert(`결제 실패: ${response.error_msg}`);
        }
    });
  };

const handleFinalConfirm = () => {
    try {
      console.log("확인 버튼 클릭됨");
      
      // 1. 장바구니 비우기 함수 실행
      if (onClearCart) onClearCart();
      
      // 2. 모달 상태를 명시적으로 false로 변경 (가장 중요!)
      setShowSuccess(false); 
      
      // 3. 메인 페이지로 이동
      console.log("메인으로 이동 시도");
      navigate('/'); 
    } catch (error) {
      console.error("확인 버튼 처리 중 에러 발생:", error);
      // 에러가 나더라도 일단 모달은 닫고 메인으로 보냅니다.
      setShowSuccess(false);
      navigate('/');
    }
  };

  return (
    <div className="cart-page-container">
      <header className="cart-header">
        <button className="back-icon-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="header-title">장바구니</h2>
        <div style={{ width: 24 }}></div>
      </header>

      <div className="cart-content">
        {cartItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-circle">
              <Trash2 size={40} />
            </div>
            <p className="empty-text">장바구니가 비어있습니다.</p>
            <button className="go-shopping-btn" onClick={onBack}>
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <>
            <div className="cart-count">
              전체 <span>{cartItems.length}</span>개
            </div>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-img-box">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="cart-item-info">
                    <div className="item-header">
                      <h3 className="item-name">{item.title}</h3>
                      <button className="delete-btn" onClick={() => onRemove(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="item-bottom">
                      <p className="item-price">
                        {(typeof item.price === 'string'
                          ? parseInt(item.price.replace(/[^0-9]/g, '')) * item.quantity
                          : item.price * item.quantity
                        ).toLocaleString()}원
                      </p>
                      <div className="quantity-control">
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="total-row">
            <span className="total-label">총 주문금액</span>
            <span className="total-amount">{totalPrice.toLocaleString()}원</span>
          </div>
          <button className="order-primary-btn" onClick={handleOrder}>
            결제하기
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <CheckCircle size={56} color="#000" strokeWidth={2.5} className="success-icon" />
            <h3>주문이 완료되었습니다!</h3>
            <p>소중한 상품을 정성껏 준비하여<br />발송해 드리겠습니다.</p>
            <button className="close-modal-btn" onClick={handleFinalConfirm}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;