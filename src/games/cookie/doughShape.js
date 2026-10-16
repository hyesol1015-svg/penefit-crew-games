import { SHEET } from './cookieData.js'

/**
 * doughShape.js — 반죽 모양 계산 도우미 (그림 없이 숫자만)
 */

/* 매번 같은 모양이 나오도록 고정된 '흔들림' 값 (반죽 가장자리 울퉁불퉁) */
const EDGE = Array.from({ length: 40 }, (_, i) => Math.sin(i * 12.9898) * 0.5 + Math.sin(i * 4.1414) * 0.5)
/* 반죽 속 파우더 알갱이 위치 (타원 안쪽, 0~1 비율) */
export const SPECKS = Array.from({ length: 46 }, (_, i) => {
  const a = i * 2.39996
  const r = Math.sqrt((i + 0.5) / 46) * 0.86
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 0.55 + ((i * 7) % 5) * 0.16, light: i % 3 === 0 }
})

/** 울퉁불퉁한 타원 경로 (부드러운 곡선) */
export function wobblyEllipse(cx, cy, rx, ry, wobble) {
  const n = EDGE.length
  const pts = EDGE.map((e, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 1 + e * wobble
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
  })
  // 점들을 지나는 부드러운 곡선 (Catmull-Rom → 베지어)
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return `${d}Z`
}

/** 반죽 크기: flat 0(동그란 덩어리) → 1(다 편 반죽) */
export function doughSize(flat) {
  const f = Math.min(Math.max(flat, 0), 1)
  const e = 1 - (1 - f) * (1 - f) // 처음엔 빨리, 나중엔 천천히 넓어져요
  return {
    rx: 50 + (SHEET.rx - 50) * e,
    ry: 36 + (SHEET.ry - 36) * e,
    thick: 15 - 11 * e, // 두께(옆면)
  }
}

