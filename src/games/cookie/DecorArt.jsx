import { mixColor } from './cookieData.js'
import { CookieShape } from './CookieArt.jsx'

/**
 * DecorArt — 쿠키 장식 그림 (임시 SVG 아이싱)
 *
 *   Decoration     : 장식 한 개 (Paw Print · Heart · Star · Dots), 가운데가 0,0
 *   DecoratedCookie: 구운 쿠키 + 그 위의 장식들 (꾸미기 · 완성 화면에서 함께 써요)
 *
 * 장식 위치(x, y)는 쿠키 기준 좌표예요. 쿠키를 돌리거나 키워도 장식이 같이 따라가요.
 */

const STAR = (() => {
  const pts = []
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? 1 : 0.45
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(Math.cos(a) * r).toFixed(3)},${(Math.sin(a) * r).toFixed(3)}`)
  }
  return `M${pts.join(' L')}Z`
})()

const HEART = 'M0,0.85 C-0.25,0.62 -1,0.2 -1,-0.3 C-1,-0.72 -0.62,-0.95 -0.32,-0.92 C-0.15,-0.9 -0.05,-0.78 0,-0.62 C0.05,-0.78 0.15,-0.9 0.32,-0.92 C0.62,-0.95 1,-0.72 1,-0.3 C1,0.2 0.25,0.62 0,0.85Z'

const DOTS = [
  { x: -0.55, y: -0.35, r: 0.26, c: 0 },
  { x: 0.45, y: -0.5, r: 0.22, c: 2 },
  { x: 0.1, y: 0.25, r: 0.28, c: 3 },
  { x: -0.6, y: 0.55, r: 0.2, c: 1 },
  { x: 0.7, y: 0.45, r: 0.21, c: 0 },
]

/** 장식 한 개 — size: 반지름(쿠키 좌표), palette: 점 장식에 섞어 쓰는 색들 */
export function Decoration({ type, color, size = 5.2, palette }) {
  const edge = mixColor(color, '#6b4320', 0.28)
  const common = { fill: color, stroke: edge, strokeWidth: 0.55 / size * 2.2, strokeLinejoin: 'round' }
  let body
  if (type === 'heart') {
    body = <path d={HEART} {...common} />
  } else if (type === 'star') {
    body = <path d={STAR} {...common} />
  } else if (type === 'dots') {
    const colors = palette?.length ? palette : [color]
    body = (
      <g>
        {DOTS.map((d, i) => {
          const c = i === 0 ? color : colors[(d.c + i) % colors.length]
          return (
            <g key={i}>
              <circle cx={d.x} cy={d.y} r={d.r} fill={c} stroke={mixColor(c, '#6b4320', 0.28)} strokeWidth={0.06} />
              <circle cx={d.x - d.r * 0.3} cy={d.y - d.r * 0.3} r={d.r * 0.32} fill="#fff" opacity="0.7" />
            </g>
          )
        })}
      </g>
    )
  } else {
    // paw print
    body = (
      <g {...common}>
        <path d="M0,-0.05 C0.45,-0.05 0.72,0.3 0.72,0.58 C0.72,0.82 0.5,0.9 0.3,0.85 C0.15,0.82 0.08,0.78 0,0.78 C-0.08,0.78 -0.15,0.82 -0.3,0.85 C-0.5,0.9 -0.72,0.82 -0.72,0.58 C-0.72,0.3 -0.45,-0.05 0,-0.05Z" />
        <ellipse cx="-0.78" cy="-0.22" rx="0.24" ry="0.31" transform="rotate(-25 -0.78 -0.22)" />
        <ellipse cx="-0.3" cy="-0.72" rx="0.25" ry="0.33" transform="rotate(-8 -0.3 -0.72)" />
        <ellipse cx="0.3" cy="-0.72" rx="0.25" ry="0.33" transform="rotate(8 0.3 -0.72)" />
        <ellipse cx="0.78" cy="-0.22" rx="0.24" ry="0.31" transform="rotate(25 0.78 -0.22)" />
      </g>
    )
  }
  return (
    <g transform={`scale(${size})`}>
      {/* 아이싱 아래 살짝 그림자 */}
      <g transform="translate(0.08 0.14)" opacity="0.18">
        {type === 'dots' ? (
          DOTS.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#5a2e14" />)
        ) : (
          <path d={type === 'heart' ? HEART : type === 'star' ? STAR : 'M-0.75,-0.95 h1.5 v1.85 h-1.5z'} fill="#5a2e14" opacity={type === 'paw' ? 0 : 1} />
        )}
      </g>
      {body}
      {type !== 'dots' && <ellipse cx="-0.3" cy="-0.35" rx="0.22" ry="0.12" fill="#fff" opacity="0.75" transform="rotate(-25 -0.3 -0.35)" />}
    </g>
  )
}

/** 구운 쿠키 + 장식 (가운데 0,0) */
export function DecoratedCookie({ cookie, colors, decorations, palette, newestId }) {
  return (
    <g>
      <CookieShape cutterId={cookie.cutterId} flavor={colors} />
      {decorations.map((d) => (
        <g key={d.id} transform={`translate(${d.x} ${d.y}) rotate(${d.rot})`}>
          <g className={d.id === newestId ? 'decor is-new' : 'decor'}>
            <Decoration type={d.type} color={d.color} size={d.size} palette={palette} />
          </g>
          {d.id === newestId && (
            <g className="decor-sparkle" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => {
                const a = (i / 5) * Math.PI * 2 - Math.PI / 2
                return (
                  <path
                    key={i}
                    d="M0,-1.6 L0.45,-0.45 L1.6,0 L0.45,0.45 L0,1.6 L-0.45,0.45 L-1.6,0 L-0.45,-0.45Z"
                    fill={i % 2 ? '#FFD666' : '#FFFFFF'}
                    style={{ '--sx': `${Math.cos(a) * 9}px`, '--sy': `${Math.sin(a) * 9}px` }}
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
