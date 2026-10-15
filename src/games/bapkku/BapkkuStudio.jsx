import { useRef, useState } from 'react'
import Bowl from './Bowl.jsx'
import CharacterSlot from '../../components/CharacterSlot.jsx'
import { ASSETS, assetUrl } from '../../gameAssets.js'
import {
  BOWLS,
  TOPPERS,
  MAX_PARTICLES,
  STAR_STEPS,
  GOAL,
  getStars,
  clampIntoFood,
  createPowderBurst,
} from './bapkkuData.js'
import '../../styles/bapkku.css'

/**
 * BapkkuStudio — 밥꾸(밥 꾸미기) 스튜디오 게임
 *
 * 게임 흐름
 *   1. 그릇 색 고르기 (크림 / 핑크 / 민트)
 *   2. 토퍼 파우더 고르기 (단호박 / 비트 / 브로콜리)
 *   3. 그릇 위를 톡톡 누르거나 문질러서 파우더 뿌리기
 *   4. [완성!] → 축하 화면(별점) → 다시 만들기 또는 메인으로
 *
 * 화면 구성 (모바일에서 스크롤 없이 한 화면에 들어가도록)
 *   ┌ HUD: 뒤로가기 · 게임 이름 · 캐릭터
 *   ├ 토핑 게이지 (별 3개)
 *   ├ 주방 무대: 그릇 (남은 높이를 모두 차지)
 *   └ 하단 트레이: 그릇 선택 · 토퍼 선택 · 초기화/완성 버튼
 *
 * 모든 게임 상태는 이 컴포넌트의 React state에 들어 있습니다.
 */
function BapkkuStudio({ onHome }) {
  // ── 게임 상태 ──
  const [bowlId, setBowlId] = useState('cream') // 선택한 그릇
  const [topperId, setTopperId] = useState('pumpkin') // 선택한 토퍼
  const [particles, setParticles] = useState([]) // 뿌려진 알갱이들
  const [puffs, setPuffs] = useState([]) // 톡! 가루 구름 (최근 몇 개만)
  const [isDone, setIsDone] = useState(false) // 완성 화면 표시 여부
  const [shakeKey, setShakeKey] = useState(0) // 뿌릴 때 토퍼 병이 흔들리는 효과용

  // 알갱이마다 붙일 고유 번호 (state가 아니어도 되므로 ref 사용)
  const idCounter = useRef(0)
  const makeId = () => ++idCounter.current

  const bowl = BOWLS.find((b) => b.id === bowlId)
  const topper = TOPPERS.find((t) => t.id === topperId)

  const count = particles.length
  const stars = getStars(count)
  const gauge = Math.min(count / GOAL, 1)

  // 지금까지 사용한 토퍼 종류 (완성 화면 문구용)
  const usedToppers = TOPPERS.filter((t) => particles.some((p) => p.topperId === t.id))

  /** 그릇 위 (x, y) 지점에 파우더 뿌리기 — Bowl이 SVG 좌표로 알려 줌 */
  const handleSprinkle = (x, y) => {
    const center = clampIntoFood(x, y) // 그릇 테두리를 눌러도 사료 위에 떨어지도록
    const burst = createPowderBurst(center, topper, makeId)

    // 너무 많아지면 가장 오래된 알갱이부터 지워 성능을 지킵니다.
    setParticles((prev) => [...prev, ...burst].slice(-MAX_PARTICLES))
    setPuffs((prev) => [...prev.slice(-3), { id: makeId(), x: center.x, y: center.y, color: topper.colors[0] }])
    setShakeKey((k) => k + 1)
  }

  /** 꾸미기 초기화 */
  const handleReset = () => {
    setParticles([])
    setPuffs([])
  }

  /** 다시 만들기: 완성 화면을 닫고 빈 그릇으로 */
  const handleRemake = () => {
    handleReset()
    setIsDone(false)
  }

  const hasTopping = count > 0
  const kitchenBg = assetUrl(ASSETS.kitchenBackground)

  return (
    <div
      className={`screen bapkku ${kitchenBg ? 'has-bg-image' : ''}`}
      style={kitchenBg ? { backgroundImage: `url(${kitchenBg})` } : undefined}
    >
      {/* 배경 이미지가 없을 때만 보이는 임시 주방 (벽지 + 창문 + 선반) */}
      <div className="kitchen" aria-hidden="true">
        <div className="kitchen__window" />
      </div>

      {/* ── HUD (상단 바) ── */}
      <header className="hud">
        <button type="button" className="round-btn" onClick={onHome} aria-label="메인 화면으로">
          <span aria-hidden="true">‹</span>
        </button>
        <div className="hud__plate">
          <span className="hud__eyebrow">PENEFIT CREW KITCHEN</span>
          <h1 className="hud__title">밥꾸 스튜디오</h1>
        </div>
        <CharacterSlot characterId="bapkku" size="sm" />
      </header>

      {/* ── 토핑 게이지 + 알갱이 수 ── */}
      <div className="meter">
        <div className="meter__bar" role="progressbar" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={Math.min(count, GOAL)} aria-label="토핑 게이지">
          <div className="meter__fill" style={{ width: `${gauge * 100}%` }} />
          {STAR_STEPS.map((step, i) => (
            <span
              key={step}
              className={`meter__star ${stars > i ? 'is-on' : ''}`}
              style={{ left: `${Math.max((step / GOAL) * 100, 6)}%` }}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
        <span className="stage__count">
          토핑 알갱이 <b>{count}</b>개
        </span>
      </div>

      {/* ── 주방 무대 ── */}
      <section className="stage">
        {/* 그릇이 놓이는 나무 조리대 (배경 이미지를 쓰면 숨겨짐) */}
        <div className="stage__counter" aria-hidden="true" />

        <p className="stage__hint" aria-live="polite">
          {hasTopping
            ? `${topper.name} 파우더 솔솔~ 문질러도 뿌려져요!`
            : '토퍼를 고르고 그릇을 톡톡 눌러 보세요!'}
        </p>

        <div className="stage__bowl">
          <Bowl bowl={bowl} particles={particles} puffs={puffs} onSprinkle={handleSprinkle} />
        </div>
      </section>

      {/* ── 하단 트레이 ── */}
      <section className="tray">
        <div className="tray__row">
          <h2 className="tray__label">그릇</h2>
          <div className="tray__options" role="radiogroup" aria-label="그릇 색">
            {BOWLS.map((b) => (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={bowlId === b.id}
                className={`chip ${bowlId === b.id ? 'is-active' : ''}`}
                onClick={() => setBowlId(b.id)}
              >
                {/* 미니 그릇 모양 견본 */}
                <span
                  className="chip__bowl"
                  style={{ '--rim': b.rim, '--body': b.body, '--shade': b.bodyShade }}
                  aria-hidden="true"
                />
                <span className="chip__name">{b.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tray__row">
          <h2 className="tray__label">토퍼</h2>
          <div className="tray__options" role="radiogroup" aria-label="토퍼 파우더">
            {TOPPERS.map((t) => {
              const active = topperId === t.id
              const productImage = assetUrl(ASSETS.toppers[t.id])
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`chip chip--topper ${active ? 'is-active' : ''}`}
                  style={{ '--powder': t.colors[0] }}
                  onClick={() => setTopperId(t.id)}
                >
                  {/* 선택된 토퍼는 뿌릴 때마다 살짝 흔들려요 */}
                  <span
                    key={active ? shakeKey : 'idle'}
                    className={`jar-wrap ${active && shakeKey ? 'is-shaking' : ''}`}
                    aria-hidden="true"
                  >
                    {productImage ? (
                      // 실제 제품 이미지 (gameAssets.js에서 설정) — 원본 그대로 표시
                      <img className="jar-img" src={productImage} alt="" draggable="false" />
                    ) : (
                      // 임시 파우더 병 (CSS)
                      <span className="jar" style={{ '--powder': t.colors[0], '--powder-2': t.colors[2] }}>
                        <span className="jar__lid" />
                        <span className="jar__body" />
                      </span>
                    )}
                  </span>
                  <span className="chip__name">{t.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="tray__actions">
          <button type="button" className="btn btn--ghost" onClick={handleReset} disabled={!hasTopping}>
            ↺ 초기화
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setIsDone(true)} disabled={!hasTopping}>
            완성!
          </button>
        </div>
      </section>

      {/* ── 완성 축하 화면 ── */}
      {isDone && (
        <CelebrationModal
          bowl={bowl}
          particles={particles}
          stars={stars}
          usedToppers={usedToppers}
          onRemake={handleRemake}
          onHome={onHome}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
 * 완성 축하 화면 (밥꾸 스튜디오에서만 쓰므로 같은 파일에 둡니다)
 * 색종이 위치는 index로 계산해서 매번 같은 모양으로 흩날립니다.
 * ───────────────────────────────────────────── */
const CONFETTI_COLORS = ['#FFD666', '#FFB496', '#F8BFCB', '#AEE0CB', '#FFF6E2', '#F6B73C']
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 47) % 100,
  delay: (i % 7) * 0.18,
  duration: 2.4 + (i % 5) * 0.35,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}))

const STAR_MESSAGES = ['', '맛있어 보여요!', '정말 먹음직스러워요!', '최고의 밥꾸 셰프!']

function CelebrationModal({ bowl, particles, stars, usedToppers, onRemake, onHome }) {
  const toppingText = usedToppers.map((t) => t.name).join(' · ')

  return (
    <div className="celebrate" role="dialog" aria-modal="true" aria-labelledby="celebrate-title">
      <div className="celebrate__rays" aria-hidden="true" />
      <div className="celebrate__confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className={c.round ? 'is-round' : ''}
            style={{
              left: `${c.left}%`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="celebrate__card">
        <h2 id="celebrate-title" className="ribbon">
          밥꾸 완성!
        </h2>

        <div className="celebrate__stars" aria-label={`별 ${stars}개`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`big-star ${i < stars ? 'is-on' : ''}`}
              style={{ animationDelay: `${0.35 + i * 0.18}s` }}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
        <p className="celebrate__grade">{STAR_MESSAGES[stars]}</p>

        <div className="celebrate__plate">
          <Bowl bowl={bowl} particles={particles} interactive={false} />
          <div className="celebrate__cheer">
            <CharacterSlot characterId="cheer" size="sm" />
          </div>
        </div>

        <p className="celebrate__desc">
          {bowl.name} 그릇에 <b>{toppingText}</b> 토퍼
          <br />
          알갱이 <b>{particles.length}개</b>를 뿌린 특별한 한 끼예요.
        </p>

        <div className="celebrate__actions">
          <button type="button" className="btn btn--primary" onClick={onRemake}>
            다시 만들기
          </button>
          <button type="button" className="btn btn--ghost" onClick={onHome}>
            메인 화면으로
          </button>
        </div>
      </div>
    </div>
  )
}

export default BapkkuStudio
