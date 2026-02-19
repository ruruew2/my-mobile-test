import React, { useEffect, CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface ProductState {
    image: string;
    title: string;
    category: string;
    price: string;
    desc: string;
}

const Detail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as ProductState;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!state) return <div style={{ padding: '50px', textAlign: 'center' }}>상품 정보가 없습니다.</div>;

    return (
        <div style={{ 
            backgroundColor: '#fff', 
            minHeight: '100vh', 
            // 🚩 수정: 너무 넓었던 여백을 160px로 줄여 딱 붙는 느낌을 줍니다.
            paddingBottom: '160px', 
            position: 'relative' 
        }}>
            {/* 헤더 */}
            <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                position: 'sticky',
                top: 0,
                backgroundColor: '#fff',
                zIndex: 100,
            }}>
                <ChevronLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>상세보기</h2>
            </div>

            {/* 메인 이미지 */}
            <img src={state.image} alt={state.title} style={{ width: '100%', height: 'auto', display: 'block' }} />

            {/* 상품 정보 */}
            <div style={{ padding: '30px' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>{state.category}</span>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{state.title}</h1>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>{state.price}</p>

                <div style={{ height: '1px', backgroundColor: '#eee', margin: '25px 0' }} />

                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>상품 설명</h3>
                <p style={{ color: '#666', lineHeight: '1.7', fontSize: '15px', wordBreak: 'keep-all' }}>
                    {state.desc} <br /><br />
                    이 상품은 국립박물관의 유물을 현대적으로 재해석한 문화상품(굿즈)입니다. 
                    전시의 감동을 일상 속에서도 느껴보세요.
                </p>
            </div>

            {/* 하단 구매 바 - 탭 바 바로 위로 밀착 */}
            <div style={{
                position: 'fixed',
                // 🚩 수정: 탭 바 바로 위에 살짝 떠 있게 80px로 조정 (딱 붙는 느낌)
                bottom: '80px', 
                left: '50%',
                transform: 'translateX(-50%)',
                width: '94%',
                maxWidth: '480px',
                padding: '12px 16px',
                borderRadius: '16px',
                backgroundColor: '#fff',
                display: 'flex',
                gap: '10px',
                boxSizing: 'border-box',
                // 그림자를 연하게 해서 자연스럽게 연결
                boxShadow: '0 -4px 15px rgba(0,0,0,0.08)', 
                zIndex: 9999,
            }}>
                <button style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #eee',
                    backgroundColor: '#fff',
                    fontWeight: 'bold',
                    fontSize: '15px'
                }}>장바구니</button>
                <button style={{
                    flex: 2,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#000',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '15px'
                }}>구매하기</button>
            </div>
        </div>
    );
};

export default Detail;