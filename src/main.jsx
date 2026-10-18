import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 앱 전체에 쓰이는 색상·버튼·레이아웃 스타일
import './styles/global.css'
import App from './App.jsx'
// Meta Pixel: Shopee 링크 클릭 측정 (한 번만 설치)
import { installShopeeClickTracking } from './pixel.js'

installShopeeClickTracking()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
