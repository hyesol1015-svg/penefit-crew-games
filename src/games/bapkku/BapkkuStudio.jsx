import { useEffect, useRef, useState } from 'react'
import Bowl from './Bowl.jsx'
import Scoop from './Scoop.jsx'
import StepBar from './StepBar.jsx'
import GameShell from '../../components/GameShell.jsx'
import CharacterSlot from '../../components/CharacterSlot.jsx'
import { ASSETS, assetUrl } from '../../gameAssets.js'
import {
  BOWLS,
  STEPS,
  SCOOPS_TO_FILL,
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
 * 단계별 진행:  ① 그릇 → ② 사료 → ③ 파우더 → ④ 토핑 → ⑤ 완성
 *   - 각 단계의 조건을 채워야 '다음' 버튼이 켜져요.
 *   - '이전' 버튼이나 위쪽 단계 표시를 눌러 뒤로 갈 수 있어요.
 *   - 단계를 오가도 그릇·사료·파우더는 그대로 유지돼요. (state가 이 컴포넌트에 모여 있기 때문)
 *
 * 현재 구현 범위
 *   ①그릇(5종) ②사료 담기 ③파우더(기존 3종) ⑤완성 화면
 *   ④토핑 꾸미기, 파우더 6종, PNG 저장은 다음 작업에서 추가할 예정입니다.
 *
 * 화면 배치는 공통 틀인 GameShell이 화면 크기에 맞춰 알아서 처리합니다.
 */

// 다음 버튼에 쓰는 문구 (단계 번호 순서)
const NEXT_LABELS = ['다음: 사료 ▶', '다음: 파우더 ▶', '다음: 토핑 ▶', '완성!']

function BapkkuStudio({ onHome, onRestart }) {
  // ── 진행 상태 ──
  const [stepIndex, setStepIndex] = useState(0) // 지금 단계 (0 = 그릇)
  const [isDone, setIsDone] = useState(false) // 완성 화면 표시 여부

  // ── ① 그릇 ──
  const [bowlId, setBowlId] = useState(null) // 처음에는 아무 그릇도 고르지 않은 상태

  // ── ② 사료 ──
  const [scoops, setScoops] = useState(0) // 담은 스쿱 수 (0 = 빈 그릇)
  const [pourId, setPourId] = useState(null) // 바뀔 때마다 사료가 쏟아지는 연출
  const pouring = useRef(false) // 붓는 중에는 또 붓지 않도록 잠금
  const scoopRef = useRef(null) // 스쿱에게 '부어!'라고 시키기 위한 연결
  const sceneRef = useRef(null) // 무대 (그릇 위치를 찾을 때 사용)

  // ── ③ 파우더 ──
  const [topperId, setTopperId] = useState('pumpkin') // 선택한 토퍼
  const [particles, setParticles] = useState([]) // 뿌려진 알갱이들
  const [puffs, setPuffs] = useState([]) // 톡! 가루 구름 (최근 몇 개만)
  const [shakeKey, setShakeKey] = useState(0) // 뿌릴 때 토퍼 병이 흔들리는 효과용

  // 알갱이·연출마다 붙일 고유 번호 (state가 아니어도 되므로 ref 사용)
  const idCounter = useRef(0)
  const makeId = () => ++idCounter.current

  // 예약해 둔 타이머는 화면을 떠날 때 모두 정리
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const step = STEPS[stepIndex].id
  const bowl = BOWLS.find((b) => b.id === bowlId) ?? null
  const topper = TOPPERS.find((t) => t.id === topperId)
  const isFull = scoops >= SCOOPS_TO_FILL
  const fill = scoops / SCOOPS_TO_FILL

  const count = particles.length
  const stars = getStars(count)
  const gauge = Math.min(count / GOAL, 1)
  const usedToppers = TOPPERS.filter((t) => particles.some((p) => p.topperId === t.id))

  /* ── 단계 조건: 이 조건이 채워져야 다음 단계로 갈 수 있어요 ── */
  const complete = {
    bowl: bowl !== null,
    food: isFull,
    powder: count > 0,
    topping: true, // 토핑은 다음 작업에서 구현 (지금은 바로 완성 가능)
  }
  // 갈 수 있는 가장 먼 단계 = 처음으로 '미완료'인 단계
  const firstIncomplete = STEPS.findIndex((s) => s.id !== 'done' && !complete[s.id])
  const reachable = firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete
  const canGoNext = complete[step]

  const goToStep = (index) => {
    if (index > reachable) return
    if (STEPS[index].id === 'done') {
      setIsDone(true)
      return
    }
    setStepIndex(index)
  }
  const goNext = () => canGoNext && goToStep(stepIndex + 1)
  const goPrev = () => stepIndex > 0 && setStepIndex(stepIndex - 1)

  /* ── ② 사료 붓기 ──
     스쿱이 그릇 위로 날아가 기울어지면(약 0.26초 뒤) 알갱이가 쏟아지고,
     잠시 뒤 사료 양이 한 칸 올라가요. */
  const handlePour = () => {
    if (pouring.current || !bowl || scoops >= SCOOPS_TO_FILL) return false
    pouring.current = true
    later(() => setPourId(makeId()), 260)
    later(() => setScoops((s) => Math.min(s + 1, SCOOPS_TO_FILL)), 560)
    later(() => {
      pouring.current = false
    }, 900)
    return true
  }

  // 무대 속 그릇 SVG와 좌표 변환 도우미
  const bowlSvg = () => sceneRef.current?.querySelector('.bowl-svg')
  const toBowl = (x, y) => {
    const svg = bowlSvg()
    const m = svg?.getScreenCTM()
    return m ? new DOMPoint(x, y).matrixTransform(m.inverse()) : null
  }
  // 스쿱을 놓은 곳이 그릇 위(입구 근처)인지
  const isOverBowl = (x, y) => {
    const p = toBowl(x, y)
    return Boolean(p && p.x > 10 && p.x < 310 && p.y > -70 && p.y < 160)
  }
  // 스쿱 컵이 가야 할 화면 좌표 (그릇 오른쪽 위)
  const getPourPoint = () => {
    const m = bowlSvg()?.getScreenCTM()
    return m ? new DOMPoint(200, 14).matrixTransform(m) : null
  }

  /* ── ③ 파우더 뿌리기 (기존 기능 그대로) ── */
  const handleSprinkle = (x, y) => {
    const center = clampIntoFood(x, y) // 그릇 테두리를 눌러도 사료 위에 떨어지도록
    const burst = createPowderBurst(center, topper, makeId)
    // 너무 많아지면 가장 오래된 알갱이부터 지워 성능을 지킵니다.
    setParticles((prev) => [...prev, ...burst].slice(-MAX_PARTICLES))
    setPuffs((prev) => [...prev.slice(-3), { id: makeId(), x: center.x, y: center.y, color: topper.colors[0] }])
    setShakeKey((k) => k + 1)
  }

  const clearPowder = () => {
    setParticles([])
    setPuffs([])
  }

  /** 완성 화면의 '다시 만들기': 처음 단계부터 새로 */
  const handleRemake = () => onRestart?.()

  // 단계마다 그릇을 눌렀을 때 하는 일
  const bowlAction = step === 'food' ? () => scoopRef.current?.pour() : step === 'powder' ? handleSprinkle : undefined

  /* ── 무대 위 안내 문구 ── */
  const hints = {
    bowl: bowl ? `${bowl.name} 그릇 좋아요! 이제 사료를 담으러 가 볼까요?` : '마음에 드는 그릇을 골라 주세요!',
    food: isFull
      ? '사료 가득! 이제 파우더를 뿌려 볼까요?'
      : scoops === 0
        ? '스쿱을 그릇으로 끌어다 놓거나 톡 눌러 보세요!'
        : `사료 ${scoops}/${SCOOPS_TO_FILL} — 조금 더 담아 볼까요?`,
    powder: count > 0 ? `${topper.name} 파우더 솔솔~ 문질러도 뿌려져요!` : '토퍼를 고르고 그릇 위를 문질러 보세요!',
    topping: '토핑 꾸미기는 다음 업데이트에서 열려요. 지금 바로 완성할 수 있어요!',
  }

  /* ── 위쪽: 단계 표시 (+ 파우더 단계에서는 토핑 게이지) ── */
  const status = (
    <>
      <StepBar steps={STEPS} current={isDone ? STEPS.length - 1 : stepIndex} reachable={reachable} onSelect={goToStep} />
      {step === 'powder' && (
        <div className="meter">
          <div
            className="meter__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={GOAL}
            aria-valuenow={Math.min(count, GOAL)}
            aria-label="토핑 게이지"
          >
            <div className="meter__fill" style={{ width: `${gauge * 100}%` }} />
            {STAR_STEPS.map((s, i) => (
              <span
                key={s}
                className={`meter__star ${stars > i ? 'is-on' : ''}`}
                style={{ left: `${Math.max((s / GOAL) * 100, 6)}%` }}
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
      )}
    </>
  )

  /* ── 단계별 패널 내용 ── */
  const bowlPicker = (
    <div className="option-grid" role="radiogroup" aria-label="그릇 색">
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
  )

  const foodPanel = (
    <div className="food-panel">
      <div className="food-panel__meter" aria-label={`사료 ${scoops}/${SCOOPS_TO_FILL} 스쿱`}>
        {Array.from({ length: SCOOPS_TO_FILL }, (_, i) => (
          <span key={i} className={`food-panel__dot ${i < scoops ? 'is-filled' : ''}`} aria-hidden="true" />
        ))}
        <span className="food-panel__text">
          {isFull ? '가득 찼어요!' : `${scoops} / ${SCOOPS_TO_FILL} 스쿱`}
        </span>
      </div>
      <button
        type="button"
        className="chip food-panel__btn"
        onClick={() => scoopRef.current?.pour()}
        disabled={isFull}
      >
        {isFull ? '사료 가득 ✓' : '한 스쿱 담기'}
      </button>
      <p className="panel-help">스쿱을 그릇으로 끌어다 놓아도 돼요.</p>
    </div>
  )

  const topperPicker = (
    <div className="powder-panel">
      <div className="option-grid" role="radiogroup" aria-label="토퍼 파우더">
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
      <button type="button" className="text-btn" onClick={clearPowder} disabled={count === 0}>
        ↺ 가루 모두 지우기
      </button>
    </div>
  )

  const toppingPanel = (
    <div className="coming-panel">
      <p>
        <b>토핑 10종 꾸미기</b>는 다음 작업에서 만들어요.
      </p>
      <p className="panel-help">지금은 &lsquo;완성!&rsquo;을 눌러 결과를 볼 수 있어요.</p>
    </div>
  )

  const panels = { bowl: bowlPicker, food: foodPanel, powder: topperPicker, topping: toppingPanel }
  const panelTitles = { bowl: '그릇 고르기', food: '사료 담기', powder: '토퍼 파우더', topping: '토핑 꾸미기' }

  // 노트북 화면 왼쪽에만 보이는 레시피 카드 (작은 화면에서는 숨김)
  const recipeCard = (
    <div className="recipe">
      <p className="recipe__step">
        STEP {stepIndex + 1} · {STEPS[stepIndex].label}
      </p>
      <p className="recipe__tip">{STEPS[stepIndex].tip}</p>
      <ul className="recipe__list">
        {STEPS.slice(0, 4).map((s, i) => (
          <li key={s.id} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''}>
            {i < stepIndex ? '✓' : '•'} {s.label}
          </li>
        ))}
      </ul>
    </div>
  )

  /* ── 하단 버튼: 이전 / 다음 ── */
  const actions = (
    <>
      <button type="button" className="btn btn--ghost" onClick={goPrev} disabled={stepIndex === 0}>
        ◀ 이전
      </button>
      <button
        type="button"
        className={`btn btn--primary ${canGoNext ? 'is-ready' : ''}`}
        onClick={goNext}
        disabled={!canGoNext}
      >
        {NEXT_LABELS[stepIndex]}
      </button>
    </>
  )

  return (
    <GameShell
      className={`bapkku bapkku--${step}`}
      title="밥꾸 스튜디오"
      characterId="bapkku"
      onHome={onHome}
      onRestart={onRestart}
      status={status}
      left={recipeCard}
      leftTitle="오늘의 레시피"
      leftClassName="panel--recipe"
      right={panels[step]}
      rightTitle={panelTitles[step]}
      actions={actions}
      overlay={
        isDone && (
          <CelebrationModal
            bowl={bowl}
            particles={particles}
            stars={stars}
            usedToppers={usedToppers}
            onRemake={handleRemake}
            onHome={onHome}
          />
        )
      }
    >
      <p className="stage__hint" aria-live="polite">
        {hints[step]}
      </p>

      <div className="stage__bowl" ref={sceneRef}>
        {/* 그릇을 바꾸면 새 그릇이 '퐁' 하고 놓이도록 key로 다시 그림 */}
        <div key={bowlId ?? 'ghost'} className={`bowl-holder ${bowl ? 'bowl-pop' : 'bowl-ghost'}`}>
          <Bowl
            bowl={bowl ?? BOWLS[0]}
            fill={fill}
            pourId={pourId}
            particles={particles}
            puffs={puffs}
            onSprinkle={bowlAction}
            label={
              !bowl
                ? '아직 그릇을 고르지 않았어요'
                : step === 'food'
                  ? `${bowl.name} 그릇. 눌러서 사료를 담아요`
                  : step === 'powder'
                    ? `${bowl.name} 그릇. 눌러서 파우더를 뿌려요`
                    : `${bowl.name} 그릇`
            }
          />
        </div>

        {/* 사료 담기 단계에서만 스쿱 등장 */}
        {step === 'food' && (
          <Scoop
            ref={scoopRef}
            disabled={isFull}
            isOverBowl={isOverBowl}
            getPourPoint={getPourPoint}
            onPour={handlePour}
          />
        )}
      </div>
    </GameShell>
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
          <Bowl bowl={bowl} fill={1} particles={particles} interactive={false} />
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
