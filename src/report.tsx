import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const AI_API_URL = 'http://54.180.234.226:8000';

const CourseNavigation = ({ onComplete }: { onComplete: (data: any[]) => void }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

        const tags = [
        '화려한',
        '몽환적인',
        '생생한',
        '정갈한',
        '트렌디한',
        '톡톡튀는',
        '우아한',
        '은은한',
        '과감한',
        '능동적인',
        '웅장한',
        '깊이있는',
        '고전적인',
        '자유로운',
        '압도적인',
        '입체적인',
        '다채로운',
        '섬세한',
    ];

    const handleComplete = async () => {
        setIsLoading(true); // 로딩 시작
        try {
            const user = JSON.parse(localStorage.getItem('artLogUser') || '{}');
const response = await fetch(`${AI_API_URL}/api/ai/recommend`, { // 여기 /api 가 있는지 확인!
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags: selected, userId: user.loginId || 'guest' })
});


if (response.ok) {
    const data = await response.json();
    // 부모의 handlePreferenceComplete 실행 (데이터 통째로 전달)
    onComplete(data); 
}

        } catch (error) {
            console.error("AI 추천 오류:", error);
            onComplete([]); // 에러 시 빈 배열 전달
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <Loader2 size={50} className="animate-spin" color="#7C4DFF" />
                <h2 style={{ marginTop: '24px', fontWeight: '700' }}>AI가 당신의 취향을 분석 중입니다</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px' }}>
            <h2 style={{ fontWeight: '800', marginBottom: '10px' }}>당신의 취향을 알려주세요</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>3개 이상 선택해주세요.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {tags.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                        style={{
                            padding: '10px 20px', borderRadius: '25px', border: '1px solid #eee',
                            backgroundColor: selected.includes(tag) ? '#7C4DFF' : '#fff',
                            color: selected.includes(tag) ? '#fff' : '#333'
                        }}
                    >
                        {tag}
                    </button>
                ))}
            </div>
            <button 
                onClick={handleComplete}
                disabled={selected.length < 3}
                style={{
                    marginTop: '40px', width: '100%', padding: '18px', borderRadius: '15px',
                    backgroundColor: selected.length >= 3 ? '#111' : '#ccc', color: '#fff', border: 'none', fontWeight: 'bold'
                }}
            >
                분석 시작하기
            </button>
        </div>
    );
};

export default CourseNavigation;