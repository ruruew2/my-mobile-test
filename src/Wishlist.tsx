import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

// onItemClick 프롭을 추가하여 상세 페이지 이동 기능을 연결합니다.
const Wishlist = ({ likedProducts, onBack, onRemove, onItemClick }: any) => {
    return (
        /* gift-shop-wrapper와의 간섭을 피하기 위해 전용 컨테이너 클래스 사용 */
        <div className="wishlist-page-container">
            
            {/* 상단 헤더: wishlist 전용 클래스로 변경하여 아트 기프트 숍 헤더 보호 */}
            <div className="wishlist-header">
                <div className="wishlist-header-row">
                    {/* 뒤로가기 버튼: absolute로 왼쪽 고정 */}
                    <button onClick={onBack} className="wishlist-back-btn">
                        <ArrowLeft size={28} />
                    </button>
                    
                    {/* 타이틀: flex 중앙 정렬 */}
                    <h3 className="wishlist-page-title">찜한 목록</h3>
                </div>
            </div>

            {/* 리스트 영역 */}
            <div className="wishlist-content-list">
                {likedProducts.length === 0 ? (
                    /* 아이콘 없이 텍스트만 모던하게 중앙 배치 */
                    <div className="wishlist-empty-state">
                        <p>좋아요 한 상품이 없습니다.</p>
                    </div>
                ) : (
                    likedProducts.map((item: any) => (
                        <div 
                            key={item.id} 
                            className="wishlist-horizontal-card"
                            /* 카드 클릭 시 상세 페이지 이동 로직 수행 */
                            onClick={() => onItemClick && onItemClick(item)}
                        >
                            <div className="wishlist-card-img-wrapper">
                                <img src={item.image} alt={item.title} className="wishlist-card-img" />
                            </div>

                            <div className="wishlist-card-info">
                                <h3 className="wishlist-item-title">{item.title}</h3>
                                <p className="wishlist-price">
                                    {/* 숫자일 경우 콤마 표시, 문자열일 경우 그대로 출력 */}
                                    {typeof item.price === 'number' 
                                        ? `${item.price.toLocaleString()}원` 
                                        : item.price}
                                </p>
                            </div>

                            {/* 삭제 버튼: stopPropagation으로 상세 이동 이벤트 전파 방지 */}
                            <button 
                                className="wishlist-remove-btn" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(item.id);
                                }}
                            >
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