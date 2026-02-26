import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 👈 이 부분이 수정되었습니다!

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 프론트에서 /api_proxy로 시작하는 요청을 만나면 로컬 서버(8000번)로 보냅니다.
      '/api_proxy': {
        target: 'http://127.0.0.1:8000', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_proxy/, '')
      }
    }
  }
})