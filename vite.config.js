import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages 주소: https://hyesol1015-svg.github.io/penefit-crew-games/
//  - 배포용 빌드(npm run build)와 미리보기(npm run preview)는 '/penefit-crew-games/' 아래에서 열려요.
//  - 내 컴퓨터 개발 서버(npm run dev)는 지금처럼 http://localhost:5173/ 에서 열려요.
//  - 이미지 경로는 src/gameAssets.js 의 assetUrl() 이 이 base 를 자동으로 붙여 줘요.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/penefit-crew-games/' : '/',
  plugins: [react()],
}))
