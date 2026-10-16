import { useId, useRef, useState } from 'react'
import { BakingMat, DoughSheet } from './CookieArt.jsx'
import { doughSize } from './doughShape.js'
import { ROLL_PASS_DISTANCE, SHEET } from './cookieData.js'

/**
 * RollStage — 베이킹 매트 위 반죽 밀기
 *
 *  - 밀대를 위아래로 끌면 반죽 위를 지나갈 때마다 반죽이 점점 넓고 납작해져요.
 *  - 한 방향으로 반죽 위를 ROLL_PASS_DISTANCE 만큼 지나가면 '한 번 밀기'로 세요.
 *    (방향을 바꿔 다시 밀면 다음 번) → ROLL_PASSES 번이면 완성
 *  - 밀대가 아닌 매트 어디를 눌러 끌어도 밀대가 따라와요 (휴대폰에서 편하게)
 *
 * props
 *   flavor : FLAVORS 중 하나
 *   flat   : 0~1 (펴진 정도)
 *   onRoll(amount) : 반죽 위를 민 거리 (SVG 단위, 한 번에 최대 ROLL_PASS_DISTANCE 만큼만 세어요)
 */
const PIN_MIN = 26
const PIN_MAX = 196

function RollStage({ flavor, flat, onRoll }) {
  const uid = `r${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const svgRef = useRef(null)
  const drag = useRef(null)
  const [pinY, setPinY] = useState(PIN_MIN + 4)
  const pinRef = useRef(PIN_MIN + 4)
  const [grabbed, setGrabbed] = useState(false)
  const run = useRef({ dir: 0, dist: 0 })

  const { ry, thick } = doughSize(flat)
  const doughTop = SHEET.cy - thick / 2 - ry - 6
  const doughBottom = SHEET.cy + thick / 2 + ry + 6
  const overDough = pinY > doughTop && pinY < doughBottom

  const toSvg = (event) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }

  const clampY = (y) => Math.min(PIN_MAX, Math.max(PIN_MIN, y))

  const handleDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    const pt = toSvg(event)
    if (!pt) return
    event.preventDefault()
    svgRef.current.setPointerCapture?.(event.pointerId)
    // 밀대를 잡았으면 잡은 자리 그대로, 아니면 밀대가 손가락 쪽으로 '쓱' 와요
    const offset = Math.abs(pt.y - pinY) < 24 ? pt.y - pinY : 0
    drag.current = { offset }
    setGrabbed(true)
    moveTo(clampY(pt.y - offset))
  }

  const moveTo = (y) => {
    const prev = pinRef.current
    const dy = y - prev
    pinRef.current = y
    setPinY(y)
    if (dy === 0) return
    // 반죽 위를 지나간 거리만 세요
    const lo = Math.max(Math.min(prev, y), doughTop)
    const hi = Math.min(Math.max(prev, y), doughBottom)
    const over = Math.max(0, hi - lo)
    const dir = Math.sign(dy)
    const r = run.current
    if (dir !== r.dir) {
      r.dir = dir
      r.dist = 0
    }
    const add = Math.min(over, Math.max(0, ROLL_PASS_DISTANCE - r.dist))
    r.dist += over
    if (add > 0) onRoll?.(add)
  }

  const handleMove = (event) => {
    if (!drag.current) return
    const pt = toSvg(event)
    if (!pt) return
    moveTo(clampY(pt.y - drag.current.offset))
  }

  const handleUp = () => {
    drag.current = null
    setGrabbed(false)
  }

  // 키보드: 위/아래 방향키로 밀기
  const handleKey = (event) => {
    const step = event.key === 'ArrowUp' ? -14 : event.key === 'ArrowDown' ? 14 : 0
    if (!step) return
    event.preventDefault()
    const cur = pinRef.current
    let next = clampY(cur + step)
    if (next === cur) next = clampY(cur - step)
    moveTo(next)
  }

  // 밀대가 굴러가는 느낌: 나뭇결 줄이 위치에 따라 움직여요
  const grain = [0, 1, 2].map((k) => ((k * 8.7 + pinY * 0.9) % 26 + 26) % 26)

  return (
    <svg
      ref={svgRef}
      className={`roll-svg ${grabbed ? 'is-grabbed' : ''}`}
      viewBox="0 0 320 220"
      role="application"
      aria-label={`Baking mat with dough. Drag the rolling pin up and down. ${Math.round(flat * 100)} percent rolled.`}
      tabIndex={0}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onLostPointerCapture={handleUp}
      onKeyDown={handleKey}
    >
      <defs>
        <linearGradient id={`${uid}-barrel`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F6D5A8" />
          <stop offset="0.35" stopColor="#E9BB82" />
          <stop offset="0.8" stopColor="#C98E58" />
          <stop offset="1" stopColor="#B27945" />
        </linearGradient>
        <linearGradient id={`${uid}-handle`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#D79A64" />
          <stop offset="0.5" stopColor="#B87842" />
          <stop offset="1" stopColor="#8E5A2E" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-10%" y="-100%" width="120%" height="300%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <clipPath id={`${uid}-barrelClip`}>
          <rect x="50" y="-13" width="220" height="26" rx="8" />
        </clipPath>
      </defs>

      <BakingMat />

      <DoughSheet flavor={flavor} flat={flat}>
        {/* 밀대가 반죽 위를 지날 때 눌리는 자국 */}
        {overDough && grabbed && (
          <ellipse cx={SHEET.cx} cy={pinY + 10} rx={doughSize(flat).rx * 0.9} ry="5" fill="#fff" opacity="0.18" />
        )}
      </DoughSheet>

      {/* 밀대 그림자: 반죽 위에서는 눌러서 가깝고 진하게 */}
      <ellipse
        cx="163"
        cy={pinY + (overDough ? 13 : 17)}
        rx={overDough ? 128 : 132}
        ry={overDough ? 6 : 8}
        fill="#6b3518"
        opacity={grabbed ? 0.26 : 0.2}
        filter={`url(#${uid}-shadow)`}
      />

      {/* 밀대 */}
      <g className="pin" transform={`translate(0 ${pinY})`}>
        <g className="pin__body">
          {/* 손잡이 */}
          <rect x="14" y="-6.5" width="40" height="13" rx="6.5" fill={`url(#${uid}-handle)`} />
          <rect x="266" y="-6.5" width="40" height="13" rx="6.5" fill={`url(#${uid}-handle)`} />
          <rect x="18" y="-4.5" width="30" height="3" rx="1.5" fill="#E8B985" opacity="0.7" />
          <rect x="272" y="-4.5" width="30" height="3" rx="1.5" fill="#E8B985" opacity="0.7" />
          {/* 몸통 */}
          <rect x="50" y="-13" width="220" height="26" rx="8" fill={`url(#${uid}-barrel)`} />
          <g clipPath={`url(#${uid}-barrelClip)`} stroke="#C58A55" strokeWidth="1" opacity="0.55">
            {grain.map((g, i) => (
              <line key={i} x1="54" x2="266" y1={-13 + g} y2={-13 + g} strokeDasharray={i === 1 ? '40 22 70 30' : '90 18 50 40'} />
            ))}
          </g>
          <rect x="56" y="-10" width="208" height="5" rx="2.5" fill="#FFF1DC" opacity="0.6" />
          {/* 몸통 끝 테 */}
          <rect x="50" y="-13" width="6" height="26" rx="3" fill="#C88A52" />
          <rect x="264" y="-13" width="6" height="26" rx="3" fill="#C88A52" />
          {/* 밀대에 묻은 밀가루 */}
          {flat > 0.1 && <ellipse cx="160" cy="7" rx="70" ry="2.2" fill={flavor.doughLight} opacity={Math.min(0.6, flat)} />}
        </g>
        {/* '위아래로 밀어요' 화살표 (처음에만) */}
        {flat === 0 && !grabbed && (
          <g className="pin__hint" aria-hidden="true">
            <path d="M160,-22 l-7,8 h14z M160,24 l-7,-8 h14z" fill="#E98F6C" />
          </g>
        )}
      </g>
    </svg>
  )
}

export default RollStage
