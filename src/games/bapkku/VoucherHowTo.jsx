import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { VOUCHER, copyToClipboard, fillCode } from './voucher.js'

/**
 * VoucherHowTo — 바우처 사용 방법 안내 창 (3단계)
 *
 *  - 엔딩 바우처 카드의 'How to Use' 버튼을 누르면 열려요. (네 게임 공통)
 *  - 게임과 같은 둥근 카드 + 부드러운 색 + 작은 아이콘으로 단계를 보여 줘요.
 *    (실제 쇼핑 앱 화면을 따라 그리지 않았어요. 'Shopee SG' 는 글자로만 표시)
 *  - Back / Next 로 넘기고, 마지막 단계에서 Got it 으로 닫아요. X·바깥·Esc 로도 닫혀요.
 *  - 휴대폰에서는 좌우로 밀어서도 넘길 수 있어요.
 *  - codeBox 단계(2단계)에는 코드 쿠폰 박스 + Copy 버튼이 있어요. (정확히 코드만 복사)
 *  - 문구는 voucher.js 의 steps 에서 바꿔요.
 */

const TONES = {
  peach: { bg: '#FFE6DA', ring: '#FFB496', ink: '#C9663F' },
  butter: { bg: '#FFF1C4', ring: '#FFD666', ink: '#A7701A' },
  mint: { bg: '#DDF4E9', ring: '#9FDCB9', ink: '#2F7A57' },
}

/* 단계별 작은 아이콘 (단순한 임시 SVG) */
function StepIcon({ name, color }) {
  const s = { fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const icons = {
    cart: (
      <g {...s}>
        <path d="M5 7h3l2.4 10.5h10.2L23 10H9.2" />
        <circle cx="12" cy="21.5" r="1.6" fill={color} />
        <circle cx="19.5" cy="21.5" r="1.6" fill={color} />
      </g>
    ),
    jar: (
      <g {...s}>
        <rect x="9" y="5" width="10" height="4" rx="1.6" fill="#fff" />
        <path d="M8.5 9.5h11v12a2.5 2.5 0 0 1-2.5 2.5h-6a2.5 2.5 0 0 1-2.5-2.5z" fill="#fff" />
        <rect x="10.5" y="13.5" width="7" height="5" rx="1.4" fill={color} opacity="0.35" stroke="none" />
      </g>
    ),
    checkout: (
      <g {...s}>
        <rect x="5" y="8" width="18" height="13" rx="3" fill="#fff" />
        <path d="M5 12.5h18" />
        <path d="M15 18h4" />
      </g>
    ),
    voucher: (
      <g {...s}>
        <path d="M5 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.2a2.8 2.8 0 0 0 0 5.6V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2.2a2.8 2.8 0 0 0 0-5.6z" fill="#fff" />
        <path d="M11 17l6-6" />
        <circle cx="11.5" cy="11.5" r="1" fill={color} />
        <circle cx="16.5" cy="16.5" r="1" fill={color} />
      </g>
    ),
    code: (
      <g {...s}>
        <rect x="4" y="9" width="20" height="10" rx="3" fill="#fff" />
        <path d="M8 14h1M11.5 14h1M15 14h1M18.5 14h1" strokeWidth="2.8" />
      </g>
    ),
    apply: (
      <g {...s}>
        <rect x="4" y="9.5" width="20" height="9" rx="4.5" fill={color} stroke="none" opacity="0.9" />
        <path d="M10 14.2l2.6 2.4 5.4-5.2" stroke="#fff" />
      </g>
    ),
    check: (
      <g {...s}>
        <circle cx="14" cy="14" r="9" fill="#fff" />
        <path d="M9.5 14.3l3 3 6-6.3" />
      </g>
    ),
    shipping: (
      <g {...s}>
        <path d="M4 9h11v9H4z" fill="#fff" />
        <path d="M15 12h4.5l3 3.2V18H15z" fill="#fff" />
        <circle cx="8" cy="19.5" r="1.8" fill="#fff" />
        <circle cx="18.5" cy="19.5" r="1.8" fill="#fff" />
      </g>
    ),
    order: (
      <g {...s}>
        <path d="M7 10h14l-1.2 12H8.2z" fill="#fff" />
        <path d="M10.5 10V8.5a3.5 3.5 0 0 1 7 0V10" />
        <path d="M11.5 16l2 2 3.5-3.6" />
      </g>
    ),
  }
  return (
    <svg className="howto__icon-svg" viewBox="0 0 28 28" aria-hidden="true">
      {icons[name] ?? icons.check}
    </svg>
  )
}

/** 2단계 안의 작은 쿠폰 박스: 코드 + Copy 버튼 */
function CodeBox({ code }) {
  const [status, setStatus] = useState('idle') // idle | copied | failed
  const inputRef = useRef(null)
  const timerRef = useRef(0)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleCopy = async (event) => {
    const button = event.currentTarget
    clearTimeout(timerRef.current)
    if (await copyToClipboard(code)) {
      setStatus('copied')
      button.focus({ preventScroll: true })
      timerRef.current = window.setTimeout(() => setStatus('idle'), 2600)
    } else {
      setStatus('failed')
      const input = inputRef.current
      input?.focus({ preventScroll: true })
      input?.setSelectionRange(0, code.length) // 직접 복사할 수 있게 코드 선택
    }
  }
  const copied = status === 'copied'

  return (
    <div className="howto__code">
      <div className="howto__code-row">
        <input
          ref={inputRef}
          className="howto__code-text"
          type="text"
          value={code}
          readOnly
          spellCheck="false"
          autoComplete="off"
          size={code.length}
          aria-label="Secret code"
          onFocus={(event) => event.currentTarget.select()}
          onClick={(event) => event.currentTarget.select()}
        />
        <button type="button" className={`btn howto__code-copy ${copied ? 'is-copied' : ''}`} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="howto__code-status" role="status" aria-live="polite">
        {copied && <span className="voucher__sr">Code {code} copied.</span>}
        {status === 'failed' && 'Copy is not available here. The code is selected, so copy it yourself.'}
      </p>
    </div>
  )
}

function VoucherHowTo({ voucher = VOUCHER, onClose }) {
  const steps = voucher.steps ?? []
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1) // 넘기는 방향 (그림 움직임용)
  const dialogRef = useRef(null)
  const swipe = useRef(null)
  const last = index === steps.length - 1
  const step = steps[index]
  const tone = TONES[step?.tone] ?? TONES.peach

  const go = (next) => {
    if (next < 0 || next >= steps.length) return
    setDir(next > index ? 1 : -1)
    setIndex(next)
  }

  // 열리면 안내 창에 초점, Esc 로 닫기, 방향키로 넘기기
  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
      else if (event.target instanceof HTMLInputElement) return // 코드 칸 안에서는 방향키로 넘기지 않아요
      else if (event.key === 'ArrowRight') go(index + 1)
      else if (event.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!step) return null

  return createPortal(
    <div
      className="howto"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose?.() // 바깥을 누르면 닫혀요
      }}
    >
      <div
        ref={dialogRef}
        className="howto__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="howto-title"
        tabIndex={-1}
        onPointerDown={(event) => {
          swipe.current = { x: event.clientX, y: event.clientY }
        }}
        onPointerUp={(event) => {
          const s = swipe.current
          swipe.current = null
          if (!s) return
          const dx = event.clientX - s.x
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(event.clientY - s.y) * 1.5) go(index + (dx < 0 ? 1 : -1))
        }}
      >
        <button type="button" className="howto__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>

        <p className="howto__eyebrow">
          {fillCode(voucher.title, voucher)} · Shopee SG
        </p>
        <h2 id="howto-title" className="howto__title">
          {voucher.howToTitle}
        </h2>

        {/* 단계 표시 (눌러서 이동) */}
        <ol className="howto__dots" aria-label="Steps">
          {steps.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className={`howto__dot ${i === index ? 'is-current' : ''} ${i < index ? 'is-done' : ''}`}
                onClick={() => go(i)}
                aria-label={`Step ${i + 1}`}
                aria-current={i === index ? 'step' : undefined}
              >
                {i < index ? '✓' : i + 1}
              </button>
            </li>
          ))}
        </ol>

        {/* 지금 단계 카드 */}
        <section
          key={index}
          className={`howto__card ${dir > 0 ? 'from-right' : 'from-left'}`}
          style={{ '--tone-bg': tone.bg, '--tone-ring': tone.ring, '--tone-ink': tone.ink }}
          aria-live="polite"
        >
          <span className="howto__step">
            Step {index + 1} of {steps.length}
          </span>
          <div className="howto__icons" aria-hidden="true">
            {step.icons.map((name, i) => (
              <span key={name} className="howto__icon" style={{ animationDelay: `${0.08 * i}s` }}>
                <StepIcon name={name} color={tone.ink} />
              </span>
            ))}
          </div>
          <h3 className="howto__card-title">{fillCode(step.title, voucher)}</h3>
          <ol className="howto__lines">
            {step.lines.map((line, i) => (
              <li key={i}>
                <span className="howto__num" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  {String(line)
                    .split('{code}')
                    .map((part, k) => (
                      <span key={k}>
                        {k > 0 && <strong className="howto__inline-code">{voucher.code.trim()}</strong>}
                        {part}
                      </span>
                    ))}
                </span>
              </li>
            ))}
          </ol>
          {step.codeBox && <CodeBox code={voucher.code.trim()} />}
        </section>

        <div className="howto__nav">
          <button type="button" className="btn btn--ghost howto__btn" onClick={() => go(index - 1)} disabled={index === 0}>
            ◀ Back
          </button>
          {last ? (
            <button type="button" className="btn btn--primary howto__btn" onClick={onClose}>
              Got it!
            </button>
          ) : (
            <button type="button" className="btn btn--primary howto__btn" onClick={() => go(index + 1)}>
              Next ▶
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default VoucherHowTo
