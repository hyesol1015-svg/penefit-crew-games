import CrewSprite from '../../components/CrewSprite.jsx'
// 밥꾸 스튜디오 엔딩과 같은 바우처 카드를 그대로 재사용해요 (코드·문구는 bapkku/voucher.js 한 곳에서 관리)
import VoucherCard from '../bapkku/VoucherCard.jsx'
import { hasVoucher } from '../bapkku/voucher.js'
import { DecoratedCookie } from './DecorArt.jsx'
import { gridLayout } from './cookieData.js'

/**
 * CookieFinish — 쿠키 완성 화면 (덮개 화면)
 *
 *  - 직접 만든 쿠키(모양·맛 색·구운 색·장식)를 귀여운 접시에 그대로 담아 보여 줘요.
 *  - 고른 크루가 옆에서 축하하고, 아래에 PENEFITGAME 바우처 카드가 나와요.
 *  - 밥꾸 완성 화면과 같은 스타일(.celebrate …)을 함께 써요.
 */
const CONFETTI_COLORS = ['#FFB496', '#FFD666', '#CDEEDF', '#F9C2D0', '#C9E4FF', '#E4D4FF']
const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 7) * 0.45,
  duration: 3.2 + (i % 5) * 0.5,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}))

const SPARKLES = [
  { x: 6, y: 20, d: 0.4 },
  { x: 90, y: 10, d: 0.9 },
  { x: 14, y: 78, d: 1.3 },
  { x: 82, y: 70, d: 0.2 },
  { x: 50, y: 2, d: 1.6 },
]

function CookiePlate({ cookies, colors, decorations, palette }) {
  const { spots, scale } = gridLayout(cookies.length, { x: 30, y: 36, w: 180, h: 88 }, 1.6)
  return (
    <svg className="plate-svg" viewBox="0 0 240 150" role="img" aria-label={`A plate of ${cookies.length} decorated cookies`}>
      {/* 접시 그림자 + 물결 테두리 접시 */}
      <ellipse cx="122" cy="134" rx="100" ry="11" fill="#8a4b2a" opacity="0.15" />
      <g fill="#FBD3DB">
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2
          return <circle key={i} cx={120 + Math.cos(a) * 108} cy={80 + Math.sin(a) * 52} r="8" />
        })}
      </g>
      <ellipse cx="120" cy="80" rx="108" ry="52" fill="#FBD3DB" />
      <ellipse cx="120" cy="80" rx="100" ry="46" fill="#FFF4F1" stroke="#F4BCC7" strokeWidth="2" />
      <ellipse cx="120" cy="82" rx="80" ry="34" fill="#FFFAF7" stroke="#F8D8DE" strokeWidth="1.5" strokeDasharray="3 4" />
      <path d="M40,64 C52,44 84,34 112,32" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      {cookies.map((c, i) => (
        <g key={c.id} transform={`translate(${spots[i].x} ${spots[i].y}) scale(${scale}) rotate(${c.rot})`}>
          <DecoratedCookie cookie={c} colors={colors} decorations={decorations.filter((d) => d.cookieId === c.id)} palette={palette} />
        </g>
      ))}
    </svg>
  )
}

function CookieFinish({ crew, flavor, cookies, colors, decorations, palette, onRemake, onHome }) {
  const showVoucher = hasVoucher()
  const shapes = [...new Set(cookies.map((c) => c.cutterId))].map((id) => id[0].toUpperCase() + id.slice(1)).join(', ')

  return (
    <div className="celebrate cookie-finish" role="dialog" aria-modal="true" aria-labelledby="cookie-finish-title">
      <div className="celebrate__bg" aria-hidden="true">
        <div className="celebrate__rays" />
      </div>
      <div className="celebrate__confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className={c.round ? 'is-round' : ''}
            style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s` }}
          />
        ))}
      </div>

      <div className={`celebrate__card ${showVoucher ? 'has-voucher' : ''}`}>
        <h2 id="cookie-finish-title" className="ribbon">
          Cookies Complete!
        </h2>

        <div className="celebrate__result">
          <p className="celebrate__grade cookie-finish__lead">You baked something pawsome!</p>

          <div className="celebrate__plate cookie-finish__plate">
            <div className="cookie-finish__dish">
              <CookiePlate cookies={cookies} colors={colors} decorations={decorations} palette={palette} />
              {SPARKLES.map((s, i) => (
                <span key={i} className="finish-sparkle" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} aria-hidden="true">
                  ✦
                </span>
              ))}
            </div>
            <div className="celebrate__cheer">
              <span className="celebrate__say">{crew.name}: Yum!</span>
              <span className="celebrate__crew">
                <CrewSprite crew={crew} />
              </span>
            </div>
          </div>

          <p className="celebrate__desc">
            <b>{cookies.length}</b> {flavor.name} {cookies.length === 1 ? 'cookie' : 'cookies'} ({shapes})
            <br />
            with <b>{decorations.length}</b> sweet {decorations.length === 1 ? 'decoration' : 'decorations'}.
          </p>
        </div>

        <div className="celebrate__reward">
          {showVoucher && <VoucherCard />}
          <div className="celebrate__actions">
            <button type="button" className="btn btn--primary" onClick={onRemake}>
              Start Over
            </button>
            <button type="button" className="btn btn--ghost" onClick={onHome}>
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieFinish
