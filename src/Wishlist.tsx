import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

const Wishlist = ({ likedProducts, onBack, onRemove }: any) => {
    return (
        <div className="gift-shop-wrapper wishlist-page">
            <div className="shop-header">
                <div className="header-title-row">
                    <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 0 12px' }}>좋아요</h2>
                </div>
            </div>

            <div className="sub-page-list">
                {likedProducts.length === 0 ? (
                    <div className="empty-state">
                        <p>좋아요 한 상품이 없습니다.</p>
                    </div>
                ) : (
                    likedProducts.map((item: any) => (
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
        </div>
    );
};

export default Wishlist;