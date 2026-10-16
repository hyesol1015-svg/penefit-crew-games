import { useId, useRef, useState } from 'react'
import { mixColor } from './cookieData.js'
import { SPECKS } from './doughShape.js'

/**
 * MixStage — 커다란 믹싱볼 (맛 고르기 + 반죽 섞기 단계)
 *
 *  - 맛 고르기 단계: 밀가루 · 파우더 · 물이 따로 담긴 모습 (interactive = false)
 *  - 섞기 단계: 그릇 안에서 손가락/마우스를 '빙글빙글' 돌리면
 *      재료 조각들이 소용돌이치며 가운데로 모이고 → 색이 섞이고 → 하나의 반죽 덩어리가 돼요.
 *    ※ 톡톡 누르기만 해서는 진행되지 않아요. 같은 방향으로 원을 그려야 잘 섞여요.
 *
 * props
 *   flavor     : FLAVORS 중 하나
 *   progress   : 0~1 (섞인 정도)
 *   swirl      : 지금까지 돌린 각도 (소용돌이 그림용, 라디안)
 *   interactive: 섞기 단계에서만 true
 *   onStir(amount, signed) : 저은 양(라디안)을 알려 줘요
 */

// 그릇 안쪽 (재료가 담기는 타원)
const IN = { cx: 160, cy: 110, rx: 106, ry: 30 }

// 재료 조각들 (밀가루 · 파우더) — 매번 같은 배치
const CRUMBS = Array.from({ length: 34 }, (_, i) => {
  const powder = i % 5 === 1 || i % 5 === 3
  const base = powder ? { x: 0.36, y: -0.1 } : { x: -0.3, y: 0.02 }
  const a = i * 2.39996
  const r = Math.sqrt(((i * 37) % 34) / 34 + 0.03) * (powder ? 0.26 : 0.36)
  return {
    x: base.x + Math.cos(a) * r,
    y: base.y + Math.sin(a) * r * 1.6,
    size: 6.5 + ((i * 13) % 7) * 1.1,
    powder,
  }
})

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

function MixStage({ flavor, progress = 0, swirl = 0, interactive = false, onStir }) {
  const uid = `m${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const svgRef = useRef(null)
  const drag = useRef(null)
  const [spoon, setSpoon] = useState(null) // 젓고 있는 숟가락 위치 (SVG 좌표)
  const [active, setActive] = useState(false)

  const p = Math.min(Math.max(progress, 0), 1)

  const toSvg = (event) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }

  // 그릇 가운데를 기준으로 한 각도 (위에서 비스듬히 본 타원 → 원으로 바꿔서 계산)
  const polar = (pt) => {
    const nx = (pt.x - IN.cx) / IN.rx
    const ny = (pt.y - IN.cy) / (IN.ry * 1.9)
    return { a: Math.atan2(ny, nx), d: Math.hypot(nx, ny) }
  }

  const clampSpoon = (pt) => {
    const nx = (pt.x - IN.cx) / (IN.rx * 0.86)
    const ny = (pt.y - IN.cy) / (IN.ry * 0.86)
    const d = Math.hypot(nx, ny)
    if (d <= 1) return pt
    return { x: IN.cx + (nx / d) * IN.rx * 0.86, y: IN.cy + (ny / d) * IN.ry * 0.86 }
  }

  const handleDown = (event) => {
    if (!interactive) return
    if (event.button !== undefined && event.button !== 0) return
    const pt = toSvg(event)
    if (!pt) return
    event.preventDefault()
    svgRef.current.setPointerCapture?.(event.pointerId)
    const { a } = polar(pt)
    drag.current = { prev: a, lastSign: 0 }
    setSpoon(clampSpoon(pt))
    setActive(true)
  }

  const handleMove = (event) => {
    const d = drag.current
    if (!d) return
    const pt = toSvg(event)
    if (!pt) return
    setSpoon(clampSpoon(pt))
    const { a, d: dist } = polar(pt)
    // 그릇 가운데 바로 위(각도가 마구 튐)나 그릇에서 너무 멀리 벗어나면 세지 않아요
    if (dist < 0.14 || dist > 1.9) {
      d.prev = a
      return
    }
    let delta = a - d.prev
    if (delta > Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    d.prev = a
    if (Math.abs(delta) > 1.3) return // 순간이동 같은 큰 점프는 무시
    const sign = Math.sign(delta)
    // 같은 방향으로 계속 돌릴 때만 제대로 섞여요 (왔다 갔다 문지르기는 조금만)
    const amount = Math.abs(delta) * (sign === d.lastSign || d.lastSign === 0 ? 1 : 0.25)
    if (sign !== 0) d.lastSign = sign
    onStir?.(amount, delta)
  }

  const handleUp = () => {
    drag.current = null
    setActive(false)
    setSpoon(null)
  }

  // 키보드: 방향키로 조금씩 젓기
  const handleKey = (event) => {
    if (!interactive) return
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault()
      onStir?.(Math.PI / 5, Math.PI / 5)
    }
  }

  // 반죽 덩어리
  const ballShow = smooth(0.3, 0.9, p)
  const ballRx = 28 + 48 * p
  const ballRy = 12 + 13 * p
  const ballCy = IN.cy + 2 - 6 * p
  const doughMid = mixColor(flavor.flour, flavor.dough, 0.5)
  const spin = swirl * 0.45

  return (
    <svg
      ref={svgRef}
      className={`mix-svg ${interactive ? 'is-interactive' : ''} ${active ? 'is-stirring' : ''}`}
      viewBox="0 0 320 240"
      role={interactive ? 'application' : 'img'}
      aria-label={interactive ? `Mixing bowl. Stir in circles to mix. ${Math.round(p * 100)} percent mixed.` : `Mixing bowl with flour and ${flavor.name} powder`}
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
          <stop offset="0" stopColor="#F4C5BE" />
          <stop offset="0.3" stopColor="#FFE9E2" />
          <stop offset="0.65" stopColor="#FFDCD3" />
          <stop offset="1" stopColor="#EBADA5" />
        </linearGradient>
        <radialGradient id={`${uid}-inside`} cx="0.5" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#FFF6F0" />
          <stop offset="0.7" stopColor="#F9E2D8" />
          <stop offset="1" stopColor="#EDC7BA" />
        </radialGradient>
        <radialGradient id={`${uid}-ball`} cx="0.4" cy="0.3" r="0.75">
          <stop offset="0" stopColor={flavor.doughLight} />
          <stop offset="0.6" stopColor={flavor.dough} />
          <stop offset="1" stopColor={flavor.doughSide} />
        </radialGradient>
        <radialGradient id={`${uid}-flour`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFDF6" />
          <stop offset="1" stopColor={flavor.flour} />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <ellipse cx={IN.cx} cy={IN.cy} rx={IN.rx + 4} ry={IN.ry + 6} />
        </clipPath>
        <filter id={`${uid}-blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="164" cy="222" rx="112" ry="13" fill="#8a4b2a" opacity="0.22" filter={`url(#${uid}-blur)`} />

      {/* 그릇 몸통 + 땡땡이 무늬 */}
      <path d="M26,102 C30,176 92,218 160,218 C228,218 290,176 294,102Z" fill={`url(#${uid}-body)`} />
      <g fill="#FFFFFF" opacity="0.7">
        {[
          [70, 150],
          [110, 176],
          [160, 186],
          [210, 176],
          [250, 150],
          [92, 128],
          [140, 152],
          [182, 152],
          [228, 128],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
        ))}
      </g>
      <path d="M46,128 C60,170 96,196 130,206" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.45" />
      <path d="M40,104 C44,114 270,114 280,104" fill="none" stroke="#E9A79F" strokeWidth="3" opacity="0.4" />

      {/* 테두리 + 안쪽 */}
      <ellipse cx="160" cy="102" rx="134" ry="40" fill="#FFF8F4" stroke="#EDB7AE" strokeWidth="2.5" />
      <ellipse cx="160" cy="105" rx="121" ry="33" fill={`url(#${uid}-inside)`} />

      {/* ── 재료 (그릇 안쪽만 보이게) ── */}
      <g clipPath={`url(#${uid}-clip)`}>
        {/* 물 */}
        <ellipse cx="166" cy={IN.cy + 15} rx="26" ry="6" fill="#BFE6F2" opacity={Math.max(0, 0.75 - p * 2.2)} />
        <ellipse cx="160" cy={IN.cy + 14} rx="8" ry="1.6" fill="#fff" opacity={Math.max(0, 0.8 - p * 2.4)} />

        {/* 처음 담긴 재료 더미: 밀가루 산 + 파우더 산 (저을수록 흩어져요) */}
        <g opacity={1 - smooth(0, 0.5, p)}>
          <ellipse cx={IN.cx - 30} cy={IN.cy + 6} rx="44" ry="13" fill="#000" opacity="0.05" />
          <path d={`M${IN.cx - 74},${IN.cy + 6} C${IN.cx - 66},${IN.cy - 16} ${IN.cx - 46},${IN.cy - 24} ${IN.cx - 30},${IN.cy - 24} C${IN.cx - 12},${IN.cy - 24} ${IN.cx + 6},${IN.cy - 14} ${IN.cx + 12},${IN.cy + 6} C${IN.cx - 10},${IN.cy + 14} ${IN.cx - 52},${IN.cy + 14} ${IN.cx - 74},${IN.cy + 6}Z`} fill={`url(#${uid}-flour)`} />
          <path d={`M${IN.cx - 50},${IN.cy - 14} C${IN.cx - 42},${IN.cy - 21} ${IN.cx - 30},${IN.cy - 22} ${IN.cx - 22},${IN.cy - 19}`} stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d={`M${IN.cx + 8},${IN.cy + 3} C${IN.cx + 14},${IN.cy - 14} ${IN.cx + 28},${IN.cy - 19} ${IN.cx + 40},${IN.cy - 19} C${IN.cx + 54},${IN.cy - 19} ${IN.cx + 66},${IN.cy - 11} ${IN.cx + 70},${IN.cy + 3} C${IN.cx + 54},${IN.cy + 10} ${IN.cx + 24},${IN.cy + 10} ${IN.cx + 8},${IN.cy + 3}Z`} fill={flavor.color} />
          <path d={`M${IN.cx + 22},${IN.cy - 10} C${IN.cx + 28},${IN.cy - 16} ${IN.cx + 38},${IN.cy - 17} ${IN.cx + 46},${IN.cy - 15}`} stroke={mixColor(flavor.color, '#ffffff', 0.45)} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {SPECKS.slice(0, 14).map((s, i) => (
            <circle key={i} cx={IN.cx + 39 + s.x * 26} cy={IN.cy - 6 + s.y * 9} r={s.s * 0.8} fill={flavor.speck} opacity="0.5" />
          ))}
        </g>

        {/* 섞인 반죽 덩어리 */}
        <g opacity={ballShow}>
          <ellipse cx={IN.cx} cy={ballCy + ballRy * 0.55} rx={ballRx * 1.02} ry={ballRy * 0.75} fill={flavor.doughSide} />
          <ellipse cx={IN.cx} cy={ballCy} rx={ballRx} ry={ballRy} fill={`url(#${uid}-ball)`} />
          <g transform={`rotate(${(spin * 180) / Math.PI} ${IN.cx} ${ballCy})`}>
            {SPECKS.slice(0, 26).map((s, i) => (
              <circle key={i} cx={IN.cx + s.x * ballRx * 0.9} cy={ballCy + s.y * ballRy * 0.9} r={s.s * 0.9} fill={s.light ? flavor.doughLight : flavor.speck} opacity={0.6} />
            ))}
          </g>
          <ellipse cx={IN.cx - ballRx * 0.3} cy={ballCy - ballRy * 0.45} rx={ballRx * 0.3} ry={ballRy * 0.22} fill="#fff" opacity="0.4" />
        </g>

        {/* 따로 있던 재료 조각들: 저을수록 소용돌이치며 가운데로 모이고 색이 섞여요 */}
        {CRUMBS.map((c, i) => {
          const r0 = Math.hypot(c.x, c.y)
          const a0 = Math.atan2(c.y, c.x)
          const a = a0 + swirl * (0.55 + 0.45 * (1 - Math.min(r0, 1)))
          const r = r0 * (1 - 0.82 * p)
          const x = IN.cx + Math.cos(a) * r * IN.rx
          const y = IN.cy + Math.sin(a) * r * IN.ry
          const base = c.powder ? flavor.color : flavor.flour
          const color = mixColor(base, c.powder ? flavor.dough : doughMid, Math.min(1, p * 1.3))
          const size = c.size * (1 + p * 0.5)
          const op = 1 - smooth(0.7, 1, p)
          if (op <= 0.01) return null
          return (
            <g key={i} opacity={op}>
              <ellipse cx={x} cy={y + size * 0.3} rx={size} ry={size * 0.55} fill="#000" opacity="0.06" />
              <ellipse cx={x} cy={y} rx={size} ry={size * 0.62} fill={c.powder ? color : p < 0.05 ? `url(#${uid}-flour)` : color} />
              <ellipse cx={x - size * 0.3} cy={y - size * 0.22} rx={size * 0.35} ry={size * 0.18} fill="#fff" opacity="0.45" />
            </g>
          )
        })}

        {/* 저을 때 생기는 소용돌이 자국 */}
        {interactive && p < 1 && (
          <g opacity={active ? 0.5 : 0} transform={`rotate(${(spin * 180) / Math.PI} ${IN.cx} ${IN.cy})`} className="mix-swirl">
            <ellipse cx={IN.cx} cy={IN.cy} rx={IN.rx * 0.62} ry={IN.ry * 0.62} fill="none" stroke={flavor.doughLight} strokeWidth="2.4" strokeDasharray="38 26" strokeLinecap="round" />
            <ellipse cx={IN.cx} cy={IN.cy} rx={IN.rx * 0.36} ry={IN.ry * 0.36} fill="none" stroke={flavor.doughLight} strokeWidth="2" strokeDasharray="20 18" strokeLinecap="round" />
          </g>
        )}
      </g>

      {/* 안쪽 테두리 그림자 */}
      <ellipse cx="160" cy="104" rx="121" ry="33" fill="none" stroke="#E7B3A7" strokeWidth="3" opacity="0.5" />

      {/* '원을 그리며 저어요' 안내 화살표 (아직 안 저었을 때) */}
      {interactive && p === 0 && !active && (
        <g className="mix-hint" aria-hidden="true">
          <g className="mix-hint__spin">
            <ellipse cx={IN.cx} cy={IN.cy} rx="66" ry="20" fill="none" stroke="#E98F6C" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" />
            <path d="M226,108 l-9,-7 m9,7 l-11,4" stroke="#E98F6C" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        </g>
      )}

      {/* 나무 숟가락: 저을 때는 손가락을 따라오고, 쉴 때는 그릇에 기대 있어요 */}
      {(interactive || p > 0) && <WoodenSpoon at={spoon} resting={!spoon} />}
    </svg>
  )
}

function WoodenSpoon({ at, resting }) {
  const x = at ? at.x : 238
  const y = at ? at.y : 96
  const tilt = at ? -32 + ((x - 160) / 106) * 18 : -24
  return (
    <g className={`spoon ${resting ? 'spoon--rest' : 'spoon--stir'}`} transform={`translate(${x} ${y}) rotate(${tilt})`} pointerEvents="none">
      {/* 그림자 */}
      <ellipse cx="4" cy="6" rx="10" ry="4" fill="#5a2e14" opacity="0.18" />
      {/* 손잡이 */}
      <rect x="-3.2" y="-96" width="6.4" height="90" rx="3.2" fill="#D7A06A" />
      <rect x="-3.2" y="-96" width="2.6" height="90" rx="1.3" fill="#EBC08E" />
      <circle cx="0" cy="-90" r="1.6" fill="#B07A47" />
      {/* 숟가락 머리 */}
      <ellipse cx="0" cy="0" rx="10" ry="13" fill="#CF955E" />
      <ellipse cx="-1.5" cy="-1.5" rx="7" ry="9.5" fill="#E2B07A" />
      <ellipse cx="-3" cy="-4" rx="2.5" ry="3.6" fill="#F5D3A6" opacity="0.8" />
    </g>
  )
}

export default MixStage
