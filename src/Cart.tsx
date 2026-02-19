import React from 'react';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';

const Cart = ({ cartItems, onBack, onRemove }: any) => {
    // 가격 계산 로직
    const calculateTotal = () => {
        const total = cartItems.reduce((acc: number, item: any) => {
            const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
            const qty = item.quantity || 1; 
            return acc + (price * qty);
        }, 0);
        return total.toLocaleString() + "원";
    };

    return (
        <div className="gift-shop-wrapper cart-page">
            {/* 상단 헤더 */}
            <div className="shop-header">
                <div className="header-title-row">
                    <button onClick={onBack} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="page-title">장바구니</h2>
                </div>
            </div>

            {/* 리스트 영역 */}
            <div className="sub-page-list">
                {cartItems.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={48} className="empty-icon" />
                        <p>장바구니가 비어있습니다.</p>
                    </div>
                ) : (
                    cartItems.map((item: any, idx: number) => (
                        <div key={`${item.id}-${idx}`} className="horizontal-card">
                            <div className="card-img-wrapper">
                                <img src={item.image} alt={item.title} className="card-img" />
                            </div>
                            
                            <div className="card-info">
                                <h3 className="item-title">{item.title}</h3>
                                <div className="price-row-in-card">
                                    <p className="price">{item.price}</p>
                                    <span className="qty-badge">{item.quantity || 1}개</span>
                                </div>
                            </div>

                            <button className="remove-btn" onClick={() => onRemove(item.id)}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* 하단 결제 바 */}
            {cartItems.length > 0 && (
                <div className="fixed-cart-footer">
                    <div className="price-row">
                        <span>총 결제 금액</span>
                        <span className="total-price">{calculateTotal()}</span>
                    </div>
                    <button className="checkout-btn">결제하기</button>
                </div>
            )}
        </div>
    );
};

export default Cart;