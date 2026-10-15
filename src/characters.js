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
