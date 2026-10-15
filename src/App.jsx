import { useState } from 'react'
import MainScreen from './components/MainScreen.jsx'
import { GAME_SCREENS } from './games/index.js'

/**
 * App — 화면 전환만 담당하는 최상위 컴포넌트
 *
 * 라우터 라이브러리 없이 `screen` state 하나로 화면을 바꿉니다.
 *   'home'                         → 메인 화면 (게임 카드 4개)
 *   'bapkku' | 'cookie' | 'cafe' | 'jelly' → 각 게임 (games/index.js 에 등록)
 *
 * runId: '처음부터 다시하기'용 번호.
 * 이 번호가 바뀌면 React가 게임 컴포넌트를 새로 만들어서
 * 모든 state가 처음 상태로 돌아갑니다. (게임마다 따로 초기화 코드를 짤 필요 없음)
 */
function App() {
  const [screen, setScreen] = useState('home')
  const [runId, setRunId] = useState(0)

  const goHome = () => setScreen('home')
  const restart = () => setRunId((n) => n + 1)

  const Game = GAME_SCREENS[screen]

  return (
    <div className="app-bg">
      <main className="app-frame">
        {Game ? (
          <Game key={`${screen}-${runId}`} onHome={goHome} onRestart={restart} />
        ) : (
          <MainScreen onPlay={(gameId) => setScreen(gameId)} />
        )}
      </main>
    </div>
  )
}

export default App
