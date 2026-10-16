import { useRef } from 'react'
import { DecoratedCookie } from './DecorArt.jsx'
import { gridLayout } from './cookieData.js'

/**
 * DecorateStage — 구운 쿠키가 놓인 트레이 (꾸미기 단계)
 *
 *  - 쿠키를 누르면 그 쿠키가 선택되고, 누른 자리에 고른 장식이 올라가요.
 *  - 장식은 쿠키 안쪽에만 놓여요. (가장자리 밖을 눌러도 쿠키 안으로 당겨 와요)
 *  - 쿠키마다 다르게 꾸밀 수 있어요.
 *
 * props
 *   cookies, colors(구운 쿠키 색), decorations, palette, selectedId, newestId
 *   onDecorate(cookieId, x, y) : 쿠키 기준 좌표
 *   onMiss() : 쿠키가 아닌 곳을 눌렀을 때
 */
const LIMIT = 10.5 // 장식 중심이 쿠키 가운데에서 벗어날 수 있는 최대 거리
const DECOR_R = 5.2 // 장식 반지름 (이만큼은 쿠키 안에 들어와야 해요)

/** 장식이 쿠키 모양(별·하트의 뾰족한 끝 포함) 밖으로 삐져나가지 않도록 가운데 쪽으로 당겨요 */
function fitInside(body, x, y) {
  if (!body?.isPointInFill) return { x, y }
  const inside = (px, py) =>
    [
      [0, 0],
      [DECOR_R, 0],
      [-DECOR_R, 0],
      [0, DECOR_R],
      [0, -DECOR_R],
    ].every(([dx, dy]) => body.isPointInFill(new DOMPoint(px + dx, py + dy)))
  let px = x
  let py = y
  for (let i = 0; i < 12; i += 1) {
    if (inside(px, py)) return { x: px, y: py }
    px *= 0.8
    py *= 0.8
  }
  return { x: 0, y: 0 }
}

function DecorateStage({ cookies, colors, decorations, palette, selectedId, newestId, onDecorate, onMiss }) {
  const groupRefs = useRef({})
  const { spots, scale } = gridLayout(cookies.length, { x: 30, y: 28, w: 260, h: 166 }, 2.1)

  const handleCookieDown = (event, cookie) => {
    event.stopPropagation()
    event.preventDefault()
    const g = groupRefs.current[cookie.id]
    const m = g?.getScreenCTM()
    if (!m) return
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    const d = Math.hypot(p.x, p.y)
    const k = d > LIMIT ? LIMIT / d : 1
    const spot = fitInside(g.querySelector('.cookie-body'), p.x * k, p.y * k)
    onDecorate?.(cookie.id, spot.x, spot.y)
  }

  // 키보드: 쿠키에 초점을 두고 Enter/스페이스 → 쿠키 위 빈 곳에 장식
  const handleCookieKey = (event, cookie) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    const n = decorations.filter((d) => d.cookieId === cookie.id).length
    const a = n * 2.39996
    const r = n === 0 ? 0 : Math.min(LIMIT, 4 + n * 1.2)
    onDecorate?.(cookie.id, Math.cos(a) * r, Math.sin(a) * r)
  }

  return (
    <svg
      className="decor-svg"
      viewBox="0 0 320 220"
      role="group"
      aria-label="Baking tray with baked cookies. Tap a cookie to decorate it."
      onPointerDown={(event) => {
        if (event.target === event.currentTarget || event.target.closest?.('.decor-tray')) onMiss?.()
      }}
    >
      {/* 트레이 */}
      <g className="decor-tray">
        <rect x="16" y="20" width="292" height="196" rx="18" fill="#9b8b7b" opacity="0.3" />
        <rect x="12" y="12" width="296" height="196" rx="18" fill="#DCD3C9" stroke="#BCAE9F" strokeWidth="2.5" />
        <rect x="12" y="12" width="296" height="12" rx="6" fill="#fff" opacity="0.4" />
        <rect x="22" y="22" width="276" height="176" rx="10" fill="#FFF8EC" />
        <g stroke="#F0E2CC" strokeWidth="1">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`} x1={22 + (i + 1) * 21.2} y1="22" x2={22 + (i + 1) * 21.2} y2="198" />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1="22" y1={22 + (i + 1) * 22} x2="298" y2={22 + (i + 1) * 22} />
          ))}
        </g>
      </g>

      {cookies.map((c, i) => {
        const mine = decorations.filter((d) => d.cookieId === c.id)
        const selected = c.id === selectedId
        return (
          <g key={c.id} transform={`translate(${spots[i].x} ${spots[i].y}) scale(${scale})`}>
            {selected && <circle className="decor-ring" r="23" fill="#fff" fillOpacity="0.35" stroke="#F09AAA" strokeWidth={1.6} strokeDasharray="4 3" />}
            <g
              ref={(el) => {
                groupRefs.current[c.id] = el
              }}
              transform={`rotate(${c.rot})`}
              className={`decor-cookie ${selected ? 'is-selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Cookie ${i + 1} (${c.cutterId}), ${mine.length} decorations. Tap to decorate.`}
              onPointerDown={(event) => handleCookieDown(event, c)}
              onKeyDown={(event) => handleCookieKey(event, c)}
            >
              {/* 누르기 쉬운 넉넉한 영역 */}
              <circle r="21" fill="transparent" />
              <DecoratedCookie cookie={c} colors={colors} decorations={mine} palette={palette} newestId={newestId} />
            </g>
          </g>
        )
      })}
    </svg>
  )
}

export default DecorateStage
