import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 프론트에서 /api_proxy로 시작하는 요청을 만나면 AWS 실제 서버로 보냅니다.
      '/api_proxy': {
        // target을 내 로컬 주소 대신 실제 AWS IP 주소로 고정합니다.
        target: 'http://54.180.234.226:8000', 
        changeOrigin: true,
        secure: false, // http 주소이므로 보안 검사 건너뛰기
        rewrite: (path) => path.replace(/^\/api_proxy/, '')
      }
    }
  }
})