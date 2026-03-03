import React, { useState, useEffect } from 'react';
import './Banner.css';

const Banner = () => {
    const banners = [
        {
            id: 1,
            title: '새로운 시작, 새로운 설렘',
            subtitle: '3월 티켓 혜택 모음',
            desc: '봄과 함께 찾아온 신작 공연 & 선착순 쿠폰',
            imgUrl: 'https://picsum.photos/800/400?random=1',
        },
        {
            id: 2,
            title: '지금 가장 핫한 전시',
            subtitle: '현대 미술의 정수, 리얼리티 展',
            desc: 'ArtLog 단독 예매 시 20% 할인',
            imgUrl: 'https://picsum.photos/800/400?random=2',
        },
        {
            id: 3,
            title: '소중한 사람에게 선물하세요',
            subtitle: '전시 관람권 & 굿즈 선물하기',
            desc: '마음을 전하는 가장 예술적인 방법',
            imgUrl: 'https://picsum.photos/800/400?random=3',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [banners.length]);

    return (
        <div className="banner-viewport">
            <div className="banner-slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {banners.map((b) => (
                    <div
                        key={b.id}
                        className="banner-slide"
                        style={{
                            // 사진 위에 어두운 그라데이션을 겹쳐서 글자가 잘 보이게 만듭니다.
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${b.imgUrl})`,
                        }}
                    >
                        <div className="banner-text-content">
                            <span className="banner-tag">SPECIAL EVENT</span>
                            <h2 className="banner-main-title">{b.subtitle}</h2>
                            <p className="banner-sub-desc">{b.desc}</p>
                            <span className="banner-date">2026.3.1 - 3.31</span>
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
