import React from 'react';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';

const Cart = ({ cartItems, onBack, onRemove }: any) => {
    // 가격 계산 (예: "15,000원" -> 15000)
    const calculateTotal = () => {
        const total = cartItems.reduce((acc, item) => {
            const price = parseInt(item.price.replace(/[^0-9]/g, ''));
            return acc + price;
        }, 0);
        return total.toLocaleString() + "원";
    };

    return (
        <div className="gift-shop-wrapper cart-page">
            <div className="shop-header">
                <div className="header-title-row">
                    <button className="back-button" onClick={onBack}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="page-title">장바구니</h2>
                </div>
            </div>

            <div className="sub-page-list">
                {cartItems.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={48} className="empty-icon" />
                        <p>장바구니가 비어있습니다.</p>
                    </div>
                ) : (
                    cartItems.map((item: any) => (
                        <div key={item.id} className="horizontal-card">
                            <img src={item.image} alt={item.title} className="card-img" />
                            <div className="card-info">
                                <h3>{item.title}</h3>
                                <p className="price">{item.price}</p>
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