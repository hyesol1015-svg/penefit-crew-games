import { FLAVORS, CUTTERS, mixColor } from '../cookie/cookieData.js'

/**
 * jellyData.js — 말랑젤리 연구소(Gummy Lab) 데이터
 *
 * ★ 반려동물용 젤리 간식을 만드는 '게임 속 가상 레시피'예요.
 *   실제 급여 안전성이나 영양 효과를 보증하지 않아요.
 *   유해한 재료(자일리톨·초콜릿·포도·건포도·양파·마늘 등)는 게임에 넣지 않아요.
 *
 * 다른 게임 데이터를 최대한 재사용해요.
 *   - 맛 6종   : 실제 페네핏 파우더 6종 (쿠키 FLAVORS = 밥꾸 TOPPERS, 아이콘·이름·컬러명 그대로)
 *   - 몰드 모양 : 하트·별·강아지·고양이는 쿠키틀(CUTTERS) 모양 재사용 + 곰 모양 추가
 */

export const STEPS = [
  { id: 'flavor', label: 'Flavor', title: 'Choose Flavor', tip: 'Pick your first PENEFIT powder flavor. It sets the base color.' },
  { id: 'mix', label: 'Mix', title: 'Mix Jelly', tip: 'Pick a second flavor, then stir in circles to mix the colors.' },
  { id: 'mold', label: 'Mold', title: 'Choose Mold', tip: 'Pick a cute silicone mold shape for your gummies.' },
  { id: 'pour', label: 'Pour', title: 'Pour Jelly', tip: 'Drag the beaker over each mold to fill it up.' },
  { id: 'set', label: 'Set', title: 'Set Jelly', tip: 'Hold the chill wand over each jelly to help it set.' },
  { id: 'pop', label: 'Pop', title: 'Pop It Out', tip: 'Tap or drag up each gummy to pop it onto the plate.' },
  { id: 'done', label: 'Done', title: 'Finish', tip: 'Enjoy your wobbly gummies!' },
]

/* 맛 6종 (실제 페네핏 파우더) */
export { FLAVORS }
export const DEFAULT_FLAVOR_ID = FLAVORS[0].id

/** 두 맛을 섞은 젤리 색 (같은 맛을 두 번 골라도 괜찮아요) */
export function jellyColors(f1, f2) {
  const base = mixColor(f1.color, f2.color, 0.5)
  return {
    base,
    light: mixColor(base, '#ffffff', 0.5),
    mid: mixColor(base, '#ffffff', 0.18),
    deep: mixColor(base, '#4a2f45', 0.28),
    edge: mixColor(base, '#4a2f45', 0.42),
  }
}

/* 몰드 5종 — path: 가운데 0,0 / 지름 약 38 (쿠키틀과 같은 크기) */
const fromCutter = (id) => CUTTERS.find((c) => c.id === id)
export const MOLDS = [
  {
    id: 'bear',
    name: 'Bear',
    image: null,
    path: 'M-10.5,-12.5 C-12,-20.5 -23,-20 -21.5,-11 C-21,-8.5 -19.5,-7 -18,-6.5 C-20.5,-1 -20.5,6 -16.5,11 C-12,16.5 -6,18 0,18 C6,18 12,16.5 16.5,11 C20.5,6 20.5,-1 18,-6.5 C19.5,-7 21,-8.5 21.5,-11 C23,-20 12,-20.5 10.5,-12.5 C4,-15.5 -4,-15.5 -10.5,-12.5Z',
    details: [
      { type: 'dot', x: -6, y: -1, r: 1.8 },
      { type: 'dot', x: 6, y: -1, r: 1.8 },
      { type: 'ellipse', x: 0, y: 7, rx: 6, ry: 4.4, rot: 0 },
      { type: 'path', d: 'M-1.8,5.6 L1.8,5.6 L0,7.6Z', fill: true },
    ],
  },
  { id: 'heart', name: 'Heart', image: null, path: fromCutter('heart').path, details: fromCutter('heart').details },
  { id: 'star', name: 'Star', image: null, path: fromCutter('star').path, details: fromCutter('star').details },
  { id: 'dog', name: 'Dog', image: null, path: fromCutter('dog').path, details: fromCutter('dog').details },
  { id: 'cat', name: 'Cat', image: null, path: fromCutter('cat').path, details: fromCutter('cat').details },
]
export const DEFAULT_MOLD_ID = MOLDS[0].id

/* 젤리 트레이: 한 번에 6개 (2줄 × 3칸) — viewBox 0 0 320 260 기준 */
export const SLOTS = [
  { x: 92, y: 158 },
  { x: 160, y: 158 },
  { x: 228, y: 158 },
  { x: 92, y: 212 },
  { x: 160, y: 212 },
  { x: 228, y: 212 },
]
export const SLOT_SCALE = 1.12

/* 접시 위 젤리 자리 (최대 6개: 뒷줄 3개 → 앞줄 3개 순서로 차곡차곡) */
export const PLATE_SPOTS = [
  { x: -46, y: -12 },
  { x: 0, y: -13 },
  { x: 46, y: -12 },
  { x: -46, y: 11 },
  { x: 0, y: 12 },
  { x: 46, y: 11 },
]

/* 플레이 기준 */
export const MIX_TURNS = 3 // 약 3바퀴 저으면 색이 고르게 섞여요 (약 3초)
export const POUR_SECONDS_PER_SLOT = 0.45 // 한 칸이 차는 시간 → 6칸 약 3초
export const SET_SECONDS_PER_SLOT = 0.7 // 차가운 지팡이를 대고 있으면 한 칸이 굳는 시간 → 약 4~5초
export const SET_TAP = 0.25 // 톡 누를 때마다 굳는 양

export { mixColor }
