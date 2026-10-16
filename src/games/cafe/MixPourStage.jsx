import { useEffect, useId, useRef, useState } from 'react'
import { Cup, CafeTable } from './CupArt.jsx'
import { CUP, POUR_SECONDS, mixColor } from './cafeData.js'

/**
 * MixPourStage — 섞기 & 붓기 (맛 고르기 단계에서는 섞기 전 그릇을 보여 줘요)
 *
 *  ① 섞기 : 믹싱볼 안에서 손가락/마우스로 원을 그리며 저어요.
 *           파우더 덩어리가 소용돌이치며 녹고, 음료 색이 점점 고르게 바뀌어요. (약 3바퀴)
 *  ② 붓기 : 다 섞이면 음료가 피처에 담겨요. 피처를 끌어 컵 위로 가져가면
 *           피처가 기울어지며 음료가 흘러 내리고 컵 수위가 올라가요. (약 2~3초)
 *
 * props
 *   cup, drink, mix(0~1), swirl, level(0~1), interactive
 *   onStir(amount, signed) / onPour(dLevel)
 */
const BOWL = { cx: 160, cy: 132, rx: 100, ry: 24 }
const CLUMPS = Array.from({ length: 16 }, (_, i) => {
  const a = i * 2.39996
  const r = Math.sqrt((i + 0.6) / 16) * 0.28
  return { x: 0.32 + Math.cos(a) * r, y: -0.05 + Math.sin(a) * r * 1.4, s: 4 + ((i * 7) % 5) * 1.1 }
})

// 붓기 단계 위치
const CUP_POS = { x: 236, y: 240, s: 0.82 }
const PITCHER_REST = { x: 82, y: 158 }
const SPOUT_TILTED = { x: 48, y: 3 } // 기울였을 때 주둥이 위치 (피처 기준)

function MixPourStage({ cup, drink, mix = 0, swirl = 0, level = 0, interactive = false, onStir, onPour }) {
  const pouringStage = interactive && mix >= 1
  return pouringStage ? (
    <PourScene cup={cup} drink={drink} level={level} onPour={onPour} />
  ) : (
    <MixScene drink={drink} mix={mix} swirl={swirl} interactive={interactive} onStir={onStir} />
  )
}

/* ─────────────── ① 섞기 ─────────────── */
function MixScene({ drink, mix, swirl, interactive, onStir }) {
  const uid = `mx${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const svgRef = useRef(null)
  const drag = useRef(null)
  const [spoon, setSpoon] = useState(null)
  const p = Math.min(Math.max(mix, 0), 1)

  const toSvg = (event) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }
  const polar = (pt) => {
    const nx = (pt.x - BOWL.cx) / BOWL.rx
    const ny = (pt.y - BOWL.cy) / (BOWL.ry * 2)
    return { a: Math.atan2(ny, nx), d: Math.hypot(nx, ny) }
  }
  const clamp = (pt) => {
    const nx = (pt.x - BOWL.cx) / (BOWL.rx * 0.85)
    const ny = (pt.y - BOWL.cy) / (BOWL.ry * 0.85)
    const d = Math.hypot(nx, ny)
    return d <= 1 ? pt : { x: BOWL.cx + (nx / d) * BOWL.rx * 0.85, y: BOWL.cy + (ny / d) * BOWL.ry * 0.85 }
  }

  const handleDown = (event) => {
    if (!interactive || (event.button !== undefined && event.button !== 0)) return
    const pt = toSvg(event)
    if (!pt) return
    event.preventDefault()
    svgRef.current.setPointerCapture?.(event.pointerId)
    drag.current = { prev: polar(pt).a, lastSign: 0 }
    setSpoon(clamp(pt))
  }
  const handleMove = (event) => {
    const d = drag.current
    if (!d) return
    const pt = toSvg(event)
    if (!pt) return
    setSpoon(clamp(pt))
    const { a, d: dist } = polar(pt)
    if (dist < 0.14 || dist > 1.9) {
      d.prev = a
      return
    }
    let delta = a - d.prev
    if (delta > Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    d.prev = a
    if (Math.abs(delta) > 1.3) return
    const sign = Math.sign(delta)
    const amount = Math.abs(delta) * (sign === d.lastSign || d.lastSign === 0 ? 1 : 0.25)
    if (sign !== 0) d.lastSign = sign
    onStir?.(amount, delta)
  }
  const handleUp = () => {
    drag.current = null
    setSpoon(null)
  }
  const handleKey = (event) => {
    if (!interactive) return
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault()
      onStir?.(Math.PI / 5, Math.PI / 5)
    }
  }

  const liquid = mixColor(drink.base, drink.drink, p)
  const spin = swirl * 0.5

  return (
    <svg
      ref={svgRef}
      className={`cafe-svg mixpour-svg ${interactive ? 'is-interactive' : ''} ${spoon ? 'is-stirring' : ''}`}
      viewBox="0 0 320 260"
      role={interactive ? 'application' : 'img'}
      aria-label={interactive ? `Mixing bowl. Stir in circles to mix. ${Math.round(p * 100)} percent mixed.` : `Mixing bowl with drink base and ${drink.name} powder`}
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onLostPointerCapture={handleUp}
      onKeyDown={handleKey}
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#BFE3D2" />
          <stop offset="0.3" stopColor="#E3F6EE" />
          <stop offset="0.7" stopColor="#CDEEDF" />
          <stop offset="1" stopColor="#9FD0BA" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={BOWL.rx} ry={BOWL.ry} />
        </clipPath>
      </defs>
      <CafeTable />
      {/* 그릇 */}
      <ellipse cx="164" cy="226" rx="84" ry="9" fill="#7a4a24" opacity="0.18" />
      <path d="M40,128 C44,186 98,224 160,224 C222,224 276,186 280,128Z" fill={`url(#${uid}-body)`} />
      <path d="M58,150 C70,184 100,204 130,212" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      {[86, 122, 160, 198, 234].map((x, i) => (
        <path key={x} d={`M${x},${176 + (i % 2) * 14} m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0`} fill="#fff" opacity="0.65" />
      ))}
      <ellipse cx="160" cy="128" rx="122" ry="34" fill="#F4FCF8" stroke="#A9D7C2" strokeWidth="2.5" />
      <ellipse cx="160" cy="131" rx="110" ry="28" fill="#D7EFE4" />
      {/* 음료 */}
      <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={BOWL.rx} ry={BOWL.ry} fill={liquid} />
      <g clipPath={`url(#${uid}-clip)`}>
        <ellipse cx={BOWL.cx - 30} cy={BOWL.cy - 8} rx="40" ry="6" fill="#fff" opacity="0.35" />
        {/* 파우더 덩어리: 저을수록 소용돌이치며 녹아요 */}
        {CLUMPS.map((c, i) => {
          const r0 = Math.hypot(c.x, c.y)
          const a0 = Math.atan2(c.y, c.x)
          const a = a0 + swirl * (0.6 + 0.4 * (1 - r0))
          const r = r0 * (1 - 0.6 * p)
          const op = Math.max(0, 1 - p * 1.25)
          if (op <= 0.01) return null
          return (
            <g key={i} opacity={op}>
              <ellipse cx={BOWL.cx + Math.cos(a) * r * BOWL.rx} cy={BOWL.cy + Math.sin(a) * r * BOWL.ry} rx={c.s * (1 + p)} ry={c.s * 0.55 * (1 + p)} fill={drink.color} />
              <ellipse cx={BOWL.cx + Math.cos(a) * r * BOWL.rx - 1.5} cy={BOWL.cy + Math.sin(a) * r * BOWL.ry - 1} rx={c.s * 0.4} ry={c.s * 0.2} fill="#fff" opacity="0.4" />
            </g>
          )
        })}
        {/* 섞이는 소용돌이 줄무늬 */}
        {p > 0 && p < 1 && (
          <g transform={`rotate(${(spin * 180) / Math.PI} ${BOWL.cx} ${BOWL.cy}) translate(${BOWL.cx} ${BOWL.cy}) scale(1 ${BOWL.ry / BOWL.rx}) translate(${-BOWL.cx} ${-BOWL.cy})`} opacity={0.55 * (1 - p)}>
            <circle cx={BOWL.cx} cy={BOWL.cy} r={BOWL.rx * 0.62} fill="none" stroke={drink.color} strokeWidth="5" strokeDasharray="60 40" strokeLinecap="round" />
            <circle cx={BOWL.cx} cy={BOWL.cy} r={BOWL.rx * 0.34} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="30 26" strokeLinecap="round" />
          </g>
        )}
        {p >= 1 && <ellipse cx={BOWL.cx + 22} cy={BOWL.cy - 6} rx="22" ry="4" fill="#fff" opacity="0.3" />}
      </g>
      {interactive && p === 0 && !spoon && (
        <ellipse className="mix-hint-ring" cx={BOWL.cx} cy={BOWL.cy} rx="66" ry="16" fill="none" stroke="#E98F6C" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" />
      )}
      {(interactive || p > 0) && <Ladle at={spoon} />}
    </svg>
  )
}

function Ladle({ at }) {
  const x = at ? at.x : 244
  const y = at ? at.y : 120
  const tilt = at ? -26 + ((x - 160) / 100) * 16 : -20
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`} pointerEvents="none">
      <ellipse cx="3" cy="5" rx="10" ry="4" fill="#5a2e14" opacity="0.15" />
      <rect x="-3" y="-92" width="6" height="88" rx="3" fill="#F7B9C4" />
      <rect x="-2" y="-90" width="2" height="82" rx="1" fill="#FFE1E7" />
      <ellipse cx="0" cy="0" rx="10" ry="12" fill="#F2A3B3" />
      <ellipse cx="-1.5" cy="-1.5" rx="7" ry="8.5" fill="#FFC9D4" />
      <circle cx="0" cy="-94" r="5" fill="#fff" stroke="#E592A3" strokeWidth="1.5" />
    </g>
  )
}

/* ─────────────── ② 붓기 ─────────────── */
function PourScene({ cup, drink, level, onPour }) {
  const uid = `pr${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const svgRef = useRef(null)
  const drag = useRef(null)
  const [pos, setPos] = useState(PITCHER_REST)
  const [dragging, setDragging] = useState(false)
  const [keyPour, setKeyPour] = useState(false)
  const onPourRef = useRef(onPour)
  useEffect(() => {
    onPourRef.current = onPour
  })

  // 컵 입구 위치 (SVG 좌표)
  const rimY = CUP_POS.y - CUP.H * CUP_POS.s
  const spout = { x: pos.x + SPOUT_TILTED.x, y: pos.y + SPOUT_TILTED.y }
  const overCup = Math.abs(spout.x - CUP_POS.x) < 34 && spout.y < rimY + 6 && spout.y > rimY - 100
  const full = level >= 1
  const pouring = !full && ((dragging && overCup) || keyPour)
  const tilted = (dragging && overCup) || keyPour

  useEffect(() => {
    if (!pouring) return undefined
    let raf = 0
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      onPourRef.current?.(dt / POUR_SECONDS)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pouring])

  const toSvg = (event) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }
  const clampPos = (p) => ({ x: Math.min(270, Math.max(40, p.x)), y: Math.min(200, Math.max(40, p.y)) })

  const handleDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    const pt = toSvg(event)
    if (!pt) return
    event.preventDefault()
    svgRef.current.setPointerCapture?.(event.pointerId)
    const near = Math.hypot(pt.x - pos.x, pt.y - pos.y) < 50
    drag.current = { ox: near ? pt.x - pos.x : 0, oy: near ? pt.y - pos.y : 0 }
    setDragging(true)
    setPos(clampPos({ x: pt.x - drag.current.ox, y: pt.y - drag.current.oy }))
  }
  const handleMove = (event) => {
    if (!drag.current) return
    const pt = toSvg(event)
    if (pt) setPos(clampPos({ x: pt.x - drag.current.ox, y: pt.y - drag.current.oy }))
  }
  const handleUp = () => {
    drag.current = null
    setDragging(false)
    setPos(PITCHER_REST) // 손을 떼면 피처가 제자리로
  }
  // 키보드: Enter/스페이스를 누르고 있는 동안 붓기
  const handleKey = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    setKeyPour(true)
    setPos({ x: CUP_POS.x - SPOUT_TILTED.x + 4, y: rimY - 40 })
  }
  const handleKeyUp = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    setKeyPour(false)
    setPos(PITCHER_REST)
  }

  // 컵 안 음료 윗면 (흘러내리는 줄기가 닿는 곳)
  const surfaceY = CUP_POS.y + CUP_POS.s * (-5 - (CUP.H - 12) * level)
  const left = Math.max(0, 1 - level) // 피처에 남은 음료

  return (
    <svg
      ref={svgRef}
      className={`cafe-svg pour-svg ${dragging ? 'is-dragging' : ''}`}
      viewBox="0 0 320 260"
      role="application"
      aria-label={`Pitcher and ${cup.name} cup. Drag the pitcher over the cup to pour. ${Math.round(level * 100)} percent full.`}
      tabIndex={0}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onLostPointerCapture={handleUp}
      onKeyDown={handleKey}
      onKeyUp={handleKeyUp}
    >
      <defs>
        <clipPath id={`${uid}-pitcher`}>
          <path d="M-24,-30 L24,-30 C30,0 30,24 20,34 L-20,34 C-30,24 -30,0 -24,-30Z" />
        </clipPath>
      </defs>
      <CafeTable />
      <g transform={`translate(${CUP_POS.x} ${CUP_POS.y}) scale(${CUP_POS.s})`}>
        <Cup cup={cup} drink={drink} level={level} />
      </g>

      {/* 컵 위 '여기로' 안내 (처음에만) */}
      {level === 0 && !dragging && !keyPour && (
        <g className="pour-target" aria-hidden="true">
          <ellipse cx={CUP_POS.x} cy={rimY - 2} rx="46" ry="11" fill="none" stroke="#E98F6C" strokeWidth="2.6" strokeDasharray="8 7" strokeLinecap="round" />
          <path d={`M${CUP_POS.x - 60},${rimY - 70} q30,-20 52,22`} fill="none" stroke="#E98F6C" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="6 6" />
          <path d={`M${CUP_POS.x - 8},${rimY - 48} l-1,-10 m1,10 l-10,-4`} stroke="#E98F6C" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* 흘러내리는 음료 줄기 */}
      {pouring && (
        <g className="pour-stream" pointerEvents="none">
          <path
            d={`M${spout.x},${spout.y} C${spout.x + 4},${spout.y + 10} ${CUP_POS.x - 4},${spout.y + 16} ${CUP_POS.x - 2},${surfaceY}`}
            fill="none"
            stroke={drink.drink}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={`M${spout.x},${spout.y} C${spout.x + 4},${spout.y + 10} ${CUP_POS.x - 4},${spout.y + 16} ${CUP_POS.x - 2},${surfaceY}`}
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="6 10"
            className="pour-stream__shine"
            opacity="0.7"
          />
          <ellipse cx={CUP_POS.x - 2} cy={surfaceY} rx="9" ry="2.6" fill="#fff" opacity="0.55" className="pour-splash" />
        </g>
      )}

      {/* 피처 */}
      <g className={`pitcher-move ${dragging || keyPour ? 'is-held' : ''}`} style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
        <ellipse cx="2" cy={tilted ? 44 : 38} rx="26" ry="5" fill="#5a2e14" opacity={dragging ? 0.1 : 0.18} />
        <g className="pitcher-tilt" style={{ transform: `rotate(${tilted ? 52 : 0}deg)` }}>
          {/* 손잡이 */}
          <path d="M-24,-20 C-46,-20 -46,22 -22,20" fill="none" stroke="#F2B8C4" strokeWidth="7" strokeLinecap="round" />
          {/* 몸통 (투명) + 음료 */}
          <path d="M-24,-30 L24,-30 C30,0 30,24 20,34 L-20,34 C-30,24 -30,0 -24,-30Z" fill="#FFFFFF" opacity="0.7" />
          <g clipPath={`url(#${uid}-pitcher)`}>
            <rect x="-34" y={34 - 60 * left} width="68" height={60 * left + 2} fill={drink.drink} />
            <rect x="-34" y={34 - 60 * left} width="68" height="4" fill={mixColor(drink.drink, '#ffffff', 0.35)} />
          </g>
          <path d="M-24,-30 L24,-30 C30,0 30,24 20,34 L-20,34 C-30,24 -30,0 -24,-30Z" fill="none" stroke="#E9A9B8" strokeWidth="2.4" />
          {/* 주둥이 */}
          <path d="M18,-30 L32,-36 L26,-26Z" fill="#FFFFFF" stroke="#E9A9B8" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="0" cy="-30" rx="24" ry="4" fill="#FFF4F6" stroke="#E9A9B8" strokeWidth="2" />
          <path d="M-16,-20 L-18,22" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
          {/* 하트 무늬 */}
          <path d="M6,8 c-2,-3 -7,-2 -6,2 c1,3 6,6 6,6 c0,0 5,-3 6,-6 c1,-4 -4,-5 -6,-2z" fill="#F7B9C4" opacity="0.9" />
        </g>
      </g>
    </svg>
  )
}

export default MixPourStage
