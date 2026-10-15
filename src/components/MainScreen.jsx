import { useEffect, useState } from 'react'
import CharacterSlot from './CharacterSlot.jsx'
import { GAMES } from '../games/gameList.js'
import { ASSETS, assetUrl } from '../gameAssets.js'
import '../styles/main.css'

/**
 * MainScreen — 첫 화면 (게임 로비)
 *
 * 구성: 캐릭터 자리 → 타이틀(로고) → 게임 카드 4개
 * 모바일 세로 화면 한 장에 스크롤 없이 들어가도록 높이를 나눠 씁니다.
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

  const kitchenBg = assetUrl(ASSETS.kitchenBackground)
  const logo = assetUrl(ASSETS.logo)

  return (
    <div
      className={`screen main-screen ${kitchenBg ? 'has-bg-image' : ''}`}
      style={kitchenBg ? { backgroundImage: `url(${kitchenBg})` } : undefined}
    >
      {/* 배경 이미지가 없을 때만 보이는 임시 주방 */}
      <div className="kitchen" aria-hidden="true">
        <div className="kitchen__window" />
        <div className="kitchen__counter" />
      </div>

      {/* ── 상단: 캐릭터 이미지 자리 + 타이틀 ── */}
      <section className="lobby-hero">
        <div className="lobby-hero__stage">
          <span className="sparkle sparkle--1">✦</span>
          <span className="sparkle sparkle--2">✧</span>
          <span className="sparkle sparkle--3">✦</span>
          <CharacterSlot characterId="main" size="lg" showLabel />
        </div>

        {logo ? (
          <h1 className="lobby-title">
            <img className="lobby-title__logo" src={logo} alt="PENEFIT CREW" />
          </h1>
        ) : (
          <h1 className="lobby-title">PENEFIT CREW</h1>
        )}
        <p className="lobby-ribbon">
          <span>Little Kitchen</span>
        </p>
      </section>

      {/* ── 게임 카드 목록 ── */}
      <section className="game-board" aria-label="게임 목록">
        <p className="game-board__lead">오늘은 어떤 요리를 만들어 볼까요?</p>
        <div className="game-grid">
          {GAMES.map((game, index) => {
            const playable = game.status === 'play'
            const thumb = assetUrl(ASSETS.gameThumbs[game.id])
            return (
              <button
                key={game.id}
                type="button"
                className={`game-card game-card--${game.theme} ${playable ? 'is-playable' : 'is-soon'}`}
                style={{ animationDelay: `${index * 70}ms` }}
                onClick={() => handleCardClick(game)}
                aria-label={`${game.title} ${playable ? '플레이하기' : '준비 중'}`}
              >
                <span className="game-card__thumb" aria-hidden="true">
                  {thumb ? <img src={thumb} alt="" draggable="false" /> : game.emoji}
                  {!playable && <span className="game-card__lock">🔒</span>}
                </span>
                <span className="game-card__title">{game.title}</span>
                <span className="game-card__desc">{game.desc}</span>
                <span className={`game-card__badge ${playable ? 'badge--play' : 'badge--soon'}`}>
                  {playable ? 'PLAY' : 'Coming Soon'}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

export default MainScreen
