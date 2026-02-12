// 1. 맨 윗줄에 이 import 문이 반드시 있어야 합니다!
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 2. 그 다음 defineConfig를 호출합니다.
export default defineConfig({
    plugins: [react()],
    // ... 기타 설정들
});
