import { useState } from 'react'
import { CHARACTERS } from '../characters.js'
import { assetUrl } from '../gameAssets.js'

/**
 * CharacterSlot — 캐릭터 이미지가 들어가는 자리
 *
 * - characters.js 에 image 경로가 있으면 그 PNG를 보여 줍니다.
 * - 경로가 없거나 이미지를 못 불러오면 emoji를 임시로 보여 줍니다.
 * - size: 'lg'(메인 화면), 'md', 'sm'(게임 헤더)
 * - showLabel: true면 "캐릭터 자리" 안내 문구를 함께 표시(이미지 교체 전용)
 */
function CharacterSlot({ characterId = 'main', size = 'md', showLabel = false }) {
  const character = CHARACTERS[characterId] ?? CHARACTERS.main
  const [failed, setFailed] = useState(false)

  // '/characters/a.png' 처럼 /로 시작하는 경로는 배포 경로(BASE_URL)를 붙여 줍니다.
  const src = assetUrl(character.image)

  const hasImage = src && !failed

  return (
    <div className={`character-slot character-slot--${size} ${hasImage ? 'has-image' : ''}`}>
      {hasImage ? (
        <img
          src={src}
          alt={character.name}
          className="character-slot__img"
          draggable="false"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <span className="character-slot__emoji" role="img" aria-label={character.name}>
            {character.emoji}
          </span>
          {showLabel && <span className="character-slot__label">Character</span>}
        </>
      )}
    </div>
  )
}

export default CharacterSlot
