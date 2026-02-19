import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Heart } from 'lucide-react';
import './GiftShop.css';
import Wishlist from './Wishlist';
import Cart from './Cart';

const GiftShop = () => {
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

    // --- 카테고리 태그 (형용사 버전) ---
    const categories = ['전체', '문구/사무', '패션/생활', '주방/식기', '인테리어', '소품'];

    // --- 전체 데이터 (누락된 상품 2종 복구 완료) ---
    const allProducts = [
        {
            id: 26,
            category: '몽환적인',
            title: '궁 엽서 세트',
            price: '15,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479831/stationery_postcard_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479831/stationery_postcard_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479826/stationery_postcard_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479828/stationery_postcard_02.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479830/stationery_postcard_03.jpg'
            ],
            description: '한국의 아름다운 5대 궁궐을 담은 프리미엄 엽서 세트입니다.',
            isMain: true,
        },
        {
            id: 22,
            category: '톡톡튀는',
            title: '반가유상 스티커',
            price: '2,500원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479837/stationery_sticker_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479837/stationery_sticker_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479834/stationery_sticker_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479835/stationery_sticker_02.jpg'
            ],
            description: '귀여운 반가사유상 캐릭터 스티커입니다.',
            isMain: false,
        },
        {
            id: 24,
            category: '정갈한',
            title: '호두령패 자석',
            price: '10,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479823/stationery_magnet_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479823/stationery_magnet_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479820/stationery_magnet_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479822/stationery_magnet_02.jpg'
            ],
            description: '전통 패를 재해석한 고급스러운 자석입니다.',
            isMain: false,
        },
        {
            id: 1,
            category: '감각적인',
            title: '납작 달항아리 파우치',
            price: '18,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479805/fashion_pouch_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479805/fashion_pouch_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479802/fashion_pouch_back.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479803/fashion_pouch_detail.jpg'
            ],
            description: '달항아리의 곡선을 살린 입체 파우치입니다.',
            isMain: true,
        },
        {
            id: 4, // 누락 복구
            category: '감각적인',
            title: '고양이 카드지갑',
            price: '20,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479810/fashion_wallet_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479810/fashion_wallet_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479807/fashion_wallet_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479808/fashion_wallet_02.jpg'
            ],
            description: '민화 속 고양이를 자수로 표현한 지갑입니다.',
            isMain: false,
        },
        {
            id: 7, // 누락 복구
            category: '감각적인',
            title: '데니 태극기 키링',
            price: '20,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479800/fashion_keyring_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479800/fashion_keyring_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479796/fashion_keyring_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479798/fashion_keyring_02.jpg'
            ],
            description: '데니 태극기를 모티브로 제작된 키링입니다.',
            isMain: false,
        },
        {
            id: 9,
            category: '감각적인',
            title: '반가유상 미니어처',
            price: '65,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479818/prop_mini_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479818/prop_mini_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479813/prop_mini_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479814/prop_mini_02.jpg'
            ],
            description: '국보 반가사유상을 정교하게 재현한 미니어처입니다.',
            isMain: true,
        },
        {
            id: 13,
            category: '정갈한',
            title: '행운의 북어벨',
            price: '35,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479795/decor_fishbell_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479795/decor_fishbell_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479792/decor_fishbell_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479793/decor_fishbell_02.jpg'
            ],
            description: '평안과 복을 기원하는 도어벨입니다.',
            isMain: true,
        },
        {
            id: 16,
            category: '우아한',
            title: '취객선비 변색 잔세트',
            price: '26,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479843/tableware_cup_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479843/tableware_cup_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479839/tableware_cup_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479841/tableware_cup_02.jpg'
            ],
            description: '온도에 따라 색이 변하는 선비 잔입니다.',
            isMain: true,
        },
        {
            id: 18,
            category: '우아한',
            title: '자개 텀블러(무궁화)',
            price: '54,000원',
            image: 'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479850/tableware_tumbler_main.jpg',
            detailImages: [
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479850/tableware_tumbler_main.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479845/tableware_tumbler_01.jpg',
                'https://res.cloudinary.com/ddr95otqk/image/upload/v1771479848/tableware_tumbler_02.jpg'
            ],
            description: '자개 공예 기법으로 문양을 새긴 텀블러입니다.',
            isMain: false,
        },
    ];

    const filteredProducts =
        activeTab === '전체'
            ? allProducts.filter((p) => p.isMain)
            : allProducts.filter((p) => p.category === activeTab);

    if (viewMode === 'wishlist') {
        const likedProducts = allProducts.filter(p => likedItems.includes(p.id));
        return <Wishlist likedProducts={likedProducts} onBack={() => setViewMode('main')} onRemove={toggleLike} />;
    }

    if (viewMode === 'cart') {
        return <Cart cartItems={cartItems} onBack={() => setViewMode('main')} onRemove={removeFromCart} />;
    }

    if (selectedProduct) {
        // 안전장치: detailImages가 없으면 기본 image를 배열로 사용
        const displayImages = selectedProduct.detailImages && selectedProduct.detailImages.length > 0 
            ? selectedProduct.detailImages 
            : [selectedProduct.image];

        return (
            <div className="gift-shop-wrapper detail-view">
                <button className="back-button" onClick={() => { setSelectedProduct(null); setCurrentImgIdx(0); }}>
                    <ArrowLeft size={24} /> <span>목록으로</span>
                </button>
                <div className="detail-content">
                    <div className="detail-gallery">
                        <div className="main-image-container">
                            <img src={displayImages[currentImgIdx]} alt="detail" className="main-detail-image" />
                        </div>
                        <div className="thumbnail-list">
                            {displayImages.map((img: string, idx: number) => (
                                <div key={idx} className={`thumbnail-item ${currentImgIdx === idx ? 'active' : ''}`} onClick={() => setCurrentImgIdx(idx)}>
                                    <img src={img} alt={`thumb-${idx}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="detail-info-section">
                        <div className="detail-header-row">
                            <h2>{selectedProduct.title}</h2>
                            <button className="detail-like-btn" onClick={() => toggleLike(selectedProduct.id)}>
                                <Heart size={30} fill={likedItems.includes(selectedProduct.id) ? '#FF4B4B' : 'none'} stroke={likedItems.includes(selectedProduct.id) ? '#FF4B4B' : '#000'} />
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
                        <button className="buy-button" onClick={() => {
                            const itemWithQty = { ...selectedProduct, quantity };
                            setCartItems(prev => [...prev, itemWithQty]);
                            setViewMode('cart');
                            setSelectedProduct(null);
                        }}>
                            {quantity}개 장바구니 담기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gift-shop-wrapper">
            <div className="shop-header">
                <div className="header-title-row">
                    <div className="title-left">
                        <ShoppingBag size={24} /> 
                        <h2>아트 기프트 숍</h2>
                    </div>
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
                <p className="shop-description">전시의 감동을 특별한 굿즈로 간직하세요.</p>
            </div>

            <div className="category-container">
                {categories.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`category-btn ${activeTab === tab ? 'active' : ''}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="product-list">
                {filteredProducts.map((item) => (
                    <div key={item.id} className="product-card" onClick={() => setSelectedProduct(item)}>
                        <div className="product-image-container">
                            <div className="category-tag">{item.category}</div>
                            <img src={item.image} alt={item.title} className="product-image" />
                            <button className="like-button" onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}>
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