import { useId, useRef, useState } from 'react'
import { mixColor } from './jellyData.js'

/**
 * JellyMixBowl — 연구소 유리 믹싱볼 (맛 고르기 · 섞기 단계)
 *
 *  - 첫 번째 맛 색 젤리액 위에 두 번째 맛 덩어리가 떠 있어요.
 *  - 손가락/마우스로 원을 그리며 저으면 두 색이 소용돌이치며 섞여 새 색이 돼요. (약 3바퀴)
 *  - 톡톡 누르기만 해서는 섞이지 않아요.
 *
 * props
 *   first, second : 고른 맛 (FLAVORS)
 *   mix 0~1, swirl, interactive, onStir(amount, signed)
 */
const B = { cx: 160, cy: 128, rx: 102, ry: 25 }
const BLOBS = Array.from({ length: 14 }, (_, i) => {
  const a = i * 2.39996
  const r = Math.sqrt((i + 0.6) / 14) * 0.3
  return { x: 0.3 + Math.cos(a) * r, y: -0.05 + Math.sin(a) * r * 1.3, s: 5 + ((i * 7) % 5) * 1.2 }
})

function JellyMixBowl({ first, second, mix = 0, swirl = 0, interactive = false, onStir }) {
  const uid = `jm${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const svgRef = useRef(null)
  const drag = useRef(null)
  const [rod, setRod] = useState(null)
  const p = Math.min(Math.max(mix, 0), 1)
  const mixed = mixColor(first.color, second.color, 0.5)
  const pool = mixColor(first.color, mixed, p)
  const blob = mixColor(second.color, mixed, p)

  const toSvg = (event) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }
  const polar = (pt) => {
    const nx = (pt.x - B.cx) / B.rx
    const ny = (pt.y - B.cy) / (B.ry * 2)
    return { a: Math.atan2(ny, nx), d: Math.hypot(nx, ny) }
  }
  const clamp = (pt) => {
    const nx = (pt.x - B.cx) / (B.rx * 0.85)
    const ny = (pt.y - B.cy) / (B.ry * 0.85)
    const d = Math.hypot(nx, ny)
    return d <= 1 ? pt : { x: B.cx + (nx / d) * B.rx * 0.85, y: B.cy + (ny / d) * B.ry * 0.85 }
  }
  const handleDown = (event) => {
    if (!interactive || (event.button !== undefined && event.button !== 0)) return
    const pt = toSvg(event)
    if (!pt) return
    event.preventDefault()
    svgRef.current.setPointerCapture?.(event.pointerId)
    drag.current = { prev: polar(pt).a, lastSign: 0 }
    setRod(clamp(pt))
  }
  const handleMove = (event) => {
    const d = drag.current
    if (!d) return
    const pt = toSvg(event)
    if (!pt) return
    setRod(clamp(pt))
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
    setRod(null)
  }
  const handleKey = (event) => {
    if (!interactive) return
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault()
      onStir?.(Math.PI / 5, Math.PI / 5)
    }
  }

  return (
    <svg
      ref={svgRef}
      className={`jelly-svg ${interactive ? 'is-interactive' : ''} ${rod ? 'is-stirring' : ''}`}
      viewBox="0 0 320 260"
      role={interactive ? 'application' : 'img'}
      aria-label={
        interactive
          ? `Mixing bowl with ${first.name} and ${second.name}. Stir in circles to mix. ${Math.round(p * 100)} percent mixed.`
          : `Mixing bowl with ${first.name} jelly base`
      }
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onLostPointerCapture={handleUp}
      onKeyDown={handleKey}
    >
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#E7DCFF" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="0.75" stopColor="#F1EAFF" stopOpacity="0.6" />
          <stop offset="1" stopColor="#CFC0F2" stopOpacity="0.9" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <ellipse cx={B.cx} cy={B.cy} rx={B.rx} ry={B.ry} />
        </clipPath>
        <clipPath id={`${uid}-body`}>
          <path d="M42,126 C46,186 100,222 160,222 C220,222 274,186 278,126Z" />
        </clipPath>
      </defs>

      {/* 연구소 작업대 매트 */}
      <ellipse cx="160" cy="232" rx="150" ry="20" fill="#E4D9FB" />
      <ellipse cx="160" cy="232" rx="140" ry="16" fill="none" stroke="#fff" strokeWidth="1.6" strokeDasharray="4 5" />
      <ellipse cx="164" cy="226" rx="90" ry="9" fill="#5a3a6a" opacity="0.14" />

      {/* 유리 볼: 옆에서 보이는 젤리액 */}
      <g clipPath={`url(#${uid}-body)`}>
        <rect x="40" y={B.cy} width="240" height="100" fill={pool} opacity="0.8" />
        <rect x="40" y={B.cy + 40} width="240" height="60" fill={mixColor(pool, '#4a2f45', 0.12)} opacity="0.5" />
      </g>
      <path d="M42,126 C46,186 100,222 160,222 C220,222 274,186 278,126Z" fill={`url(#${uid}-glass)`} stroke="#C7B6EC" strokeWidth="2.5" />
      {/* 눈금 */}
      <g stroke="#B9A6E6" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <line x1="240" y1="150" x2="254" y2="150" />
        <line x1="236" y1="166" x2="246" y2="166" />
        <line x1="230" y1="182" x2="244" y2="182" />
      </g>
      <path d="M60,148 C70,184 100,206 128,212" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.6" />

      {/* 입구 + 윗면 */}
      <ellipse cx="160" cy="124" rx="120" ry="32" fill="none" stroke="#D9CCF6" strokeWidth="5" />
      <ellipse cx={B.cx} cy={B.cy} rx={B.rx} ry={B.ry} fill={pool} />
      <g clipPath={`url(#${uid}-clip)`}>
        <ellipse cx={B.cx - 34} cy={B.cy - 9} rx="36" ry="5" fill="#fff" opacity="0.35" />
        {/* 두 번째 맛 덩어리: 저을수록 소용돌이치며 섞여요 */}
        {BLOBS.map((c, i) => {
          const r0 = Math.hypot(c.x, c.y)
          const a0 = Math.atan2(c.y, c.x)
          const a = a0 + swirl * (0.6 + 0.4 * (1 - r0))
          const r = r0 * (1 - 0.5 * p)
          const op = Math.max(0, 1 - p * 1.2)
          if (op <= 0.01) return null
          return (
            <ellipse
              key={i}
              cx={B.cx + Math.cos(a) * r * B.rx}
              cy={B.cy + Math.sin(a) * r * B.ry}
              rx={c.s * (1 + p * 1.2)}
              ry={c.s * 0.55 * (1 + p * 1.2)}
              fill={blob}
              opacity={op}
            />
          )
        })}
        {p > 0 && p < 1 && (
          <g
            transform={`rotate(${(swirl * 0.5 * 180) / Math.PI} ${B.cx} ${B.cy}) translate(${B.cx} ${B.cy}) scale(1 ${B.ry / B.rx}) translate(${-B.cx} ${-B.cy})`}
            opacity={0.6 * (1 - p)}
          >
            <circle cx={B.cx} cy={B.cy} r={B.rx * 0.6} fill="none" stroke={blob} strokeWidth="6" strokeDasharray="56 40" strokeLinecap="round" />
            <circle cx={B.cx} cy={B.cy} r={B.rx * 0.32} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="28 24" strokeLinecap="round" opacity="0.7" />
          </g>
        )}
        {p >= 1 && (
          <g className="mix-sparkle">
            <ellipse cx={B.cx + 24} cy={B.cy - 7} rx="24" ry="4" fill="#fff" opacity="0.4" />
          </g>
        )}
      </g>

      {interactive && p === 0 && !rod && (
        <ellipse className="jelly-dash" cx={B.cx} cy={B.cy} rx="66" ry="15" fill="none" stroke="#B48AE0" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" />
      )}
      {(interactive || p > 0) && <StirRod at={rod} />}
    </svg>
  )
}

/** 연구소 유리 막대 (끝에 별 장식) */
function StirRod({ at }) {
  const x = at ? at.x : 246
  const y = at ? at.y : 118
  const tilt = at ? -24 + ((x - 160) / 100) * 16 : -18
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`} pointerEvents="none">
      <ellipse cx="3" cy="5" rx="9" ry="3.5" fill="#5a2e14" opacity="0.15" />
      <rect x="-3.2" y="-96" width="6.4" height="98" rx="3.2" fill="#E9E1FF" stroke="#BBA8EA" strokeWidth="1.4" />
      <rect x="-1.8" y="-92" width="1.8" height="88" rx="0.9" fill="#fff" opacity="0.9" />
      <path d="M0,-112 l3.5,7 7.5,1 -5.5,5 1.4,7.6 -6.9,-3.7 -6.9,3.7 1.4,-7.6 -5.5,-5 7.5,-1z" fill="#FFD666" stroke="#E8B03F" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  )
}

export default JellyMixBowl
