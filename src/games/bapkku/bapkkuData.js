/**
 * 밥꾸 스튜디오 — 게임 데이터와 계산 함수
 *
 * 화면(컴포넌트)과 분리해 두면 그릇 색이나 토퍼 종류를
 * 이 파일만 고쳐서 쉽게 늘릴 수 있습니다.
 */

/* ─────────────────────────────────────────────
 * 1. 사료 그릇 3종
 *    입체감을 위해 같은 색 계열을 밝은색(Light)·기본·그림자색(Shade)으로 나눴어요.
 *    rim   : 그릇 테두리(윗면)      body  : 그릇 몸통
 *    inner : 그릇 안쪽 벽           dot   : 몸통의 물방울 무늬
 * ───────────────────────────────────────────── */
export const BOWLS = [
  {
    id: 'cream',
    name: 'Cream',
    rim: '#FFF9EC',
    rimShade: '#F0DAB0',
    body: '#F6E2BB',
    bodyLight: '#FFF4DE',
    bodyShade: '#D8BB87',
    inner: '#EBD3A8',
    innerShade: '#C7A46E',
    dot: '#FFFFFF',
  },
  {
    id: 'pink',
    name: 'Pink',
    rim: '#FFEDF1',
    rimShade: '#F2BFCB',
    body: '#F8BFCB',
    bodyLight: '#FFDDE4',
    bodyShade: '#DB93A5',
    inner: '#EDB2C0',
    innerShade: '#C98093',
    dot: '#FFF5F7',
  },
  {
    id: 'mint',
    name: 'Mint',
    rim: '#EAF9F2',
    rimShade: '#B6E1CD',
    body: '#AEE0CB',
    bodyLight: '#D4F2E5',
    bodyShade: '#80BFA4',
    inner: '#9DD4BC',
    innerShade: '#6CAA8F',
    dot: '#F3FBF7',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    rim: '#F7F2FF',
    rimShade: '#D8CBF1',
    body: '#D6C8F0',
    bodyLight: '#EEE7FF',
    bodyShade: '#AE9CD6',
    inner: '#C7B6E8',
    innerShade: '#9A86C6',
    dot: '#FBF9FF',
  },
  {
    id: 'butter',
    name: 'Butter Yellow',
    rim: '#FFF9DE',
    rimShade: '#F4DA8E',
    body: '#FFDF8C',
    bodyLight: '#FFF0BF',
    bodyShade: '#E3B655',
    inner: '#F2CF7C',
    innerShade: '#CFA34B',
    dot: '#FFFDF3',
  },
]

/* ─────────────────────────────────────────────
 * 게임 진행 단계
 *   그릇 선택 → 사료 담기 → 파우더 뿌리기 → 토핑 꾸미기 → 완성
 *   tip: 노트북 화면 왼쪽 '레시피 카드'에 보이는 설명
 * ───────────────────────────────────────────── */
export const STEPS = [
  { id: 'bowl', label: 'Bowl', tip: 'Pick a bowl you love. It goes right onto the counter.' },
  { id: 'food', label: 'Food', tip: 'Drag the scoop to the bowl, or tap it, until the bowl is full.' },
  { id: 'powder', label: 'Powder', tip: 'Pick a powder, drag the shaker over the bowl and give it a shake. Mix as many as you like!' },
  { id: 'topping', label: 'Toppings', tip: 'Add yummy toppings to decorate your bowl.' },
  { id: 'done', label: 'Done', tip: 'Check out your finished bowl!' },
]

// 그릇을 가득 채우는 데 필요한 스쿱 수
export const SCOOPS_TO_FILL = 4

/* ─────────────────────────────────────────────
 * 2. 토퍼 파우더 6종 — 실제 PENEFIT Palette Powder 구성
 *
 *    ★ 파우더를 바꾸거나 색을 조정할 때는 이 배열만 고치면 됩니다.
 *
 *    name      : 화면에 보이는 제품명 (영어)
 *    colorName : 영문 컬러명 (선택 카드·파우더 통 라벨에 표시)
 *    color     : 게임용 참고 색상. 실제 제품 사진과 비교해서 나중에 조정하세요.
 *                → 떨어지는 가루 색(밝은색·어두운색 섞임)은 이 색에서 자동으로 만들어져요.
 *    icon      : 파우더 아이콘 경로 (선택 카드 + 파우더 통 라벨에 표시)
 *                파일은 public/assets/powders/ 에. 없거나 못 불러오면 기존 임시 그림으로 표시돼요.
 *    image     : 실제 제품 이미지 경로 (없으면 null → 임시 파우더 통 그림 사용)
 *                예) '/assets/toppers/beetroot.png'  (파일은 public/assets/toppers/ 에)
 *                세로형 누끼 PNG(약 8:11), 뚜껑이 위쪽이면 가장 자연스러워요.
 *    grain     : 가루 질감 — 'powder'(고운 가루) / 'flake'(얇은 조각) / 'grain'(굵은 알갱이)
 *    size      : 알갱이 크기 범위 [최소, 최대] (SVG 단위)
 *    opacity   : 알갱이 투명도 범위 [최소, 최대]
 *    density   : 한 번 뿌릴 때 나오는 양의 배율
 * ───────────────────────────────────────────── */
const TOPPER_DATA = [
  {
    id: 'beetroot',
    name: 'Beetroot',
    colorName: 'RED',
    color: '#CE829A',
    icon: '/assets/powders/beetroot.png',
    image: null,
    grain: 'powder',
    size: [0.8, 1.6],
    opacity: [0.75, 1],
    density: 1.05,
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    colorName: 'GREEN',
    color: '#A8C97D',
    icon: '/assets/powders/broccoli.png',
    image: null,
    grain: 'flake',
    size: [1, 1.9],
    opacity: [0.75, 1],
    density: 0.85,
  },
  {
    id: 'pumpkin',
    name: 'Sweet Pumpkin',
    colorName: 'YELLOW',
    color: '#F0D16E',
    icon: '/assets/powders/sweet_pumpkin.png',
    image: null,
    grain: 'powder',
    size: [0.9, 1.8],
    opacity: [0.8, 1],
    density: 1,
  },
  {
    id: 'psyllium',
    name: 'Psyllium Husk',
    colorName: 'BEIGE',
    color: '#DCC693',
    icon: '/assets/powders/psyllium_husk.png',
    image: null,
    grain: 'flake',
    size: [0.9, 1.9],
    opacity: [0.75, 1],
    density: 0.85,
  },
  {
    id: 'chlorella',
    name: 'Chlorella',
    colorName: 'DEEP GREEN',
    color: '#689F63',
    icon: '/assets/powders/chlorella.png',
    image: null,
    grain: 'powder',
    size: [0.7, 1.5],
    opacity: [0.7, 0.95],
    density: 1.1,
  },
  {
    id: 'purpleSweetPotato',
    name: 'Purple Sweet Potato',
    colorName: 'PURPLE',
    color: '#B997BD',
    icon: '/assets/powders/purple_sweet_potato.png',
    image: null,
    grain: 'powder',
    size: [0.85, 1.7],
    opacity: [0.75, 1],
    density: 1,
  },
]

/* 참고 색상 하나로 밝은색·어두운색을 만들어 주는 도우미 (색 조정은 color 한 곳만!) */
function mix(hex, target, amount) {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const out = ch.map((c) => Math.round(c + (target - c) * amount))
  return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

export const TOPPERS = TOPPER_DATA.map((t) => ({
  ...t,
  // 떨어지는 가루 색: [기본, 조금 밝게, 조금 어둡게, 더 밝게]
  colors: [t.color, mix(t.color, 255, 0.18), mix(t.color, 0, 0.14), mix(t.color, 255, 0.34)],
  // 파우더 통 라벨 색 (기본 색보다 살짝 진하게 해서 글자가 잘 보이게)
  label: mix(t.color, 0, 0.08),
}))

/* ─────────────────────────────────────────────
 * 3. 사료가 담긴 영역 (SVG 좌표 기준 타원)
 *    Bowl.jsx 의 SVG viewBox(0 0 320 240) 안에서
 *    파우더가 떨어질 수 있는 범위입니다.
 * ───────────────────────────────────────────── */
export const FOOD_AREA = { cx: 160, cy: 90, rx: 104, ry: 25 }

// 그릇에 쌓일 수 있는 최대 알갱이 수 (너무 많으면 휴대폰이 느려져요)
export const MAX_PARTICLES = 2200

// 다음 단계로 가려면 최소 이만큼은 뿌려야 해요
export const POWDER_MIN = 80

/* ─────────────────────────────────────────────
 * 4. 별점 기준 (토핑 게이지)
 *    알갱이 수가 기준을 넘을 때마다 별이 하나씩 켜져요.
 *    GOAL은 게이지가 가득 차는 알갱이 수입니다.
 * ───────────────────────────────────────────── */
export const STAR_STEPS = [POWDER_MIN, 400, 800]
export const GOAL = 1000

export function getStars(count) {
  return STAR_STEPS.filter((step) => count >= step).length
}

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

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

/**
 * 파우더 한 줌(burst)을 만듭니다.
 *
 * spout   : 가루가 나오는 곳 (파우더 통 입구, SVG 좌표)
 * landing : 가루가 떨어질 사료 위 지점 (SVG 좌표)
 * amount  : 뿌리는 세기 (통을 많이 흔들수록 커짐)
 *
 * 알갱이마다
 *   x, y        : 사료 위에 내려앉을 최종 위치 (사료 영역 밖이면 안쪽으로 끌어옴)
 *   dx, dy      : 통 입구에서 출발하기 위한 시작 위치 차이 → '떨어지는' 애니메이션
 *   r / rx, ry  : 크기 (flake 질감은 납작한 조각)
 *   opacity     : 투명도 (조금씩 다르게)
 */
export function createPowderBurst({ spout, landing, topper, amount, makeId, stroke }) {
  const height = Math.max(landing.y - spout.y, 24) // 떨어지는 높이
  const spread = 8 + height * 0.1 // 높이서 뿌릴수록 넓게 퍼져요
  const count = Math.max(3, Math.round(amount * 3 * topper.density))

  const particles = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const radius = spread * Math.sqrt(Math.random()) // 가운데가 더 촘촘하게
    const pos = clampIntoFood(
      landing.x + Math.cos(angle) * radius,
      landing.y + Math.sin(angle) * radius * 0.5, // 비스듬히 보는 시점이라 세로는 좁게
      0.97,
    )
    const r = rand(topper.size[0], topper.size[1])
    const flake = topper.grain === 'flake'
    return {
      id: makeId(),
      x: pos.x,
      y: pos.y,
      r,
      rx: flake ? r * 1.7 : r,
      ry: flake ? r * 0.75 : r,
      rot: Math.round(rand(0, 180)),
      color: pick(topper.colors),
      opacity: rand(topper.opacity[0], topper.opacity[1]),
      dx: spout.x - pos.x + rand(-2.5, 2.5),
      dy: spout.y - pos.y,
      delay: Math.round(rand(0, 70)),
      dur: Math.round(260 + height * 2.1 + rand(0, 120)),
    }
  })

  return {
    id: makeId(),
    stroke, // 같은 '한 번의 동작'에서 나온 묶음끼리 같은 번호 → 되돌리기 단위
    topperId: topper.id,
    color: topper.colors[0],
    landing,
    // 가루가 내려앉은 자리에 생기는 옅은 '가루 막' 크기 → 쌓인 느낌
    film: { rx: spread * 1.15, ry: spread * 0.5 },
    particles,
  }
}
