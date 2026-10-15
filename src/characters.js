/**
 * 캐릭터 이미지 설정 파일
 * ─────────────────────────────────────────────
 * 지금은 실제 캐릭터 파일이 없어서 emoji(임시 아이콘)가 표시됩니다.
 *
 * 페네핏 크루 캐릭터 PNG로 바꾸는 방법
 *   1) PNG 파일을 public/characters/ 폴더에 넣습니다.
 *      예) public/characters/crew-main.png
 *   2) 아래 image 값을 '/characters/파일이름.png' 로 바꿉니다.
 *      예) image: '/characters/crew-main.png'
 *   3) 저장하면 바로 화면에 반영됩니다. (코드의 다른 부분은 고칠 필요 없음)
 *
 * 이미지 경로가 틀리거나 파일이 없으면 자동으로 emoji가 다시 표시됩니다.
 * 배경이 투명한 PNG(정사각형, 512px 이상)를 권장합니다.
 */
/* ─────────────────────────────────────────────
 * 페네핏 크루 (실제 캐릭터 이미지)
 * ─────────────────────────────────────────────
 * 이미지 위치: public/assets/characters/
 * 각 PNG에는 [앞모습 · 옆모습 · 뒷모습 · 반대쪽 옆모습]이 가로로 나란히 있어요.
 * 원본 파일은 그대로 두고, 화면에서는 front 영역(앞모습)만 잘라서 보여 줍니다.
 *
 *   sheet : 원본 이미지 전체 크기 [가로, 세로] (px)
 *   front : 앞모습 영역 [x, y, 가로, 세로] (px, 원본 기준)
 *           → 이미지 픽셀을 분석해서 캐릭터 둘레에 10px 여유를 두고 정했어요.
 *
 * 이미지를 새로 그려서 교체할 때는 sheet와 front 값도 함께 고쳐 주세요.
 * (front 값이 틀리면 옆모습이 같이 보이거나 몸이 잘려 보여요)
 */
export const CREW = [
  {
    id: 'pene',
    name: '페네',
    species: '강아지',
    image: '/assets/characters/dog_brown.png',
    sheet: [1920, 644],
    front: [7, 33, 509, 605],
  },
  {
    id: 'sepsep',
    name: '셉셉이',
    species: '강아지',
    image: '/assets/characters/dog_cream.png',
    sheet: [1920, 669],
    front: [11, 34, 440, 617],
  },
  {
    id: 'pity',
    name: '피티',
    species: '고양이',
    image: '/assets/characters/cat_orange.png',
    sheet: [1920, 678],
    front: [30, 13, 451, 656],
  },
  {
    id: 'doldol',
    name: '돌돌이',
    species: '고양이',
    image: '/assets/characters/cat_black.png',
    sheet: [1920, 671],
    front: [11, 19, 503, 634],
    // 이 파일은 배경이 투명하지 않고 흰색이에요. 흰 카드 위에 올려서 자연스럽게 보이게 해요.
    // (투명 배경 PNG로 바꾸면 이 줄을 지워도 됩니다)
    whiteBackground: true,
  },
]

// 처음 게임을 켰을 때 선택되어 있는 크루
export const DEFAULT_CREW_ID = 'pene'

export const findCrew = (id) => CREW.find((c) => c.id === id) ?? CREW[0]

/* ─────────────────────────────────────────────
 * 아직 실제 이미지가 없는 자리 (임시 이모지)
 * 쿠키·멍푸치노·젤리 게임 화면 등에서 사용
 * ───────────────────────────────────────────── */
export const CHARACTERS = {
  // 메인 화면 상단에 크게 들어가는 캐릭터
  main: {
    name: '페네핏 크루',
    image: null,
    emoji: '🐶',
  },
  // 밥꾸 스튜디오 화면 상단의 작은 캐릭터
  bapkku: {
    name: '밥꾸 셰프',
    image: null,
    emoji: '🐶',
  },
  // 쿠키 베이커리 / 멍푸치노 카페 / 말랑젤리 연구소 화면의 캐릭터
  cookie: {
    name: '쿠키 셰프',
    image: null,
    emoji: '🐶',
  },
  cafe: {
    name: '카페 바리스타',
    image: null,
    emoji: '🐶',
  },
  jelly: {
    name: '젤리 연구원',
    image: null,
    emoji: '🐶',
  },
  // 완성 화면에서 축하해 주는 캐릭터
  cheer: {
    name: '축하하는 크루',
    image: null,
    emoji: '🎉',
  },
}
