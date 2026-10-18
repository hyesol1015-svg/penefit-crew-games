import CrewSprite from './CrewSprite.jsx'
import { CREW } from '../characters.js'
import { GAMES } from '../games/gameList.js'
import { ASSETS, assetUrl } from '../gameAssets.js'
import { VOUCHER, hasVoucher } from '../games/bapkku/voucher.js'
import '../styles/main.css'

/**
 * MainScreen — 첫 화면 (게임 로비)
 *
 * 구성: 페네핏 크루 4마리(선택) + 타이틀(로고) / 게임 카드 4개
 * 화면 크기별 배치 (styles/main.css)
 *   - 휴대폰 세로   : 위 캐릭터·타이틀, 아래 카드 2×2
 *   - 아이패드 세로 : 같은 구조, 카드와 글씨를 크게
 *   - 가로 화면·노트북 : 왼쪽 캐릭터·타이틀, 오른쪽 카드판
 *
 * onPlay(gameId)   : 카드를 눌렀을 때 App에 알려 해당 게임으로 이동합니다.
 * crewId           : 지금 선택된 크루
 * onSelectCrew(id) : 크루 카드를 눌렀을 때 선택을 바꿉니다.
 *
 * 보상 배너: 게임을 끝까지 하면 바우처를 받는다는 걸 첫 화면에서 미리 알려 줘요.
 *   - 할인 문구는 voucher.js 의 title('25% OFF Voucher')에서 가져와요.
 *   - 바우처 코드는 여기서 보여 주지 않아요. (게임을 끝내야 공개)
 *   - voucher.js 에서 바우처를 끄면(enabled: false) 배너도 사라져요.
 */
function MainScreen({ onPlay, crewId, onSelectCrew }) {
  const selected = CREW.find((c) => c.id === crewId) ?? CREW[0]

  // '25% OFF Voucher' → '25% OFF' (할인 문구만 배너에 크게)
  const showReward = hasVoucher(VOUCHER)
  const rewardDeal = String(VOUCHER.title).match(/^(\d+%\s*OFF)/i)?.[1] ?? VOUCHER.title

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

      {/* ── 페네핏 크루 4마리 + 타이틀 ── */}
      <section className="lobby-hero">
        <div className="crew-picker">
          <span className="sparkle sparkle--1">✦</span>
          <span className="sparkle sparkle--2">✧</span>
          <span className="sparkle sparkle--3">✦</span>
          <div className="crew-picker__row" role="radiogroup" aria-label="Pick your kitchen buddy">
            {CREW.map((crew, i) => {
              const active = crew.id === selected.id
              return (
                <button
                  key={crew.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`crew-card ${active ? 'is-active' : ''}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                  onClick={() => onSelectCrew?.(crew.id)}
                >
                  <span className="crew-card__frame">
                    <CrewSprite crew={crew} />
                  </span>
                  <span className="crew-card__name">{crew.name}</span>
                </button>
              )
            })}
          </div>
          <p className="crew-picker__caption" aria-live="polite">
            Today's chef is <b>{selected.name}</b>! Pick your kitchen buddy.
          </p>
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
      <section className="game-board" aria-label="Games">
        {/* ── 보상 배너: 게임을 끝내면 받는 바우처 미리 알림 ── */}
        {showReward && (
          <div className="reward-banner" role="note">
            <span className="reward-banner__gift" aria-hidden="true">
              🎁
            </span>
            <span className="reward-banner__text">
              <span className="reward-banner__main">
                Finish a recipe to unlock <b>{rewardDeal}</b>
              </span>
              <span className="reward-banner__sub">Secret voucher for Shopee SG · any game</span>
            </span>
          </div>
        )}
        <p className="game-board__lead">What shall we cook today?</p>
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
                aria-label={`Play ${game.title} (${game.audience})`}
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
