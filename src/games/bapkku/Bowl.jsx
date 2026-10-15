import { useId, useRef } from 'react'
import { FOOD_AREA } from './bapkkuData.js'

/* ─────────────────────────────────────────────
 * 사료 알갱이(키블) 배치
 * 매번 무작위로 그리면 화면이 바뀔 때마다 모양이 달라지므로,
 * '씨앗값(seed)'이 고정된 난수로 한 번만 만들어 둡니다.
 * ───────────────────────────────────────────── */
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rand = seededRandom(20261015)
const KIBBLE_COLORS = ['#C68B59', '#B47646', '#D9A066', '#A9693C']
const KIBBLES = Array.from({ length: 90 }, () => {
  const angle = rand() * Math.PI * 2
  const dist = Math.sqrt(rand())
  return {
    x: FOOD_AREA.cx + Math.cos(angle) * dist * (FOOD_AREA.rx + 2),
    y: FOOD_AREA.cy + Math.sin(angle) * dist * (FOOD_AREA.ry + 2),
    rx: 4.2 + rand() * 2.6,
    ry: 3 + rand() * 1.6,
    rot: Math.round(rand() * 180),
    color: KIBBLE_COLORS[Math.floor(rand() * KIBBLE_COLORS.length)],
  }
}).sort((a, b) => a.y - b.y) // 뒤쪽(위)부터 그려야 앞쪽 알갱이가 위에 겹쳐 보여요

/**
 * 누른 지점이 '그릇 영역'인지 판정 (SVG 좌표 기준)
 * - 테두리 타원(cx160, cy92, rx132, ry40)보다 조금 넉넉한 범위
 * - 또는 테두리 아래의 몸통 영역
 * 사료 바로 위의 빈 공간이나 테두리를 살짝 빗나가게 눌러도 뿌려지도록
 * 판정을 넓게 잡고, 실제 알갱이는 clampIntoFood로 사료 위에만 놓입니다.
 */
function isInsideBowl(x, y) {
  const nx = (x - 160) / (132 * 1.15)
  const ny = (y - 92) / (40 * 1.6)
  const onRim = nx * nx + ny * ny <= 1
  const onBody = y >= 92 && y <= 212 && Math.abs(x - 160) <= 136
  return onRim || onBody
}

// 그릇 몸통의 물방울 무늬 위치
const BODY_DOTS = [
  [92, 138], [128, 150], [160, 154], [192, 150], [228, 138],
  [110, 172], [145, 182], [175, 182], [210, 172],
]

/**
 * Bowl — 사료가 담긴 그릇 (SVG)
 *
 * props
 *   bowl        : BOWLS 중 하나 (색상 정보)
 *   particles   : 뿌려진 파우더 알갱이 배열
 *   puffs       : 톡! 할 때 생기는 작은 가루 구름
 *   onSprinkle  : (x, y) => void  — SVG 좌표로 뿌릴 위치를 알려 줌
 *   interactive : false면 완성 화면처럼 보기 전용
 *
 * 마우스와 터치를 모두 지원하기 위해 Pointer Events를 사용합니다.
 * 누른 채로 문지르면 연속해서 뿌려져요.
 */
function Bowl({ bowl, particles = [], puffs = [], onSprinkle, interactive = true }) {
  const svgRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef(null)
  // 한 화면에 그릇이 2개 있어도 clipPath id가 겹치지 않도록 고유 id 사용
  const clipId = `bowl-clip-${useId().replace(/:/g, '')}`

  // 화면(px) 좌표 → SVG viewBox 좌표로 변환
  const toSvgPoint = (event) => {
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (!matrix) return null
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    return { x: p.x, y: p.y }
  }

  // 그릇을 눌렀을 때: 바로 한 번 뿌리고 '문지르기' 모드 시작
  const handlePointerDown = (event) => {
    if (!interactive) return
    const point = toSvgPoint(event)
    // 그릇 바깥의 빈 공간을 누른 경우는 무시
    if (!point || !isInsideBowl(point.x, point.y)) return
    event.preventDefault()
    isDrawing.current = true
    svgRef.current?.setPointerCapture?.(event.pointerId)
    lastPoint.current = point
    onSprinkle?.(point.x, point.y)
  }

  // 누른 채로 움직이면 일정 거리마다 한 번씩 뿌리기
  const handlePointerMove = (event) => {
    if (!isDrawing.current) return
    const point = toSvgPoint(event)
    if (!point) return
    const last = lastPoint.current
    if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 16) {
      lastPoint.current = point
      onSprinkle?.(point.x, point.y)
    }
  }

  const stopDrawing = () => {
    isDrawing.current = false
    lastPoint.current = null
  }

  // 키보드 사용자: Enter/스페이스로 사료 위 무작위 위치에 뿌리기
  const handleKeyDown = (event) => {
    if (!interactive) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const angle = Math.random() * Math.PI * 2
      const d = Math.random() * 0.8
      onSprinkle?.(
        FOOD_AREA.cx + Math.cos(angle) * d * FOOD_AREA.rx,
        FOOD_AREA.cy + Math.sin(angle) * d * FOOD_AREA.ry,
      )
    }
  }

  return (
    <svg
      ref={svgRef}
      className={`bowl-svg ${interactive ? 'is-interactive' : 'is-static'}`}
      viewBox="0 0 320 240"
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : -1}
      aria-label={
        interactive
          ? `${bowl.name} 사료 그릇. 눌러서 토퍼를 뿌리세요`
          : `${bowl.name} 그릇에 완성된 밥꾸`
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
      onLostPointerCapture={stopDrawing}
      onKeyDown={handleKeyDown}
    >
      <defs>
        {/* 그릇 입구 모양으로 잘라서 사료·파우더가 밖으로 삐져나오지 않게 */}
        <clipPath id={clipId}>
          <ellipse cx="160" cy="92" rx="116" ry="32" />
        </clipPath>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="160" cy="214" rx="120" ry="13" fill="rgba(140, 92, 50, 0.14)" />

      {/* 그릇 그림 묶음. 클릭(터치)은 바깥 <svg>가 받아서 좌표로 판정합니다. */}
      <g className="bowl-hit">
        {/* 그릇 받침 */}
        <ellipse cx="160" cy="203" rx="76" ry="12" fill={bowl.inner} />

        {/* 그릇 몸통 */}
        <path
          d="M28,92 C32,165 84,206 160,206 C236,206 288,165 292,92 Z"
          fill={bowl.body}
          style={{ transition: 'fill 0.35s ease' }}
        />
        {/* 몸통 물방울 무늬 */}
        {BODY_DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={bowl.dot} opacity="0.75" />
        ))}
        {/* 몸통 왼쪽 반사광 */}
        <path
          d="M50,116 C58,152 80,178 108,192"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* 그릇 테두리(윗면) */}
        <ellipse cx="160" cy="92" rx="132" ry="40" fill={bowl.rim} style={{ transition: 'fill 0.35s ease' }} />
        {/* 그릇 안쪽 */}
        <ellipse cx="160" cy="92" rx="116" ry="32" fill={bowl.inner} style={{ transition: 'fill 0.35s ease' }} />

        {/* 사료 + 파우더 (그릇 입구 모양으로 잘림) */}
        <g clipPath={`url(#${clipId})`}>
          <ellipse cx="160" cy="98" rx="114" ry="30" fill="#9E6638" />
          {KIBBLES.map((k, i) => (
            <ellipse
              key={i}
              cx={k.x}
              cy={k.y}
              rx={k.rx}
              ry={k.ry}
              fill={k.color}
              transform={`rotate(${k.rot} ${k.x} ${k.y})`}
            />
          ))}
          {/* 사료 윗면의 은은한 하이라이트 */}
          <ellipse cx="146" cy="86" rx="64" ry="10" fill="#FFFFFF" opacity="0.1" />

          {/* 뿌려진 파우더 알갱이 */}
          {particles.map((p) => (
            <g
              key={p.id}
              className="powder"
              style={{ '--fall': `${p.fall}px`, animationDelay: `${p.delay}ms` }}
            >
              <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} />
            </g>
          ))}
        </g>

        {/* 톡! 할 때 퍼지는 가루 구름 */}
        {puffs.map((puff) => (
          <circle
            key={puff.id}
            className="puff"
            cx={puff.x}
            cy={puff.y}
            r="16"
            fill={puff.color}
          />
        ))}

        {/* 테두리 위쪽 반짝임 */}
        <path
          d="M64,70 C96,56 132,52 160,52"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.7"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export default Bowl
