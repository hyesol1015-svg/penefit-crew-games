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

// 키블 색 4가지: [밝은색, 기본색, 어두운색] — 그라데이션으로 동글동글 입체감을 줍니다.
const KIBBLE_TONES = [
  ['#F2C28C', '#D49A62', '#A16A36'],
  ['#E8B27A', '#C4854E', '#8D5A2C'],
  ['#F8D3A0', '#E2AE74', '#B27C45'],
  ['#DDA46C', '#B87A45', '#7F5128'],
]

const rand = seededRandom(20261015)
const KIBBLES = Array.from({ length: 175 }, () => {
  const angle = rand() * Math.PI * 2
  const dist = Math.sqrt(rand())
  const big = rand() > 0.35
  return {
    x: 160 + Math.cos(angle) * dist * 116,
    y: 86 + Math.sin(angle) * dist * 36,
    rx: big ? 5.4 + rand() * 1.8 : 4 + rand() * 1.4,
    ry: big ? 4 + rand() * 1.2 : 3.2 + rand(),
    rot: Math.round(rand() * 180),
    tone: Math.floor(rand() * KIBBLE_TONES.length),
    hole: rand() > 0.86, // 가운데가 살짝 파인 도넛형 키블
  }
}).sort((a, b) => a.y - b.y) // 뒤쪽(위)부터 그려야 앞쪽 알갱이가 위에 겹쳐 보여요

// 그릇 몸통의 물방울 무늬 위치
const BODY_DOTS = [
  [86, 132], [124, 146], [160, 150], [196, 146], [234, 132],
  [104, 168], [142, 178], [178, 178], [216, 168],
]

// 사료가 소복하게 쌓인 '언덕' 모양 (그릇 입구 아래쪽 곡선 + 위로 볼록한 곡선)
const MOUND_PATH = 'M44,92 C58,68 108,56 160,56 C212,56 262,68 276,92 A116,32 0 0 1 44,92 Z'

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
 * [클릭 처리 구조]
 * 클릭(터치)은 바깥 <svg>가 직접 받습니다.
 * 예전에는 안쪽 <g>에만 이벤트를 달아서, 그림이 없는 투명한 부분
 * (테두리 바로 위 등)을 누르면 이벤트가 <svg>로 가 버려 아무 일도
 * 일어나지 않았어요. 지금은 좌표로 '그릇 영역인지'를 판정합니다.
 * 마우스와 터치를 모두 지원하기 위해 Pointer Events를 사용하고,
 * 누른 채로 문지르면 연속해서 뿌려져요.
 */
function Bowl({ bowl, particles = [], puffs = [], onSprinkle, interactive = true }) {
  const svgRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef(null)
  // 한 화면에 그릇이 2개 있어도 SVG 안의 id가 겹치지 않도록 고유 접두어 사용
  const uid = `b${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const ref = (name) => `url(#${uid}-${name})`

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
      preserveAspectRatio="xMidYMax meet"
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
          <stop offset="0.6" stopColor={bowl.inner} />
        </linearGradient>
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
        {/* 사료 더미 모양으로 잘라서 키블·파우더가 그릇 밖으로 나가지 않게 */}
        <clipPath id={`${uid}-mound`}>
          <path d={MOUND_PATH} />
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

        {/* 사료 더미 */}
        <path d={MOUND_PATH} fill={ref('food')} />
        <g clipPath={ref('mound')}>
          {KIBBLES.map((k, i) => (
            <g key={i} transform={`rotate(${k.rot} ${k.x} ${k.y})`}>
              {/* 알갱이 그림자 → 알갱이 → 하이라이트 순서로 겹쳐 입체감 */}
              <ellipse cx={k.x + 1} cy={k.y + 1.8} rx={k.rx} ry={k.ry} fill="#4a2a10" opacity="0.26" />
              <ellipse cx={k.x} cy={k.y} rx={k.rx} ry={k.ry} fill={ref(`kib${k.tone}`)} />
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
          <path d="M44,92 A116,32 0 0 0 276,92" fill="none" stroke="#2e1606" strokeOpacity="0.22" strokeWidth="10" />
          {/* 사료 윗면 하이라이트 */}
          <ellipse cx="146" cy="72" rx="62" ry="9" fill="#FFF3DC" opacity="0.14" />

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
          <circle key={puff.id} className="puff" cx={puff.x} cy={puff.y} r="16" fill={puff.color} />
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
