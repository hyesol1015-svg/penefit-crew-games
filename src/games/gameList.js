/**
 * 메인 화면에 보이는 게임 카드 목록 (데이터)
 *
 * id       → 게임 화면을 찾는 열쇠 (games/index.js 의 GAME_SCREENS 와 같아야 함)
 * theme    → 카드 배경색 (styles/main.css 의 .game-card--테마이름)
 * emoji    → 임시 아이콘. gameAssets.js 의 gameThumbs 에 이미지를 넣으면 교체됩니다.
 * audience → 카드에 붙는 작은 표시 (어떤 펫 메뉴인지)
 *
 * 카드 순서를 바꾸고 싶으면 이 배열의 순서만 바꾸면 됩니다.
 */
export const GAMES = [
  {
    id: 'bapkku',
    title: 'Bowl Decorating Studio',
    desc: 'Fill a bowl and top it with yummy powders',
    emoji: '🍚',
    theme: 'peach',
    audience: 'Pet Meal',
  },
  {
    id: 'cookie',
    title: 'Cookie Bakery',
    desc: 'Mix, bake and ice cute pet cookies',
    emoji: '🍪',
    theme: 'butter',
    audience: 'Pet Treat',
  },
  {
    id: 'cafe',
    title: 'Puppuccino Café',
    desc: 'Pick a cup and serve a fluffy puppuccino',
    emoji: '☕',
    theme: 'cream',
    audience: 'Pet Drink',
  },
  {
    id: 'jelly',
    title: 'Gummy Lab',
    desc: 'Make squishy pet gummies in cute molds',
    emoji: '🍮',
    theme: 'mint',
    // 반려동물용 젤리 간식을 만드는 게임입니다. (무가당 재료 콘셉트)
    audience: 'Pet Gummy',
  },
]
