import CrewSprite from '../../components/CrewSprite.jsx'
// 다른 세 게임과 같은 바우처 카드를 그대로 재사용해요 (설정은 bapkku/voucher.js 한 곳)
import VoucherCard from '../bapkku/VoucherCard.jsx'
import { hasVoucher } from '../bapkku/voucher.js'
import { JellyPlate } from './JellyArt.jsx'

/**
 * JellyFinish — 말랑젤리 완성 화면 (덮개 화면)
 *  - 꺼낸 젤리의 색·모양·개수를 그대로 접시에 담아 말랑말랑 흔들려요.
 *  - 고른 크루가 축하하고, 아래에 PENEFITGAME 바우처 카드
 *  - 다른 게임 완성 화면과 같은 스타일(.celebrate …)을 함께 써요
 */
const CONFETTI_COLORS = ['#FFB496', '#FFD666', '#CDEEDF', '#F9C2D0', '#C9E4FF', '#E4D4FF']
const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 43) % 100,
  delay: (i % 7) * 0.45,
  duration: 3.2 + (i % 5) * 0.5,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}))
const SPARKLES = [
  { x: 6, y: 18, d: 0.3 },
  { x: 88, y: 10, d: 1 },
  { x: 12, y: 74, d: 1.4 },
  { x: 84, y: 66, d: 0.6 },
]

function JellyFinish({ crew, mold, first, second, colors, items, onRemake, onHome }) {
  const showVoucher = hasVoucher()
  const flavorText = first.id === second.id ? first.name : `${first.name} + ${second.name}`
  return (
    <div className="celebrate jelly-finish" role="dialog" aria-modal="true" aria-labelledby="jelly-finish-title">
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
        <h2 id="jelly-finish-title" className="ribbon">
          Gummy Lab Complete!
        </h2>

        <div className="celebrate__result">
          <p className="celebrate__grade jelly-finish__lead">You made something pawsome!</p>
          <div className="celebrate__plate jelly-finish__plate">
            <div className="jelly-finish__dish">
              <svg className="jelly-finish__svg" viewBox="-104 -58 208 98" role="img" aria-label={`A plate of ${items.length} ${mold.name} gummies`}>
                <JellyPlate moldId={mold.id} colors={colors} items={items.map((it) => ({ id: it.id }))} scale={1.2} landing={false} />
              </svg>
              {SPARKLES.map((s, i) => (
                <span key={i} className="jelly-finish__sparkle" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} aria-hidden="true">
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
            <b>{items.length}</b> {mold.name} {items.length === 1 ? 'gummy' : 'gummies'}
            <br />
            with <b>{flavorText}</b> flavor.
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

export default JellyFinish
