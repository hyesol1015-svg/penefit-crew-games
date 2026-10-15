import { useState } from 'react'
import MainScreen from './components/MainScreen.jsx'
import BapkkuStudio from './games/bapkku/BapkkuStudio.jsx'

/**
 * App — 화면 전환만 담당하는 최상위 컴포넌트
 *
 * 라우터 라이브러리 없이 `screen` state 하나로 화면을 바꿉니다.
 *   'home'   → 메인 화면 (게임 카드 목록)
 *   'bapkku' → 밥꾸 스튜디오 게임
 * 새 게임을 추가할 때는 games/ 폴더에 컴포넌트를 만들고
 * 아래 조건문에 한 줄을 더하면 됩니다.
 */
function App() {
  const [screen, setScreen] = useState('home')

  const goHome = () => setScreen('home')

  return (
    <div className="app-bg">
      <main className="app-frame">
        {screen === 'home' && <MainScreen onPlay={(gameId) => setScreen(gameId)} />}
        {screen === 'bapkku' && <BapkkuStudio onHome={goHome} />}
      </main>
    </div>
  )
}

export default App
