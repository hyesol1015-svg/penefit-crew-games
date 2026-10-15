import { useId } from 'react'
import { ASSETS, assetUrl } from '../../gameAssets.js'

/**
 * PowderJar — 파우더 토퍼 통 그림 (임시 디자인)
 *
 * 귀여운 펫 토퍼 패키지 '느낌'만 낸 임시 그림입니다.
 * 실제 브랜드 로고나 실제 제품 패키지를 따라 그리지 않았어요.
 *   - 크림색 뚜껑 + 가루가 나오는 구멍
 *   - 파우더 색 라벨에 재료 이름
 *   - 아래쪽 투명 창으로 보이는 가루
 *
 * gameAssets.js 의 toppers[id] 에 실제 제품 PNG를 넣으면
 * 이 그림 대신 원본 이미지를 그대로(비율 유지) 보여 줍니다.
 *
 * props
 *   topper : TOPPERS 중 하나
 *   small  : 선택 버튼 안에 들어가는 작은 크기 (글자 생략)
 */
function PowderJar({ topper, small = false }) {
  const uid = `j${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const productImage = assetUrl(ASSETS.toppers?.[topper.id])

  if (productImage) {
    return <img className="powder-jar__img" src={productImage} alt="" draggable="false" />
  }

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
      <rect x="18" y="74" width="44" height="24" rx="9" fill={`url(#${uid}-grain)`} />
      <rect x="18" y="74" width="44" height="24" rx="9" fill="none" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.5" />
      <path d="M22,78 Q22,76 25,76 L30,76" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* 라벨 */}
      <rect x="12" y="40" width="56" height={small ? 26 : 30} rx="6" fill={`url(#${uid}-label)`} />
      <circle cx="22" cy={small ? 53 : 50} r="3" fill="#FFFFFF" opacity="0.9" />
      <circle cx="58" cy={small ? 53 : 50} r="3" fill="#FFFFFF" opacity="0.9" />
      {!small && (
        <>
          <text
            x="40"
            y="56"
            textAnchor="middle"
            fontFamily="Jua, 'Gowun Dodum', sans-serif"
            fontSize={topper.name.length > 3 ? 10 : 12}
            fill="#FFFFFF"
          >
            {topper.name}
          </text>
          <text x="40" y="66" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontSize="5.5" fontWeight="600" fill="#FFFFFF" opacity="0.85" letterSpacing="0.8">
            TOPPER POWDER
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
