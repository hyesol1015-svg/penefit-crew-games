import { useId } from 'react'
import { assetUrl } from '../../gameAssets.js'

/**
 * PowderJar — 파우더 토퍼 통 그림 (임시 디자인)
 *
 * 귀여운 펫 토퍼 패키지 '느낌'만 낸 임시 그림입니다.
 * 실제 브랜드 로고나 실제 제품 패키지를 따라 그리지 않았어요.
 *   - 크림색 뚜껑 + 가루가 나오는 구멍
 *   - 파우더 색 라벨에 제품명 + 영문 컬러명
 *   - 아래쪽 투명 창으로 보이는 가루
 *
 * bapkkuData.js 의 TOPPERS 항목에 image 경로를 넣으면
 * 이 그림 대신 실제 제품 PNG를 그대로(비율 유지) 보여 줍니다.
 *
 * props
 *   topper : TOPPERS 중 하나
 *   small  : 선택 버튼 안에 들어가는 작은 크기 (글자 생략)
 */
// 라벨 색이 밝으면 진한 글씨, 어두우면 흰 글씨
function textColorOn(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 175 ? '#5A4232' : '#FFFFFF'
}

// 긴 제품명은 두 줄로 나눠요 (예: Purple Sweet / Potato)
function splitName(name) {
  const words = name.split(' ')
  if (words.length < 2) return [name]
  if (words.length === 2) return words
  return [words.slice(0, -1).join(' '), words[words.length - 1]]
}

function PowderJar({ topper, small = false }) {
  const uid = `j${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const productImage = assetUrl(topper.image)

  if (productImage) {
    return (
      <img
        className="powder-jar__img"
        src={productImage}
        alt={`${topper.name} (${topper.colorName}) powder`}
        draggable="false"
      />
    )
  }

  const ink = textColorOn(topper.label)
  const lines = splitName(topper.name)
  const longest = Math.max(...lines.map((l) => l.length))
  const nameSize = longest > 9 ? 7.6 : longest > 7 ? 8.8 : 10

  const [c0, c1, c2] = topper.colors
  return (
    <svg className="powder-jar__svg" viewBox="0 0 80 110" aria-hidden="true">
      <defs>
        {/* 통 몸체: 양옆이 어둡고 왼쪽이 밝은 원통 느낌 */}
        <linearGradient id={`${uid}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#EADBC6" />
          <stop offset="0.28" stopColor="#FFFDF8" />
          <stop offset="0.7" stopColor="#FBF3E6" />
          <stop offset="1" stopColor="#DCCAB0" />
        </linearGradient>
        <linearGradient id={`${uid}-cap`} x1="0" x2="1">
          <stop offset="0" stopColor="#E9D6B8" />
          <stop offset="0.35" stopColor="#FFF6E4" />
          <stop offset="1" stopColor="#D8BF98" />
        </linearGradient>
        <linearGradient id={`${uid}-label`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={topper.label} stopOpacity="0.85" />
          <stop offset="1" stopColor={topper.label} />
        </linearGradient>
        {/* 창 안의 가루 질감 */}
        <pattern id={`${uid}-grain`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={c0} />
          <circle cx="1.5" cy="1.5" r="0.9" fill={c1} />
          <circle cx="4.5" cy="4" r="0.8" fill={c2} />
          <circle cx="4" cy="1" r="0.5" fill="#FFFFFF" opacity="0.5" />
        </pattern>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="40" cy="104" rx="26" ry="4" fill="#7a4a24" opacity="0.18" />

      {/* 몸체 */}
      <rect x="12" y="26" width="56" height="78" rx="14" fill={`url(#${uid}-body)`} />

      {/* 아래쪽 투명 창으로 보이는 가루 */}
      <rect x="18" y="78" width="44" height="21" rx="8" fill={`url(#${uid}-grain)`} />
      <rect x="18" y="78" width="44" height="21" rx="8" fill="none" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.5" />
      <path d="M22,82 Q22,80 25,80 L30,80" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* 라벨: 제품명 + 영문 컬러명 */}
      <rect x="12" y="38" width="56" height={small ? 28 : 36} rx="6" fill={`url(#${uid}-label)`} />
      {small ? (
        <>
          <circle cx="22" cy="52" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="58" cy="52" r="3" fill="#FFFFFF" opacity="0.9" />
        </>
      ) : (
        <>
          {lines.map((line, i) => (
            <text
              key={line}
              x="40"
              y={(lines.length === 1 ? 54 : 49) + i * 9.5}
              textAnchor="middle"
              fontFamily="Fredoka, 'Nunito', sans-serif"
              fontWeight="600"
              fontSize={nameSize}
              fill={ink}
            >
              {line}
            </text>
          ))}
          <text
            x="40"
            y="70"
            textAnchor="middle"
            fontFamily="Fredoka, 'Nunito', sans-serif"
            fontSize="5.6"
            fontWeight="600"
            fill={ink}
            opacity="0.85"
            letterSpacing="0.8"
          >
            {topper.colorName}
          </text>
        </>
      )}

      {/* 몸체 하이라이트 */}
      <rect x="17" y="30" width="5" height="68" rx="2.5" fill="#FFFFFF" opacity="0.55" />

      {/* 뚜껑 + 가루 나오는 구멍 */}
      <rect x="14" y="10" width="52" height="20" rx="8" fill={`url(#${uid}-cap)`} />
      {[22, 28, 34, 40, 46, 52, 58].map((x) => (
        <rect key={x} x={x - 0.8} y="13" width="1.6" height="14" rx="0.8" fill="#C9AE86" opacity="0.5" />
      ))}
      <ellipse cx="40" cy="10" rx="26" ry="5" fill="#FFF8EA" />
      {[30, 37, 44, 51, 33.5, 40.5, 47.5].map((x, i) => (
        <circle key={x} cx={x} cy={i < 4 ? 9 : 11.3} r="1.3" fill="#A48660" />
      ))}
    </svg>
  )
}

export default PowderJar
