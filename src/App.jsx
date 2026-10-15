import { useState } from 'react'
import MainScreen from './components/MainScreen.jsx'
import { GAME_SCREENS } from './games/index.js'
import { CREW, DEFAULT_CREW_ID } from './characters.js'

/**
 * App — 화면 전환 + '함께 요리할 크루' 선택을 담당하는 최상위 컴포넌트
 *
 * 라우터 라이브러리 없이 `screen` state 하나로 화면을 바꿉니다.
 *   'home'                                 → 메인 화면 (크루 선택 + 게임 카드 4개)
 *   'bapkku' | 'cookie' | 'cafe' | 'jelly' → 각 게임 (games/index.js 에 등록)
 *
 * runId: '처음부터 다시하기'용 번호.
 * 이 번호가 바뀌면 React가 게임 컴포넌트를 새로 만들어서
 * 모든 state가 처음 상태로 돌아갑니다. (게임마다 따로 초기화 코드를 짤 필요 없음)
 *
 * crewId: 메인 화면에서 고른 캐릭터. 게임 화면에 전달돼요.
 * 새로고침해도 유지되도록 브라우저 저장소(localStorage)에 기억해 둡니다.
 * (저장소를 쓸 수 없는 환경이어도 게임은 그대로 동작해요)
 */
const CREW_KEY = 'penefit-crew-id'

function loadCrewId() {
  try {
    const saved = window.localStorage.getItem(CREW_KEY)
    return CREW.some((c) => c.id === saved) ? saved : DEFAULT_CREW_ID
  } catch {
    return DEFAULT_CREW_ID
  }
}

function App() {
  const [screen, setScreen] = useState('home')
  const [runId, setRunId] = useState(0)
  const [crewId, setCrewId] = useState(loadCrewId)

  const goHome = () => setScreen('home')
  const restart = () => setRunId((n) => n + 1)

  const selectCrew = (id) => {
    setCrewId(id)
    try {
      window.localStorage.setItem(CREW_KEY, id)
    } catch {
      // 저장소를 못 써도 이번 실행 동안은 선택이 유지돼요
    }
  }

  const Game = GAME_SCREENS[screen]

  return (
    <div className="app-bg">
      <main className="app-frame">
        {Game ? (
          <Game key={`${screen}-${runId}`} onHome={goHome} onRestart={restart} crewId={crewId} />
        ) : (
          <MainScreen onPlay={(gameId) => setScreen(gameId)} crewId={crewId} onSelectCrew={selectCrew} />
        )}
      </main>
    </div>
  )
}

export default App
