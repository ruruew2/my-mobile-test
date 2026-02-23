import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

const Wishlist = ({ likedProducts, onBack, onRemove, onItemClick }: any) => {
    return (
        <div className="wishlist-page-container">
            <div className="wishlist-header">
                <div className="wishlist-header-row">
                    <button onClick={onBack} className="wishlist-back-btn">
                        <ArrowLeft size={28} />
                    </button>
                    <h3 className="wishlist-page-title">찜한 목록</h3>
                </div>
            </div>

            <div className="wishlist-content-grid">
                {likedProducts.length === 0 ? (
                    <div className="wishlist-empty-state">
                        <p>좋아요 한 상품이 없습니다.</p>
                    </div>
                ) : (
                    likedProducts.map((item: any) => (
                        <div 
                            key={item.id} 
                            className="wishlist-grid-card"
                            onClick={() => onItemClick && onItemClick(item)}
                        >
                            <div className="wishlist-card-img-wrapper">
                                <img src={item.image} alt={item.title} className="wishlist-card-img" />
                                {/* 삭제 버튼을 이미지 위로 배치하여 공간 활용 */}
                                <button 
                                    className="wishlist-remove-btn-overlay" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(item.id);
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="wishlist-card-info">
                                <h3 className="wishlist-item-title">{item.title}</h3>
                                <p className="wishlist-price">
                                    {typeof item.price === 'number' 
                                        ? `${item.price.toLocaleString()}원` 
                                        : item.price}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Wishlist;