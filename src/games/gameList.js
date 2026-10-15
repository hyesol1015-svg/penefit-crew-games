/**
 * 메인 화면에 보이는 게임 카드 목록
 *
 * status
 *   'play' → 눌러서 플레이 가능
 *   'soon' → Coming Soon (눌러도 안내 메시지만 표시)
 * theme  → 카드 배경색 (styles/main.css 의 .game-card--테마이름)
 * emoji  → 임시 아이콘. 나중에 아이콘 이미지로 바꿔도 됩니다.
 *
 * 새 게임을 열 때는 status를 'play'로 바꾸고, App.jsx 에 화면을 연결하세요.
 */
export const GAMES = [
  {
    id: 'bapkku',
    title: '밥꾸 스튜디오',
    desc: '사료 그릇에 토퍼를 솔솔 뿌려 꾸며요',
    emoji: '🍚',
    theme: 'peach',
    status: 'play',
  },
  {
    id: 'cookie',
    title: '쿠키 베이커리',
    desc: '바삭바삭 강아지 쿠키 굽기',
    emoji: '🍪',
    theme: 'butter',
    status: 'soon',
  },
  {
    id: 'cafe',
    title: '멍푸치노 카페',
    desc: '폭신한 멍푸치노 한 잔',
    emoji: '☕',
    theme: 'cream',
    status: 'soon',
  },
  {
    id: 'jelly',
    title: '말랑젤리 연구소',
    desc: '말랑말랑 젤리 실험실',
    emoji: '🍮',
    theme: 'mint',
    status: 'soon',
  },
]
