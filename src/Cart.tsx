import React, { useState } from 'react'; // useState 추가
import { ArrowLeft, Trash2, Minus, Plus, CheckCircle } from 'lucide-react'; // CheckCircle 추가
import './Cart.css';

interface CartProps {
    cartItems: any[];
    onBack: () => void;
    onRemove: (id: any) => void;
    onUpdateQuantity: (id: any, newQty: number) => void;
    onClearCart: () => void; // ✨ 장바구니 전체 삭제 함수 추가
}

const Cart = ({ cartItems, onBack, onRemove, onUpdateQuantity, onClearCart }: CartProps) => {
    const [showSuccess, setShowSuccess] = React.useState(false);

    // 2. 기존의 가격 계산 로직
    const totalPrice = cartItems.reduce((acc, item) => {
        const priceNum = typeof item.price === 'string' ? parseInt(item.price.replace(/[^0-9]/g, '')) : item.price;
        return acc + priceNum * item.quantity;
    }, 0);

    // 3. 결제 버튼 클릭 시 실행될 함수
    const handleOrder = () => {
        setShowSuccess(true); // 팝업 띄우기
    };
    const handleFinalConfirm = () => {
        onClearCart(); // 1. 장바구니를 비우고
        onBack(); // 2. 메인 페이지(기프트숍)로 돌아갑니다.
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
                                                ).toLocaleString()}
                                                원
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

            {/* 5. 팝업(모달) UI 부분 수정 */}
            {showSuccess && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <CheckCircle size={56} color="#000" strokeWidth={2.5} className="success-icon" />
                        <h3>주문이 완료되었습니다!</h3>
                        <p>
                            소중한 상품을 정성껏 준비하여
                            <br />
                            발송해 드리겠습니다.
                        </p>
                        <button className="close-modal-btn" onClick={handleFinalConfirm}>
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
