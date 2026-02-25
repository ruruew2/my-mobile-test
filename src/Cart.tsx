import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Minus, Plus, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; 
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
  const location = useLocation();

  // --- 모바일 결제 리디렉션 결과 처리 ---
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const imp_success = queryParams.get('imp_success');
    const error_msg = queryParams.get('error_msg');

    // 모바일 결제 후 m_redirect_url로 돌아온 경우
    if (imp_success === 'true') {
      setShowSuccess(true);
      // URL 파라미터 지우기 (성공 모달이 떠 있으므로 사용자에게 깔끔한 URL 노출)
      window.history.replaceState({}, '', location.pathname);
    } else if (imp_success === 'false') {
      alert(`결제 실패: ${error_msg}`);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  // 가격 계산 로직
  const totalPrice = cartItems.reduce((acc, item) => {
    const priceNum = typeof item.price === 'string' 
      ? parseInt(item.price.replace(/[^0-9]/g, '')) 
      : item.price;
    return acc + priceNum * item.quantity;
  }, 0);

  // 결제하기 핸들러
  const handleOrder = () => {
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
      // ✅ 모바일 대응 필수 설정
      // 리디렉션 주소는 현재 페이지 주소를 그대로 전달하여 useEffect에서 처리하게 합니다.
      m_redirect_url: `${window.location.origin}${location.pathname}`,
      app_scheme: 'my-mobile-test' // 아이폰 앱 복귀를 위한 스킴
    };

    IMP.request_pay(paymentData, (response: any) => {
      // PC 환경에서는 이 콜백이 실행됩니다.
      if (response.success) {
        setShowSuccess(true); 
      } else {
        // 모바일 리디렉션 시에는 이 창 자체가 닫히므로 콜백이 안 뜰 수 있습니다.
        if (response.error_msg) {
          alert(`결제 실패: ${response.error_msg}`);
        }
      }
    });
  };

  const handleFinalConfirm = () => {
    try {
      if (onClearCart) onClearCart();
      setShowSuccess(false); 
      navigate('/'); 
    } catch (error) {
      console.error("확인 버튼 처리 중 에러 발생:", error);
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