import React from 'react';
import { CheckCircle } from 'lucide-react';
import './SuccessModal_review.css';

interface SuccessModalProps {
  onClose: () => void;
}

const SuccessModal = ({ onClose }: SuccessModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="success-modal">
        {/* 장바구니랑 똑같은 아이콘 스타일 */}
        <div className="success-icon">
          <CheckCircle 
            size={72} 
            color="#000" 
            fill="#22c55e" 
            strokeWidth={2.5} 
          />
        </div>
        
        <h3>후기 작성이 완료되었습니다!</h3>
        <p>소중한 후기를 작성해주셔서 감사합니다.</p>

        <button className="close-modal-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;