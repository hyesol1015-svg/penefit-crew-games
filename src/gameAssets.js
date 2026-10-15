/**
 * 게임 이미지 에셋 설정 파일
 * ─────────────────────────────────────────────
 * 고품질 이미지가 필요한 자리를 한곳에 모아 두었습니다.
 * 값이 null이면 지금처럼 CSS/SVG로 그린 임시 디자인이 보이고,
 * 경로를 넣으면 그 이미지로 바로 교체됩니다.
 *
 * 사용 방법
 *   1) 이미지 파일을 public/assets/ 폴더에 넣습니다.
 *   2) 아래 값을 '/assets/파일이름.png' 로 바꿉니다.
 *
 * ※ 캐릭터 이미지는 src/characters.js 에서 따로 설정합니다.
 * ※ 제품 사진은 원본 그대로(누끼 PNG) 넣어 주세요. 코드에서 모양을 바꾸지 않습니다.
 */
export const ASSETS = {
  // 주방 배경 일러스트 (세로형 권장, 1080×1920 이상)
  // 넣으면 CSS로 그린 벽지·조리대 대신 이 이미지가 깔립니다.
  kitchenBackground: null,

  // 브랜드 로고 (투명 PNG). 넣으면 'PENEFIT CREW' 글자 대신 로고가 보입니다.
  logo: null,

  // 게임 카드 썸네일 (정사각형 투명 PNG, 256px 이상)
  gameThumbs: {
    bapkku: null,
    cookie: null,
    cafe: null,
    jelly: null,
  },

  // 토퍼 파우더 제품 이미지 (정사각형 투명 PNG)
  // 넣으면 CSS로 그린 임시 병 대신 실제 제품 사진이 보입니다.
  toppers: {
    pumpkin: null,
    beet: null,
    broccoli: null,
  },
}

/**
 * '/assets/a.png' 처럼 /로 시작하는 경로에 배포 경로(BASE_URL)를 붙여 줍니다.
 * 다른 하위 경로에 배포해도 이미지가 깨지지 않게 하기 위함입니다.
 */
export function assetUrl(path) {
  if (!path) return null
  return path.startsWith('/') ? import.meta.env.BASE_URL + path.slice(1) : path
}
