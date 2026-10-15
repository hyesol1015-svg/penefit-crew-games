import CharacterSlot from './CharacterSlot.jsx'
import { GAMES } from '../games/gameList.js'
import { ASSETS, assetUrl } from '../gameAssets.js'
import '../styles/main.css'

/**
 * MainScreen — 첫 화면 (게임 로비)
 *
 * 구성: 캐릭터 자리 + 타이틀(로고) / 게임 카드 4개
 * 화면 크기별 배치 (styles/main.css)
 *   - 휴대폰 세로   : 위 캐릭터·타이틀, 아래 카드 2×2
 *   - 아이패드 세로 : 같은 구조, 카드와 글씨를 크게
 *   - 가로 화면·노트북 : 왼쪽 캐릭터·타이틀, 오른쪽 카드판
 *
 * onPlay(gameId): 카드를 눌렀을 때 App에 알려 해당 게임으로 이동합니다.
 */
function MainScreen({ onPlay }) {
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

      {/* ── 캐릭터 이미지 자리 + 타이틀 ── */}
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

      {/* ── 게임 카드 4개 (모두 플레이 가능) ── */}
      <section className="game-board" aria-label="게임 목록">
        <p className="game-board__lead">오늘은 어떤 요리를 만들어 볼까요?</p>
        <div className="game-grid">
          {GAMES.map((game, index) => {
            const thumb = assetUrl(ASSETS.gameThumbs[game.id])
            return (
              <button
                key={game.id}
                type="button"
                className={`game-card game-card--${game.theme}`}
                style={{ animationDelay: `${index * 70}ms` }}
                onClick={() => onPlay(game.id)}
                aria-label={`${game.title} 플레이하기 (${game.audience})`}
              >
                <span className="game-card__top">
                  <span className="game-card__thumb" aria-hidden="true">
                    {thumb ? <img src={thumb} alt="" draggable="false" /> : game.emoji}
                  </span>
                  <span className="game-card__tag">{game.audience}</span>
                </span>
                <span className="game-card__title">{game.title}</span>
                <span className="game-card__desc">{game.desc}</span>
                <span className="game-card__badge" aria-hidden="true">
                  PLAY ▶
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default MainScreen
