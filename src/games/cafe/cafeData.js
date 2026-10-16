import { BOWLS } from '../bapkku/bapkkuData.js'
import { FLAVORS, mixColor, icingPalette } from '../cookie/cookieData.js'

/**
 * cafeData.js — 멍푸치노 카페 데이터
 *
 * ★ 게임 속 가상 펫 음료예요. 실제 반려동물 음료 레시피나 급여 안내가 아니에요.
 *
 * 다른 게임 데이터를 최대한 재사용해요.
 *   - 컵 5색      : 밥꾸 스튜디오 그릇 색(BOWLS)과 같은 팔레트 (Cream · Pink · Mint · Lavender · Butter Yellow)
 *   - 맛 6종      : 실제 페네핏 파우더 6종 (쿠키 베이커리의 FLAVORS = 밥꾸의 TOPPERS)
 *   - 장식 색     : 쿠키 베이커리의 icingPalette (고른 맛과 어울리는 파스텔 4색)
 */

/* 단계 — done 은 완성 화면(덮개)을 여는 자리 */
export const STEPS = [
  { id: 'cup', label: 'Cup', title: 'Choose Cup', tip: 'Pick a cup color for your puppuccino.' },
  { id: 'flavor', label: 'Flavor', title: 'Choose Flavor', tip: 'Pick a PENEFIT powder flavor. The drink will turn that color.' },
  { id: 'mix', label: 'Mix', title: 'Mix & Pour', tip: 'Stir in circles to mix, then drag the pitcher over the cup to pour.' },
  { id: 'foam', label: 'Foam', title: 'Add Foam', tip: 'Hold and move the whisk over the cup. Swirl it for a swirly top!' },
  { id: 'decorate', label: 'Decorate', title: 'Decorate', tip: 'Pick a decoration, then tap the foam to add it.' },
  { id: 'done', label: 'Done', title: 'Finish', tip: 'Serve your puppuccino!' },
]

/* 컵 5색 (그릇과 같은 색 이름·팔레트) */
export const CUPS = BOWLS.map((b) => ({
  id: b.id,
  name: b.name,
  rim: b.rim,
  rimShade: b.rimShade,
  body: b.body,
  bodyLight: b.bodyLight,
  bodyShade: b.bodyShade,
  dot: b.dot,
  image: null, // 나중에 컵 PNG로 바꾸고 싶으면 경로를 넣으세요 (예: '/assets/cups/pink.png')
}))
export const DEFAULT_CUP_ID = CUPS[0].id

/* 맛 6종 (실제 페네핏 파우더) + 음료 색 */
const BASE = '#FFF1DC' // 음료 바탕색 (부드러운 크림색)
export const DRINKS = FLAVORS.map((f) => ({
  ...f,
  base: BASE,
  drink: mixColor(BASE, f.color, 0.68), // 다 섞인 음료 색
  drinkDeep: mixColor(mixColor(BASE, f.color, 0.68), '#5a3a28', 0.14), // 음료 아래쪽 그림자
}))
export const DEFAULT_DRINK_ID = DRINKS[0].id

export { mixColor, icingPalette }

/* 섞기·붓기·거품 기준 */
export const MIX_TURNS = 3 // 그릇 안에서 약 3바퀴 저으면 완성 (약 3초)
export const POUR_SECONDS = 2.4 // 피처를 컵 위에서 기울인 채 이만큼이면 가득
export const FOAM = {
  HOLD_RATE: 0.13, // 컵 위에서 누르고만 있어도 1초에 이만큼
  MOVE_RATE: 0.0013, // 컵 위에서 움직인 거리(SVG 단위)당 이만큼 → 자연스럽게 움직이면 약 2~3초
}

/* 장식 4종 — 그림은 쿠키 베이커리의 DecorArt.jsx 를 그대로 써요 */
export const DECORATIONS = [
  { id: 'paw', name: 'Paw Print' },
  { id: 'heart', name: 'Heart' },
  { id: 'star', name: 'Star' },
  { id: 'dots', name: 'Dots' },
]
export const MAX_DECORATIONS = 12

/* 컵 그림 크기 (컵 기준 좌표: 바닥 가운데가 0,0) */
export const CUP = {
  H: 118, // 컵 높이
  TOP: 52, // 위쪽 반폭
  BOTTOM: 40, // 아래쪽 반폭
  RIM_RY: 12, // 컵 입구 타원 세로 반지름
  FOAM_MAX: 46, // 거품 최대 높이
}

/** 거품 윗면 (장식이 올라가는 타원) — foam 0~1 */
export function foamTop(foam) {
  const h = 6 + CUP.FOAM_MAX * Math.min(Math.max(foam, 0), 1)
  return { cx: 0, cy: -CUP.H - h * 0.62, rx: CUP.TOP - 6 - (1 - foam) * 4, ry: 9 + h * 0.18, h }
}
