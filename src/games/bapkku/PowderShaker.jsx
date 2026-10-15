import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import PowderJar from './PowderJar.jsx'

/**
 * PowderShaker — 끌어서 뿌리는 파우더 통
 *
 * 조작 방법
 *   - 통을 누른 채로 그릇 위로 끌고 가면 통이 기울며 가루가 떨어져요.
 *   - 그릇 위에서 좌우로 흔들수록(많이 움직일수록) 가루가 더 많이 나와요.
 *   - 가만히 누르고만 있어도 조금씩 솔솔 떨어져요.
 *   - 손을 떼면 통은 그 자리에 그대로 있어요. (다시 잡아서 이어서 뿌리기)
 *   - 키보드: 방향키로 통 옮기기, Enter/스페이스로 한 번 뿌리기
 *
 * 가루가 실제로 떨어질지(그릇 위인지)는 부모(BapkkuStudio)가 판단합니다.
 *
 * props
 *   topper        : 지금 고른 파우더 (TOPPERS 중 하나)
 *   onPour        : (입구X, 입구Y, 세기) => boolean — 화면 좌표, 뿌렸으면 true
 *   onStrokeStart : 한 번의 뿌리기 동작이 시작될 때 (되돌리기 단위)
 *   onStrokeEnd   : (뿌렸는지 여부) => void
 *   ref           : 부모가 ref.current.shake() 로 통을 흔들 수 있어요
 */

// 통 그림에서 '가루 나오는 구멍'의 위치: 가운데에서 위쪽으로 높이의 41.8%
const SPOUT = 0.418
const TILT = -38 // 뿌릴 때 기울어지는 각도(도)
const TICK_MS = 70 // 가루가 나오는 간격

function PowderShaker({ topper, onPour, onStrokeStart, onStrokeEnd, ref }) {
  const homeRef = useRef(null) // 처음 놓인 자리(기준점)
  const drag = useRef(null)
  const timer = useRef(null)
  const pourRef = useRef(onPour) // 항상 최신 함수를 쓰도록 보관
  const [pos, setPos] = useState({ x: 0, y: 0 }) // 처음 자리에서 얼마나 옮겼는지(px)
  const [tilt, setTilt] = useState(0)
  const [pouring, setPouring] = useState(false) // 지금 가루가 떨어지는 중인지
  const [shakeKey, setShakeKey] = useState(0)

  useEffect(() => {
    pourRef.current = onPour
  })
  // 화면을 떠날 때 타이머 정리
  useEffect(() => () => clearInterval(timer.current), [])

  /** 지금 통 입구(가루 나오는 곳)의 화면 좌표 */
  const spoutPoint = (p = pos, angle = tilt) => {
    const r = homeRef.current.getBoundingClientRect()
    const cx = r.left + r.width / 2 + p.x
    const cy = r.top + r.height / 2 + p.y
    const d = r.height * SPOUT
    const rad = (angle * Math.PI) / 180
    return { x: cx + d * Math.sin(rad), y: cy - d * Math.cos(rad) }
  }

  /** 통이 무대 밖으로 나가 잘리지 않도록 옮길 수 있는 범위 */
  const bounds = () => {
    const home = homeRef.current.getBoundingClientRect()
    const scene = homeRef.current.closest('.shell__scene')?.getBoundingClientRect() ?? home
    return {
      minX: scene.left - home.left,
      maxX: scene.right - home.right,
      minY: scene.top - home.top,
      maxY: scene.bottom - home.bottom,
    }
  }

  /** 한 번 뿌리기 (세기 amount) */
  const pourOnce = (amount, p, angle) => {
    const s = spoutPoint(p, angle)
    const ok = pourRef.current?.(s.x, s.y, amount) ?? false
    setPouring(ok)
    return ok
  }

  /* ── 드래그 ── */
  const handlePointerDown = (event) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const b = bounds()
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: pos.x,
      baseY: pos.y,
      lastX: event.clientX,
      lastT: performance.now(),
      dist: 0,
      vx: 0,
      poured: false,
      pos,
      b,
    }
    setTilt(TILT)
    onStrokeStart?.()
    // 누르자마자 한 번, 그 뒤로는 일정 간격마다 가루가 나와요
    drag.current.poured = pourOnce(3, pos, TILT)
    clearInterval(timer.current)
    timer.current = setInterval(() => {
      const d = drag.current
      if (!d) return
      // 움직인 거리만큼 세기가 커져요 (가만히 있으면 솔솔, 흔들면 듬뿍)
      const amount = 0.8 + Math.min(d.dist * 0.07, 8)
      d.dist = 0
      if (pourOnce(amount, d.pos, d.angle ?? TILT)) d.poured = true
    }, TICK_MS)
  }

  const handlePointerMove = (event) => {
    const d = drag.current
    if (!d) return
    const now = performance.now()
    const raw = { x: d.baseX + event.clientX - d.startX, y: d.baseY + event.clientY - d.startY }
    const next = {
      x: Math.min(Math.max(raw.x, d.b.minX), d.b.maxX),
      y: Math.min(Math.max(raw.y, d.b.minY), d.b.maxY),
    }
    d.dist += Math.hypot(next.x - d.pos.x, next.y - d.pos.y)
    // 좌우로 움직이는 속도에 따라 통이 살짝 더/덜 기울어요
    const vx = (event.clientX - d.lastX) / Math.max(now - d.lastT, 8)
    d.vx = d.vx * 0.7 + vx * 0.3
    d.lastX = event.clientX
    d.lastT = now
    d.angle = TILT + Math.max(-14, Math.min(14, d.vx * 18))
    d.pos = next
    setPos(next)
    setTilt(d.angle)
  }

  const handlePointerUp = () => {
    const d = drag.current
    if (!d) return
    clearInterval(timer.current)
    drag.current = null
    setTilt(0)
    setPouring(false)
    onStrokeEnd?.(d.poured)
  }

  /* ── 키보드 ── */
  const handleKeyDown = (event) => {
    const step = 18
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (moves[event.key]) {
      event.preventDefault()
      const b = bounds()
      const [mx, my] = moves[event.key]
      setPos((p) => ({
        x: Math.min(Math.max(p.x + mx, b.minX), b.maxX),
        y: Math.min(Math.max(p.y + my, b.minY), b.maxY),
      }))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      shake()
    }
  }

  /** 제자리에서 한 번 기울여 뿌리기 (키보드·버튼용) */
  const shake = () => {
    onStrokeStart?.()
    setTilt(TILT)
    setShakeKey((k) => k + 1)
    const ok = pourOnce(5, pos, TILT)
    setTimeout(() => {
      setTilt(0)
      setPouring(false)
      onStrokeEnd?.(ok)
    }, 320)
  }

  useImperativeHandle(ref, () => ({ shake }))

  return (
    <div
      className="shaker-home"
      ref={homeRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={`shaker ${tilt ? 'is-tilted' : ''} ${pouring ? 'is-pouring' : ''}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) rotate(${tilt}deg)` }}
        role="button"
        tabIndex={0}
        aria-label={`${topper.name} powder shaker. Drag it over the bowl and shake to sprinkle. Use the arrow keys to move it and Enter to sprinkle.`}
        onKeyDown={handleKeyDown}
      >
        <div key={shakeKey} className={`shaker__art ${shakeKey ? 'is-shake' : ''}`}>
          <PowderJar topper={topper} />
        </div>
      </div>
    </div>
  )
}

export default PowderShaker
