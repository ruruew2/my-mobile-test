import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 브라우저에서 /api로 시작하는 요청을 보내면 
      // 백엔드 서버(54.180.234.226:8000)로 전달합니다.
      '/api': {
        target: 'http://54.180.234.226:8000',
        changeOrigin: true,
        // 필요에 따라 /api 문구를 제거하고 서버에 전달합니다.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});