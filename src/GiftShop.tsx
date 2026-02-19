import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Heart, Trash2 } from 'lucide-react';
import './GiftShop.css';
import Wishlist from './Wishlist';
import Cart from './Cart';

const GiftShop = () => {
    // --- 상태 관리 ---
    const [activeTab, setActiveTab] = useState('전체');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [likedItems, setLikedItems] = useState<number[]>([]);
    const [cartItems, setCartItems] = useState<any[]>([]); 
    const [quantity, setQuantity] = useState(1); 
    
    const [viewMode, setViewMode] = useState<'main' | 'wishlist' | 'cart'>('main');

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (selectedProduct) setQuantity(1); 
    }, [selectedProduct, viewMode]);

    const toggleLike = (id: number) => {
        setLikedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const removeFromCart = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const handleQty = (type: 'plus' | 'minus') => {
        if (type === 'plus') setQuantity(prev => prev + 1);
        else if (type === 'minus' && quantity > 1) setQuantity(prev => prev - 1);
    };

    // --- 데이터 영역 (원본 유지) ---
    const categories = ['전체', '문구/사무', '패션/생활', '인테리어', '주방/식기', '소품'];

    const allProducts = [
        {
            id: 26,
            category: '문구/사무',
            title: '궁 엽서 세트',
            price: '15,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949239/stationery_postcard_main_hzrzfa.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949239/stationery_postcard_main_hzrzfa.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949238/stationery_postcard_detail_mcfw7g.jpg',
            ],
            description: '한국의 아름다운 5대 궁궐을 담은 프리미엄 엽서 세트입니다.',
            isMain: true,
        },
        {
            id: 22,
            category: '문구/사무',
            title: '반가유상 스티커',
            price: '2,500원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949233/stationery_sticker_main_o25clh.jpg',
            description: '귀여운 반가사유상 캐릭터 스티커입니다.',
            isMain: false,
        },
        {
            id: 24,
            category: '문구/사무',
            title: '호두령패 자석',
            price: '10,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949235/stationery_magnet_main_urti6m.jpg',
            description: '전통 패를 재해석한 고급스러운 자석입니다.',
            isMain: false,
        },
        {
            id: 1,
            category: '패션/생활',
            title: '납작 달항아리 파우치',
            price: '18,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949221/fashion_pouch_main_dfjvsc.jpg',
            description: '달항아리의 곡선을 살린 입체 파우치입니다.',
            isMain: true,
        },
        {
            id: 4,
            category: '패션/생활',
            title: '고양이 카드지갑',
            price: '20,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949226/fashion_wallet_main_txibot.jpg',
            description: '민화 속 고양이를 자수로 표현한 지갑입니다.',
            isMain: false,
        },
        {
            id: 7,
            category: '패션/생활',
            title: '데니 태극기 키링',
            price: '20,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949230/fashion_keyring_main_rij9fw.jpg',
            description: '데니 태극기를 모티브로 제작된 키링입니다.',
            isMain: false,
        },
        {
            id: 9,
            category: '소품',
            title: '반가유상 미니어처',
            price: '65,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949217/prop_mini_main_hwy5pe.jpg',
            description: '국보 반가사유상을 정교하게 재현한 미니어처입니다.',
            isMain: true,
        },
        {
            id: 13,
            category: '인테리어',
            title: '행운의 북어벨',
            price: '35,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949209/decor_fishbell_main_kmeofv.jpg',
            description: '평안과 복을 기원하는 도어벨입니다.',
            isMain: true,
        },
        {
            id: 16,
            category: '주방/식기',
            title: '취객선비 변색 잔세트',
            price: '26,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949203/tableware_cup_main_h27cdj.jpg',
            description: '온도에 따라 색이 변하는 선비 잔입니다.',
            isMain: true,
        },
        {
            id: 18,
            category: '주방/식기',
            title: '자개 텀블러(무궁화)',
            price: '54,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1770949201/tableware_tumbler_main_dyfpre.jpg',
            description: '자개 공예 기법으로 문양을 새긴 텀블러입니다.',
            isMain: false,
        },
    ];

    const filteredProducts =
        activeTab === '전체'
            ? allProducts.filter((p) => p.isMain)
            : allProducts.filter((p) => p.category === activeTab);

    // --- [화면 3] 좋아요(위시리스트) 화면 ---
    if (viewMode === 'wishlist') {
        const likedProducts = allProducts.filter(p => likedItems.includes(p.id));
        return (
            <Wishlist 
                likedProducts={likedProducts} 
                onBack={() => setViewMode('main')} 
                onRemove={toggleLike} 
            />
        );
    }

    // --- [화면 4] 장바구니 화면 ---
    if (viewMode === 'cart') {
        return (
            <Cart 
                cartItems={cartItems} 
                onBack={() => setViewMode('main')} 
                onRemove={removeFromCart} 
            />
        );
    }

    // --- [화면 1] 상세보기 화면 ---
    if (selectedProduct) {
        const displayImages =
            selectedProduct.detailImages && selectedProduct.detailImages.length > 0
                ? selectedProduct.detailImages
                : [selectedProduct.image];

        return (
            <div className="gift-shop-wrapper detail-view">
                <button
                    className="back-button"
                    onClick={() => {
                        setSelectedProduct(null);
                        setCurrentImgIdx(0);
                    }}
                >
                    <ArrowLeft size={24} /> <span>목록으로</span>
                </button>

                <div className="detail-content">
                    <div className="detail-gallery">
                        <div className="main-image-container">
                            <img src={displayImages[currentImgIdx]} alt="detail" className="main-detail-image" />
                        </div>
                        <div className="thumbnail-list">
                            {displayImages.map((img: string, idx: number) => (
                                <div
                                    key={idx}
                                    className={`thumbnail-item ${currentImgIdx === idx ? 'active' : ''}`}
                                    onClick={() => setCurrentImgIdx(idx)}
                                >
                                    <img src={img} alt={`thumb-${idx}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="detail-info-section">
                        <div className="detail-header-row">
                            <h2>{selectedProduct.title}</h2>
                            <button className="detail-like-btn" onClick={() => toggleLike(selectedProduct.id)}>
                                <Heart
                                    size={30}
                                    fill={likedItems.includes(selectedProduct.id) ? '#FF4B4B' : 'none'}
                                    stroke={likedItems.includes(selectedProduct.id) ? '#FF4B4B' : '#000'}
                                />
                            </button>
                        </div>

                        <div className="price-quantity-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <p className="detail-price" style={{ margin: 0 }}>{selectedProduct.price}</p>
                            <div className="quantity-counter" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f5f5f5', padding: '5px 15px', borderRadius: '20px' }}>
                                <button onClick={() => handleQty('minus')} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>-</button>
                                <span style={{ fontWeight: 'bold' }}>{quantity}</span>
                                <button onClick={() => handleQty('plus')} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>+</button>
                            </div>
                        </div>

                        <p className="detail-description">{selectedProduct.description}</p>
                        
                        <button 
                            className="buy-button"
                            onClick={() => {
                                const itemWithQty = { ...selectedProduct, quantity };
                                setCartItems(prev => [...prev, itemWithQty]);
                                setViewMode('cart');
                                setSelectedProduct(null);
                            }}
                        >
                            {quantity}개 장바구니 담기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- [화면 2] 목록 메인 화면 ---
// --- [화면 2] 목록 메인 화면 ---
    return (
        <div className="gift-shop-wrapper">
            {/* 상단 헤더 영역 - 구조 단순화 */}
            <div className="shop-header">
                <div className="header-title-row">
                    {/* 왼쪽 제목 세트 */}
                    <div className="title-left">
                        <ShoppingBag size={24} /> 
                        <h2>아트 기프트 숍</h2>
                    </div>
                    
                    {/* 오른쪽 아이콘 세트 */}
                    <div className="header-icon-group">
                        <button className="icon-btn" onClick={() => setViewMode('wishlist')}>
                            <Heart size={24} fill={likedItems.length > 0 ? "#000" : "none"} />
                            {likedItems.length > 0 && <span className="badge">{likedItems.length}</span>}
                        </button>
                        <button className="icon-btn" onClick={() => setViewMode('cart')}>
                            <ShoppingBag size={24} />
                            {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
                        </button>
                    </div>
                </div>
                {/* 설명글은 row 밖으로 빼서 무조건 아래로 가게 함 */}
                <p className="shop-description">전시의 감동을 특별한 굿즈로 간직하세요.</p>
            </div>

            {/* 카테고리 탭 (기존 코드 유지) */}
            <div className="category-container">
                {categories.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`category-btn ${activeTab === tab ? 'active' : ''}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 상품 리스트 (기존 코드 유지) */}
            <div className="product-list">
                {filteredProducts.map((item) => (
                    <div key={item.id} className="product-card" onClick={() => setSelectedProduct(item)}>
                        <div className="product-image-container">
                            <div className="category-tag">{item.category}</div>
                            <img src={item.image} alt={item.title} className="product-image" />
                            <button
                                className="like-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(item.id);
                                }}
                            >
                                <Heart size={20} fill={likedItems.includes(item.id) ? '#FF4B4B' : 'none'} stroke={likedItems.includes(item.id) ? '#FF4B4B' : '#000'} />
                            </button>
                        </div>
                        <div className="product-info">
                            <div>
                                <h3>{item.title}</h3>
                                <span className="product-price">{item.price}</span>
                            </div>
                            <button className="detail-btn">상세보기</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GiftShop;