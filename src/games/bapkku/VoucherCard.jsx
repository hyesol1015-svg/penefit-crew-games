import { useEffect, useRef, useState } from 'react'
import { VOUCHER, hasVoucher } from './voucher.js'

/**
 * VoucherCard — 완성 화면에 나타나는 선물 바우처 카드
 *
 *  - 선물 상자 뚜껑이 톡 열리면서 쿠폰 티켓이 나타나요.
 *  - 'Copy Voucher Code' 버튼을 누르면 코드가 클립보드에 복사되고 버튼이 'Copied!'(체크 표시)로 바뀌어요.
 *  - 복사가 안 되는 환경(오래된 브라우저, 보안 주소가 아닌 곳 등)이면
 *    코드를 자동으로 선택해 두고 직접 복사하는 방법을 알려 줘요.
 *  - 코드·문구는 voucher.js 에서 바꿔요. (enabled: false 면 카드가 안 보여요)
 */

/** 클립보드 복사: 최신 방식 → 예전 방식 순서로 시도, 성공하면 true */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 권한이 막혀 있으면 아래의 예전 방식으로 한 번 더 시도해요
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '0'
    area.style.left = '0'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    area.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

const SPARKLES = [
  { x: 8, y: 30, d: 0.9, s: 1 },
  { x: 88, y: 18, d: 1.05, s: 0.8 },
  { x: 22, y: 4, d: 1.2, s: 0.7 },
  { x: 76, y: 52, d: 1.35, s: 0.9 },
]

function CheckIcon() {
  return (
    <svg className="voucher__check" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#fff" />
      <path d="M5.5 10.3 8.6 13.3 14.6 7" fill="none" stroke="#5fae84" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 리본이 달린 작은 선물 상자 (뚜껑이 열리는 그림) */
function GiftBox() {
  return (
    <svg className="voucher__box" viewBox="0 0 64 56" aria-hidden="true">
      <ellipse cx="32" cy="53" rx="22" ry="3" fill="#b9773f" opacity="0.18" />
      {/* 상자 몸통 */}
      <rect x="10" y="24" width="44" height="28" rx="6" fill="#ffb496" />
      <rect x="10" y="24" width="44" height="7" rx="3" fill="#e98f6c" opacity="0.35" />
      <rect x="28" y="24" width="8" height="28" fill="#ffd666" />
      <rect x="14" y="30" width="4" height="16" rx="2" fill="#fff" opacity="0.45" />
      {/* 뚜껑 + 리본 매듭 (함께 위로 톡 열려요) */}
      <g className="voucher__lid">
        <path d="M24 13 C18 3 9 7 14 13 C17 16 22 15 32 15Z" fill="#ffd666" stroke="#e8b03f" strokeWidth="1.4" />
        <path d="M40 13 C46 3 55 7 50 13 C47 16 42 15 32 15Z" fill="#ffd666" stroke="#e8b03f" strokeWidth="1.4" />
        <rect x="6" y="14" width="52" height="12" rx="5" fill="#ffc7ae" />
        <rect x="27" y="14" width="10" height="12" fill="#ffd666" />
        <circle cx="32" cy="14" r="4" fill="#ffc23a" />
      </g>
    </svg>
  )
}

function VoucherCard({ voucher = VOUCHER }) {
  const [status, setStatus] = useState('idle') // idle | copied | failed
  const codeRef = useRef(null)
  const timerRef = useRef(0)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (!hasVoucher(voucher)) return null
  const code = voucher.code.trim()

  // 코드 글자 전체를 선택 (직접 복사할 수 있게)
  const selectCode = () => {
    const input = codeRef.current
    if (!input) return
    input.focus({ preventScroll: true })
    input.select()
    input.setSelectionRange(0, code.length)
  }

  const handleCopy = async (event) => {
    const button = event.currentTarget
    clearTimeout(timerRef.current)
    const ok = await copyToClipboard(code)
    if (ok) {
      setStatus('copied')
      button.focus({ preventScroll: true }) // 예전 방식 복사 후에도 버튼에 초점을 돌려줘요
      timerRef.current = window.setTimeout(() => setStatus('idle'), 2600)
    } else {
      setStatus('failed')
      selectCode()
    }
  }

  const copied = status === 'copied'

  return (
    <section className="voucher" aria-labelledby="voucher-title">
      <div className="voucher__gift" aria-hidden="true">
        <GiftBox />
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="voucher__sparkle"
            style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s`, scale: s.s }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="voucher__ticket">
        <h3 id="voucher-title" className="voucher__title">
          {voucher.title}
        </h3>

        <label className="voucher__code-box">
          <span className="voucher__label">Voucher Code</span>
          <input
            ref={codeRef}
            className="voucher__code"
            type="text"
            value={code}
            readOnly
            spellCheck="false"
            autoComplete="off"
            size={code.length}
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
          />
        </label>

        <p className="voucher__desc">{voucher.description}</p>

        <button
          type="button"
          className={`btn voucher__copy ${copied ? 'is-copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <CheckIcon />
              {voucher.copiedLabel}
            </>
          ) : (
            voucher.copyLabel
          )}
        </button>

        <p className="voucher__status" role="status" aria-live="polite">
          {copied && <span className="voucher__sr">Voucher code {code} copied.</span>}
          {status === 'failed' && 'Copy is not available here. The code is selected, so copy it yourself (Ctrl+C or long-press).'}
        </p>
      </div>
    </section>
  )
}

export default VoucherCard
