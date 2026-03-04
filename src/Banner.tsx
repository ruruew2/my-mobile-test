import React, { useState, useEffect } from 'react';
import './Banner.css';

const Banner = () => {
    const banners = [
        {
            id: 1,
            tag: 'LIMITED OFFER',
            subtitle: '얼리버드 50% 할인 티켓',
            desc: '전시 <르네 마그리트> 선착순 100명 한정 판매',
            imgUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800',
            date: '2026.03.01 - 03.15',
        },
        {
            id: 2,
            tag: 'HOT EXHIBITION',
            subtitle: '초현실주의 거장: 르네 마그리트 展',
            desc: '벨기에 왕립 미술관 제작, DDP 아시아 최대 회고전',
            imgUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800',
            date: '2026.02.15 - 05.20',
        },
        {
            id: 3,
            tag: 'MUST WATCH',
            subtitle: '뮤지컬 <알라딘> 한국 공연',
            desc: '브로드웨이 오리지널의 감동 그대로, ArtLog 단독 회차',
            imgUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=800',
            date: '2025.11.22 - 2026.04.10',
        },
        {
            id: 4,
            tag: 'ART GIFT',
            subtitle: '취향을 담은 가장 특별한 선물',
            desc: '소중한 분에게 ArtLog 전시 관람권과 굿즈를 선물하세요',
            imgUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800',
            date: 'ArtLog Gift 상시 운영',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!isPaused) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 3000); // 3초로 복구
            return () => clearInterval(timer);
        }
    }, [isPaused, banners.length]);

    return (
        <div className="banner-viewport" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div className="banner-slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {banners.map((b) => (
                    <div key={b.id} className="banner-slide" style={{ backgroundImage: `url(${b.imgUrl})` }}>
                        <div className="banner-overlay"></div>
                        <div className="banner-text-content">
                            <span className="banner-tag">{b.tag}</span>
                            <h2 className="banner-main-title">{b.subtitle}</h2>
                            <p className="banner-sub-desc">{b.desc}</p>
                            <span className="banner-date">{b.date}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="banner-indicators">
                {banners.map((_, i) => (
                    <div key={i} className={`indicator ${i === currentIndex ? 'active' : ''}`} />
                ))}
            </div>
        </div>
    );
};

export default Banner;
