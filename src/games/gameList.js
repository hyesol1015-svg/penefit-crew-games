/**
 * 메인 화면에 보이는 게임 카드 목록 (데이터)
 *
 * id       → 게임 화면을 찾는 열쇠 (games/index.js 의 GAME_SCREENS 와 같아야 함)
 * theme    → 카드 배경색 (styles/main.css 의 .game-card--테마이름)
 * emoji    → 임시 아이콘. gameAssets.js 의 gameThumbs 에 이미지를 넣으면 교체됩니다.
 * audience → 카드에 붙는 작은 표시 (펫용 / 사람용 구분)
 *
 * 카드 순서를 바꾸고 싶으면 이 배열의 순서만 바꾸면 됩니다.
 */
export const GAMES = [
  {
    id: 'bapkku',
    title: '밥꾸 스튜디오',
    desc: '그릇에 사료를 담고 토퍼로 예쁘게 꾸며요',
    emoji: '🍚',
    theme: 'peach',
    audience: '펫 밥상',
  },
  {
    id: 'cookie',
    title: '쿠키 베이커리',
    desc: '반죽부터 굽기, 아이싱까지 쿠키 만들기',
    emoji: '🍪',
    theme: 'butter',
    audience: '펫 간식',
  },
  {
    id: 'cafe',
    title: '멍푸치노 카페',
    desc: '컵을 고르고 폭신한 멍푸치노 서빙하기',
    emoji: '☕',
    theme: 'cream',
    audience: '펫 음료',
  },
  {
    id: 'jelly',
    title: '말랑젤리 연구소',
    desc: '색을 섞고 몰드에 부어 말랑 젤리 완성',
    emoji: '🍮',
    theme: 'mint',
    // 이 게임은 사람용 디저트 놀이 콘셉트입니다. (펫 식품과 구분)
    audience: '사람용 디저트',
  },
]
