import { useEffect, useRef, useState } from 'react'
import { VOUCHER, copyToClipboard, hasVoucher } from './voucher.js'
import VoucherHowTo from './VoucherHowTo.jsx'

/**
 * VoucherCard — 완성 화면에 나타나는 선물 바우처 카드
 *
 *  - 선물 상자 뚜껑이 톡 열리면서 쿠폰 티켓이 나타나요.
 *  - 제목은 '25% OFF Voucher' 처럼 할인 문구를 크게 강조해요. (문구는 voucher.js)
 *  - 'Copy Code' 버튼을 누르면 코드가 클립보드에 복사되고 버튼이 'Copied!'(체크 표시)로 바뀌어요.
 *  - 'Shop on Shopee SG' 버튼은 제품 페이지(voucher.js 의 shopUrl)를 새 탭으로 열어요.
 *  - 'How to Use' 버튼을 누르면 3단계 사용 방법 안내 창(VoucherHowTo.jsx)이 열려요.
 *  - 복사가 안 되는 환경(오래된 브라우저, 보안 주소가 아닌 곳 등)이면
 *    코드를 자동으로 선택해 두고 직접 복사하는 방법을 알려 줘요.
 *  - 코드·문구는 voucher.js 에서 바꿔요. (enabled: false 면 카드가 안 보여요)
 */

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

/** 새 탭으로 열린다는 작은 표시 */
function ExternalIcon() {
  return (
    <svg className="voucher__ext" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M11 4h5v5M16 4l-7 7M14 12v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const howToBtnRef = useRef(null)
  const [howToOpen, setHowToOpen] = useState(false)

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

  // '25% OFF Voucher' → 할인 문구(25% OFF)만 크게
  const titleMatch = String(voucher.title).match(/^(\d+%\s*OFF)\s*(.*)$/i)

  const closeHowTo = () => {
    setHowToOpen(false)
    howToBtnRef.current?.focus({ preventScroll: true }) // 닫으면 버튼으로 초점을 돌려줘요
  }

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
        <h3 id="voucher-title" className={`voucher__title ${titleMatch ? 'has-deal' : ''}`}>
          {titleMatch ? (
            <>
              <span className="voucher__deal">{titleMatch[1]}</span> <span className="voucher__deal-sub">{titleMatch[2]}</span>
            </>
          ) : (
            voucher.title
          )}
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
        {voucher.note && <p className="voucher__note">{voucher.note}</p>}

        <div className="voucher__buttons">
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
          {voucher.shopUrl && (
            <a
              className="btn voucher__shop"
              href={voucher.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${voucher.shopLabel} (opens in a new tab)`}
            >
              {voucher.shopLabel}
              <ExternalIcon />
            </a>
          )}
          {voucher.steps?.length > 0 && (
            <button
              ref={howToBtnRef}
              type="button"
              className="btn voucher__howto"
              onClick={() => setHowToOpen(true)}
              aria-haspopup="dialog"
            >
              {voucher.howToLabel}
            </button>
          )}
        </div>

        <p className="voucher__status" role="status" aria-live="polite">
          {copied && <span className="voucher__sr">Voucher code {code} copied.</span>}
          {status === 'failed' && 'Copy is not available here. The code is selected, so copy it yourself (Ctrl+C or long-press).'}
        </p>
      </div>
      {howToOpen && <VoucherHowTo voucher={voucher} onClose={closeHowTo} />}
    </section>
  )
}

export default VoucherCard
