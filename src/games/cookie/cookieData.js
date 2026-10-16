import { TOPPERS } from '../bapkku/bapkkuData.js'

/**
 * cookieData.js — 쿠키 베이커리 데이터 모음
 *
 * ★ 게임용 가상 레시피예요. 실제 반려동물 쿠키 레시피나 급여 정보가 아니에요.
 *
 *  1. STEPS      : 단계 목록 (Flavor → Mix → Roll → Cut → Bake 준비 화면)
 *  2. FLAVORS    : 반죽 맛 = 밥꾸 스튜디오의 실제 페네핏 파우더 6종(TOPPERS)을 그대로 재사용
 *  3. 반죽 색     : 맛 색 + 밀가루 크림색을 섞어서 만들어요
 *  4. 섞기·밀기 기준
 *  5. CUTTERS    : 쿠키틀 5종 (Dog, Cat, Paw, Heart, Star) — 임시 SVG 모양
 */

/* ─────────────────────────────────────────────
 * 1. 단계
 *    ready 는 '굽기 준비' 화면이에요. 굽기·꾸미기·완성은 다음 작업에서 만들어요.
 * ───────────────────────────────────────────── */
export const STEPS = [
  { id: 'flavor', label: 'Flavor', title: 'Choose Flavor', tip: 'Pick a powder flavor. Your dough will turn that color.' },
  { id: 'mix', label: 'Mix', title: 'Mix Dough', tip: 'Stir in circles inside the bowl until the dough comes together.' },
  { id: 'roll', label: 'Roll', title: 'Roll Dough', tip: 'Drag the rolling pin up and down over the dough to flatten it.' },
  { id: 'cut', label: 'Cut', title: 'Cut Shapes', tip: 'Pick a cookie cutter and tap the dough to cut cute shapes.' },
  { id: 'ready', label: 'Ready', title: 'Ready to Bake', tip: 'Your cookies are on the tray. Baking is coming soon!' },
]

/* 다음 작업에서 만들 단계 (지금은 'Coming soon' 으로만 보여요) */
export const COMING_STEPS = ['Bake', 'Decorate', 'Finish']

/* ─────────────────────────────────────────────
 * 2. 반죽 맛 — 밥꾸 스튜디오의 파우더 데이터(TOPPERS)를 그대로 써요
 *    (이름·컬러명·색·아이콘 경로가 한 곳에서 관리돼요)
 *    아래 순서는 쿠키 게임에서 보여 줄 순서예요.
 * ───────────────────────────────────────────── */
const FLAVOR_ORDER = ['pumpkin', 'broccoli', 'beetroot', 'psyllium', 'chlorella', 'purpleSweetPotato']

/* ─────────────────────────────────────────────
 * 3. 반죽 색 만들기
 * ───────────────────────────────────────────── */
const FLOUR = '#F4E1BC' // 밀가루(크림색)

function toRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function toHex(rgb) {
  return `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`
}
/** 두 색 섞기 (t=0 이면 a, t=1 이면 b) */
export function mixColor(a, b, t) {
  const A = toRgb(a)
  const B = toRgb(b)
  return toHex(A.map((c, i) => c + (B[i] - c) * t))
}
const shade = (hex, t) => mixColor(hex, t > 0 ? '#ffffff' : '#000000', Math.abs(t))

export const FLAVORS = FLAVOR_ORDER.map((id) => TOPPERS.find((t) => t.id === id))
  .filter(Boolean)
  .map((t) => {
    const dough = mixColor(FLOUR, t.color, 0.62) // 반죽 윗면
    return {
      ...t,
      flour: FLOUR,
      dough,
      doughLight: shade(dough, 0.32), // 반짝이는 부분
      doughSide: shade(dough, -0.16), // 반죽 옆면(두께)
      doughLine: shade(dough, -0.3), // 쿠키틀 자국·무늬
      speck: shade(t.color, -0.22), // 반죽 속 파우더 알갱이
    }
  })

export const DEFAULT_FLAVOR_ID = FLAVORS[0].id

/* ─────────────────────────────────────────────
 * 4. 섞기·밀기 기준
 *    MIX_TURNS : 그릇 안에서 몇 바퀴 저으면 반죽이 완성되는지
 *                (손가락으로 한 바퀴 ≈ 0.8~1초 → 약 3~4초)
 *    ROLL_PASSES : 밀대로 몇 번 밀면 반죽이 다 펴지는지
 *    ROLL_PASS_DISTANCE : 밀대를 반죽 위로 이만큼(SVG 단위) 움직이면 '한 번 밀기'
 * ───────────────────────────────────────────── */
export const MIX_TURNS = 3
export const ROLL_PASSES = 4
export const ROLL_PASS_DISTANCE = 50

/* ─────────────────────────────────────────────
 * 5. 쿠키틀 5종
 *    path    : 쿠키 외곽선 (가운데가 0,0 / 지름 약 38)
 *    details : 쿠키 위에 눌린 무늬 (눈·코·발바닥 등). 반죽 색보다 진한 선으로 그려요.
 *    image   : 나중에 PNG로 바꾸고 싶으면 경로를 넣으세요 (예: '/assets/cookies/dog.png')
 * ───────────────────────────────────────────── */
function starPath(R, r, points = 5) {
  const pts = []
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? R : r
    const a = -Math.PI / 2 + (i * Math.PI) / points
    pts.push(`${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad + 1.5).toFixed(2)}`)
  }
  return `M${pts.join(' L')}Z`
}

export const CUTTERS = [
  {
    id: 'dog',
    name: 'Dog',
    image: null,
    path: 'M-9,-15 C-4,-18 4,-18 9,-15 C13,-17.5 19.5,-15.5 20.5,-9 C21.5,-2.5 19.5,4.5 15,6.5 C14,12.5 8,17.5 0,17.5 C-8,17.5 -14,12.5 -15,6.5 C-19.5,4.5 -21.5,-2.5 -20.5,-9 C-19.5,-15.5 -13,-17.5 -9,-15Z',
    details: [
      { type: 'dot', x: -5.5, y: 0, r: 1.8 },
      { type: 'dot', x: 5.5, y: 0, r: 1.8 },
      { type: 'path', d: 'M-2.6,6 Q0,8.6 2.6,6 Q0,4.4 -2.6,6Z', fill: true },
      { type: 'path', d: 'M0,8 L0,10.5 M-3,11.5 Q0,13.5 3,11.5' },
      { type: 'path', d: 'M-15.5,-8 C-14.5,-4 -14,0 -15,4 M15.5,-8 C14.5,-4 14,0 15,4' },
    ],
  },
  {
    id: 'cat',
    name: 'Cat',
    image: null,
    path: 'M-16.5,-1 L-15.5,-19 C-15.3,-20.3 -14.2,-20.6 -13.2,-19.9 L-6.5,-12 C-2.3,-13.4 2.3,-13.4 6.5,-12 L13.2,-19.9 C14.2,-20.6 15.3,-20.3 15.5,-19 L16.5,-1 C17.5,9.5 9.5,16.5 0,16.5 C-9.5,16.5 -17.5,9.5 -16.5,-1Z',
    details: [
      { type: 'path', d: 'M-8,0 Q-5.5,-2.6 -3,0 M3,0 Q5.5,-2.6 8,0' },
      { type: 'path', d: 'M-2.2,4.6 L2.2,4.6 L0,7Z', fill: true },
      { type: 'path', d: 'M0,7 Q-1.5,9.5 -4,9 M0,7 Q1.5,9.5 4,9' },
      { type: 'path', d: 'M-7,6 L-14,5 M-7,8 L-13.5,9.5 M7,6 L14,5 M7,8 L13.5,9.5' },
    ],
  },
  {
    id: 'paw',
    name: 'Paw',
    image: null,
    path: 'M0,17 C-5,17 -8,19 -12,17 C-16,15 -15.5,9 -13,6 C-17,6 -19.5,1 -18.5,-3 C-17.5,-8 -12.5,-9.5 -10,-6.5 C-11,-11.5 -9,-17.5 -4.5,-17.5 C-1.3,-17.5 0,-14.5 0,-12.5 C0,-14.5 1.3,-17.5 4.5,-17.5 C9,-17.5 11,-11.5 10,-6.5 C12.5,-9.5 17.5,-8 18.5,-3 C19.5,1 17,6 13,6 C15.5,9 16,15 12,17 C8,19 5,17 0,17Z',
    details: [
      { type: 'path', d: 'M0,2 C5,2 8.5,6 8.5,9.5 C8.5,12.5 6,13.5 3.5,12.8 C2,12.4 1,12 0,12 C-1,12 -2,12.4 -3.5,12.8 C-6,13.5 -8.5,12.5 -8.5,9.5 C-8.5,6 -5,2 0,2Z' },
      { type: 'ellipse', x: -11.5, y: -1, rx: 2.8, ry: 3.6, rot: -25 },
      { type: 'ellipse', x: -4.6, y: -9.5, rx: 2.9, ry: 3.9, rot: -8 },
      { type: 'ellipse', x: 4.6, y: -9.5, rx: 2.9, ry: 3.9, rot: 8 },
      { type: 'ellipse', x: 11.5, y: -1, rx: 2.8, ry: 3.6, rot: 25 },
    ],
  },
  {
    id: 'heart',
    name: 'Heart',
    image: null,
    path: 'M0,17 C-4,13 -19.5,4.5 -19.5,-6 C-19.5,-14 -12.5,-18.5 -6.5,-17.5 C-3.2,-17 -1,-14.5 0,-11.5 C1,-14.5 3.2,-17 6.5,-17.5 C12.5,-18.5 19.5,-14 19.5,-6 C19.5,4.5 4,13 0,17Z',
    details: [{ type: 'path', d: 'M-12,-9 C-12,-12.5 -9,-13.5 -6.5,-13' }],
  },
  {
    id: 'star',
    name: 'Star',
    image: null,
    path: starPath(20, 9.2),
    details: [{ type: 'dot', x: 0, y: 1.5, r: 1.6 }],
  },
]

export const DEFAULT_CUTTER_ID = CUTTERS[0].id

/* ─────────────────────────────────────────────
 * 6. 반죽판·쿠키 배치
 *    SVG viewBox(0 0 320 220) 기준. 다 민 반죽은 SHEET 크기의 타원이에요.
 * ───────────────────────────────────────────── */
export const SHEET = { cx: 160, cy: 112, rx: 122, ry: 76 }
export const COOKIE_R = 19 // 쿠키 반지름 (겹침 판단용)
export const MAX_COOKIES = 10
export const MIN_COOKIES = 1 // 이만큼만 찍어도 다음으로 갈 수 있어요

/** 반죽 위 (x, y)에 쿠키를 놓을 수 있는지: 반죽 안쪽 + 다른 쿠키와 많이 겹치지 않기 */
export function canPlaceCookie(x, y, cookies) {
  const nx = (x - SHEET.cx) / (SHEET.rx - COOKIE_R * 0.95)
  const ny = (y - SHEET.cy) / (SHEET.ry - COOKIE_R * 0.9)
  if (nx * nx + ny * ny > 1) return false
  return cookies.every((c) => Math.hypot(c.x - x, c.y - y) >= COOKIE_R * 1.82)
}

/** 누른 자리가 살짝 겹치면 가까운 빈자리를 찾아 줘요 (못 찾으면 null) */
export function findCookieSpot(x, y, cookies) {
  if (canPlaceCookie(x, y, cookies)) return { x, y }
  for (let dist = 4; dist <= 22; dist += 3) {
    for (let k = 0; k < 12; k += 1) {
      const a = (k / 12) * Math.PI * 2
      const px = x + Math.cos(a) * dist
      const py = y + Math.sin(a) * dist
      if (canPlaceCookie(px, py, cookies)) return { x: px, y: py }
    }
  }
  return null
}
