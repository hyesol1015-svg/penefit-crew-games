import { useState } from 'react'
import PowderJar from './PowderJar.jsx'
import { assetUrl } from '../../gameAssets.js'

/**
 * PowderIcon — 파우더 선택 카드에 들어가는 아이콘
 *
 * - bapkkuData.js 의 icon 경로에 있는 실제 페네핏 파우더 아이콘을 보여 줘요.
 * - 아이콘 파일이 없거나 불러오지 못하면 기존 임시 파우더 통(작은 크기)으로 자동 대체돼요.
 * - 원본 PNG는 바꾸지 않고, 화면에서만 동그랗게 잘라 보여 줘요.
 *   (아이콘 파일 가장자리의 배경·여백이 카드에 보이지 않게 하기 위해서예요)
 */
function PowderIcon({ topper }) {
  const [failed, setFailed] = useState(false)
  const src = assetUrl(topper.icon)

  if (!src || failed) {
    return (
      <span className="chip__jar" aria-hidden="true">
        <PowderJar topper={topper} small />
      </span>
    )
  }

  return (
    <span className="powder-icon" aria-hidden="true">
      <img src={src} alt="" draggable="false" onError={() => setFailed(true)} />
    </span>
  )
}

export default PowderIcon
