import { useId } from 'react'
import { assetUrl } from '../../gameAssets.js'
import { CUTTERS, SHEET } from './cookieData.js'
import { SPECKS, doughSize, wobblyEllipse } from './doughShape.js'

/**
 * CookieArt — 쿠키 베이커리에서 함께 쓰는 그림 조각들 (임시 SVG 일러스트)
 *
 *   BakingMat   : 분홍 실리콘 베이킹 매트 (밀기·찍기 단계 바닥)
 *   DoughSheet  : 반죽 덩어리 → 납작하게 편 반죽 (flat 0~1)
 *   CookieShape : 쿠키틀로 찍어 낸 쿠키 한 개 (가운데 0,0 / 지름 약 38)
 *   CutterOutline : 금속 쿠키틀 테두리 그림
 *   CookieTray  : 찍은 쿠키를 모아 두는 베이킹 트레이 (HTML + 작은 SVG)
 *
 * 모두 실제 사진 에셋이 아닌 임시 그림이에요.
 * cookieData.js 의 CUTTERS 에 image 경로를 넣으면 쿠키는 그 PNG로 바뀌어요.
 */

const uidOf = (raw) => `c${raw.replace(/[^a-zA-Z0-9]/g, '')}`

/* ─────────────────────────────────────────────
 * 베이킹 매트 (viewBox 0 0 320 220 기준)
 * ───────────────────────────────────────────── */
export function BakingMat() {
  return (
    <g className="mat" aria-hidden="true">
      <rect x="10" y="16" width="300" height="200" rx="18" fill="#9b6a44" opacity="0.18" />
      <rect x="6" y="6" width="308" height="204" rx="18" fill="#F6B9C3" />
      <rect x="6" y="6" width="308" height="204" rx="18" fill="none" stroke="#E79AA9" strokeWidth="2" />
      <rect x="18" y="17" width="284" height="182" rx="11" fill="#FCE4E4" />
      {/* 매트 위 안내 원·눈금 */}
      <g fill="none" stroke="#F4BFC8" strokeWidth="1.4">
        <ellipse cx="160" cy="108" rx="128" ry="80" strokeDasharray="5 6" />
        <ellipse cx="160" cy="108" rx="86" ry="54" strokeDasharray="4 6" />
        <ellipse cx="160" cy="108" rx="44" ry="28" strokeDasharray="3 5" />
      </g>
      <g stroke="#F2B3BE" strokeWidth="1.6" strokeLinecap="round">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={36 + i * 20.7} y1="11" x2={36 + i * 20.7} y2={i % 2 ? 14 : 15.5} />
        ))}
      </g>
      {/* 실리콘 광택 */}
      <path d="M26,24 L120,24" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </g>
  )
}

/* ─────────────────────────────────────────────
 * 반죽 (덩어리 → 납작한 반죽)
 * ───────────────────────────────────────────── */
export function DoughSheet({ flavor, flat = 0, cx = SHEET.cx, cy = SHEET.cy, children }) {
  const uid = uidOf(useId())
  const { rx, ry, thick } = doughSize(flat)
  const wobble = 0.05 - flat * 0.015
  const top = wobblyEllipse(cx, cy - thick / 2, rx, ry, wobble)
  const side = wobblyEllipse(cx, cy + thick / 2, rx, ry, wobble)
  return (
    <g className="dough-sheet">
      <defs>
        <radialGradient id={`${uid}-top`} cx="0.42" cy="0.32" r="0.75">
          <stop offset="0" stopColor={flavor.doughLight} />
          <stop offset="0.55" stopColor={flavor.dough} />
          <stop offset="1" stopColor={flavor.doughSide} />
        </radialGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* 바닥 그림자 */}
      <ellipse cx={cx + 3} cy={cy + thick / 2 + 6} rx={rx * 1.02} ry={ry * 0.92} fill="#8a4b2a" opacity="0.22" filter={`url(#${uid}-soft)`} />
      {/* 옆면(두께) */}
      <path d={side} fill={flavor.doughSide} />
      {/* 윗면 */}
      <path d={top} fill={`url(#${uid}-top)`} />
      {/* 반죽 속 파우더 알갱이 */}
      <g>
        {SPECKS.map((s, i) => (
          <circle
            key={i}
            cx={cx + s.x * rx}
            cy={cy - thick / 2 + s.y * ry}
            r={s.s * (1.1 - flat * 0.25)}
            fill={s.light ? flavor.doughLight : flavor.speck}
            opacity={s.light ? 0.8 : 0.45}
          />
        ))}
      </g>
      {/* 동그란 덩어리일 때 더 반짝이는 윗부분 */}
      <ellipse
        cx={cx - rx * 0.3}
        cy={cy - thick / 2 - ry * 0.42}
        rx={rx * 0.32}
        ry={ry * 0.16}
        fill="#fff"
        opacity={0.38 - flat * 0.2}
        transform={`rotate(-12 ${cx - rx * 0.3} ${cy - thick / 2 - ry * 0.42})`}
      />
      {children}
    </g>
  )
}

/* ─────────────────────────────────────────────
 * 쿠키 한 개 / 쿠키틀
 * ───────────────────────────────────────────── */
function Details({ cutter, color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
      {cutter.details.map((d, i) => {
        if (d.type === 'dot') return <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} stroke="none" />
        if (d.type === 'ellipse')
          return <ellipse key={i} cx={d.x} cy={d.y} rx={d.rx} ry={d.ry} transform={`rotate(${d.rot} ${d.x} ${d.y})`} />
        return <path key={i} d={d.d} fill={d.fill ? color : 'none'} />
      })}
    </g>
  )
}

/**
 * CookieShape — 찍어 낸 쿠키
 *   variant 'cut'  : 반죽판 위에 찍힌 자국 (가장자리에 홈)
 *   variant 'raw'  : 트레이 위에 올린 생쿠키 (두께 + 그림자)
 */
export function CookieShape({ cutterId, flavor, variant = 'raw' }) {
  const cutter = CUTTERS.find((c) => c.id === cutterId) ?? CUTTERS[0]
  const src = assetUrl(cutter.image)
  if (src) return <image href={src} x="-21" y="-21" width="42" height="42" />
  if (variant === 'cut') {
    return (
      <g>
        <path d={cutter.path} fill={flavor.doughLight} opacity="0.35" transform="translate(0.8 1.2)" />
        <path d={cutter.path} fill={flavor.dough} stroke={flavor.doughLine} strokeWidth="1.8" strokeLinejoin="round" />
        <path d={cutter.path} fill="none" stroke="#fff" strokeWidth="0.8" strokeLinejoin="round" opacity="0.45" transform="translate(-0.6 -0.8) scale(0.94)" />
        <Details cutter={cutter} color={flavor.doughLine} />
      </g>
    )
  }
  return (
    <g>
      <path d={cutter.path} fill="#7a4a2a" opacity="0.2" transform="translate(1.5 4)" />
      <path d={cutter.path} fill={flavor.doughSide} transform="translate(0 2.6)" />
      <path className="cookie-body" d={cutter.path} fill={flavor.dough} />
      {/* 구운 쿠키: 가장자리가 노릇하게 + 윗면 은은한 광택 */}
      {flavor.edge && (
        <path d={cutter.path} fill="none" stroke={flavor.edge} strokeWidth="2.6" strokeLinejoin="round" opacity={0.35 + flavor.baked * 0.4} />
      )}
      <path d={cutter.path} fill="none" stroke={flavor.doughLight} strokeWidth="1.4" opacity="0.7" transform="scale(0.88)" />
      {flavor.edge && <ellipse cx="-5" cy="-8" rx="6" ry="2.2" fill="#fff" opacity={0.18 + flavor.baked * 0.12} transform="rotate(-18 -5 -8)" />}
      <Details cutter={cutter} color={flavor.doughLine} />
      <circle cx="-6" cy="-7" r="0.9" fill={flavor.speck} opacity="0.45" />
      <circle cx="7" cy="3" r="0.8" fill={flavor.speck} opacity="0.45" />
      <circle cx="-3" cy="9" r="0.7" fill={flavor.speck} opacity="0.4" />
    </g>
  )
}

/** 금속 쿠키틀 (위에서 본 테두리) */
export function CutterOutline({ cutterId, width = 3.4 }) {
  const cutter = CUTTERS.find((c) => c.id === cutterId) ?? CUTTERS[0]
  return (
    <g strokeLinejoin="round" fill="none">
      <path d={cutter.path} stroke="#c9707f" strokeWidth={width + 1.4} transform="translate(0 1.4)" opacity="0.5" />
      <path d={cutter.path} stroke="#F09AAA" strokeWidth={width} />
      <path d={cutter.path} stroke="#FFE3E8" strokeWidth={width * 0.32} transform="translate(-0.4 -0.6)" />
    </g>
  )
}

/** 쿠키틀 선택 카드에 들어가는 작은 그림 */
export function CutterCardArt({ cutterId, flavor }) {
  return (
    <svg className="cutter-art" viewBox="-25 -24 50 50" aria-hidden="true">
      <ellipse cx="1" cy="21" rx="17" ry="3" fill="#a0603a" opacity="0.15" />
      <g opacity="0.95">
        <CookieShape cutterId={cutterId} flavor={flavor} />
      </g>
      <g transform="translate(0 -2.5) scale(1.06)">
        <CutterOutline cutterId={cutterId} width={2.8} />
      </g>
    </svg>
  )
}

/* ─────────────────────────────────────────────
 * 베이킹 트레이 (찍은 쿠키 모음)
 * ───────────────────────────────────────────── */
export function CookieTray({ cookies, flavor, big = false, max = 10 }) {
  const slots = Math.max(max, cookies.length)
  return (
    <div className={`cookie-tray ${big ? 'cookie-tray--big' : ''}`} aria-label={`Baking tray with ${cookies.length} cookies`}>
      <div className="cookie-tray__paper">
        {Array.from({ length: slots }, (_, i) => {
          const c = cookies[i]
          return (
            <span key={c ? c.id : `empty-${i}`} className={`cookie-tray__slot ${c ? 'is-filled' : ''}`}>
              {c && (
                <svg viewBox="-24 -23 48 50" aria-hidden="true">
                  <g transform={`rotate(${c.rot})`}>
                    <CookieShape cutterId={c.cutterId} flavor={flavor} />
                  </g>
                </svg>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
