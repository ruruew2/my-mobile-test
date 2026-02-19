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
    
    // 🚩 화면 모드: 'main'(목록), 'wishlist'(좋아요), 'cart'(장바구니)
    const [viewMode, setViewMode] = useState<'main' | 'wishlist' | 'cart'>('main');

    // 상세보기 진입 시 스크롤 상단 이동
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedProduct, viewMode]);

    const toggleLike = (id: number) => {
        setLikedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
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
            <div className="gift-shop-wrapper">
                <div className="shop-header">
                    <div className="header-title-row">
                        <button className="back-button" onClick={() => setViewMode('main')} style={{marginBottom: 0}}>
                            <ArrowLeft size={24} />
                        </button>
                        <h2 style={{flex: 1, marginLeft: '10px'}}>좋아요</h2>
                    </div>
                </div>
                <div className="product-list" style={{paddingTop: '20px'}}>
                    {likedProducts.length === 0 ? (
                        <p style={{textAlign: 'center', padding: '100px 0', color: '#888'}}>좋아요 한 상품이 없습니다.</p>
                    ) : (
                        likedProducts.map(item => (
                            <div key={item.id} className="product-card" style={{display: 'flex', padding: '15px', gap: '15px', alignItems: 'center'}}>
                                <img src={item.image} alt={item.title} style={{width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover'}} />
                                <div style={{flex: 1}}>
                                    <h3 style={{fontSize: '16px', margin: '0 0 5px 0'}}>{item.title}</h3>
                                    <p style={{fontWeight: 'bold', margin: 0}}>{item.price}</p>
                                </div>
                                <button onClick={() => toggleLike(item.id)} style={{background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer'}}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // --- [화면 4] 장바구니 화면 ---
    if (viewMode === 'cart') {
        return (
            <div className="gift-shop-wrapper">
                <div className="shop-header">
                    <div className="header-title-row">
                        <button className="back-button" onClick={() => setViewMode('main')} style={{marginBottom: 0}}>
                            <ArrowLeft size={24} />
                        </button>
                        <h2 style={{flex: 1, marginLeft: '10px'}}>장바구니</h2>
                    </div>
                </div>
                <div style={{textAlign: 'center', padding: '100px 0'}}>
                    <ShoppingBag size={48} style={{color: '#eee', marginBottom: '10px'}} />
                    <p style={{color: '#888'}}>장바구니가 비어있습니다.</p>
                </div>
            </div>
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
                        <p className="detail-price">{selectedProduct.price}</p>
                        <p className="detail-description">{selectedProduct.description}</p>
                        <button className="buy-button">구매하기</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- [화면 2] 목록 메인 화면 ---
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
                            <Heart size={22} />
                            {likedItems.length > 0 && <span className="badge">{likedItems.length}</span>}
                        </button>
                        <button className="icon-btn" onClick={() => setViewMode('cart')}>
                            <ShoppingBag size={22} />
                            <span className="badge">0</span>
                        </button>
                    </div>
                </div>
                <p className="shop-description">전시의 감동을 특별한 굿즈로 간직하세요.</p>
            </div>

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

            <div className="product-list">
                {filteredProducts.map((item) => (
                    <div key={item.id} className="product-card">
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
                                <Heart
                                    size={20}
                                    fill={likedItems.includes(item.id) ? '#FF4B4B' : 'none'}
                                    stroke={likedItems.includes(item.id) ? '#FF4B4B' : '#000'}
                                />
                            </button>
                        </div>
                        <div className="product-info">
                            <div>
                                <h3>{item.title}</h3>
                                <span className="product-price">{item.price}</span>
                            </div>
                            <button className="detail-btn" onClick={() => setSelectedProduct(item)}>
                                상세보기
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GiftShop;