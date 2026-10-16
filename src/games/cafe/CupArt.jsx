import { useId } from 'react'
import { assetUrl } from '../../gameAssets.js'
import { Decoration } from '../cookie/DecorArt.jsx'
import { CUP, foamTop, mixColor } from './cafeData.js'

/**
 * CupArt — 멍푸치노 카페 그림 조각 (임시 SVG 일러스트)
 *
 *   Cup       : 반투명 유리컵 + 음료(수위) + 거품 + 장식 — 컵 기준 좌표(바닥 가운데가 0,0)
 *   CafeTable : 레이스 테이블보를 깐 동그란 카페 테이블
 *
 * 컵은 살짝 투명해서 음료가 차오르는 모습이 보여요.
 * cafeData.js 의 CUPS 에 image 경로를 넣으면 컵 몸통 대신 PNG를 보여 줘요. (음료·거품은 그대로)
 */

const w = (y, top = CUP.TOP, bottom = CUP.BOTTOM) => bottom + (top - bottom) * (-y / CUP.H) // 높이 y에서의 컵 반폭

function bodyPath(inset = 0) {
  const t = CUP.TOP - inset
  const b = CUP.BOTTOM - inset
  const yTop = -CUP.H
  const yBot = -inset
  const r = 14
  return `M${-t},${yTop} L${-b},${yBot - r} Q${-b},${yBot} ${-b + r},${yBot} L${b - r},${yBot} Q${b},${yBot} ${b},${yBot - r} L${t},${yTop} Z`
}

/** 소용돌이(나선) 모양 경로 — 거품 윗면 위에 그려요 */
function spiralPath(cx, cy, rx, ry, turns) {
  const steps = Math.max(8, Math.round(turns * 28))
  let d = ''
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const a = t * turns * Math.PI * 2
    const r = 0.1 + t * 0.78
    const x = cx + Math.cos(a) * r * rx
    const y = cy + Math.sin(a) * r * ry
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `
  }
  return d
}

// 거품 몽글몽글한 덩어리 위치 (돔 둘레)
const PUFFS = Array.from({ length: 9 }, (_, i) => {
  const a = Math.PI - (i / 8) * Math.PI
  return { c: Math.cos(a), s: Math.sin(a), r: 1 + ((i * 5) % 3) * 0.12 }
})

export function Cup({ cup, drink, level = 0, foam = 0, swirl = 0, decorations = [], palette = [], newestId = null }) {
  const uid = `cup${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const lv = Math.min(Math.max(level, 0), 1)
  const fm = Math.min(Math.max(foam, 0), 1)
  const cupImage = assetUrl(cup.image)

  // 음료 윗면
  const yl = -5 - (CUP.H - 12) * lv
  const lrx = w(yl) - 5
  const lry = CUP.RIM_RY * 0.82 * (lrx / CUP.TOP)
  const liquid = drink?.drink ?? '#FFF1DC'

  // 거품
  const ft = foamTop(fm)
  const turns = Math.min(3, swirl / (Math.PI * 2))

  return (
    <g className="cup">
      <defs>
        <clipPath id={`${uid}-inner`}>
          <path d={bodyPath(5)} />
        </clipPath>
        <clipPath id={`${uid}-body`}>
          <path d={bodyPath(0)} />
        </clipPath>
        <linearGradient id={`${uid}-drink`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={mixColor(liquid, '#ffffff', 0.12)} />
          <stop offset="1" stopColor={drink?.drinkDeep ?? liquid} />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor={cup.bodyLight} stopOpacity="0.55" />
          <stop offset="0.45" stopColor={cup.body} stopOpacity="0.32" />
          <stop offset="1" stopColor={cup.bodyShade} stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={`${uid}-foam`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.7" stopColor="#FFF8EC" />
          <stop offset="1" stopColor="#F2E2CB" />
        </radialGradient>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="4" cy="3" rx={CUP.BOTTOM + 14} ry="7" fill="#7a4a24" opacity="0.2" />

      {/* 손잡이 */}
      <path
        d={`M${w(-92) - 2},-92 C${w(-92) + 34},-96 ${w(-30) + 36},-36 ${w(-30) - 1},-32`}
        fill="none"
        stroke={cup.bodyShade}
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d={`M${w(-92) - 2},-92 C${w(-92) + 34},-96 ${w(-30) + 36},-36 ${w(-30) - 1},-32`}
        fill="none"
        stroke={cup.body}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path d={`M${w(-88) + 8},-90 C${w(-88) + 26},-88 ${w(-60) + 26},-70 ${w(-60) + 22},-58`} fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />

      {/* 컵 안쪽 뒷벽 */}
      <ellipse cx="0" cy={-CUP.H} rx={CUP.TOP - 2} ry={CUP.RIM_RY - 1} fill={cup.bodyShade} opacity="0.35" />

      {/* 음료 (투명한 컵 안에서 차올라요) */}
      {lv > 0.001 && (
        <g clipPath={`url(#${uid}-inner)`}>
          <rect x={-CUP.TOP} y={yl} width={CUP.TOP * 2} height={-yl + 2} fill={`url(#${uid}-drink)`} />
          <ellipse cx="0" cy={yl} rx={lrx} ry={lry} fill={mixColor(liquid, '#ffffff', 0.28)} />
          <ellipse cx={-lrx * 0.3} cy={yl - lry * 0.2} rx={lrx * 0.35} ry={lry * 0.3} fill="#fff" opacity="0.35" />
        </g>
      )}

      {/* 컵 몸통 (반투명 유리 + 색) */}
      {cupImage ? (
        <image href={cupImage} x={-CUP.TOP - 30} y={-CUP.H - 12} width={(CUP.TOP + 30) * 2} height={CUP.H + 16} preserveAspectRatio="xMidYMax meet" opacity="0.9" />
      ) : (
        <g>
          <path d={bodyPath(0)} fill={`url(#${uid}-glass)`} stroke={cup.bodyShade} strokeWidth="2" />
          {/* 아래쪽 색 띠 + 땡땡이 */}
          <g clipPath={`url(#${uid}-body)`}>
            <rect x={-CUP.TOP} y="-26" width={CUP.TOP * 2} height="28" fill={cup.body} />
            <rect x={-CUP.TOP} y="-26" width={CUP.TOP * 2} height="4" fill={cup.bodyLight} opacity="0.8" />
            {[-24, 0, 24].map((x) => (
              <circle key={x} cx={x} cy="-12" r="4.2" fill={cup.dot} opacity="0.9" />
            ))}
          </g>
          {/* 유리 반짝임 */}
          <path d={`M${-w(-100) + 9},-100 L${-w(-30) + 8},-32`} stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          <path d={`M${w(-100) - 12},-98 L${w(-80) - 11},-78`} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
        </g>
      )}

      {/* 컵 입구 테두리 */}
      <ellipse cx="0" cy={-CUP.H} rx={CUP.TOP} ry={CUP.RIM_RY} fill="none" stroke={cup.rim} strokeWidth="4.5" />
      <ellipse cx="0" cy={-CUP.H} rx={CUP.TOP} ry={CUP.RIM_RY} fill="none" stroke={cup.rimShade} strokeWidth="1.2" opacity="0.8" />

      {/* 거품 */}
      {fm > 0.001 && (
        <g className="cup-foam">
          <ellipse cx="2" cy={-CUP.H + 2} rx={CUP.TOP - 1} ry={CUP.RIM_RY} fill="#E9D7BE" opacity="0.6" />
          <ellipse cx="0" cy={-CUP.H} rx={CUP.TOP - 1} ry={CUP.RIM_RY} fill={`url(#${uid}-foam)`} />
          {PUFFS.map((p, i) => {
            const r = (8 + ft.h * 0.2) * p.r
            const x = p.c * (CUP.TOP - r * 0.7)
            const y = -CUP.H - p.s * (ft.h * 0.78) + r * 0.25
            return (
              <g key={i}>
                <circle cx={x + 1.5} cy={y + 2} r={r} fill="#EAD9C1" opacity="0.7" />
                <circle cx={x} cy={y} r={r} fill={`url(#${uid}-foam)`} />
              </g>
            )
          })}
          {/* 거품 윗면 (장식이 올라가는 곳) */}
          <ellipse cx={ft.cx} cy={ft.cy} rx={ft.rx} ry={ft.ry} fill="#FFFDF8" />
          <ellipse cx={ft.cx - ft.rx * 0.35} cy={ft.cy - ft.ry * 0.35} rx={ft.rx * 0.35} ry={ft.ry * 0.3} fill="#fff" />
          {/* 빙글빙글 저은 소용돌이 */}
          {turns > 0.05 && (
            <path
              d={spiralPath(ft.cx, ft.cy, ft.rx, ft.ry, Math.max(turns, 0.6))}
              fill="none"
              stroke="#E9D5BA"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity={Math.min(1, turns * 1.4)}
            />
          )}
        </g>
      )}

      {/* 거품 위 장식 */}
      {decorations.map((d) => (
        <g key={d.id} transform={`translate(${d.x} ${d.y}) scale(1 0.8) rotate(${d.rot})`}>
          <g className={d.id === newestId ? 'cafe-decor is-new' : 'cafe-decor'}>
            <Decoration type={d.type} color={d.color} size={d.size} palette={palette} />
          </g>
          {d.id === newestId && (
            <g className="cafe-sparkle" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => {
                const a = (i / 5) * Math.PI * 2 - Math.PI / 2
                return (
                  <path
                    key={i}
                    d="M0,-2 L0.55,-0.55 L2,0 L0.55,0.55 L0,2 L-0.55,0.55 L-2,0 L-0.55,-0.55Z"
                    fill={i % 2 ? '#FFD666' : '#FFFFFF'}
                    style={{ '--sx': `${Math.cos(a) * 13}px`, '--sy': `${Math.sin(a) * 13}px` }}
                  />
                )
              })}
            </g>
          )}
        </g>
      ))}
    </g>
  )
}

/** 레이스 테이블보를 깐 동그란 카페 테이블 (viewBox 0 0 320 260 기준) */
export function CafeTable({ cy = 236 }) {
  return (
    <g className="cafe-table" aria-hidden="true">
      <ellipse cx="164" cy={cy + 14} rx="150" ry="16" fill="#7a4a24" opacity="0.16" />
      <g fill="#FFF6EC">
        {Array.from({ length: 30 }, (_, i) => {
          const a = (i / 30) * Math.PI * 2
          return <circle key={i} cx={160 + Math.cos(a) * 148} cy={cy + Math.sin(a) * 22} r="6" />
        })}
      </g>
      <ellipse cx="160" cy={cy} rx="148" ry="22" fill="#F9D9DF" />
      <ellipse cx="160" cy={cy} rx="140" ry="18" fill="none" stroke="#fff" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.9" />
      <ellipse cx="160" cy={cy - 1} rx="96" ry="11" fill="#FFE7EC" opacity="0.8" />
    </g>
  )
}
