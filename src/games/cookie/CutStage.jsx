import { useRef, useState } from 'react'
import { BakingMat, CookieShape, CutterOutline, DoughSheet } from './CookieArt.jsx'
import { canPlaceCookie } from './cookieData.js'

/**
 * CutStage — 다 편 반죽 위에 쿠키틀로 찍기
 *
 *  - 고른 쿠키틀로 반죽을 누르면 그 자리에 '꾹' 찍혀요. (쿠키틀이 내려왔다가 올라가며 가루가 톡톡 튀어요)
 *  - 다른 쿠키와 많이 겹치면 가까운 빈자리로 살짝 옮겨 찍고, 자리가 없으면 안내해요. (판단은 부모가 해요)
 *  - 마우스를 올리면 찍힐 자리를 미리 보여 줘요. (분홍 = 찍을 수 있음, 회색 = 자리가 없음)
 *
 * props
 *   flavor   : FLAVORS 중 하나
 *   cutterId : 고른 쿠키틀
 *   cookies  : 찍은 쿠키들 [{ id, cutterId, x, y, rot }]
 *   stampId  : 방금 찍은 쿠키 id (찍는 연출용)
 *   onStamp(x, y) : 반죽을 눌렀을 때 (SVG 좌표)
 */
const CRUMB_DIRS = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2 + 0.3
  const d = 20 + (i % 3) * 5
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.8, r: 1.1 + (i % 3) * 0.45 }
})

function CutStage({ flavor, cutterId, cookies, stampId, onStamp }) {
  const svgRef = useRef(null)
  const [hover, setHover] = useState(null)

  const toSvg = (event) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const q = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse())
    return { x: q.x, y: q.y }
  }

  const handleDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    const pt = toSvg(event)
    if (!pt) return
    event.preventDefault()
    onStamp?.(pt.x, pt.y)
  }

  const handleMove = (event) => {
    if (event.pointerType !== 'mouse') return
    const pt = toSvg(event)
    setHover(pt)
  }

  // 키보드: Enter/스페이스로 빈자리에 찍기 (반죽 가운데부터 차례로 찾아요)
  const handleKey = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onStamp?.(null, null)
  }

  const stamp = cookies.find((c) => c.id === stampId)
  const ghostOk = hover && canPlaceCookie(hover.x, hover.y, cookies)

  return (
    <svg
      ref={svgRef}
      className="cut-svg"
      viewBox="0 0 320 220"
      role="application"
      aria-label={`Rolled dough on a baking mat. Tap the dough to cut a cookie. ${cookies.length} cookies cut.`}
      tabIndex={0}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerLeave={() => setHover(null)}
      onKeyDown={handleKey}
    >
      <BakingMat />
      <DoughSheet flavor={flavor} flat={1} />

      {/* 찍힌 쿠키들 (반죽 위에 자국으로 남아요) */}
      <g className="cut-cookies">
        {cookies.map((c) => (
          <g key={c.id} transform={`translate(${c.x} ${c.y - 2}) rotate(${c.rot})`}>
            <g className={c.id === stampId ? 'cut-cookie is-new' : 'cut-cookie'}>
              <CookieShape cutterId={c.cutterId} flavor={flavor} variant="cut" />
            </g>
          </g>
        ))}
      </g>

      {/* 찍는 연출: 쿠키틀이 내려와 꾹 → 위로 / 가루가 톡톡 */}
      {stamp && (
        <g key={stamp.id} transform={`translate(${stamp.x} ${stamp.y - 2})`} pointerEvents="none">
          <g className="stamp-crumbs">
            {CRUMB_DIRS.map((d, i) => (
              <circle
                key={i}
                r={d.r}
                fill={i % 2 ? flavor.doughLight : flavor.dough}
                style={{ '--dx': `${d.dx}px`, '--dy': `${d.dy}px`, animationDelay: '0.16s' }}
              />
            ))}
          </g>
          <g transform={`rotate(${stamp.rot})`}>
            <g className="stamp-cutter">
              <CutterOutline cutterId={stamp.cutterId} />
            </g>
          </g>
        </g>
      )}

      {/* 마우스를 올렸을 때 미리 보기 */}
      {hover && (
        <g transform={`translate(${hover.x} ${hover.y})`} opacity={ghostOk ? 0.75 : 0.35} pointerEvents="none" className={ghostOk ? '' : 'is-blocked'}>
          <CutterOutline cutterId={cutterId} width={2.6} />
        </g>
      )}
    </svg>
  )
}

export default CutStage
