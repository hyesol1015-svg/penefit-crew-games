import { assetUrl } from '../gameAssets.js'

/**
 * CrewSprite — 캐릭터 시트에서 '앞모습'만 잘라 보여 주는 컴포넌트
 *
 * 원리 (원본 이미지는 전혀 바꾸지 않아요)
 *   1) 앞모습 영역과 같은 비율의 상자를 만들고 (aspect-ratio)
 *   2) 상자 밖으로 넘치는 부분은 숨긴 뒤 (overflow: hidden)
 *   3) 전체 시트 이미지를 크게 놓고 앞모습 위치만큼 옮겨서 보여 줘요.
 *   → 모든 값을 % 로 계산하기 때문에 상자 크기가 바뀌어도 비율이 깨지지 않아요.
 *
 * 크기는 부모(CSS)가 정해 줍니다. 상자는 너비 100%를 기본으로,
 * 높이는 aspect-ratio 로 자동 계산돼요. (높이 기준으로 맞추려면 CSS에서 height + width:auto)
 *
 * props
 *   crew      : characters.js 의 CREW 항목
 *   className : 추가 CSS 클래스
 */
function CrewSprite({ crew, className = '' }) {
  const [sheetW, sheetH] = crew.sheet
  const [x, y, w, h] = crew.front

  return (
    <span
      className={`crew-sprite ${crew.whiteBackground ? 'has-white-bg' : ''} ${className}`}
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      <img
        src={assetUrl(crew.image)}
        alt={`${crew.name} (${crew.species})`}
        draggable="false"
        style={{
          width: `${(sheetW / w) * 100}%`,
          height: `${(sheetH / h) * 100}%`,
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
        }}
      />
    </span>
  )
}

export default CrewSprite
