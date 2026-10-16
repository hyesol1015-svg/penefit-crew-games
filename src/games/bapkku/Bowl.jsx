import { memo, useEffect, useId, useRef, useState } from 'react'
import { FOOD_AREA, MEATS, TOPPERS } from './bapkkuData.js'
import { MeatDefs, MeatShape } from './MeatArt.jsx'

/* ─────────────────────────────────────────────
 * 사료 알갱이(키블) 재료
 * 매번 무작위로 만들면 화면이 바뀔 때마다 모양이 달라지므로,
 * '씨앗값(seed)'이 고정된 난수로 한 번만 만들어 둡니다.
 *
 * 위치는 '단위 원' 안의 좌표(u, v)로 저장해 두고,
 * 사료 양(fill)에 따라 실제 그릇 안 좌표로 바꿔서 그립니다.
 * ───────────────────────────────────────────── */
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// 키블 색 4가지: [밝은색, 기본색, 어두운색] — 그라데이션으로 동글동글 입체감
const KIBBLE_TONES = [
  ['#F2C28C', '#D49A62', '#A16A36'],
  ['#E8B27A', '#C4854E', '#8D5A2C'],
  ['#F8D3A0', '#E2AE74', '#B27C45'],
  ['#DDA46C', '#B87A45', '#7F5128'],
]

const rand = seededRandom(20261015)
const KIBBLE_COUNT = 190
const KIBBLES = Array.from({ length: KIBBLE_COUNT }, () => {
  const angle = rand() * Math.PI * 2
  const dist = Math.sqrt(rand())
  const big = rand() > 0.35
  return {
    u: Math.cos(angle) * dist, // -1 ~ 1 (좌우)
    v: Math.sin(angle) * dist, // -1 ~ 1 (앞뒤)
    rank: rand(), // 사료가 적을 때는 rank가 낮은 알갱이만 보여요
    rx: big ? 5.4 + rand() * 1.8 : 4 + rand() * 1.4,
    ry: big ? 4 + rand() * 1.2 : 3.2 + rand(),
    rot: Math.round(rand() * 180),
    tone: Math.floor(rand() * KIBBLE_TONES.length),
    hole: rand() > 0.86, // 가운데가 살짝 파인 도넛형 키블
  }
})

// 스쿱에서 쏟아지는 알갱이 (떨어지는 연출용)
const DROPS = Array.from({ length: 16 }, () => ({
  dx: rand() * 2 - 1,
  dy: rand() * 2 - 1,
  delay: Math.round(rand() * 220),
  tone: Math.floor(rand() * KIBBLE_TONES.length),
  rot: Math.round(rand() * 180),
}))

/**
 * 사료 양(f: 0~1)에 따른 사료 윗면 모양
 *  - 적을 때: 그릇 깊은 곳에 작고 평평하게
 *  - 가득일 때: 그릇 입구까지 차오르고 가운데가 소복하게 솟음
 */
function foodSurface(fill) {
  const f = Math.min(Math.max(fill, 0), 1) // 혹시 범위를 벗어나도 0~1로 고정
  const rx = 74 + 42 * f // 사료 윗면의 가로 반지름
  return {
    rx,
    ry: rx * 0.276, // 그릇 입구와 같은 비율(위에서 비스듬히 본 시점)
    cy: 114 - 22 * f, // 윗면 중심 높이 (작을수록 위)
    dome: 36 * Math.pow(f, 1.4), // 가운데가 솟은 높이
  }
}

// 사료 더미 외곽선 (위로 볼록한 곡선 + 그릇 입구를 따라가는 아래 곡선)
function moundPath({ rx, ry, cy, dome }) {
  const x0 = 160 - rx
  const x1 = 160 + rx
  const top = cy - Math.max(dome, ry * 0.9)
  return [
    `M${x0},${cy}`,
    `C${x0 + 0.12 * rx},${cy - (cy - top) * 0.67} ${160 - 0.45 * rx},${top} 160,${top}`,
    `C${160 + 0.45 * rx},${top} ${x1 - 0.12 * rx},${cy - (cy - top) * 0.67} ${x1},${cy}`,
    `A${rx},${ry} 0 0 1 ${x0},${cy}`,
    'Z',
  ].join(' ')
}

// 단위 원 좌표(u, v) → 현재 사료 윗면 위의 실제 좌표
function placeOnSurface(u, v, s) {
  const lift = s.dome * Math.max(0, 1 - u * u - v * v)
  return { x: 160 + u * (s.rx - 4), y: s.cy + v * s.ry * 0.95 - lift }
}

/**
 * KibblePile — 사료 알갱이 더미 (190개 × 3겹)
 * 파우더를 뿌릴 때마다 다시 그리면 느려지므로 memo로 감싸서
 * 사료 양(shownFill)이 바뀔 때만 다시 그립니다.
 */
const KibblePile = memo(function KibblePile({ shownFill, uid }) {
  const surface = foodSurface(shownFill)
  const kibbles = KIBBLES.filter((k) => k.rank < 0.35 + 0.65 * shownFill)
    .map((k) => ({ ...k, ...placeOnSurface(k.u, k.v, surface) }))
    .sort((a, b) => a.y - b.y) // 뒤쪽(위)부터 그려야 앞쪽 알갱이가 위에 겹쳐 보여요
  return (
    <>
      {kibbles.map((k, i) => (
        <g key={i} transform={`rotate(${k.rot} ${k.x} ${k.y})`}>
          {/* 알갱이 그림자 → 알갱이 → 하이라이트 순서로 겹쳐 입체감 */}
          <ellipse cx={k.x + 1} cy={k.y + 1.8} rx={k.rx} ry={k.ry} fill="#4a2a10" opacity="0.26" />
          <ellipse cx={k.x} cy={k.y} rx={k.rx} ry={k.ry} fill={`url(#${uid}-kib${k.tone})`} />
          {k.hole ? (
            <ellipse cx={k.x} cy={k.y} rx={k.rx * 0.32} ry={k.ry * 0.32} fill="#6b411f" opacity="0.7" />
          ) : (
            <ellipse
              cx={k.x - k.rx * 0.32}
              cy={k.y - k.ry * 0.38}
              rx={k.rx * 0.38}
              ry={k.ry * 0.28}
              fill="#FFFFFF"
              opacity="0.38"
            />
          )}
        </g>
      ))}
      {/* 앞쪽 그릇 테두리 아래로 드리운 그늘 */}
      <path
        d={`M${160 - surface.rx},${surface.cy} A${surface.rx},${surface.ry} 0 0 0 ${160 + surface.rx},${surface.cy}`}
        fill="none"
        stroke="#2e1606"
        strokeOpacity="0.22"
        strokeWidth="10"
      />
      {/* 사료 윗면 하이라이트 */}
      <ellipse
        cx="146"
        cy={surface.cy - surface.dome * 0.6 - 4}
        rx={surface.rx * 0.53}
        ry="9"
        fill="#FFF3DC"
        opacity="0.14"
      />
    </>
  )
})

/**
 * 파우더 알갱이 하나 (고운 가루·굵은 알갱이는 동그라미, 조각은 납작한 타원)
 */
function Grain({ p, className, style }) {
  return p.rx === p.ry ? (
    <circle className={className} cx={p.x} cy={p.y} r={p.r} fill={p.color} style={style} />
  ) : (
    <ellipse
      className={className}
      cx={p.x}
      cy={p.y}
      rx={p.rx}
      ry={p.ry}
      fill={p.color}
      transform={`rotate(${p.rot} ${p.x} ${p.y})`}
      style={style}
    />
  )
}

/**
 * LandedBurst — 사료 위에 내려앉은 파우더 한 줌
 * 떨어지는 시간이 끝날 즈음 살며시 나타나서 '쌓인' 것처럼 보여요.
 * 한 번 그린 묶음은 다시 그리지 않도록 memo 사용 (입자가 많아도 끊기지 않게)
 */
const LandedBurst = memo(function LandedBurst({ burst, animate, uid }) {
  return (
    <g>
      {/* 가루가 소복이 덮인 느낌을 주는 옅은 색 막 (가운데 진하고 가장자리 투명) */}
      <ellipse
        className={animate ? 'powder' : undefined}
        cx={burst.landing.x}
        cy={burst.landing.y}
        rx={burst.film.rx}
        ry={burst.film.ry}
        fill={`url(#${uid}-dust-${burst.topperId})`}
        style={{ '--o': 0.55, opacity: 0.55, animationDelay: animate ? `${burst.particles[0]?.dur || 300}ms` : undefined }}
      />
      {burst.particles.map((p) => (
        <Grain
          key={p.id}
          p={p}
          className={animate ? 'powder' : undefined}
          style={{
            opacity: p.opacity,
            '--o': p.opacity,
            animationDelay: animate ? `${p.delay + p.dur * 0.82}ms` : undefined,
          }}
        />
      ))}
    </g>
  )
})

/**
 * FallingBurst — 파우더 통 입구에서 사료 위로 떨어지는 가루
 * 각 알갱이가 '입구 위치(dx, dy)'에서 출발해 제자리로 떨어진 뒤 사라지고,
 * 그 자리에 LandedBurst의 알갱이가 나타나요. 떨어진 곳엔 옅은 가루 구름이 퍼져요.
 */
const FallingBurst = memo(function FallingBurst({ burst }) {
  return (
    <g className="falling" aria-hidden="true">
      {burst.particles.map((p) => (
        <Grain
          key={p.id}
          p={p}
          className="fall"
          style={{
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '--o': p.opacity,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.dur}ms`,
          }}
        />
      ))}
      <ellipse
        className="haze"
        cx={burst.landing.x}
        cy={burst.landing.y}
        rx="14"
        ry="6"
        fill={burst.color}
        style={{ animationDelay: `${burst.particles[0]?.dur * 0.7 || 200}ms` }}
      />
    </g>
  )
})

/**
 * MeatLayer — 파우더 위에 올린 고기 토핑들
 *  - 뒤쪽(위)에 있는 조각부터 그려서 앞쪽 조각이 자연스럽게 겹쳐 보여요.
 *  - 그림자를 먼저 깔아서 사료·파우더 위에 '올라앉은' 느낌을 줘요.
 *  - onPiecePress 가 있으면 조각을 눌러 고르고 끌어서 옮길 수 있어요.
 */
function MeatLayer({ meats, uid, selectedId, liftedId, animate, onPiecePress }) {
  const sorted = [...meats].sort((a, b) => a.y - b.y)
  // 가장 최근에 올린 조각만 '톡' 떨어지는 연출 (id는 올릴 때마다 커져요)
  const newestId = meats.reduce((max, m) => Math.max(max, m.id), -1)
  return (
    <g className="meats">
      {sorted.map((m) => {
        const meat = MEATS.find((t) => t.id === m.meatId)
        if (!meat) return null
        const lifted = liftedId === m.id
        return (
          <g key={m.id} transform={`translate(${m.x} ${m.y})`}>
            {/* 바닥 그림자 (조각을 들면 옅고 넓어져요) */}
            <ellipse
              cx="1.5"
              cy={8 * m.scale}
              rx={14 * m.scale * (lifted ? 1.1 : 1)}
              ry={3.6 * m.scale}
              fill="#3a1d0a"
              opacity={lifted ? 0.18 : 0.34}
              filter={`url(#${uid}-meatShadow)`}
            />
            {selectedId === m.id && (
              <ellipse
                className="meat-ring"
                cx="0"
                cy="1"
                rx={19 * m.scale}
                ry={14 * m.scale}
                fill="#FFFFFF"
                fillOpacity="0.18"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeDasharray="4 3"
              />
            )}
            <g transform={`rotate(${m.rot}) scale(${m.flip ? -m.scale : m.scale} ${m.scale})`}>
              <g
                className={`meat-piece ${animate && m.id === newestId && !lifted ? 'meat-piece--drop' : ''} ${lifted ? 'is-lifted' : ''} ${onPiecePress ? 'is-movable' : ''}`}
                onPointerDown={onPiecePress ? (event) => onPiecePress(event, m) : undefined}
              >
                {/* 누르기 쉽도록 보이지 않는 넉넉한 영역 */}
                {onPiecePress && <ellipse cx="0" cy="1" rx="17" ry="13" fill="transparent" />}
                <MeatShape meat={meat} prefix={`${uid}-meat`} />
              </g>
            </g>
          </g>
        )
      })}
    </g>
  )
}

// 그릇 몸통의 물방울 무늬 위치
const BODY_DOTS = [
  [86, 132], [124, 146], [160, 150], [196, 146], [234, 132],
  [104, 168], [142, 178], [178, 178], [216, 168],
]

/**
 * 누른 지점이 '그릇 영역'인지 판정 (SVG 좌표 기준)
 * 테두리 타원보다 조금 넉넉한 범위 또는 테두리 아래 몸통 영역
 */
function isInsideBowl(x, y) {
  const nx = (x - 160) / (132 * 1.15)
  const ny = (y - 92) / (40 * 1.6)
  const onRim = nx * nx + ny * ny <= 1
  const onBody = y >= 92 && y <= 212 && Math.abs(x - 160) <= 136
  return onRim || onBody
}

/**
 * Bowl — 사료 그릇 (SVG)
 *
 * props
 *   bowl        : BOWLS 중 하나 (색상 정보)
 *   fill        : 사료 양 0(빈 그릇) ~ 1(가득). 바뀌면 부드럽게 차오름
 *   pourId      : 값이 바뀔 때마다 스쿱에서 사료가 쏟아지는 연출
 *   bursts      : 뿌려진 파우더 묶음들 (bapkkuData.js 의 createPowderBurst 결과)
 *   onSprinkle  : (x, y) => void  — 그릇을 누르거나 문지른 SVG 좌표를 알려 줌
 *   interactive : false면 완성 화면처럼 보기 전용
 *   rub         : false면 누른 채 문질러도 한 번만 알려요 (토핑 단계)
 *   meats       : 올린 고기 토핑들 (bapkkuData.js 의 createMeatPiece 결과)
 *   selectedMeat: 지금 고른 토핑 조각 id (점선 테두리 표시)
 *   onMeatSelect: (조각 id) => void — 조각을 눌렀을 때
 *   onMeatMove  : (조각 id, x, y) => void — 조각을 끌어 옮길 때 (SVG 좌표)
 *   label       : 화면 읽기 프로그램용 설명
 *
 * 클릭(터치)은 바깥 <svg>가 직접 받아 좌표로 '그릇 영역인지' 판정합니다.
 * 마우스와 터치를 모두 지원하기 위해 Pointer Events를 사용합니다.
 */
function Bowl({
  bowl,
  fill = 1,
  pourId = null,
  bursts = [],
  onSprinkle,
  interactive = true,
  rub = true,
  meats = [],
  selectedMeat = null,
  onMeatSelect,
  onMeatMove,
  label,
}) {
  const svgRef = useRef(null)
  const meatDrag = useRef(null) // 끌고 있는 토핑 조각 정보
  const [liftedId, setLiftedId] = useState(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef(null)
  // 한 화면에 그릇이 2개 있어도 SVG 안의 id가 겹치지 않도록 고유 접두어 사용
  const uid = `b${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const ref = (name) => `url(#${uid}-${name})`

  /* ── 사료가 부드럽게 차오르는 애니메이션 ──
     fill 값이 바뀌면 0.5초 동안 화면 속 사료 양(shownFill)을 조금씩 따라가게 합니다. */
  const [shownFill, setShownFill] = useState(fill)
  const shownRef = useRef(fill)
  useEffect(() => {
    const from = shownRef.current
    if (from === fill) return
    const start = performance.now()
    let frame
    const tick = (now) => {
      // 첫 프레임의 시각이 시작 시각보다 살짝 이를 수 있어 0~1 범위로 고정
      const t = Math.min(Math.max((now - start) / 500, 0), 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = from + (fill - from) * eased
      shownRef.current = value
      setShownFill(value)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [fill])

  const surface = foodSurface(shownFill)
  const hasFood = shownFill > 0.01
  // 떨어지는 연출은 최근 묶음 몇 개만 그려요 (이미 다 떨어진 건 필요 없음)
  const fallingBursts = interactive ? bursts.slice(-14) : []

  // 떨어지는 알갱이가 내려앉을 위치 (목표 사료 양 기준)
  const landing = foodSurface(Math.max(fill, 0.25))

  // 화면(px) 좌표 → SVG viewBox 좌표로 변환
  const toSvgPoint = (event) => {
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (!matrix) return null
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    return { x: p.x, y: p.y }
  }

  // 그릇을 눌렀을 때: 바로 한 번 알리고 '문지르기' 모드 시작
  const handlePointerDown = (event) => {
    if (!interactive || !onSprinkle) return
    const point = toSvgPoint(event)
    // 그릇 바깥의 빈 공간을 누른 경우는 무시
    if (!point || !isInsideBowl(point.x, point.y)) return
    event.preventDefault()
    isDrawing.current = true
    svgRef.current?.setPointerCapture?.(event.pointerId)
    lastPoint.current = point
    onSprinkle(point.x, point.y)
  }

  // 토핑 조각을 누르면: 고르고, 끌기 시작 (그릇을 누른 것으로 치지 않아요)
  const handlePiecePress = (event, piece) => {
    event.stopPropagation()
    event.preventDefault()
    const point = toSvgPoint(event)
    if (!point) return
    svgRef.current?.setPointerCapture?.(event.pointerId)
    meatDrag.current = { id: piece.id, offX: point.x - piece.x, offY: point.y - piece.y }
    setLiftedId(piece.id)
    onMeatSelect?.(piece.id)
  }

  // 누른 채로 움직이면 일정 거리마다 한 번씩 알리기
  const handlePointerMove = (event) => {
    if (meatDrag.current) {
      const point = toSvgPoint(event)
      const d = meatDrag.current
      if (point) onMeatMove?.(d.id, point.x - d.offX, point.y - d.offY)
      return
    }
    if (!isDrawing.current || !rub) return
    const point = toSvgPoint(event)
    if (!point) return
    const last = lastPoint.current
    if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 16) {
      lastPoint.current = point
      onSprinkle?.(point.x, point.y)
    }
  }

  const stopDrawing = () => {
    if (meatDrag.current) {
      meatDrag.current = null
      setLiftedId(null)
    }
    isDrawing.current = false
    lastPoint.current = null
  }

  // 키보드 사용자: Enter/스페이스로 사료 위 무작위 위치에 알리기
  const handleKeyDown = (event) => {
    if (!interactive || !onSprinkle) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const angle = Math.random() * Math.PI * 2
      const d = Math.random() * 0.8
      onSprinkle(
        FOOD_AREA.cx + Math.cos(angle) * d * FOOD_AREA.rx,
        FOOD_AREA.cy + Math.sin(angle) * d * FOOD_AREA.ry,
      )
    }
  }

  const canPress = interactive && Boolean(onSprinkle)

  return (
    <svg
      ref={svgRef}
      className={`bowl-svg ${interactive ? 'is-interactive' : 'is-static'} ${canPress ? 'can-press' : ''}`}
      viewBox="0 0 320 240"
      preserveAspectRatio="xMidYMax meet"
      role={canPress ? 'button' : 'img'}
      tabIndex={canPress ? 0 : -1}
      aria-label={label ?? `${bowl.name} food bowl`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
      onLostPointerCapture={stopDrawing}
      onKeyDown={handleKeyDown}
    >
      {/* ── 그라데이션·잘라내기 정의 ── */}
      <defs>
        {/* 몸통: 양옆은 어둡고 왼쪽 가운데가 밝게 → 둥근 도자기 느낌 */}
        <linearGradient id={`${uid}-body`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={bowl.bodyShade} />
          <stop offset="0.3" stopColor={bowl.bodyLight} />
          <stop offset="0.62" stopColor={bowl.body} />
          <stop offset="1" stopColor={bowl.bodyShade} />
        </linearGradient>
        {/* 몸통 아래쪽 그늘 */}
        <linearGradient id={`${uid}-bodyShadow`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.45" stopColor="#5a3218" stopOpacity="0" />
          <stop offset="1" stopColor="#5a3218" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={bowl.rim} />
          <stop offset="1" stopColor={bowl.rimShade} />
        </linearGradient>
        {/* 그릇 안쪽 벽: 깊을수록 어둡게 */}
        <linearGradient id={`${uid}-inner`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={bowl.innerShade} />
          <stop offset="0.75" stopColor={bowl.inner} />
        </linearGradient>
        {/* 빈 그릇 바닥 */}
        <radialGradient id={`${uid}-floor`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={bowl.inner} />
          <stop offset="1" stopColor={bowl.innerShade} />
        </radialGradient>
        {/* 사료 더미: 위쪽 가운데가 밝고 가장자리가 어둡게 */}
        <radialGradient id={`${uid}-food`} cx="0.45" cy="0.25" r="0.85">
          <stop offset="0" stopColor="#D49A62" />
          <stop offset="0.55" stopColor="#B07642" />
          <stop offset="1" stopColor="#7E4F27" />
        </radialGradient>
        {KIBBLE_TONES.map(([light, base, dark], i) => (
          <radialGradient key={i} id={`${uid}-kib${i}`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor={light} />
            <stop offset="0.55" stopColor={base} />
            <stop offset="1" stopColor={dark} />
          </radialGradient>
        ))}
        {/* 파우더별 '가루 막' 색 (가운데 진하고 가장자리로 갈수록 투명) */}
        {TOPPERS.map((t) => (
          <radialGradient key={t.id} id={`${uid}-dust-${t.id}`}>
            <stop offset="0" stopColor={t.colors[0]} stopOpacity="0.85" />
            <stop offset="0.6" stopColor={t.colors[1]} stopOpacity="0.4" />
            <stop offset="1" stopColor={t.colors[1]} stopOpacity="0" />
          </radialGradient>
        ))}
        {/* 바닥 그림자를 부드럽게 퍼뜨리는 흐림 효과 */}
        <filter id={`${uid}-blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        {/* 조리대 위 체크무늬 매트 */}
        <pattern id={`${uid}-mat`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="16" fill="#FFD9C6" />
          <rect width="8" height="16" fill="#FFC9B0" opacity="0.7" />
          <rect width="16" height="8" fill="#FFC9B0" opacity="0.7" />
        </pattern>
        {/* 고기 토핑 그림·그림자 */}
        <MeatDefs prefix={`${uid}-meat`} />
        <filter id={`${uid}-meatShadow`} x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
        {/* 그릇 안쪽(입구 타원 + 입구 위 공간)으로 잘라서 사료가 그릇 밖으로 안 나가게 */}
        <clipPath id={`${uid}-inside`}>
          <ellipse cx="160" cy="92" rx="116" ry="32" />
          <rect x="44" y="0" width="232" height="92" />
        </clipPath>
        {/* 사료 더미 모양으로 잘라서 키블·파우더가 더미 밖으로 안 나가게 */}
        <clipPath id={`${uid}-mound`}>
          <path d={moundPath(surface)} />
        </clipPath>
      </defs>

      {/* 체크무늬 매트 (게임 화면에서만) */}
      {interactive && (
        <g aria-hidden="true">
          <ellipse cx="160" cy="210" rx="158" ry="28" fill="#E9A684" opacity="0.5" />
          <ellipse cx="160" cy="206" rx="156" ry="27" fill={ref('mat')} />
          <ellipse cx="160" cy="206" rx="146" ry="22" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="5 5" />
        </g>
      )}

      {/* 바닥 그림자 */}
      <ellipse cx="160" cy="212" rx="126" ry="14" fill="#6e4628" opacity="0.3" filter={ref('blur')} />

      <g className="bowl-art">
        {/* 그릇 받침 */}
        <ellipse cx="160" cy="203" rx="76" ry="12" fill={bowl.bodyShade} />

        {/* 그릇 몸통 + 아래 그늘 */}
        <path d="M28,92 C32,165 84,206 160,206 C236,206 288,165 292,92 Z" fill={ref('body')} />
        <path d="M28,92 C32,165 84,206 160,206 C236,206 288,165 292,92 Z" fill={ref('bodyShadow')} />

        {/* 몸통 물방울 무늬 */}
        {BODY_DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill={bowl.dot} opacity="0.8" />
        ))}

        {/* 몸통 왼쪽 반사광 */}
        <path
          d="M48,114 C56,150 78,176 106,190"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.55"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="62" cy="108" r="3.5" fill="#FFFFFF" opacity="0.7" />

        {/* 그릇 테두리(윗면) */}
        <ellipse cx="160" cy="92" rx="132" ry="40" fill={ref('rim')} />
        <ellipse cx="160" cy="92" rx="125" ry="36" fill="none" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.5" />

        {/* 그릇 안쪽 */}
        <ellipse cx="160" cy="92" rx="116" ry="32" fill={ref('inner')} />

        <g clipPath={ref('inside')}>
          {/* 빈 그릇 바닥 (사료가 차면 가려져요) */}
          <ellipse cx="160" cy="118" rx="74" ry="20" fill={ref('floor')} />
          <ellipse cx="146" cy="113" rx="34" ry="6" fill="#FFFFFF" opacity="0.18" />

          {/* 사료 더미 */}
          {hasFood && (
            <g className="food">
              <path d={moundPath(surface)} fill={ref('food')} />
              <g clipPath={ref('mound')}>
                <KibblePile shownFill={shownFill} uid={uid} />

                {/* 사료 위에 쌓인 파우더 */}
                {bursts.map((b) => (
                  <LandedBurst key={b.id} burst={b} animate={interactive} uid={uid} />
                ))}
              </g>
              {/* 파우더 위에 올린 고기 토핑 (사료 더미보다 살짝 솟아도 보이도록 더미 잘라내기 밖에) */}
              {meats.length > 0 && (
                <MeatLayer
                  meats={meats}
                  uid={uid}
                  selectedId={interactive ? selectedMeat : null}
                  liftedId={liftedId}
                  animate={interactive}
                  onPiecePress={interactive && onMeatMove ? handlePiecePress : undefined}
                />
              )}
            </g>
          )}
        </g>

        {/* 스쿱에서 쏟아지는 사료 알갱이 */}
        {pourId !== null && (
          <g key={pourId} className="drops" aria-hidden="true">
            {DROPS.map((d, i) => {
              const x = 160 + d.dx * landing.rx * 0.45
              const y = landing.cy - landing.dome * 0.7 + d.dy * landing.ry * 0.4
              return (
                <g key={i} className="drop" style={{ animationDelay: `${d.delay}ms` }}>
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="5.6"
                    ry="4.2"
                    fill={ref(`kib${d.tone}`)}
                    transform={`rotate(${d.rot} ${x} ${y})`}
                  />
                </g>
              )
            })}
          </g>
        )}

        {/* 파우더 통에서 떨어지는 가루 */}
        {fallingBursts.map((b) => (
          <FallingBurst key={b.id} burst={b} />
        ))}

        {/* 테두리 반짝임 */}
        <path
          d="M62,70 C94,56 130,52 160,52"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.85"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M196,128 C226,124 252,114 270,104"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export default Bowl
