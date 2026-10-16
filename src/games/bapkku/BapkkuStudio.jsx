import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Bowl from './Bowl.jsx'
import Scoop from './Scoop.jsx'
import PowderShaker from './PowderShaker.jsx'
import PowderIcon from './PowderIcon.jsx'
import { MeatCardArt } from './MeatArt.jsx'
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
  MAX_GRAINS,
  GRAINS_PER_AMOUNT,
  MAX_GRAINS_PER_POUR,
  POWDER_MIN,
  STAR_STEPS,
  GOAL,
  getStars,
  clampIntoFood,
  createPowderBurst,
  MEATS,
  MAX_MEATS,
  MEAT_LIMIT,
  createMeatPiece,
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
 *   ①그릇(5종) ②사료 담기 ③파우더 6종(통을 끌어서 뿌리기, 15알부터 다음 단계)
 *   ④고기 토핑 4종(눌러서/끌어서 올리기, 옮기기, 되돌리기, 삭제) ⑤완성 화면
 *   PNG 저장은 다음 작업에서 추가할 예정입니다.
 *
 * 화면 배치는 공통 틀인 GameShell이 화면 크기에 맞춰 알아서 처리합니다.
 */

// 다음 버튼에 쓰는 문구 (단계 번호 순서)
const NEXT_LABELS = ['Next: Food ▶', 'Next: Powder ▶', 'Next: Toppings ▶', 'Finish!']

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
  const [topperId, setTopperId] = useState(TOPPERS[0].id) // 선택한 토퍼 (처음엔 목록 첫 번째)
  const [bursts, setBursts] = useState([]) // 뿌린 파우더 묶음들 (순서대로 쌓임)
  const [notice, setNotice] = useState('') // 잠깐 보여 주는 안내 (예: 그릇 위로 옮겨 주세요)
  const strokeRef = useRef(0) // 지금 진행 중인 '뿌리기 동작' 번호 (되돌리기 단위)
  const lastTapRef = useRef(0) // 그릇을 톡톡 누를 때 같은 동작으로 묶기 위한 시각
  const shakerRef = useRef(null)
  const grainAcc = useRef(0) // 흔든 세기를 '알' 수로 바꿀 때 남는 소수점을 모아 두는 곳

  // ── ④ 고기 토핑 ──
  const [meatId, setMeatId] = useState(MEATS[0].id) // 고른 고기 종류
  const [meats, setMeats] = useState([]) // 그릇에 올린 조각들 (올린 순서대로)
  const [pickedPiece, setPickedPiece] = useState(null) // 눌러서 고른 조각 id (삭제·이동용)
  const [cardDrag, setCardDrag] = useState(null) // 카드를 끌고 있을 때 손가락을 따라다니는 그림
  const cardDragRef = useRef(null)

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

  // 뿌린 '알' 수 — 화면 숫자·게이지·별·다음 단계 조건이 모두 이 값을 써요
  const count = bursts.reduce((sum, b) => sum + b.grains, 0)
  const stars = getStars(count)
  const gauge = Math.min(count / GOAL, 1)
  const usedToppers = TOPPERS.filter((t) => bursts.some((b) => b.topperId === t.id))
  const meat = MEATS.find((m) => m.id === meatId)
  const usedMeats = MEATS.filter((m) => meats.some((p) => p.meatId === m.id))

  /* ── 단계 조건: 이 조건이 채워져야 다음 단계로 갈 수 있어요 ── */
  const complete = {
    bowl: bowl !== null,
    food: isFull,
    powder: count >= POWDER_MIN, // 일정량 이상 뿌려야 다음 단계로
    topping: meats.length > 0, // 고기 토핑을 하나 이상 올리면 완성 가능
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
  const addBurst = (spout, landing, grains) => {
    if (grains <= 0) return
    if (count >= MAX_GRAINS) {
      showNotice('Wow, the bowl is full of powder!')
      return
    }
    const burst = createPowderBurst({ spout, landing, topper, grains, makeId, stroke: strokeRef.current })
    setBursts((prev) => {
      const total = prev.reduce((sum, b) => sum + b.grains, 0)
      // 너무 많아지면 더 이상 쌓지 않아요 (화면이 끊기지 않게)
      if (total >= MAX_GRAINS) return prev
      return [...prev, burst]
    })
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
    // 흔든 세기 → 알 수 (소수점은 모아 두었다가 다음에 더해요)
    grainAcc.current += Math.min(amount * GRAINS_PER_AMOUNT, MAX_GRAINS_PER_POUR)
    const grains = Math.floor(grainAcc.current)
    grainAcc.current -= grains
    addBurst(spout, landing, grains)
    return true
  }

  // 뿌리기 동작 시작/끝 (되돌리기를 위해 동작마다 새 번호)
  const startStroke = () => {
    strokeRef.current = makeId()
    grainAcc.current = 0.75 // 통을 기울이자마자 첫 알이 바로 떨어지도록
  }
  const endStroke = (poured) => {
    if (!poured) showNotice('Move the shaker over the bowl and shake!')
  }

  /** 보조 조작: 그릇을 톡 누르거나 문지르면 그 자리 위에서 가루가 떨어져요 */
  const handleTapSprinkle = (x, y) => {
    const now = performance.now()
    if (now - lastTapRef.current > 450) startStroke() // 잠깐 쉬었다 누르면 새 동작
    lastTapRef.current = now
    const landing = clampIntoFood(x, y)
    addBurst({ x: landing.x + 8, y: landing.y - 70 }, landing, 1) // 한 번 톡 = 1알
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

  /* ── ④ 고기 토핑 ── */

  /** 그릇 위 (x, y) — SVG 좌표 — 에 고른 고기 한 조각 올리기 */
  const placeMeat = (x, y, type = meat) => {
    if (!type) return
    if (meats.length >= MAX_MEATS) {
      showNotice('The bowl is full of toppings!')
      return
    }
    setMeats((prev) => (prev.length >= MAX_MEATS ? prev : [...prev, createMeatPiece(type, x, y, makeId())]))
    setPickedPiece(null)
  }

  /** 올려 둔 조각 옮기기 (그릇 밖으로 나가지 않게 사료 안쪽으로 끌어와요) */
  const moveMeat = (id, x, y) => {
    const pos = clampIntoFood(x, y, MEAT_LIMIT)
    setMeats((prev) => prev.map((m) => (m.id === id ? { ...m, x: pos.x, y: pos.y } : m)))
  }

  /** 마지막으로 올린 조각 취소 */
  const undoMeat = () => {
    const last = meats[meats.length - 1]
    if (!last) return
    setMeats((prev) => prev.slice(0, -1))
    if (pickedPiece === last.id) setPickedPiece(null)
  }

  /** 눌러서 고른 조각 삭제 */
  const removePicked = () => {
    if (pickedPiece === null) return
    setMeats((prev) => prev.filter((m) => m.id !== pickedPiece))
    setPickedPiece(null)
  }

  /* 카드를 끌어서 그릇에 놓기
     - 살짝(8px 이상) 움직이면 끌기 시작 → 그림이 손가락을 따라다녀요
     - 터치에서는 손가락에 가리지 않게 그림을 조금 위에 띄워요
     - 그릇 위에서 손을 떼면 그 자리에 올라가요 */
  const handleCardDown = (event, type) => {
    if (event.button !== undefined && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const m = bowlSvg()?.getScreenCTM()
    cardDragRef.current = {
      type,
      sx: event.clientX,
      sy: event.clientY,
      active: false,
      lift: event.pointerType === 'mouse' ? 0 : 36,
      unit: m ? Math.abs(m.a) : 2, // 그릇 SVG 1칸이 화면에서 몇 px인지 (그림 크기 맞추기)
    }
  }
  const handleCardMove = (event) => {
    const d = cardDragRef.current
    if (!d) return
    if (!d.active && Math.hypot(event.clientX - d.sx, event.clientY - d.sy) < 8) return
    if (!d.active) {
      d.active = true
      setMeatId(d.type.id)
    }
    setCardDrag({ type: d.type, x: event.clientX, y: event.clientY - d.lift, unit: d.unit })
  }
  const handleCardUp = (event) => {
    const d = cardDragRef.current
    cardDragRef.current = null
    setCardDrag(null)
    if (!d?.active) return
    const p = toBowl(event.clientX, event.clientY - d.lift)
    if (p && p.x > 36 && p.x < 284 && p.y > 30 && p.y < 140) placeMeat(p.x, p.y, d.type)
    else showNotice('Drop it on the bowl!')
  }
  const handleCardCancel = () => {
    cardDragRef.current = null
    setCardDrag(null)
  }

  /** 완성 화면의 '다시 만들기': 처음 단계부터 새로 */
  const handleRemake = () => onRestart?.()

  // 단계마다 그릇을 눌렀을 때 하는 일
  const bowlAction =
    step === 'food'
      ? () => scoopRef.current?.pour()
      : step === 'powder'
        ? handleTapSprinkle
        : step === 'topping'
          ? (x, y) => placeMeat(x, y)
          : undefined

  /* ── 무대 위 안내 문구 ── */
  const hints = {
    bowl: bowl ? `Love the ${bowl.name} bowl! Let's add some food.` : 'Pick a bowl you like!',
    food: isFull
      ? 'All full! Time to add some powder.'
      : scoops === 0
        ? 'Drag the scoop to the bowl, or just tap it!'
        : `Food ${scoops}/${SCOOPS_TO_FILL}. A little more!`,
    powder:
      notice ||
      (count === 0
        ? 'Drag the shaker over the bowl and give it a shake!'
        : count < POWDER_MIN
          ? `Yummy ${topper.name}! Just a bit more.`
          : 'Great! Try mixing in another powder.'),
    topping:
      notice ||
      (meats.length === 0
        ? `Tap the bowl to add ${meat.name}, or drag the card onto it!`
        : pickedPiece !== null
          ? 'Drag it to move it, or tap Remove.'
          : 'Yummy! Mix more toppings or tap Finish!'),
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
            aria-label="Powder gauge"
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
            Sprinkles <b>{count}</b>
          </span>
        </div>
      )}
      {step === 'topping' && (
        <div className="meter meter--toppings">
          <span className="stage__count">
            Toppings <b>{meats.length}</b> / {MAX_MEATS}
          </span>
        </div>
      )}
    </>
  )

  /* ── 단계별 패널 내용 ── */
  const bowlPicker = (
    <div className="option-grid" role="radiogroup" aria-label="Bowl color">
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
      <div className="food-panel__meter" aria-label={`Food ${scoops} of ${SCOOPS_TO_FILL} scoops`}>
        {Array.from({ length: SCOOPS_TO_FILL }, (_, i) => (
          <span key={i} className={`food-panel__dot ${i < scoops ? 'is-filled' : ''}`} aria-hidden="true" />
        ))}
        <span className="food-panel__text">
          {isFull ? 'All full!' : `${scoops} / ${SCOOPS_TO_FILL} scoops`}
        </span>
      </div>
      <button
        type="button"
        className="chip food-panel__btn"
        onClick={() => scoopRef.current?.pour()}
        disabled={isFull}
      >
        {isFull ? 'Bowl Full ✓' : 'Add a Scoop'}
      </button>
      <p className="panel-help">You can also drag the scoop to the bowl.</p>
    </div>
  )

  const topperPicker = (
    <div className="powder-panel">
      <div className="option-grid" role="radiogroup" aria-label="Topper powder">
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
              onClick={() => {
                setTopperId(t.id)
                lastTapRef.current = 0 // 파우더를 바꾸면 '되돌리기'도 새 동작으로 시작
              }}
            >
              {/* 실제 파우더 아이콘 (없으면 임시 파우더 통으로 대체) */}
              <PowderIcon topper={t} />
              {/* 제품명 + 영문 컬러명 */}
              <span className="chip__text">
                <span className="chip__name">{t.name}</span>
                <span className="chip__sub">{t.colorName}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="powder-panel__tools">
        <button type="button" className="tool-btn" onClick={undoPowder} disabled={count === 0}>
          ↶ Undo
        </button>
        <button type="button" className="tool-btn" onClick={clearPowder} disabled={count === 0}>
          ↺ Clear All
        </button>
      </div>
      <p className="panel-help">
        {count < POWDER_MIN
          ? `${POWDER_MIN - count} more to go! You can also tap the bowl.`
          : 'Tip: tap or rub the bowl to sprinkle too.'}
      </p>
    </div>
  )

  const toppingPanel = (
    <div className="powder-panel meat-panel">
      <div className="option-grid meat-grid" role="radiogroup" aria-label="Meat topping">
        {MEATS.map((m) => {
          const active = meatId === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${m.name}. Tap the bowl or drag this card onto it.`}
              className={`chip chip--meat ${active ? 'is-active' : ''}`}
              style={{ '--meat': m.tint }}
              onClick={() => setMeatId(m.id)}
              onPointerDown={(event) => handleCardDown(event, m)}
              onPointerMove={handleCardMove}
              onPointerUp={handleCardUp}
              onPointerCancel={handleCardCancel}
            >
              <span className="chip__meat" aria-hidden="true">
                <MeatCardArt meat={m} />
              </span>
              <span className="chip__text">
                <span className="chip__name">{m.name}</span>
                <span className="chip__sub">{m.desc}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="powder-panel__tools">
        <button type="button" className="tool-btn" onClick={undoMeat} disabled={meats.length === 0}>
          ↶ Undo
        </button>
        <button type="button" className="tool-btn" onClick={removePicked} disabled={pickedPiece === null}>
          ✕ Remove
        </button>
      </div>
      <p className="panel-help">
        {meats.length === 0
          ? 'Add at least one topping. Mix as many kinds as you like!'
          : 'Tap a piece on the bowl to pick it, then drag to move or tap Remove.'}
      </p>
    </div>
  )

  const panels = { bowl: bowlPicker, food: foodPanel, powder: topperPicker, topping: toppingPanel }
  const panelTitles = { bowl: 'Pick a Bowl', food: 'Add Food', powder: 'Topper Powder', topping: 'Meat Toppings' }

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
        ◀ Back
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
      title="Bowl Decorating Studio"
      characterId="bapkku"
      showCharacter={false}
      onHome={onHome}
      onRestart={onRestart}
      status={status}
      left={recipeCard}
      leftTitle="Today's Recipe"
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
            meats={meats}
            count={count}
            stars={stars}
            usedToppers={usedToppers}
            usedMeats={usedMeats}
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
            meats={meats}
            selectedMeat={step === 'topping' ? pickedPiece : null}
            onMeatSelect={setPickedPiece}
            onMeatMove={step === 'topping' ? moveMeat : undefined}
            rub={step !== 'topping'}
            onSprinkle={bowlAction}
            label={
              !bowl
                ? 'No bowl picked yet'
                : step === 'food'
                  ? `${bowl.name} bowl. Tap to add food`
                  : step === 'powder'
                    ? `${bowl.name} bowl. Tap to sprinkle powder`
                    : step === 'topping'
                      ? `${bowl.name} bowl. Tap to add ${meat.name}`
                      : `${bowl.name} bowl`
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

      {/* 카드를 끌 때 손가락을 따라다니는 고기 그림 (화면 맨 위에 그려요) */}
      {cardDrag &&
        createPortal(
          <div
            className="meat-ghost"
            style={{ left: cardDrag.x, top: cardDrag.y, width: 36 * cardDrag.unit, height: 30 * cardDrag.unit }}
            aria-hidden="true"
          >
            <MeatCardArt meat={cardDrag.type} />
          </div>,
          document.body,
        )}
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

const STAR_MESSAGES = ['', 'Looks yummy!', 'So delicious!', 'Top Bowl Chef!']

function CelebrationModal({ crew, bowl, bursts, meats, count, stars, usedToppers, usedMeats, onRemake, onHome }) {
  const powderText = usedToppers.map((t) => t.name).join(', ')
  const meatText = usedMeats.map((m) => m.name).join(', ')

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
          Bowl Complete!
        </h2>

        <div className="celebrate__stars" aria-label={`${stars} of 3 stars`}>
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
          <Bowl bowl={bowl} fill={1} bursts={bursts} meats={meats} interactive={false} />
          {/* 함께 만든 크루가 옆에서 축하해 줘요 */}
          <div className="celebrate__cheer">
            <span className="celebrate__say">{crew.name}: Yum!</span>
            <span className="celebrate__crew">
              <CrewSprite crew={crew} />
            </span>
          </div>
        </div>

        <p className="celebrate__desc">
          A <b>{bowl.name}</b> bowl with <b>{powderText}</b> powder
          {meatText && (
            <>
              {' '}
              and <b>{meatText}</b>
            </>
          )}
          .
          <br />
          <b>{count}</b> sprinkles of love!
        </p>

        <div className="celebrate__actions">
          <button type="button" className="btn btn--primary" onClick={onRemake}>
            Start Over
          </button>
          <button type="button" className="btn btn--ghost" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default BapkkuStudio
