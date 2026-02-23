import React, { useState, useRef } from 'react';
import { Star, Camera, X } from 'lucide-react';

interface ReviewFormProps {
  exhibitionTitle: string;
  onComplete: () => void;
}

const ReviewForm = ({ exhibitionTitle, onComplete }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_CHARS = 500;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      alert("사진은 최대 5장까지 가능합니다.");
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ padding: '5px' }}>
      <div style={{ marginBottom: '25px' }}>
        <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>전시 정보</p>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{exhibitionTitle}</h3>
      </div>

      {/* 별점 영역 - 애니메이션 추가 */}
      <div style={{ marginBottom: '25px', padding: '24px', backgroundColor: '#fcfcfc', borderRadius: '18px', border: '1px solid #f0f0f0', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600' }}>전시는 어떠셨나요?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <Star 
              key={num} size={35} 
              onClick={() => setRating(num)}
              onMouseEnter={() => setHoverRating(num)}
              onMouseLeave={() => setHoverRating(0)}
              color={(hoverRating || rating) >= num ? "#FFD700" : "#ddd"} 
              fill={(hoverRating || rating) >= num ? "#FFD700" : "none"}
              style={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: (hoverRating || rating) >= num ? 'scale(1.2)' : 'scale(1)' 
              }}
            />
          ))}
        </div>
      </div>

      {/* 감상평 - 글자수 제한 추가 */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>감상평</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder="작품을 통해 느낀 감동이나 전시 분위기를 자유롭게 적어주세요."
          style={{ 
            width: '100%', height: '160px', padding: '15px', borderRadius: '12px', 
            border: '1px solid #eee', outline: 'none', fontSize: '14px', resize: 'none',
            lineHeight: '1.6', backgroundColor: '#fafafa'
          }}
        />
        <div style={{ textAlign: 'right', fontSize: '12px', color: content.length >= MAX_CHARS ? '#ff4d4d' : '#aaa', marginTop: '5px' }}>
          {content.length} / {MAX_CHARS}
        </div>
      </div>

      {/* 사진 미리보기 - 가로 스크롤 추가 */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>사진 첨부</label>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed #ccc',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, backgroundColor: '#fff'
            }}
          >
            <Camera size={24} color="#aaa" />
            <span style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{images.length}/5</span>
            <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleFileChange} />
          </div>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <img src={img} alt="preview" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
              <X 
                size={16} 
                style={{ position: 'absolute', top: -5, right: -5, backgroundColor: '#333', color: '#fff', borderRadius: '50%', padding: '2px', cursor: 'pointer' }} 
                onClick={() => setImages(images.filter((_, i) => i !== idx))}
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onComplete}
        disabled={!rating || !content}
        style={{ 
          width: '100%', padding: '18px', borderRadius: '15px', border: 'none', 
          backgroundColor: (!rating || !content) ? '#ccc' : '#000', 
          color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
        }}
      >
        등록 완료
      </button>
    </div>
  );
};

export default ReviewForm;