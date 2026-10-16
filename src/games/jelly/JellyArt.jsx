import { useId } from 'react'
import { assetUrl } from '../../gameAssets.js'
import { MOLDS, PLATE_SPOTS, SLOTS, SLOT_SCALE } from './jellyData.js'

/**
 * JellyArt — 말랑젤리 연구소 그림 조각 (임시 SVG 일러스트)
 *
 *   JellyShape : 몰드 모양 젤리 한 개 (액체 → 반투명하고 탱글한 젤리)
 *   MoldTray   : 반투명 실리콘 젤리틀 트레이 (6칸)
 *   JellyPlate : 꺼낸 젤리를 차곡차곡 담는 접시
 *
 * cookieData 의 CUTTERS 처럼 MOLDS 에 image 경로를 넣으면 젤리를 PNG로 바꿀 수 있어요.
 */

const uidOf = (raw) => `j${raw.replace(/[^a-zA-Z0-9]/g, '')}`

function Details({ mold, color, opacity }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {mold.details.map((d, i) => {
        if (d.type === 'dot') return <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} stroke="none" />
        if (d.type === 'ellipse') return <ellipse key={i} cx={d.x} cy={d.y} rx={d.rx} ry={d.ry} transform={`rotate(${d.rot} ${d.x} ${d.y})`} />
        return <path key={i} d={d.d} fill={d.fill ? color : 'none'} />
      })}
    </g>
  )
}

/**
 * 젤리 한 개 (가운데 0,0)
 *   fill : 0~1  몰드에 찬 높이 (부을 때)
 *   set  : 0~1  굳은 정도 (0 = 출렁이는 액체, 1 = 반투명 탱글 젤리)
 */
export function JellyShape({ moldId, colors, fill = 1, set = 1 }) {
  const uid = uidOf(useId())
  const mold = MOLDS.find((m) => m.id === moldId) ?? MOLDS[0]
  const src = assetUrl(mold.image)
  if (fill <= 0.001) return null
  if (src && set >= 1) return <image href={src} x="-21" y="-21" width="42" height="42" />
  const top = 19 - 38 * Math.min(fill, 1)
  const s = Math.min(Math.max(set, 0), 1)
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-c`}>
          <path d={mold.path} />
        </clipPath>
        <radialGradient id={`${uid}-g`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor={colors.light} />
          <stop offset="0.55" stopColor={colors.mid} />
          <stop offset="1" stopColor={colors.deep} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${uid}-c)`}>
        {/* 액체 (굳을수록 투명해져요) */}
        <rect x="-24" y={top} width="48" height={44} fill={s > 0 ? `url(#${uid}-g)` : colors.base} opacity={0.95 - 0.23 * s} />
        {/* 부을 때 출렁이는 윗면 */}
        {fill < 1 && <rect x="-24" y={top} width="48" height="2.2" fill={colors.light} opacity="0.9" />}
        {/* 젤리 속 빛이 비치는 느낌 */}
        <ellipse cx="4" cy="8" rx="13" ry="8" fill="#ffffff" opacity={0.12 * s} />
      </g>
      {/* 굳은 젤리: 테두리 + 큰 하이라이트 + 작은 반짝임 */}
      {s > 0 && (
        <g opacity={s}>
          <path d={mold.path} fill="none" stroke={colors.edge} strokeWidth="1.4" strokeLinejoin="round" opacity="0.55" />
          <path d={mold.path} fill="none" stroke="#ffffff" strokeWidth="1.1" strokeLinejoin="round" opacity="0.5" transform="translate(-0.6 -0.8) scale(0.9)" />
          <Details mold={mold} color={colors.deep} opacity={0.45} />
          <ellipse cx="-6.5" cy="-8" rx="5.5" ry="2.6" fill="#ffffff" opacity="0.7" transform="rotate(-25 -6.5 -8)" />
          <circle cx="7" cy="-9" r="1.4" fill="#ffffff" opacity="0.85" />
          <ellipse cx="6" cy="11" rx="4" ry="1.6" fill="#ffffff" opacity="0.25" transform="rotate(-12 6 11)" />
        </g>
      )}
    </g>
  )
}

/** 실리콘 몰드의 빈 칸 하나 */
export function MoldCavity({ moldId }) {
  const mold = MOLDS.find((m) => m.id === moldId) ?? MOLDS[0]
  return (
    <g>
      <path d={mold.path} fill="#E796AB" transform="translate(0 1.6) scale(1.05)" opacity="0.6" />
      <path d={mold.path} fill="#F3B2C2" stroke="#E68FA6" strokeWidth="1.6" strokeLinejoin="round" />
      <path d={mold.path} fill="#D97E97" opacity="0.25" transform="translate(1.2 1.8) scale(0.86)" />
      <path d={mold.path} fill="none" stroke="#FFF1F5" strokeWidth="1" opacity="0.8" transform="translate(-0.5 -0.7) scale(0.95)" />
    </g>
  )
}

/**
 * 실리콘 젤리틀 트레이 (6칸)
 *   fills, sets, popped : 칸마다 상태 배열
 *   pressing : 지금 누르고 있는 칸 (말랑하게 눌림)
 *   glow     : 강조할 칸 (부을 칸·굳힐 칸)
 *   dy       : 트레이를 위아래로 옮길 때
 */
export function MoldTray({ moldId, colors, fills = [], sets = [], popped = [], pressing = -1, glow = -1, dy = 0, newlySet = [] }) {
  return (
    <g transform={`translate(0 ${dy})`}>
      {/* 트레이 그림자 + 반투명 실리콘 판 */}
      <rect x="40" y="128" width="246" height="120" rx="26" fill="#a0603a" opacity="0.14" />
      <rect x="34" y="120" width="252" height="120" rx="26" fill="#F9C6D3" opacity="0.92" />
      <rect x="34" y="120" width="252" height="120" rx="26" fill="none" stroke="#EDA0B4" strokeWidth="2.5" />
      <rect x="44" y="126" width="232" height="10" rx="5" fill="#FFFFFF" opacity="0.45" />
      <rect x="44" y="226" width="232" height="8" rx="4" fill="#E796AB" opacity="0.25" />
      {SLOTS.map((s, i) => {
        const isPopped = popped[i]
        return (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${SLOT_SCALE})`}>
            <g className={`mold-slot ${pressing === i ? 'is-pressing' : ''} ${glow === i ? 'is-glow' : ''}`}>
              <MoldCavity moldId={moldId} />
              {!isPopped && (
                <g className={`slot-jelly ${sets[i] >= 1 ? 'is-set' : ''} ${newlySet.includes(i) ? 'is-new' : ''}`}>
                  <JellyShape moldId={moldId} colors={colors} fill={fills[i] ?? 0} set={sets[i] ?? 0} />
                </g>
              )}
            </g>
          </g>
        )
      })}
    </g>
  )
}

/** 접시 (가운데 0,0) + 꺼낸 젤리들. items: [{ slot, id }] */
export function JellyPlate({ moldId, colors, items = [], scale = 0.9, landing = true }) {
  return (
    <g>
      <ellipse cx="3" cy="16" rx="96" ry="14" fill="#7a4a24" opacity="0.14" />
      <g fill="#FFF4F7">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2
          return <circle key={i} cx={Math.cos(a) * 90} cy={4 + Math.sin(a) * 26} r="6.5" />
        })}
      </g>
      <ellipse cx="0" cy="4" rx="90" ry="26" fill="#FFF4F7" stroke="#F4C3CF" strokeWidth="2" />
      <ellipse cx="0" cy="6" rx="70" ry="17" fill="#FFFAFB" stroke="#F8D6DE" strokeWidth="1.4" strokeDasharray="3 4" />
      <path d="M-70,-6 C-56,-16 -30,-20 -6,-20" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
      {items.map((it, n) => {
        const p = PLATE_SPOTS[n] ?? PLATE_SPOTS[PLATE_SPOTS.length - 1]
        return (
          <g key={it.id} transform={`translate(${p.x} ${p.y - 6}) scale(${scale})`}>
            <g className={`plate-jelly ${landing ? 'is-landing' : ''}`} style={it.from ? { '--fx': `${it.from.x}px`, '--fy': `${it.from.y}px` } : undefined}>
              <ellipse cx="1" cy="17" rx="15" ry="3.5" fill="#7a4a24" opacity="0.14" />
              <g className="jelly-wobble">
                <JellyShape moldId={moldId} colors={colors} fill={1} set={1} />
              </g>
            </g>
          </g>
        )
      })}
    </g>
  )
}
