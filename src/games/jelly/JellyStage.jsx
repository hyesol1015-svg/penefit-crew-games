import { useEffect, useRef, useState } from 'react'
import { JellyPlate, JellyShape, MoldTray } from './JellyArt.jsx'
import { MOLDS, PLATE_SPOTS, POUR_SECONDS_PER_SLOT, SET_SECONDS_PER_SLOT, SET_TAP, SLOTS, SLOT_SCALE } from './jellyData.js'

/**
 * JellyStage — 실리콘 몰드 트레이 무대 (몰드 고르기 · 붓기 · 굳히기 · 꺼내기)
 *
 *   mode 'mold' : 고른 모양의 빈 몰드 + 젤리 미리보기
 *   mode 'pour' : 젤리액이 담긴 비커를 끌어 몰드 칸 위에 두면 기울어지며 부어져요.
 *                 몰드 밖에서는 붓지 않아요. 칸마다 액체가 차올라요.
 *   mode 'set'  : 차가운 '칠 지팡이'를 젤리 위에 대고 있거나 톡톡 누르면 굳어요.
 *                 굳을수록 반투명하고 탱글해져요. (가만히 기다리기만 해서는 굳지 않아요)
 *   mode 'pop'  : 젤리를 톡 누르거나 위로 끌면 말랑하게 눌렸다가 통 튀어나와 접시에 놓여요.
 */
const BEAKER_REST = { x: 28, y: 64 } // 주둥이가 몰드 밖에 있도록 왼쪽 위에서 기다려요
const SPOUT = { x: 37, y: 4 } // 기울였을 때 비커 주둥이 위치 (비커 기준)
const WAND_REST = { x: 286, y: 70 }
const POP_DY = -66 // 꺼내기 단계에서 트레이를 위로 올려요
const PLATE = { x: 160, y: 226 }

function JellyStage({ mode, moldId, colors, fills, sets, popped, plateItems, newlySet, onPour, onSet, onPop, onMiss }) {
  const svgRef = useRef(null)
  const drag = useRef(null)
  const [pos, setPos] = useState(mode === 'set' ? WAND_REST : BEAKER_REST)
  const [held, setHeld] = useState(false)
  const [pressing, setPressing] = useState(-1)
  const cbs = useRef({ onPour, onSet })
  useEffect(() => {
    cbs.current = { onPour, onSet }
  })

  const toSvg = (event) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }

  /* ── 붓기: 비커 주둥이 바로 아래에 있는 (아직 덜 찬) 칸 ── */
  const spout = { x: pos.x + SPOUT.x, y: pos.y + SPOUT.y }
  let pourTarget = -1
  if (mode === 'pour' && held) {
    let best = Infinity
    SLOTS.forEach((s, i) => {
      if ((fills[i] ?? 0) >= 1) return
      const gap = s.y - 16 - spout.y
      if (Math.abs(s.x - spout.x) < 20 && gap > 0 && gap < 130 && gap < best) {
        best = gap
        pourTarget = i
      }
    })
  }

  /* ── 굳히기: 지팡이 끝 아래 칸 ── */
  let chillTarget = -1
  if (mode === 'set' && held) {
    SLOTS.forEach((s, i) => {
      if (Math.hypot(s.x - pos.x, s.y - pos.y) < 28 && (sets[i] ?? 0) < 1) chillTarget = i
    })
  }

  // 누르고 있는 동안 계속 붓기 / 굳히기 (화면 속도와 상관없이 시간 기준)
  const active = mode === 'pour' ? pourTarget : mode === 'set' ? chillTarget : -1
  useEffect(() => {
    if (active < 0) return undefined
    let raf = 0
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (mode === 'pour') cbs.current.onPour?.(active, dt / POUR_SECONDS_PER_SLOT)
      else cbs.current.onSet?.(active, dt / SET_SECONDS_PER_SLOT)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, mode])

  const slotAt = (pt, dy = 0) => SLOTS.findIndex((s) => Math.hypot(s.x - pt.x, s.y + dy - pt.y) < 26)

  const handleDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    const pt = toSvg(event)
    if (!pt) return
    event.preventDefault()
    svgRef.current.setPointerCapture?.(event.pointerId)
    if (mode === 'pour') {
      const near = Math.hypot(pt.x - pos.x, pt.y - pos.y) < 46
      drag.current = { ox: near ? pt.x - pos.x : 0, oy: near ? pt.y - pos.y : 0 }
      setHeld(true)
      setPos(clampPos({ x: pt.x - drag.current.ox, y: pt.y - drag.current.oy }))
    } else if (mode === 'set') {
      drag.current = { ox: 0, oy: 0 }
      setHeld(true)
      setPos(pt)
      const i = slotAt(pt)
      if (i >= 0 && (sets[i] ?? 0) < 1) onSet?.(i, SET_TAP) // 톡 누르기
    } else if (mode === 'pop') {
      const i = slotAt(pt, POP_DY)
      if (i < 0 || popped[i]) {
        onMiss?.()
        return
      }
      drag.current = { slot: i, sy: pt.y }
      setPressing(i)
    }
  }

  const clampPos = (p) => ({ x: Math.min(292, Math.max(24, p.x)), y: Math.min(200, Math.max(30, p.y)) })

  const handleMove = (event) => {
    const d = drag.current
    if (!d) return
    const pt = toSvg(event)
    if (!pt) return
    if (mode === 'pour') setPos(clampPos({ x: pt.x - d.ox, y: pt.y - d.oy }))
    else if (mode === 'set') setPos(pt)
    else if (mode === 'pop' && d.sy - pt.y > 16) {
      // 위로 끌어올리면 바로 쏙!
      drag.current = null
      setPressing(-1)
      popSlot(d.slot)
    }
  }

  const popSlot = (i) => {
    const n = plateItems.length
    const spot = PLATE_SPOTS[n] ?? PLATE_SPOTS[PLATE_SPOTS.length - 1]
    const s = SLOTS[i]
    // 몰드 칸에서 접시 자리까지 날아오는 거리 (접시 젤리 크기 기준)
    const from = { x: (s.x - (PLATE.x + spot.x)) / 0.9, y: (s.y + POP_DY - (PLATE.y + spot.y - 6)) / 0.9 }
    onPop?.(i, from)
  }

  const handleUp = () => {
    const d = drag.current
    drag.current = null
    setHeld(false)
    if (mode === 'pour') setPos(BEAKER_REST)
    if (mode === 'set') setPos(WAND_REST)
    if (mode === 'pop' && d && d.slot !== undefined) {
      setPressing(-1)
      popSlot(d.slot) // 톡 눌렀다 떼기
    }
  }

  // 키보드 (접근성): Enter/스페이스로 다음 칸 붓기·굳히기·꺼내기
  const handleKey = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    if (mode === 'pour') {
      const i = fills.findIndex((f) => (f ?? 0) < 1)
      if (i >= 0) onPour?.(i, 0.5)
    } else if (mode === 'set') {
      const i = sets.findIndex((v) => (v ?? 0) < 1)
      if (i >= 0) onSet?.(i, 0.5)
    } else if (mode === 'pop') {
      const i = SLOTS.findIndex((_, k) => !popped[k])
      if (i >= 0) popSlot(i)
    }
  }

  const mold = MOLDS.find((m) => m.id === moldId) ?? MOLDS[0]
  const left = 1 - fills.reduce((a, f) => a + Math.min(f ?? 0, 1), 0) / SLOTS.length
  const label = {
    mold: `${mold.name} silicone mold with 6 cavities`,
    pour: 'Jelly mold tray. Drag the beaker over a mold to pour.',
    set: 'Jelly tray. Hold the chill wand over each jelly to set it.',
    pop: 'Jelly tray and plate. Tap or drag up a gummy to pop it out.',
  }[mode]

  return (
    <svg
      ref={svgRef}
      className={`jelly-svg is-${mode} ${held ? 'is-held' : ''}`}
      viewBox="0 0 320 260"
      role={mode === 'mold' ? 'img' : 'application'}
      aria-label={label}
      tabIndex={mode === 'mold' ? undefined : 0}
      onPointerDown={mode === 'mold' ? undefined : handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onLostPointerCapture={handleUp}
      onKeyDown={handleKey}
    >
      {/* 연구소 작업대 매트 */}
      <ellipse cx="160" cy="238" rx="154" ry="20" fill="#E4D9FB" />
      <ellipse cx="160" cy="238" rx="144" ry="15" fill="none" stroke="#fff" strokeWidth="1.6" strokeDasharray="4 5" />

      {mode === 'pop' && (
        <g transform={`translate(${PLATE.x} ${PLATE.y})`}>
          <JellyPlate moldId={moldId} colors={colors} items={plateItems} />
        </g>
      )}

      <g key={`tray-${moldId}`} className={mode === 'mold' ? 'tray-pop' : ''}>
        <MoldTray
          moldId={moldId}
          colors={colors}
          fills={mode === 'mold' ? [] : fills}
          sets={mode === 'pour' || mode === 'mold' ? [] : sets}
          popped={mode === 'pop' ? popped : []}
          pressing={pressing}
          glow={active}
          dy={mode === 'pop' ? POP_DY : 0}
          newlySet={mode === 'set' ? newlySet : []}
        />
      </g>

      {/* 몰드 고르기: 위에 둥실 떠 있는 젤리 미리보기 */}
      {mode === 'mold' && (
        <g key={`preview-${moldId}`} transform="translate(160 64) scale(2)">
          <g className="mold-preview">
            <ellipse cx="0" cy="24" rx="16" ry="3" fill="#5a3a6a" opacity="0.12" />
            <g className="jelly-wobble">
              <JellyShape moldId={moldId} colors={colors} fill={1} set={1} />
            </g>
          </g>
        </g>
      )}

      {/* 붓기: 흘러내리는 젤리액 + 비커 */}
      {mode === 'pour' && (
        <>
          {pourTarget >= 0 && (
            <g className="jelly-stream" pointerEvents="none">
              <path
                d={`M${spout.x},${spout.y} C${spout.x + 3},${spout.y + 10} ${SLOTS[pourTarget].x - 2},${spout.y + 14} ${SLOTS[pourTarget].x},${SLOTS[pourTarget].y + 18 * SLOT_SCALE - 38 * SLOT_SCALE * Math.min(fills[pourTarget] ?? 0, 1)}`}
                fill="none"
                stroke={colors.base}
                strokeWidth="5.5"
                strokeLinecap="round"
                opacity="0.92"
              />
              <path
                d={`M${spout.x},${spout.y} C${spout.x + 3},${spout.y + 10} ${SLOTS[pourTarget].x - 2},${spout.y + 14} ${SLOTS[pourTarget].x},${SLOTS[pourTarget].y}`}
                fill="none"
                stroke="#fff"
                strokeWidth="1.4"
                strokeDasharray="5 9"
                strokeLinecap="round"
                className="jelly-stream__shine"
              />
            </g>
          )}
          {held && pourTarget < 0 && fills.some((f) => (f ?? 0) < 1) && (
            <text x={spout.x} y={spout.y - 18} textAnchor="middle" className="jelly-hint-text">
              Move over a mold
            </text>
          )}
          <Beaker pos={pos} tilted={pourTarget >= 0} held={held} colors={colors} left={left} />
          {!held && fills.every((f) => !f) && (
            <path className="jelly-dash" d="M70,92 C110,80 140,96 154,126" fill="none" stroke="#B48AE0" strokeWidth="3" strokeDasharray="8 7" strokeLinecap="round" />
          )}
        </>
      )}

      {/* 굳히기: 칠 지팡이 + 눈꽃 */}
      {mode === 'set' && <ChillWand pos={pos} active={chillTarget >= 0} />}
    </svg>
  )
}

/** 실험실 비커 (젤리액이 담긴 붓는 도구) */
function Beaker({ pos, tilted, held, colors, left }) {
  const h = 44 * Math.max(0.12, left)
  return (
    <g className={`beaker-move ${held ? 'is-held' : ''}`} style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      <ellipse cx="2" cy={tilted ? 38 : 32} rx="22" ry="4.5" fill="#5a3a6a" opacity={held ? 0.1 : 0.18} />
      <g className="beaker-tilt" style={{ transform: `rotate(${tilted ? 55 : 0}deg)` }}>
        <clipPath id="jelly-beaker-clip">
          <path d="M-19,-26 L19,-26 L19,22 Q19,28 13,28 L-13,28 Q-19,28 -19,22Z" />
        </clipPath>
        <path d="M-19,-26 L19,-26 L19,22 Q19,28 13,28 L-13,28 Q-19,28 -19,22Z" fill="#FFFFFF" opacity="0.55" />
        <g clipPath="url(#jelly-beaker-clip)">
          <rect x="-22" y={28 - h} width="44" height={h + 2} fill={colors.base} opacity="0.9" />
          <rect x="-22" y={28 - h} width="44" height="3" fill={colors.light} />
        </g>
        <path d="M-19,-26 L19,-26 L19,22 Q19,28 13,28 L-13,28 Q-19,28 -19,22Z" fill="none" stroke="#B9A6E6" strokeWidth="2.2" />
        {/* 주둥이 + 테두리 */}
        <path d="M15,-26 L27,-31 L19,-21Z" fill="#F3EEFF" stroke="#B9A6E6" strokeWidth="1.8" strokeLinejoin="round" />
        <rect x="-21" y="-29" width="42" height="5" rx="2.5" fill="#F3EEFF" stroke="#B9A6E6" strokeWidth="1.6" />
        {/* 눈금 + 반짝임 */}
        <g stroke="#B9A6E6" strokeWidth="1.6" strokeLinecap="round">
          <line x1="8" y1="-12" x2="15" y2="-12" />
          <line x1="10" y1="0" x2="15" y2="0" />
          <line x1="8" y1="12" x2="15" y2="12" />
        </g>
        <path d="M-12,-18 L-12,18" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
        <path d="M-4,8 c-1.6,-2.4 -5.6,-1.6 -4.8,1.6 c0.8,2.4 4.8,4.8 4.8,4.8 c0,0 4,-2.4 4.8,-4.8 c0.8,-3.2 -3.2,-4 -4.8,-1.6z" fill="#F7B9C4" opacity="0.9" />
      </g>
    </g>
  )
}

const SNOW = 'M0,-5 L0,5 M-4.3,-2.5 L4.3,2.5 M-4.3,2.5 L4.3,-2.5'

/** 칠 지팡이 (끝에 눈꽃) — 끝(눈꽃)이 pos에 와요 */
function ChillWand({ pos, active }) {
  return (
    <g transform={`translate(${pos.x} ${pos.y})`} pointerEvents="none">
      <g className={`wand ${active ? 'is-active' : ''}`}>
        <rect x="2" y="-4" width="7" height="62" rx="3.5" fill="#BFE6F2" stroke="#8ECDE0" strokeWidth="1.4" transform="rotate(-28)" />
        <rect x="4" y="2" width="2" height="50" rx="1" fill="#fff" opacity="0.8" transform="rotate(-28)" />
        <circle r="11" fill="#E8F7FF" stroke="#8ECDE0" strokeWidth="1.6" />
        <path d={SNOW} stroke="#5FB3D3" strokeWidth="2" strokeLinecap="round" transform="scale(1.3)" />
        {active && (
          <g className="frost">
            {[
              [-16, 8],
              [14, 14],
              [-6, 20],
              [18, -4],
              [-18, -8],
            ].map(([x, y], i) => (
              <path key={i} d={SNOW} transform={`translate(${x} ${y}) scale(0.6)`} stroke="#8ECDE0" strokeWidth="1.6" strokeLinecap="round" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </g>
        )}
      </g>
    </g>
  )
}

export default JellyStage
