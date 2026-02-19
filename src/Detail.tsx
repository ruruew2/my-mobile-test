import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const Detail = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) return <div style={{ padding: '50px', textAlign: 'center' }}>상품 정보가 없습니다.</div>;

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* 헤더 */}
            <div
                style={{
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    zIndex: 10,
                }}
            >
                <ChevronLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>상세보기</h2>
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
                    {state.desc} <br />
                    <br />이 상품은 국립박물관의 유물을 현대적으로 재해석한 문화상품(굿즈)입니다. 전시의 감동을 일상
                    속에서도 느껴보세요.
                </p>
            </div>

            {/* 하단 구매 바 */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    width: '100%',
                    maxWidth: '500px',
                    padding: '20px',
                    borderTop: '1px solid #eee',
                    backgroundColor: '#fff',
                    display: 'flex',
                    gap: '10px',
                    boxSizing: 'border-box',
                }}
            >
                <button
                    style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #ddd',
                        backgroundColor: '#fff',
                        fontWeight: 'bold',
                    }}
                >
                    장바구니
                </button>
                <button
                    style={{
                        flex: 2,
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#000',
                        color: '#fff',
                        fontWeight: 'bold',
                    }}
                >
                    구매하기
                </button>
            </div>
        </div>
    );
};

export default Detail;
