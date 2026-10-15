/**
 * 밥꾸 스튜디오 — 게임 데이터와 계산 함수
 *
 * 화면(컴포넌트)과 분리해 두면 그릇 색이나 토퍼 종류를
 * 이 파일만 고쳐서 쉽게 늘릴 수 있습니다.
 */

/* ─────────────────────────────────────────────
 * 1. 사료 그릇 3종
 *    rim   : 그릇 테두리(윗면) 색
 *    body  : 그릇 몸통 색
 *    inner : 그릇 안쪽 벽 색
 *    dot   : 몸통에 찍힌 물방울 무늬 색
 * ───────────────────────────────────────────── */
export const BOWLS = [
  { id: 'cream', name: '크림', rim: '#FFF6E2', body: '#F6E2BB', inner: '#E9CFA0', dot: '#FFFFFF' },
  { id: 'pink', name: '핑크', rim: '#FFE3E8', body: '#F8BFCB', inner: '#E8A3B2', dot: '#FFF2F5' },
  { id: 'mint', name: '민트', rim: '#DDF5EA', body: '#AEE0CB', inner: '#8FCDB4', dot: '#F1FBF6' },
]

/* ─────────────────────────────────────────────
 * 2. 토퍼 파우더 3종
 *    colors : 알갱이 하나하나에 무작위로 섞이는 색 (같은 계열 3가지)
 * ───────────────────────────────────────────── */
export const TOPPERS = [
  { id: 'pumpkin', name: '단호박', colors: ['#F6B73C', '#F2A12E', '#FFCF6B'] },
  { id: 'beet', name: '비트', colors: ['#C8406E', '#D9628A', '#A8325A'] },
  { id: 'broccoli', name: '브로콜리', colors: ['#7DAE4F', '#94C266', '#5F9440'] },
]

/* ─────────────────────────────────────────────
 * 3. 사료가 담긴 영역 (SVG 좌표 기준 타원)
 *    Bowl.jsx 의 SVG viewBox(0 0 320 240) 안에서
 *    파우더가 떨어질 수 있는 범위입니다.
 * ───────────────────────────────────────────── */
export const FOOD_AREA = { cx: 160, cy: 96, rx: 106, ry: 27 }

// 그릇에 쌓일 수 있는 최대 알갱이 수 (너무 많으면 휴대폰이 느려져요)
export const MAX_PARTICLES = 900

/**
 * 점(x, y)이 사료 영역 바깥이면 영역 안쪽으로 끌어당긴 좌표를 돌려줍니다.
 * limit: 1이면 타원 경계, 0.9면 경계보다 살짝 안쪽
 */
export function clampIntoFood(x, y, limit = 0.9) {
  const { cx, cy, rx, ry } = FOOD_AREA
  const nx = (x - cx) / rx
  const ny = (y - cy) / ry
  const dist = Math.hypot(nx, ny) // 타원을 원으로 바꿨을 때 중심에서의 거리
  if (dist <= limit) return { x, y }
  const k = limit / dist
  return { x: cx + nx * k * rx, y: cy + ny * k * ry }
}

/**
 * 한 번 톡! 했을 때 뿌려지는 파우더 알갱이 묶음을 만듭니다.
 *
 * - 클릭 지점을 중심으로 작은 타원 범위에 흩어지게 배치
 *   (그릇을 비스듬히 위에서 보는 시점이라 세로 퍼짐을 줄였어요)
 * - 사료 영역 밖으로 나간 알갱이는 영역 안으로 다시 끌어옵니다.
 * - delay, fall 값은 CSS 애니메이션(떨어지는 연출)에 쓰입니다.
 */
export function createPowderBurst(center, topper, makeId) {
  const count = 12 + Math.floor(Math.random() * 6) // 12~17개
  const spread = 20

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const radius = spread * Math.sqrt(Math.random()) // 가운데가 더 촘촘하게
    const raw = {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius * 0.5,
    }
    const pos = clampIntoFood(raw.x, raw.y, 0.97)

    return {
      id: makeId(),
      topperId: topper.id,
      x: pos.x,
      y: pos.y,
      r: 1.6 + Math.random() * 2.0,
      color: topper.colors[Math.floor(Math.random() * topper.colors.length)],
      delay: Math.floor(Math.random() * 140),
      fall: 10 + Math.floor(Math.random() * 14),
    }
  })
}
