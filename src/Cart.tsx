import React from 'react';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';

const Cart = ({ cartItems, onBack, onRemove }: any) => {
    // 가격 계산 (숫자 추출 로직 개선)
    const calculateTotal = () => {
        const total = cartItems.reduce((acc: number, item: any) => {
            const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
            const qty = item.quantity || 1; // 수량 반영
            return acc + (price * qty);
        }, 0);
        return total.toLocaleString() + "원";
    };

    return (
        <div className="gift-shop-wrapper cart-page">
            <div className="shop-header">
                {/* 🚩 수평 정렬 수정: flex-start로 왼쪽 정렬 고정 */}
                <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} />
                    </button>
                    {/* 🚩 flex: 1 제거하여 제목 쏠림 방지 */}
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 0 12px' }}>장바구니</h2>
                </div>
            </div>

            <div className="sub-page-list">
                {cartItems.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={48} className="empty-icon" />
                        <p>장바구니가 비어있습니다.</p>
                    </div>
                ) : (
                    cartItems.map((item: any, idx: number) => (
                        /* 🚩 key값 오류 방지: id가 중복될 수 있으므로 idx를 조합 */
                        <div key={`${item.id}-${idx}`} className="horizontal-card">
                            <img src={item.image} alt={item.title} className="card-img" />
                            <div className="card-info">
                                <h3>{item.title}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p className="price">{item.price}</p>
                                    {item.quantity && <span style={{ fontSize: '13px', color: '#888' }}>{item.quantity}개</span>}
                                </div>
                            </div>
                            <button className="remove-btn" onClick={() => onRemove(item.id)}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>

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