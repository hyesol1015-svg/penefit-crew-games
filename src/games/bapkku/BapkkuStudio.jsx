import { useEffect, useRef, useState } from 'react'
import Bowl from './Bowl.jsx'
import Scoop from './Scoop.jsx'
import PowderShaker from './PowderShaker.jsx'
import PowderJar from './PowderJar.jsx'
import StepBar from './StepBar.jsx'
import GameShell from '../../components/GameShell.jsx'
import CrewSprite from '../../components/CrewSprite.jsx'
import { findCrew } from '../../characters.js'
import {
  BOWLS,
  STEPS,
  SCOOPS_TO_FILL,
  TOPPERS,
  FOOD_AREA,
  MAX_PARTICLES,
  POWDER_MIN,
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
 *   ①그릇(5종) ②사료 담기 ③파우더 6종(통을 끌어서 뿌리기) ⑤완성 화면
 *   ④토핑 꾸미기, PNG 저장은 다음 작업에서 추가할 예정입니다.
 *
 * 화면 배치는 공통 틀인 GameShell이 화면 크기에 맞춰 알아서 처리합니다.
 */

// 다음 버튼에 쓰는 문구 (단계 번호 순서)
const NEXT_LABELS = ['다음: 사료 ▶', '다음: 파우더 ▶', '다음: 토핑 ▶', '완성!']

function BapkkuStudio({ onHome, onRestart, crewId }) {
  // 메인 화면에서 고른 크루 (안내 영역과 완성 화면에 등장)
  const crew = findCrew(crewId)

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
  const [bursts, setBursts] = useState([]) // 뿌린 파우더 묶음들 (순서대로 쌓임)
  const [notice, setNotice] = useState('') // 잠깐 보여 주는 안내 (예: 그릇 위로 옮겨 주세요)
  const strokeRef = useRef(0) // 지금 진행 중인 '뿌리기 동작' 번호 (되돌리기 단위)
  const lastTapRef = useRef(0) // 그릇을 톡톡 누를 때 같은 동작으로 묶기 위한 시각
  const shakerRef = useRef(null)

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

  const count = bursts.reduce((sum, b) => sum + b.particles.length, 0) // 뿌린 알갱이 수
  const stars = getStars(count)
  const gauge = Math.min(count / GOAL, 1)
  const usedToppers = TOPPERS.filter((t) => bursts.some((b) => b.topperId === t.id))

  /* ── 단계 조건: 이 조건이 채워져야 다음 단계로 갈 수 있어요 ── */
  const complete = {
    bowl: bowl !== null,
    food: isFull,
    powder: count >= POWDER_MIN, // 일정량 이상 뿌려야 다음 단계로
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

  /* ── ③ 파우더 뿌리기 ── */

  // 잠깐 보여 주는 안내 문구 (1.6초 뒤 사라짐)
  const noticeTimer = useRef(null)
  const showNotice = (text) => {
    setNotice(text)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 1600)
  }
  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  /**
   * 사료 위에 파우더 한 줌 떨어뜨리기
   * spout   : 가루가 나오는 곳 (SVG 좌표)
   * landing : 떨어질 곳 (SVG 좌표, 사료 위)
   */
  const addBurst = (spout, landing, amount) => {
    const burst = createPowderBurst({ spout, landing, topper, amount, makeId, stroke: strokeRef.current })
    setBursts((prev) => {
      const total = prev.reduce((sum, b) => sum + b.particles.length, 0)
      // 입자가 너무 많아지면 더 이상 쌓지 않아요 (화면이 끊기지 않게)
      if (total >= MAX_PARTICLES) return prev
      return [...prev, burst]
    })
    if (count >= MAX_PARTICLES) showNotice('그릇이 파우더로 가득 찼어요!')
  }

  /**
   * 파우더 통에서 가루 붓기 — PowderShaker가 통 입구의 '화면 좌표'를 알려 줘요.
   * 입구가 그릇 위에 있을 때만 뿌리고, 아니면 false를 돌려줘요.
   *   - 입구의 좌우 위치 → 가루가 떨어지는 좌우 위치
   *   - 입구의 위아래 위치 → 사료의 뒤쪽/앞쪽 (위에 있을수록 뒤쪽)
   */
  const pourFromShaker = (clientX, clientY, amount) => {
    const p = toBowl(clientX, clientY)
    if (!p) return false
    if (p.x < 52 || p.x > 268 || p.y < -150 || p.y > 135) return false // 그릇 위가 아니에요
    // 위아래 위치로 앞뒤를 정하고, 조금씩 흩어지게 무작위로 섞어요
    const base = Math.max(-0.6, Math.min(0.6, (p.y / 90) * 0.6))
    const depth = base + (Math.random() - 0.5) * 0.9
    const landing = clampIntoFood(p.x + (Math.random() - 0.5) * 10, FOOD_AREA.cy + depth * FOOD_AREA.ry, 0.9)
    const spout = { x: p.x, y: Math.min(p.y, landing.y - 26) }
    addBurst(spout, landing, amount)
    return true
  }

  // 뿌리기 동작 시작/끝 (되돌리기를 위해 동작마다 새 번호)
  const startStroke = () => {
    strokeRef.current = makeId()
  }
  const endStroke = (poured) => {
    if (!poured) showNotice('파우더 통을 그릇 위로 옮겨서 흔들어 주세요!')
  }

  /** 보조 조작: 그릇을 톡 누르거나 문지르면 그 자리 위에서 가루가 떨어져요 */
  const handleTapSprinkle = (x, y) => {
    const now = performance.now()
    if (now - lastTapRef.current > 450) startStroke() // 잠깐 쉬었다 누르면 새 동작
    lastTapRef.current = now
    const landing = clampIntoFood(x, y)
    addBurst({ x: landing.x + 8, y: landing.y - 70 }, landing, 4)
  }

  /** 마지막 동작 취소: 가장 최근 '뿌리기 동작'으로 생긴 가루만 지워요 */
  const undoPowder = () => {
    setBursts((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1].stroke
      return prev.filter((b) => b.stroke !== last)
    })
  }

  /** 전체 파우더 초기화 */
  const clearPowder = () => setBursts([])

  /** 완성 화면의 '다시 만들기': 처음 단계부터 새로 */
  const handleRemake = () => onRestart?.()

  // 단계마다 그릇을 눌렀을 때 하는 일
  const bowlAction = step === 'food' ? () => scoopRef.current?.pour() : step === 'powder' ? handleTapSprinkle : undefined

  /* ── 무대 위 안내 문구 ── */
  const hints = {
    bowl: bowl ? `${bowl.name} 그릇 좋아요! 이제 사료를 담으러 가 볼까요?` : '마음에 드는 그릇을 골라 주세요!',
    food: isFull
      ? '사료 가득! 이제 파우더를 뿌려 볼까요?'
      : scoops === 0
        ? '스쿱을 그릇으로 끌어다 놓거나 톡 눌러 보세요!'
        : `사료 ${scoops}/${SCOOPS_TO_FILL} — 조금 더 담아 볼까요?`,
    powder:
      notice ||
      (count === 0
        ? '파우더 통을 그릇 위로 끌고 와서 살랑살랑 흔들어 보세요!'
        : count < POWDER_MIN
          ? `${topper.name} 솔솔~ 조금만 더 뿌려 볼까요?`
          : '좋아요! 다른 파우더를 섞어 뿌려도 돼요.'),
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
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`chip chip--topper ${active ? 'is-active' : ''}`}
              style={{ '--powder': t.label }}
              onClick={() => setTopperId(t.id)}
            >
              <span className="chip__jar" aria-hidden="true">
                <PowderJar topper={t} small />
              </span>
              <span className="chip__name">{t.name}</span>
            </button>
          )
        })}
      </div>
      <div className="powder-panel__tools">
        <button type="button" className="tool-btn" onClick={undoPowder} disabled={count === 0}>
          ↶ 되돌리기
        </button>
        <button type="button" className="tool-btn" onClick={clearPowder} disabled={count === 0}>
          ↺ 전체 지우기
        </button>
      </div>
      <p className="panel-help">
        {count < POWDER_MIN
          ? `다음 단계까지 ${POWDER_MIN - count}알 더! · 그릇을 톡 눌러도 뿌려져요.`
          : '그릇을 톡 누르거나 문질러도 뿌려져요.'}
      </p>
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
      showCharacter={false}
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
            crew={crew}
            bowl={bowl}
            bursts={bursts}
            count={count}
            stars={stars}
            usedToppers={usedToppers}
            onRemake={handleRemake}
            onHome={onHome}
          />
        )
      }
    >
      {/* 안내 영역: 고른 크루가 말풍선으로 알려 줘요 */}
      <div className="guide">
        <span key={step} className="guide__crew">
          <CrewSprite crew={crew} />
        </span>
        <p className="stage__hint guide__bubble" aria-live="polite">
          <span className="guide__name">{crew.name}</span>
          {hints[step]}
        </p>
      </div>

      <div className="stage__bowl" ref={sceneRef}>
        {/* 그릇을 바꾸면 새 그릇이 '퐁' 하고 놓이도록 key로 다시 그림 */}
        <div key={bowlId ?? 'ghost'} className={`bowl-holder ${bowl ? 'bowl-pop' : 'bowl-ghost'}`}>
          <Bowl
            bowl={bowl ?? BOWLS[0]}
            fill={fill}
            pourId={pourId}
            bursts={bursts}
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

        {/* 파우더 단계에서만 파우더 통 등장 (고른 파우더로 바뀌어요) */}
        {step === 'powder' && (
          <PowderShaker
            ref={shakerRef}
            topper={topper}
            onPour={pourFromShaker}
            onStrokeStart={startStroke}
            onStrokeEnd={endStroke}
          />
        )}

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

function CelebrationModal({ crew, bowl, bursts, count, stars, usedToppers, onRemake, onHome }) {
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
          <Bowl bowl={bowl} fill={1} bursts={bursts} interactive={false} />
          {/* 함께 만든 크루가 옆에서 축하해 줘요 */}
          <div className="celebrate__cheer">
            <span className="celebrate__say">{crew.name}: 맛있겠다!</span>
            <span className="celebrate__crew">
              <CrewSprite crew={crew} />
            </span>
          </div>
        </div>

        <p className="celebrate__desc">
          {bowl.name} 그릇에 <b>{toppingText}</b> 토퍼
          <br />
          알갱이 <b>{count}개</b>를 뿌린 특별한 한 끼예요.
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
