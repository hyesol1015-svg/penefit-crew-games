import { useId } from 'react'
import { assetUrl } from '../../gameAssets.js'

/**
 * MeatArt — 익힌 고기 토핑 4종 그림 (임시 SVG 일러스트)
 *
 * 모양만 봐도 구별되도록 각각 다르게 그렸어요.
 *   Salmon  : 코랄 핑크 연어 조각 + 하얀 결(지방 줄무늬)
 *   Pork    : 연한 핑크 베이지 돼지고기 슬라이스 + 한쪽 가장자리 하얀 지방 + 노릇한 굽기 자국
 *   Chicken : 크림 베이지 닭가슴살 덩어리 + 결 따라 찢어진 섬유 무늬
 *   Beef    : 진한 브라운 소고기 큐브(입체) + 그릴 자국
 *
 * 모든 그림은 (0, 0)을 가운데로 가로 약 30, 세로 약 22 크기 (그릇 SVG 단위)예요.
 *
 * ★ 고퀄리티 PNG로 바꾸고 싶다면
 *   bapkkuData.js 의 MEATS 항목에 image 경로만 넣으면
 *   카드와 그릇 위 모두 그 이미지를 그대로 보여 줘요. (이 그림 대신)
 */

const IMAGE_W = 34 // PNG를 쓸 때 그릇 위에서의 크기
const IMAGE_H = 26

/** 고기 그림에 쓰는 그라데이션 모음 — 그림이 들어가는 SVG의 <defs> 안에 한 번 넣어 주세요 */
export function MeatDefs({ prefix }) {
  const id = (name) => `${prefix}-${name}`
  return (
    <>
      <linearGradient id={id('salmon')} x1="0" x2="0.3" y1="0" y2="1">
        <stop offset="0" stopColor="#FFC2A8" />
        <stop offset="0.5" stopColor="#F79A7E" />
        <stop offset="1" stopColor="#E47A60" />
      </linearGradient>
      <linearGradient id={id('pork')} x1="0" x2="0.4" y1="0" y2="1">
        <stop offset="0" stopColor="#F3CDB6" />
        <stop offset="0.55" stopColor="#E2AD8E" />
        <stop offset="1" stopColor="#C98C69" />
      </linearGradient>
      <radialGradient id={id('chicken')} cx="0.4" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#FFF4DF" />
        <stop offset="0.6" stopColor="#F1DCB6" />
        <stop offset="1" stopColor="#DDBC8A" />
      </radialGradient>
      <linearGradient id={id('beefTop')} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#B4744F" />
        <stop offset="1" stopColor="#8B4F31" />
      </linearGradient>
    </>
  )
}

/* ── 각 고기 그림 ── */

function Salmon({ g }) {
  return (
    <>
      {/* 두께(옆면) */}
      <path
        d="M-14,-1 C-13,-7 -5,-9 3,-8 C10,-7 15,-3 14,3 C13,9 6,12 -2,12 C-10,12 -15,7 -14,-1Z"
        fill="#CF6A50"
      />
      {/* 윗면 */}
      <path
        d="M-14,-3 C-13,-9 -5,-11 3,-10 C10,-9 15,-5 14,1 C13,7 6,10 -2,10 C-10,10 -15,5 -14,-3Z"
        fill={g('salmon')}
      />
      {/* 연어 특유의 하얀 결 */}
      <g fill="none" stroke="#FFEDE4" strokeLinecap="round" strokeWidth="1.4" opacity="0.9">
        <path d="M-9.5,-7.5 C-6.5,-3 -6.5,3 -9.5,8" />
        <path d="M-3.5,-9.8 C-0.5,-4 -0.5,3 -3.5,9.8" />
        <path d="M2.5,-9.8 C5.5,-4 5.5,3 2.5,9.6" />
        <path d="M8.5,-8.2 C11,-4 11,2 8.5,7.4" />
      </g>
      {/* 익으면서 생긴 결 사이 갈라짐 */}
      <g fill="none" stroke="#D9735A" strokeLinecap="round" strokeWidth="0.7" opacity="0.6">
        <path d="M-6.5,-5 L-5.8,-1" />
        <path d="M-0.5,2 L0,6" />
        <path d="M5.5,-6 L6,-2" />
      </g>
      {/* 윗면 반짝임 */}
      <ellipse cx="-4" cy="-6" rx="5" ry="1.6" fill="#FFFFFF" opacity="0.35" transform="rotate(-8 -4 -6)" />
    </>
  )
}

function Pork({ g }) {
  return (
    <>
      {/* 두께(옆면) */}
      <path
        d="M-15,-2 C-15,-6 -11,-7 -6,-7 L11,-5 C15,-4.5 16,-1 15,3 L13,9 C12,12 9,13 5,13 L-11,11 C-15,10.5 -16,7 -15,3Z"
        fill="#B47A57"
      />
      {/* 윗면 */}
      <path
        d="M-15,-5 C-15,-9 -11,-10 -6,-10 L11,-8 C15,-7.5 16,-4 15,0 L13,6 C12,9 9,10 5,10 L-11,8 C-15,7.5 -16,4 -15,0Z"
        fill={g('pork')}
      />
      {/* 한쪽 가장자리의 하얀 지방 */}
      <path
        d="M-14.5,-6 C-13.5,-9 -10,-10 -6,-10 L11,-8 C14,-7.5 15.5,-5 15,-2.5 C13,-5 10,-5.6 6,-6 L-6,-7.2 C-10,-7.6 -12.5,-7.2 -14.5,-6Z"
        fill="#FFF3E4"
      />
      {/* 고기 결 */}
      <g fill="none" stroke="#D29C7E" strokeLinecap="round" strokeWidth="0.8" opacity="0.6">
        <path d="M-9,-3 C-5,-2 0,-2.5 4,-1.5" />
        <path d="M-10,2 C-5,3 1,2.5 7,3.5" />
        <path d="M-6,6 C-2,6.8 3,6.5 8,7" />
      </g>
      {/* 노릇하게 구운 자국 */}
      <ellipse cx="9" cy="4" rx="3.6" ry="2" fill="#B5703F" opacity="0.55" />
      <ellipse cx="-8" cy="4.5" rx="2.8" ry="1.5" fill="#B5703F" opacity="0.45" />
      <ellipse cx="2" cy="7.5" rx="2" ry="1" fill="#B5703F" opacity="0.4" />
      <ellipse cx="-3" cy="-4.5" rx="6" ry="1.2" fill="#FFFFFF" opacity="0.3" />
    </>
  )
}

function Chicken({ g }) {
  const shape =
    'M-13,-4 C-14,-8 -9,-11 -4,-9 C-1,-12 5,-11 7,-8 C11,-9 15,-6 14,-2 C16,1 14,6 10,7 C8,10 2,11 -1,9 C-5,11 -11,9 -12,5 C-15,3 -15,-1 -13,-4Z'
  return (
    <>
      {/* 두께(옆면) */}
      <path d={shape} fill="#CDA672" transform="translate(0 2.6)" />
      {/* 윗면 */}
      <path d={shape} fill={g('chicken')} />
      {/* 결 따라 찢어진 닭가슴살 섬유 */}
      <g fill="none" stroke="#D6B582" strokeLinecap="round" strokeWidth="0.8" opacity="0.8">
        <path d="M-10,-3 C-6,-4.5 -1,-4 3,-5.5 C6,-6.5 9,-5.5 11,-6" />
        <path d="M-11,1 C-7,-0.5 -2,0 2,-1.5 C6,-2.5 10,-1 12.5,-2" />
        <path d="M-10,5 C-6,3.5 -1,4 3,2.5 C7,1.5 10,3 12,2.5" />
        <path d="M-5,8 C-2,6.8 2,7 5,6" />
      </g>
      {/* 노릇한 굽기 자국 */}
      <path d="M6,3 C9,2 12,3 12,5 C10,6.5 7,6.5 6,3Z" fill="#E3A863" opacity="0.55" />
      <ellipse cx="-8" cy="-6" rx="2.6" ry="1.2" fill="#E3A863" opacity="0.4" />
      <ellipse cx="-2" cy="-6.5" rx="4.5" ry="1.4" fill="#FFFFFF" opacity="0.45" />
    </>
  )
}

function Beef({ g }) {
  return (
    <g strokeLinejoin="round">
      {/* 큐브 옆면 2개 (왼쪽 더 어둡게) */}
      <path d="M-12,-3 L0,3 L0,12 L-12,6Z" fill="#6A3721" stroke="#6A3721" strokeWidth="2.6" />
      <path d="M0,3 L12,-3 L12,6 L0,12Z" fill="#7F4429" stroke="#7F4429" strokeWidth="2.6" />
      {/* 큐브 윗면 */}
      <path d="M-12,-3 L0,-9 L12,-3 L0,3Z" fill={g('beefTop')} stroke="#9A5B3B" strokeWidth="2.6" />
      {/* 그릴 자국 */}
      <g stroke="#4A2213" strokeLinecap="round" strokeWidth="1.5" opacity="0.75">
        <path d="M-6.5,-4.8 L1.5,-0.8" />
        <path d="M-2,-7 L6,-3" />
      </g>
      {/* 촉촉한 하이라이트 + 굽기 알갱이 */}
      <path d="M-8,-3.6 L-1,-7.2" stroke="#D49A74" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <circle cx="4" cy="6" r="0.8" fill="#4A2213" opacity="0.5" />
      <circle cx="-5" cy="5" r="0.7" fill="#4A2213" opacity="0.45" />
      <path d="M2,9 L9,5.5" stroke="#9C5A3A" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
    </g>
  )
}

const SHAPES = { salmon: Salmon, pork: Pork, chicken: Chicken, beef: Beef }

/**
 * 그릇 SVG 안에 그리는 고기 한 조각 (가운데가 0,0)
 *   meat   : MEATS 중 하나
 *   prefix : MeatDefs 에 넘긴 것과 같은 접두어
 */
export function MeatShape({ meat, prefix }) {
  const src = assetUrl(meat.image)
  if (src) {
    return <image href={src} x={-IMAGE_W / 2} y={-IMAGE_H / 2} width={IMAGE_W} height={IMAGE_H} />
  }
  const Shape = SHAPES[meat.id] ?? Chicken
  return <Shape g={(name) => `url(#${prefix}-${name})`} />
}

/** 선택 카드·드래그 중 손가락을 따라다니는 그림 (혼자 쓰는 작은 SVG) */
export function MeatCardArt({ meat }) {
  const prefix = `m${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const src = assetUrl(meat.image)
  if (src) {
    return <img className="meat-art" src={src} alt="" draggable="false" />
  }
  return (
    <svg className="meat-art" viewBox="-18 -14 36 30" aria-hidden="true">
      <defs>
        <MeatDefs prefix={prefix} />
      </defs>
      <ellipse cx="1" cy="12" rx="14" ry="2.6" fill="#7a4a24" opacity="0.18" />
      <MeatShape meat={meat} prefix={prefix} />
    </svg>
  )
}
