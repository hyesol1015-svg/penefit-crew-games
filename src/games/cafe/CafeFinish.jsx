import CrewSprite from '../../components/CrewSprite.jsx'
// 밥꾸 스튜디오·쿠키 베이커리와 같은 바우처 카드를 그대로 재사용해요 (설정은 bapkku/voucher.js 한 곳)
import VoucherCard from '../bapkku/VoucherCard.jsx'
import { hasVoucher } from '../bapkku/voucher.js'
import { Cup } from './CupArt.jsx'

/**
 * CafeFinish — 멍푸치노 완성 화면 (덮개 화면)
 *  - 직접 고른 컵 색 · 음료 색 · 거품 · 장식이 그대로 담긴 멍푸치노
 *  - 고른 크루가 옆에서 축하하고, 아래에 PENEFITGAME 바우처 카드
 *  - 밥꾸·쿠키 완성 화면과 같은 스타일(.celebrate …)을 함께 써요
 */
const CONFETTI_COLORS = ['#FFB496', '#FFD666', '#CDEEDF', '#F9C2D0', '#C9E4FF', '#E4D4FF']
const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 41) % 100,
  delay: (i % 7) * 0.45,
  duration: 3.2 + (i % 5) * 0.5,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}))
const SPARKLES = [
  { x: 10, y: 14, d: 0.3 },
  { x: 84, y: 8, d: 1 },
  { x: 4, y: 62, d: 1.4 },
  { x: 90, y: 56, d: 0.6 },
]

function CafeFinish({ crew, cup, drink, foam, swirl, decorations, palette, onRemake, onHome }) {
  const showVoucher = hasVoucher()
  return (
    <div className="celebrate cafe-finish" role="dialog" aria-modal="true" aria-labelledby="cafe-finish-title">
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
        <h2 id="cafe-finish-title" className="ribbon">
          Puppuccino Complete!
        </h2>

        <div className="celebrate__result">
          <p className="celebrate__grade cafe-finish__lead">You made something pawsome!</p>
          <div className="celebrate__plate cafe-finish__plate">
            <div className="cafe-finish__cup">
              <svg className="cafe-finish__svg" viewBox="-80 -190 170 200" role="img" aria-label={`${drink.name} puppuccino in a ${cup.name} cup with ${decorations.length} decorations`}>
                <ellipse cx="2" cy="4" rx="74" ry="9" fill="#F9D9DF" />
                <ellipse cx="2" cy="3" rx="62" ry="6" fill="#FFE7EC" />
                <Cup cup={cup} drink={drink} level={1} foam={foam} swirl={swirl} decorations={decorations} palette={palette} />
              </svg>
              {SPARKLES.map((s, i) => (
                <span key={i} className="cafe-finish__sparkle" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} aria-hidden="true">
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
            A <b>{drink.name}</b> puppuccino in a <b>{cup.name}</b> cup
            <br />
            with <b>{decorations.length}</b> cute {decorations.length === 1 ? 'decoration' : 'decorations'}.
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

export default CafeFinish
