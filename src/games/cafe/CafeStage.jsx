import { useEffect, useRef, useState } from 'react'
import { Cup, CafeTable } from './CupArt.jsx'
import { CUP, FOAM, foamTop } from './cafeData.js'

/**
 * CafeStage — 카페 테이블 위의 컵 (컵 고르기 · 거품 · 꾸미기 단계)
 *
 *   mode 'show'     : 컵만 보여 줘요 (컵 고르기)
 *   mode 'foam'     : 펫 전용 거품기를 누른 채 컵 위에서 움직이면 거품이 쌓여요.
 *                     빙글빙글 돌리면 거품 위에 소용돌이 무늬가 생겨요.
 *   mode 'decorate' : 거품 윗면을 누르면 고른 장식이 올라가요.
 *
 * props
 *   cup, drink, level, foam, swirl, decorations, palette, newestId
 *   onFoam(amount, swirlDelta) : 거품이 늘어난 양 (0~1 기준), 돌린 각도
 *   onDecorate(x, y)          : 컵 기준 좌표
 *   onMiss()                  : 거품이 아닌 곳을 눌렀을 때
 */
const CUP_X = 160
const CUP_Y = 238
const CUP_SCALE = 1.05

function CafeStage({ mode = 'show', cup, drink, level, foam, swirl, decorations, palette, newestId, onFoam, onDecorate, onMiss }) {
  const svgRef = useRef(null)
  const cupRef = useRef(null)
  const drag = useRef(null)
  const [whisk, setWhisk] = useState(null) // 거품기 위치 (SVG 좌표)
  const [whipping, setWhipping] = useState(false) // 컵 위에서 거품을 내는 중
  const onFoamRef = useRef(onFoam)
  useEffect(() => {
    onFoamRef.current = onFoam
  })

  const toSvg = (event) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }
  const toCup = (event) => {
    const m = cupRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }
  // 거품기 끝(거품 내는 부분)이 컵 입구 위쪽에 있는지 (컵 기준 좌표)
  const isOverCup = (p) => p && Math.abs(p.x) < CUP.TOP + 14 && p.y > -CUP.H - 90 && p.y < -CUP.H + 34

  /* ── 거품: 누르고 있는 동안 조금씩 + 움직인 만큼 더 ── */
  useEffect(() => {
    if (mode !== 'foam' || !whipping) return undefined
    let raf = 0
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      onFoamRef.current?.(FOAM.HOLD_RATE * dt, 0)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, whipping])

  const handleDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    if (mode === 'foam') {
      const pt = toSvg(event)
      const local = toCup(event)
      if (!pt || !local) return
      event.preventDefault()
      svgRef.current.setPointerCapture?.(event.pointerId)
      const ft = foamTop(0.5)
      drag.current = { last: local, angle: Math.atan2((local.y - ft.cy) * 2.2, local.x) }
      setWhisk(pt)
      setWhipping(isOverCup(local))
      if (isOverCup(local)) onFoam?.(0.02, 0) // 톡 누르기만 해도 조금
    } else if (mode === 'decorate') {
      const local = toCup(event)
      if (!local) return
      event.preventDefault()
      const ft = foamTop(foam)
      const nx = (local.x - ft.cx) / ft.rx
      const ny = (local.y - ft.cy) / ft.ry
      const d = Math.hypot(nx, ny)
      if (d > 1.25) {
        onMiss?.()
        return
      }
      const k = d > 0.78 ? 0.78 / d : 1 // 장식이 거품 가장자리 밖으로 나가지 않게
      onDecorate?.(ft.cx + nx * k * ft.rx, ft.cy + ny * k * ft.ry)
    }
  }

  const handleMove = (event) => {
    if (mode !== 'foam') return
    const pt = toSvg(event)
    if (pt && (drag.current || event.pointerType === 'mouse')) setWhisk(pt)
    const d = drag.current
    if (!d) return
    const local = toCup(event)
    if (!local) return
    const over = isOverCup(local)
    setWhipping(over)
    const dist = Math.hypot(local.x - d.last.x, local.y - d.last.y)
    const ft = foamTop(0.5)
    const angle = Math.atan2((local.y - ft.cy) * 2.2, local.x) // 위에서 비스듬히 본 타원 → 원으로
    let da = angle - d.angle
    if (da > Math.PI) da -= Math.PI * 2
    if (da < -Math.PI) da += Math.PI * 2
    d.last = local
    d.angle = angle
    if (over && dist > 0) onFoam?.(Math.min(dist, 40) * FOAM.MOVE_RATE, Math.abs(da) < 1.2 ? da : 0)
  }

  const handleUp = () => {
    drag.current = null
    setWhipping(false)
  }

  const handleKey = (event) => {
    if (mode === 'foam' && ['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      onFoam?.(0.1, Math.PI / 4)
    } else if (mode === 'decorate' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      const ft = foamTop(foam)
      const n = decorations.length
      const a = n * 2.39996
      const r = n === 0 ? 0 : Math.min(0.75, 0.25 + n * 0.08)
      onDecorate?.(ft.cx + Math.cos(a) * r * ft.rx, ft.cy + Math.sin(a) * r * ft.ry)
    }
  }

  const interactive = mode === 'foam' || mode === 'decorate'
  const ft = foamTop(foam)

  return (
    <svg
      ref={svgRef}
      className={`cafe-svg is-${mode} ${whipping ? 'is-whipping' : ''}`}
      viewBox="0 0 320 260"
      role={interactive ? 'application' : 'img'}
      aria-label={
        mode === 'foam'
          ? `Cup on a café table. Hold and move the whisk over the cup to add foam. ${Math.round(foam * 100)} percent.`
          : mode === 'decorate'
            ? `Puppuccino with foam. Tap the foam to add a decoration. ${decorations.length} decorations.`
            : `${cup.name} cup on a café table`
      }
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={interactive ? handleDown : undefined}
      onPointerMove={interactive ? handleMove : undefined}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onLostPointerCapture={handleUp}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && !drag.current) setWhisk(null)
      }}
      onKeyDown={handleKey}
    >
      <CafeTable />
      <g ref={cupRef} transform={`translate(${CUP_X} ${CUP_Y}) scale(${CUP_SCALE})`}>
        <g key={cup.id} className="cup-pop">
          <Cup cup={cup} drink={drink} level={level} foam={foam} swirl={swirl} decorations={decorations} palette={palette} newestId={newestId} />
        </g>
        {/* 꾸미기: 거품 윗면이 눌러지는 곳이라는 표시 */}
        {mode === 'decorate' && decorations.length === 0 && (
          <ellipse className="foam-target" cx={ft.cx} cy={ft.cy} rx={ft.rx * 0.82} ry={ft.ry * 0.82} fill="none" stroke="#F09AAA" strokeWidth="2" strokeDasharray="5 5" />
        )}
        {/* 거품: 처음에 '빙글빙글' 안내 */}
        {mode === 'foam' && foam === 0 && !whipping && (
          <ellipse className="foam-target" cx="0" cy={-CUP.H - 16} rx={CUP.TOP - 8} ry="14" fill="none" stroke="#E98F6C" strokeWidth="2.6" strokeDasharray="8 7" strokeLinecap="round" />
        )}
      </g>

      {mode === 'foam' && <Whisk at={whisk} resting={!drag.current} active={whipping} />}
    </svg>
  )
}

/** 펫 전용 거품기 (발바닥 손잡이) — 끝(거품 내는 부분)이 (x, y)에 와요 */
function Whisk({ at, resting, active }) {
  const x = at && !resting ? at.x : at ? at.x : 268
  const y = at && !resting ? at.y : at ? at.y : 150
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <g className={`whisk ${active ? 'is-active' : ''} ${resting && !at ? 'is-resting' : ''}`}>
        <ellipse cx="3" cy="6" rx="14" ry="4" fill="#5a2e14" opacity="0.15" />
        {/* 철사 고리 */}
        <g fill="none" stroke="#C9D3DA" strokeWidth="2.2">
          <path d="M-3,-34 C-20,-24 -16,6 0,6 C16,6 20,-24 3,-34" />
          <path d="M-2,-34 C-11,-22 -9,4 0,4 C9,4 11,-22 2,-34" />
          <path d="M0,-34 L0,5" />
        </g>
        <g fill="none" stroke="#FFFFFF" strokeWidth="0.9" opacity="0.8">
          <path d="M-3,-32 C-17,-22 -14,2 -2,4" />
        </g>
        {/* 손잡이 */}
        <rect x="-5" y="-82" width="10" height="50" rx="5" fill="#F7B9C4" />
        <rect x="-3.4" y="-80" width="3" height="44" rx="1.5" fill="#FFE1E7" />
        <rect x="-6" y="-38" width="12" height="7" rx="3" fill="#E592A3" />
        {/* 발바닥 손잡이 끝 */}
        <g transform="translate(0 -88)">
          <ellipse cx="0" cy="2" rx="7" ry="6" fill="#FFFFFF" stroke="#E592A3" strokeWidth="1.6" />
          {[-6, -2, 2, 6].map((dx, i) => (
            <circle key={dx} cx={dx} cy={i === 0 || i === 3 ? -4 : -7} r="2.4" fill="#FFFFFF" stroke="#E592A3" strokeWidth="1.3" />
          ))}
          <ellipse cx="0" cy="2.5" rx="3.6" ry="2.8" fill="#F7B9C4" />
        </g>
      </g>
    </g>
  )
}

export default CafeStage
