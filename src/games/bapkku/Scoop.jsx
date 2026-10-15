import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react'
import { ASSETS, assetUrl } from '../../gameAssets.js'

/**
 * Scoop — 사료 스쿱 (드래그 · 터치 · 키보드로 사료 붓기)
 *
 * 조작 방법
 *   - 스쿱을 끌어서 그릇 위에 놓기 → 스쿱이 기울며 사료를 부어요
 *   - 스쿱을 톡 누르기          → 스쿱이 알아서 그릇으로 날아가 부어요
 *   - 키보드 Enter / 스페이스    → 톡 누르기와 같아요
 *
 * props
 *   disabled      : true면 조작 불가 (그릇이 가득 찼을 때 등)
 *   isOverBowl    : (x, y) => boolean — 화면 좌표가 그릇 위인지 부모가 알려 줌
 *   getPourPoint  : () => {x, y} — 스쿱 입구가 가야 할 화면 좌표 (그릇 위)
 *   onPour        : () => boolean — 붓기 시작을 부모에게 알림 (false면 취소)
 *   ref           : 부모가 ref.current.pour() 로 붓기를 시킬 수 있어요
 *                   (그릇을 누르거나 패널의 '한 스쿱 담기' 버튼을 눌렀을 때)
 *
 * 실제 스쿱 이미지가 생기면 gameAssets.js 의 tools.scoop 에 넣으면 교체됩니다.
 */

// 스쿱 그림에서 '컵(사료가 담긴 곳)' 중심의 위치 (상자 크기 대비 비율)
const CUP = { x: 0.32, y: 0.56 }

function Scoop({ disabled = false, isOverBowl, getPourPoint, onPour, ref }) {
  const homeRef = useRef(null) // 움직이지 않는 자리(기준점)
  const drag = useRef(null) // 드래그 중인 정보
  const timers = useRef([])
  const [pos, setPos] = useState({ x: 0, y: 0 }) // 제자리에서 얼마나 움직였는지(px)
  const [mode, setMode] = useState('idle') // idle | drag | pour
  const [empty, setEmpty] = useState(false) // 부은 직후에는 스쿱이 비어 보여요
  const uid = `s${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const scoopImage = assetUrl(ASSETS.tools?.scoop)

  // 화면을 떠날 때 남은 타이머 정리
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  // 제자리일 때 컵 중심의 화면 좌표
  const homeCup = () => {
    const r = homeRef.current.getBoundingClientRect()
    return { x: r.left + r.width * CUP.x, y: r.top + r.height * CUP.y }
  }

  /** 그릇 위로 날아가서 붓고 → 제자리로 돌아오기 */
  const pour = () => {
    if (disabled || mode === 'pour') return false
    if (!onPour?.()) return false
    const target = getPourPoint?.()
    const home = homeCup()
    setPos(target ? { x: target.x - home.x, y: target.y - home.y } : { x: 0, y: 0 })
    setMode('pour')
    later(() => setEmpty(true), 320)
    later(() => {
      setMode('idle')
      setPos({ x: 0, y: 0 })
    }, 880)
    later(() => setEmpty(false), 1250)
    return true
  }

  useImperativeHandle(ref, () => ({ pour }))

  /* ── 드래그 ── */
  const handlePointerDown = (event) => {
    if (disabled || mode === 'pour') return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drag.current = { startX: event.clientX, startY: event.clientY, moved: false }
    setMode('drag')
  }

  const handlePointerMove = (event) => {
    const d = drag.current
    if (!d) return
    const dx = event.clientX - d.startX
    const dy = event.clientY - d.startY
    if (Math.hypot(dx, dy) > 6) d.moved = true
    setPos({ x: dx, y: dy })
  }

  const handlePointerUp = (event) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    const home = homeCup()
    const cup = { x: home.x + (event.clientX - d.startX), y: home.y + (event.clientY - d.startY) }
    // 거의 안 움직였으면 '톡 누르기', 그릇 위에 놓았으면 '붓기', 아니면 제자리로
    if (!d.moved || isOverBowl?.(cup.x, cup.y)) {
      setMode('idle')
      if (!pour()) setPos({ x: 0, y: 0 })
    } else {
      setMode('idle')
      setPos({ x: 0, y: 0 })
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pour()
    }
  }

  const rotate = mode === 'pour' ? -58 : mode === 'drag' ? -12 : 0
  const loaded = !disabled && !empty

  return (
    // 손가락·마우스 이벤트는 '움직이지 않는 자리(scoop-home)'에서 받아요.
    // 스쿱이 날아갔다 돌아오는 도중에 눌러도 놓치지 않도록 하기 위해서예요.
    // (스쿱을 누르면 이벤트가 부모인 scoop-home 으로 전달됩니다)
    <div
      className={`scoop-home ${disabled ? 'is-disabled' : ''}`}
      ref={homeRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={`scoop scoop--${mode} ${disabled ? 'is-disabled' : ''}`}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotate}deg)`,
          transformOrigin: `${CUP.x * 100}% ${CUP.y * 100}%`,
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Food scoop. Drag it to the bowl or tap to add food."
        onKeyDown={handleKeyDown}
      >
        {scoopImage ? (
          <img className="scoop__img" src={scoopImage} alt="" draggable="false" />
        ) : (
          <svg className="scoop__svg" viewBox="0 0 140 100" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-body`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#F2C25E" />
                <stop offset="0.35" stopColor="#FFE9B0" />
                <stop offset="1" stopColor="#E9B14A" />
              </linearGradient>
              <linearGradient id={`${uid}-handle`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#FFE7A6" />
                <stop offset="1" stopColor="#E7AE48" />
              </linearGradient>
              <radialGradient id={`${uid}-kib`} cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#F2C28C" />
                <stop offset="0.55" stopColor="#C4854E" />
                <stop offset="1" stopColor="#8D5A2C" />
              </radialGradient>
            </defs>
            {/* 손잡이 */}
            <rect x="70" y="40" width="64" height="13" rx="6.5" fill={`url(#${uid}-handle)`} transform="rotate(-14 70 46)" />
            <circle cx="124" cy="34.5" r="3" fill="#C98F2E" opacity="0.5" />
            {/* 컵 몸통 */}
            <path d="M8,44 C10,74 26,92 45,92 C64,92 80,74 82,44 Z" fill={`url(#${uid}-body)`} />
            <path d="M18,56 C21,72 30,82 40,85" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" />
            {/* 컵 입구 */}
            <ellipse cx="45" cy="44" rx="37" ry="10" fill="#E3A845" />
            <ellipse cx="45" cy="44" rx="33" ry="8" fill="#B9822E" />
            {/* 담긴 사료 */}
            {loaded && (
              <g>
                <path d="M13,44 C18,30 32,24 45,24 C58,24 72,30 77,44 A32,8 0 0 1 13,44 Z" fill="#9C6436" />
                {[
                  [26, 38, 5.5, 20], [38, 32, 6, 60], [52, 31, 5.8, 130], [64, 38, 5.4, 10],
                  [32, 43, 5.6, 90], [46, 40, 6.2, 150], [58, 44, 5.4, 40], [44, 27, 5, 110],
                ].map(([x, y, r, rot], i) => (
                  <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
                    <ellipse cx={x + 0.8} cy={y + 1.4} rx={r} ry={r * 0.72} fill="#4a2a10" opacity="0.25" />
                    <ellipse cx={x} cy={y} rx={r} ry={r * 0.72} fill={`url(#${uid}-kib)`} />
                  </g>
                ))}
              </g>
            )}
          </svg>
        )}
      </div>
    </div>
  )
}

export default Scoop
