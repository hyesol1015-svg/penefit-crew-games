import { useEffect, useState } from 'react'
import CharacterSlot from './CharacterSlot.jsx'
import { GAMES } from '../games/gameList.js'
import '../styles/main.css'

/**
 * MainScreen — 첫 화면
 *
 * 구성: 캐릭터 자리 → 타이틀 → 게임 카드 4개
 * onPlay(gameId): 플레이 가능한 카드를 눌렀을 때 App에 알려 화면을 전환합니다.
 */
function MainScreen({ onPlay }) {
  // Coming Soon 카드를 눌렀을 때 잠깐 띄우는 안내 문구
  const [toast, setToast] = useState('')

  // 토스트는 1.6초 뒤에 자동으로 사라집니다.
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 1600)
    return () => clearTimeout(timer)
  }, [toast])

  const handleCardClick = (game) => {
    if (game.status === 'play') {
      onPlay(game.id)
    } else {
      setToast(`${game.title}은(는) 곧 문을 열어요!`)
    }
  }

  return (
    <div className="screen main-screen">
      {/* ── 상단: 캐릭터 이미지 자리 ── */}
      <section className="hero">
        <div className="hero__stage">
          <span className="hero__sparkle hero__sparkle--1">✦</span>
          <span className="hero__sparkle hero__sparkle--2">✧</span>
          <span className="hero__sparkle hero__sparkle--3">✦</span>
          <CharacterSlot characterId="main" size="lg" showLabel />
        </div>

        <h1 className="hero__title">PENEFIT CREW</h1>
        <p className="hero__subtitle">Little Kitchen</p>
        <p className="hero__lead">오늘은 어떤 요리를 만들어 볼까요?</p>
      </section>

      {/* ── 게임 카드 목록 ── */}
      <section className="game-grid" aria-label="게임 목록">
        {GAMES.map((game, index) => {
          const playable = game.status === 'play'
          return (
            <button
              key={game.id}
              type="button"
              className={`game-card game-card--${game.theme} ${playable ? 'is-playable' : 'is-soon'}`}
              style={{ animationDelay: `${index * 70}ms` }}
              onClick={() => handleCardClick(game)}
              aria-label={`${game.title} ${playable ? '플레이하기' : '준비 중'}`}
            >
              <span className="game-card__icon" aria-hidden="true">
                {game.emoji}
              </span>
              <span className="game-card__title">{game.title}</span>
              <span className="game-card__desc">{game.desc}</span>
              <span className={`game-card__badge ${playable ? 'badge--play' : 'badge--soon'}`}>
                {playable ? 'PLAY ▶' : 'Coming Soon'}
              </span>
            </button>
          )
        })}
      </section>

      <p className="main-footer">© PENEFIT CREW · Little Kitchen</p>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

export default MainScreen
