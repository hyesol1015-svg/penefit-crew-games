import { useId } from 'react'
import { CookieShape } from './CookieArt.jsx'
import { bakedColors } from './cookieData.js'

/**
 * BakeStage — 파스텔 오븐 (굽기 단계)
 *
 *   idle    : 쿠키를 올린 트레이가 오븐 앞에 있어요
 *   loading : Bake 를 누르면 트레이가 오븐 안으로 쏙 들어가요 (약 0.7초)
 *   baking  : 오븐 불빛이 켜지고 쿠키가 점점 노릇하게 구워져요 (타이머가 올라가요)
 *   result  : Stop 을 누른 상태 그대로 멈춰요
 *
 * 오븐은 임시 SVG 그림이에요. 쿠키 모양·개수·맛 색은 앞 단계 그대로예요.
 *
 * props
 *   flavor, cookies, phase, doneness(0~1), elapsed(ms), onOvenTap
 */
const WINDOW = { x: 62, y: 92, w: 196, h: 92 }

function BakeStage({ flavor, cookies, phase, doneness, elapsed, onOvenTap }) {
  const uid = `o${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const colors = bakedColors(flavor, doneness)
  // 트레이 위 쿠키 자리: 5개까지는 한 줄, 그보다 많으면 두 줄
  const cols = Math.max(1, Math.min(cookies.length, 5))
  const rows = Math.max(1, Math.ceil(cookies.length / 5))
  const cw = 164 / cols
  const ch = 48 / rows
  const scale = Math.min(0.95, Math.min(cw, ch) / 42)
  const spots = cookies.map((_, i) => {
    const r = Math.floor(i / cols)
    const inRow = r === rows - 1 ? cookies.length - r * cols : cols
    return { x: 78 + (cols - inRow) * cw * 0.5 + cw * ((i % cols) + 0.5), y: 123 + ch * (r + 0.5) }
  })
  const hot = phase === 'baking'
  const inside = phase !== 'idle'
  const seconds = (elapsed / 1000).toFixed(1)

  return (
    <svg
      className={`oven-svg is-${phase}`}
      viewBox="0 0 320 250"
      role="img"
      aria-label={`Oven. ${hot ? `Baking, ${seconds} seconds.` : phase === 'idle' ? 'The cookie tray is ready to go in.' : 'Stopped.'}`}
      onPointerDown={hot ? onOvenTap : undefined}
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFE9B8" />
          <stop offset="1" stopColor="#F6C98C" />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.2" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.85" stopColor="#c98a48" stopOpacity="0" />
          <stop offset="1" stopColor="#c98a48" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id={`${uid}-inside`} cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor={hot ? '#FFB45A' : '#7A5340'} />
          <stop offset="1" stopColor={hot ? '#C2552C' : '#4A3027'} />
        </radialGradient>
        <linearGradient id={`${uid}-glass`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.8" stopColor="#ffffff" stopOpacity="0.16" />
        </linearGradient>
        <clipPath id={`${uid}-win`}>
          <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} rx="16" />
        </clipPath>
        <filter id={`${uid}-blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="165" cy="238" rx="138" ry="9" fill="#8a4b2a" opacity="0.25" filter={`url(#${uid}-blur)`} />

      {/* 오븐 몸통 */}
      <rect x="20" y="14" width="280" height="222" rx="28" fill={`url(#${uid}-body)`} />
      <rect x="20" y="14" width="280" height="222" rx="28" fill={`url(#${uid}-side)`} />
      <rect x="20" y="14" width="280" height="222" rx="28" fill="none" stroke="#E2AE6E" strokeWidth="2.5" />
      {/* 발 */}
      <rect x="44" y="230" width="34" height="12" rx="6" fill="#D49A5E" />
      <rect x="242" y="230" width="34" height="12" rx="6" fill="#D49A5E" />

      {/* 위쪽 조작판: 다이얼 2개 + 타이머 + 불빛 */}
      <rect x="34" y="26" width="252" height="46" rx="16" fill="#FFF6E4" stroke="#EBC28C" strokeWidth="2" />
      {[66, 254].map((cx, i) => (
        <g key={cx} className={hot ? 'oven-dial is-on' : 'oven-dial'} style={{ transformOrigin: `${cx}px 49px` }}>
          <circle cx={cx} cy="49" r="13" fill="#F7B9C4" stroke="#E592A3" strokeWidth="2" />
          <circle cx={cx} cy="49" r="8" fill="#FFD9E0" />
          <rect x={cx - 1.6} y="38" width="3.2" height="9" rx="1.6" fill="#D9758B" transform={`rotate(${i ? -40 : 30} ${cx} 49)`} />
        </g>
      ))}
      <rect x="108" y="35" width="104" height="28" rx="9" fill="#4F3A32" />
      <text x="160" y="55" textAnchor="middle" fontFamily="Fredoka, 'Nunito', sans-serif" fontSize="17" fontWeight="600" fill={hot ? '#FFD666' : '#E8C9A6'} letterSpacing="1">
        {`${seconds}s`}
      </text>
      <circle cx="224" cy="49" r="4.5" fill={hot ? '#FF8A5B' : '#E7CFAF'} className={hot ? 'oven-light is-on' : 'oven-light'} />

      {/* 오븐 문 */}
      <rect x="40" y="80" width="240" height="138" rx="22" fill="#FFF3DC" stroke="#E8BC83" strokeWidth="2.5" />
      <rect x="40" y="80" width="240" height="138" rx="22" fill="#ffffff" opacity="0.18" />

      {/* 오븐 안 */}
      <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} rx="16" fill={`url(#${uid}-inside)`} />
      <g clipPath={`url(#${uid}-win)`}>
        {/* 안쪽 선반 + 열선 */}
        <path d={`M${WINDOW.x},${WINDOW.y + 70} H${WINDOW.x + WINDOW.w}`} stroke="#3c2620" strokeWidth="2" opacity="0.5" />
        <path
          d={`M${WINDOW.x + 12},${WINDOW.y + 10} q12,-6 24,0 t24,0 t24,0 t24,0 t24,0 t24,0 t24,0`}
          fill="none"
          stroke={hot ? '#FFD07A' : '#8b6150'}
          strokeWidth="3"
          strokeLinecap="round"
          className={hot ? 'oven-coil is-on' : 'oven-coil'}
        />
        {/* 따뜻한 불빛 */}
        <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} fill="#FFC56B" className="oven-glow" opacity={hot ? 0.28 : 0} />

        {/* 오븐 안의 트레이 (들어간 뒤) */}
        {inside && (
          <g className="oven-tray">
            <Tray spots={spots} scale={scale} cookies={cookies} colors={colors} />
            {/* 열기 아지랑이 */}
            {hot && (
              <g className="oven-heat" fill="none" stroke="#FFF1C9" strokeWidth="2" strokeLinecap="round" opacity="0.55">
                <path d="M120,150 q-5,-8 0,-16 t0,-16" />
                <path d="M160,148 q-5,-8 0,-16 t0,-16" />
                <path d="M200,150 q-5,-8 0,-16 t0,-16" />
              </g>
            )}
          </g>
        )}
      </g>

      {/* 유리문 반사 + 테두리 */}
      <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} rx="16" fill={`url(#${uid}-glass)`} className="oven-glass" opacity={inside ? 1 : 0.35} />
      <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} rx="16" fill="none" stroke="#E2AE6E" strokeWidth="4" />
      {/* 손잡이 */}
      <rect x="92" y="196" width="136" height="12" rx="6" fill="#F4A9B8" stroke="#E08D9F" strokeWidth="2" />
      <rect x="100" y="198" width="80" height="3" rx="1.5" fill="#fff" opacity="0.6" />

      {/* 들어가기 전: 오븐 앞에 들고 있는 트레이 */}
      {!inside && (
        <g className="oven-tray-out">
          <g transform="translate(160 186) scale(1.12) translate(-160 -148)">
            <Tray spots={spots} scale={scale} cookies={cookies} colors={colors} />
          </g>
        </g>
      )}
    </svg>
  )
}

function Tray({ spots, scale, cookies, colors }) {
  return (
    <g>
      <rect x="70" y="118" width="180" height="60" rx="9" fill="#9b8b7b" opacity="0.35" transform="translate(2 4)" />
      <rect x="70" y="118" width="180" height="60" rx="9" fill="#D9D0C6" stroke="#B8AB9D" strokeWidth="2" />
      <rect x="76" y="122" width="168" height="50" rx="6" fill="#FFF8EC" />
      {cookies.map((c, i) => (
        <g key={c.id} transform={`translate(${spots[i].x} ${spots[i].y}) scale(${scale}) rotate(${c.rot})`}>
          <CookieShape cutterId={c.cutterId} flavor={colors} />
        </g>
      ))}
    </g>
  )
}

export default BakeStage
