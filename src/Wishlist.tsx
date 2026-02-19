import React from 'react';
import { ArrowLeft, Trash2, Heart } from 'lucide-react';

const Wishlist = ({ likedProducts, onBack, onRemove }: any) => {
    return (
        <div className="gift-shop-wrapper wishlist-page">
            {/* 상단 헤더 */}
            <div className="shop-header">
                <div className="header-title-row">
                    <button onClick={onBack} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="page-title">좋아요</h2>
                </div>
            </div>

            {/* 리스트 영역 */}
            <div className="sub-page-list">
                {likedProducts.length === 0 ? (
                    <div className="empty-state">
                        <Heart size={48} className="empty-icon" />
                        <p>좋아요 한 상품이 없습니다.</p>
                    </div>
                ) : (
                    likedProducts.map((item: any) => (
                        <div key={item.id} className="horizontal-card">
                            <div className="card-img-wrapper">
                                <img src={item.image} alt={item.title} className="card-img" />
                            </div>

                            <div className="card-info">
                                <h3 className="item-title">{item.title}</h3>
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